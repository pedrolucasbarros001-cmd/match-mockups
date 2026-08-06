// Regras do que faz sentido anunciar, fotografar e filtrar.
//
// Fonte ÚNICA destas regras: o wizard de publicar, a folha de filtros e o ecrã
// de preferências leem todos daqui. Se as opções vivessem em cada ecrã, a folha
// de filtros acabaria a oferecer "Quarto" numa pesquisa de compra enquanto o
// wizard já não deixava publicar um — controlo e realidade deixavam de bater.

import type { ListingKind, SpaceType } from "./mock-data";

// ============ Que espaços existem em cada tipo de negócio ============

/**
 * Arrendar: tudo, incluindo partes de uma casa (quarto, suite, partilhado).
 * Vender: só unidades autónomas — ninguém vende um quarto de uma casa.
 * "Moradia" só existe na venda; no arrendamento uma casa inteira anuncia-se
 * pela tipologia (T3, T4+).
 */
const RENT_TYPES: SpaceType[] = ["Quarto", "Suite", "Quarto Partilhado", "Estúdio", "T1", "T2", "T3", "T4+"];
const SALE_TYPES: SpaceType[] = ["Estúdio", "T1", "T2", "T3", "T4+", "Moradia"];

export function spaceTypesFor(kind: ListingKind): SpaceType[] {
  return kind === "sale" ? SALE_TYPES : RENT_TYPES;
}

export function isSpaceTypeAllowed(kind: ListingKind, t: SpaceType): boolean {
  return spaceTypesFor(kind).includes(t);
}

/** Descrição curta mostrada no card de escolha do wizard. */
export const SPACE_TYPE_DESC: Record<SpaceType, string> = {
  "Quarto": "Um quarto numa casa partilhada.",
  "Suite": "Quarto com casa de banho privativa.",
  "Quarto Partilhado": "Uma cama num quarto com mais pessoas.",
  "Estúdio": "Espaço único, sem quarto separado.",
  "T1": "1 quarto separado da sala.",
  "T2": "2 quartos.",
  "T3": "3 quartos.",
  "T4+": "4 ou mais quartos.",
  "Moradia": "Casa independente, com ou sem terreno.",
};

/** Um quarto/suite/partilhado é parte de uma casa — o resto é partilhado. */
export function isRoomType(t: SpaceType): boolean {
  return t === "Quarto" || t === "Suite" || t === "Quarto Partilhado";
}

/** Quantos quartos tem a tipologia (para derivar slots de foto e capacidade). */
export function bedroomCount(t: SpaceType): number {
  switch (t) {
    case "T1": return 1;
    case "T2": return 2;
    case "T3": return 3;
    case "T4+": return 4;
    case "Moradia": return 3;
    default: return 0; // quarto/suite/partilhado/estúdio não têm "quartos" a listar
  }
}

// ============ Plano de fotos por tipo ============

export type PhotoSlot = {
  /** Chave estável — a foto guarda-se associada a este slot. */
  key: string;
  label: string;
  /** Essencial = sem ela o anúncio fica visivelmente incompleto (avisa, não bloqueia). */
  essential: boolean;
  hint?: string;
};

/**
 * O que faz sentido fotografar em cada tipo. Nunca bloqueia a publicação —
 * são sugestões com peso: as essenciais contam para o Quality Score e geram
 * um aviso quando faltam, as restantes são só oportunidades de melhorar.
 *
 * Regra que evita redundância: um quarto é um quarto, mesmo partilhado — o que
 * muda é o resto. Quem arrenda um quarto tem de mostrar as áreas comuns que o
 * inquilino vai mesmo usar (cozinha, casa de banho); quem arrenda uma suite
 * mostra a casa de banho privativa em vez da comum.
 */
export function photoPlanFor(t: SpaceType | null): PhotoSlot[] {
  if (!t) return [];

  if (t === "Suite") {
    return [
      { key: "room", label: "O quarto", essential: true, hint: "A vista geral do espaço que é mesmo arrendado." },
      { key: "ensuite", label: "Casa de banho privativa", essential: true, hint: "É o que distingue uma suite de um quarto." },
      { key: "kitchen", label: "Cozinha", essential: true, hint: "Área comum que vais partilhar." },
      { key: "living", label: "Sala comum", essential: false },
      { key: "building", label: "Entrada ou exterior", essential: false },
    ];
  }

  if (t === "Quarto" || t === "Quarto Partilhado") {
    return [
      { key: "room", label: t === "Quarto Partilhado" ? "O quarto e a cama" : "O quarto", essential: true, hint: "A vista geral do espaço que é mesmo arrendado." },
      { key: "bathroom", label: "Casa de banho", essential: true, hint: "A que o inquilino vai usar, mesmo sendo partilhada." },
      { key: "kitchen", label: "Cozinha", essential: true, hint: "Área comum que vais partilhar." },
      { key: "living", label: "Sala comum", essential: false },
      { key: "building", label: "Entrada ou exterior", essential: false },
    ];
  }

  if (t === "Estúdio") {
    return [
      { key: "main", label: "O espaço principal", essential: true, hint: "Num estúdio, sala e quarto são o mesmo sítio." },
      { key: "kitchen", label: "Zona de cozinha", essential: true },
      { key: "bathroom", label: "Casa de banho", essential: true },
      { key: "building", label: "Entrada ou exterior", essential: false },
    ];
  }

  // T1 · T2 · T3 · T4+ · Moradia — uma foto por quarto, mais as áreas comuns.
  const rooms = bedroomCount(t);
  const bedroomSlots: PhotoSlot[] = Array.from({ length: rooms }, (_, i) => ({
    key: `bedroom-${i + 1}`,
    label: rooms === 1 ? "O quarto" : `Quarto ${i + 1}`,
    // Só o primeiro é essencial: exigir foto dos 4 quartos seria atrito puro.
    essential: i === 0,
  }));

  return [
    { key: "living", label: "Sala", essential: true },
    { key: "kitchen", label: "Cozinha", essential: true },
    ...bedroomSlots,
    { key: "bathroom", label: "Casa de banho", essential: true },
    ...(t === "Moradia"
      ? [{ key: "outdoor", label: "Exterior ou terreno", essential: true as const, hint: "Numa moradia é o que mais pesa na decisão." }]
      : [{ key: "building", label: "Entrada ou prédio", essential: false as const }]),
  ];
}

/** Slots essenciais ainda sem foto — usado para avisar sem travar. */
export function missingEssentialPhotos(t: SpaceType | null, filled: string[]): PhotoSlot[] {
  return photoPlanFor(t).filter((s) => s.essential && !filled.includes(s.key));
}

// ============ Rastreio de burla e de anúncios mal formados ============

export type ListingWarning = {
  id: string;
  /** "block" impede publicar; "warn" deixa publicar mas avisa. */
  level: "warn" | "block";
  title: string;
  body: string;
};

const RE = {
  // Contactos diretos — a conversa deve ficar na plataforma até haver aceitação.
  phone: /\b(?:\+?351[\s.-]?)?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b/,
  email: /[\w.+-]+\s*(?:@|\(at\)|\[at\])\s*[\w-]+\s*\.\s*[\w.]{2,}/i,
  messenger: /\bwhats?\s?app\b|\btelegram\b|\bviber\b|\bsignal\b|\bzap\b|\binsta(?:gram)?\b|\bfacebook\b|\bmessenger\b/i,
  link: /https?:\/\/|www\.|\b[\w-]+\.(?:com|pt|net|org|io|me)\b/i,

  // Vários espaços num anúncio só — cada anúncio representa exatamente um espaço.
  multiple:
    /\b(?:[2-9]|dez|dois|duas|tr[êe]s|quatro|cinco|v[áa]rios|v[áa]rias|diversos|m[úu]ltiplos)\s+(?:quartos?|suites?|est[úu]dios?|apartamentos?|espa[çc]os?|vagas?|camas?|fra[çc][õo]es?)\s*(?:dispon[íi]ve|para|a\s+arrendar|livres)/i,
  multiple2: /\b(?:temos|tenho|restam|sobram)\s+(?:[2-9]|v[áa]rios|v[áa]rias)\b/i,

  // Pagamento fora da plataforma antes de visitar — padrão clássico de burla.
  advancePay:
    /\b(?:transfer[êe]ncia|mbway|mb\s?way|western\s?union|paypal|revolut|cripto|bitcoin|dep[óo]sito)\b/i,
  beforeVisit:
    /\bsem\s+visita\b|\bn[ãa]o\s+[ée]\s+poss[íi]vel\s+visitar\b|\bantes\s+de\s+visitar\b|\bsinal\s+para\s+reservar\b|\breserva\s+j[áa]\b/i,
  abroad: /\bestou\s+(?:no\s+estrangeiro|fora\s+do\s+pa[íi]s|em\s+viagem)\b|\benvio\s+as\s+chaves\b|\bchaves\s+pelo\s+correio\b/i,

  // Discriminação — ilegal e contra as regras da plataforma.
  discrimination:
    /\b(?:s[óo]|apenas|somente)\s+(?:portugueses?|nacionais?|brancos?|homens|mulheres|rapazes|raparigas|crist[ãa]os?)\b|\bn[ãa]o\s+aceito\s+(?:estrangeiros?|imigrantes?|ciganos?|negros?|homossexuais?)\b/i,

  // Preço irrealista para o mercado — sinal forte de isco.
  urgency: /\burg[êe]ncia\s+m[áa]xima\b|\bs[óo]\s+hoje\b|\b[úu]ltim[ao]\s+d[ia]a\b/i,
};

/**
 * Analisa título + descrição + preço e devolve os avisos aplicáveis.
 * Filosofia: só bloqueia o que é ilegal ou destrói a confiança na plataforma
 * (discriminação, pedido de pagamento antecipado). Tudo o resto avisa e deixa
 * a pessoa decidir — o objetivo é orientar, não travar.
 */
export function analyseListing(input: {
  title: string;
  description: string;
  price: number;
  kind: ListingKind;
  spaceType: SpaceType | null;
}): ListingWarning[] {
  const text = `${input.title} ${input.description}`;
  const out: ListingWarning[] = [];

  if (RE.discrimination.test(text)) {
    out.push({
      id: "discrimination",
      level: "block",
      title: "Isto não pode ser publicado",
      body: "O texto restringe candidatos por nacionalidade, género, etnia, religião ou orientação. É proibido por lei e pelas regras da plataforma. Reformula descrevendo o espaço, não quem pode viver nele.",
    });
  }

  const wantsAdvance = RE.advancePay.test(text) && (RE.beforeVisit.test(text) || RE.abroad.test(text));
  if (wantsAdvance) {
    out.push({
      id: "advance-payment",
      level: "block",
      title: "Pedido de pagamento antes da visita",
      body: "Pedir sinal ou transferência antes de haver visita é o padrão mais comum de burla e não é permitido. Remove essa parte — o dinheiro só muda de mãos entre as partes, depois de se conhecerem.",
    });
  } else if (RE.abroad.test(text)) {
    out.push({
      id: "remote-keys",
      level: "warn",
      title: "Chaves à distância",
      body: "Dizer que estás fora do país ou que envias as chaves pelo correio é um sinal de alerta conhecido. Quem procura vai desconfiar — se for mesmo o teu caso, explica como a visita vai acontecer.",
    });
  }

  if (RE.multiple.test(text) || RE.multiple2.test(text)) {
    out.push({
      id: "multiple-spaces",
      level: "warn",
      title: "Parece que são vários espaços",
      body: "Cada anúncio representa exatamente um espaço — é assim que quem procura sabe ao que vai e tu recebes candidatos certos. Publica um anúncio por espaço.",
    });
  }

  const contactHits = [RE.phone, RE.email, RE.messenger, RE.link].filter((r) => r.test(text)).length;
  if (contactHits > 0) {
    out.push({
      id: "direct-contact",
      level: "warn",
      title: "Contacto direto no texto",
      body: "Telefone, email, redes sociais ou links são removidos por segurança. Os contactos são partilhados automaticamente quando aceitares um candidato.",
    });
  }

  if (RE.urgency.test(text)) {
    out.push({
      id: "urgency",
      level: "warn",
      title: "Linguagem de pressão",
      body: "Frases de urgência (\"só hoje\", \"último dia\") são associadas a esquemas e afastam quem procura a sério.",
    });
  }

  // Preço fora de escala para o tipo de negócio — normalmente é engano ou isco.
  if (input.kind === "rent" && input.price > 0 && input.price >= 20_000) {
    out.push({
      id: "price-scale-rent",
      level: "warn",
      title: "Valor parece de venda",
      body: "Este valor é uma renda mensal. Se querias anunciar uma venda, volta atrás e muda o tipo de negócio.",
    });
  }
  if (input.kind === "sale" && input.price > 0 && input.price < 15_000) {
    out.push({
      id: "price-scale-sale",
      level: "warn",
      title: "Valor parece de arrendamento",
      body: "Este valor é o preço total de venda. Se querias anunciar um arrendamento, volta atrás e muda o tipo de negócio.",
    });
  }

  // Incoerência entre tipo de negócio e tipo de espaço.
  if (input.spaceType && !isSpaceTypeAllowed(input.kind, input.spaceType)) {
    out.push({
      id: "type-mismatch",
      level: "block",
      title: "Tipo de espaço incompatível",
      body:
        input.kind === "sale"
          ? "Não é possível vender um quarto de uma casa. Para vender, escolhe uma unidade autónoma (estúdio, apartamento ou moradia)."
          : "Este tipo só existe na venda. Escolhe uma tipologia de arrendamento.",
    });
  }

  return out;
}

/** Há algo que impeça mesmo a publicação? */
export function hasBlockingWarning(ws: ListingWarning[]): boolean {
  return ws.some((w) => w.level === "block");
}
