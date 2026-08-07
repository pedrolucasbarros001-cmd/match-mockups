// Estado "virgem": tudo vazio, sem dados fictícios.
// Mantemos os tipos e helpers para não partir imports pelas telas.

import { getState } from "./store";

/**
 * Nem todos existem nos dois tipos de negócio — ver spaceTypesFor() em
 * listing-rules.ts, que é quem decide o que se pode arrendar e o que se vende.
 */
export type SpaceType =
  | "Quarto"
  | "Suite"
  | "Quarto Partilhado"
  | "Estúdio"
  | "T1"
  | "T2"
  | "T3"
  | "T4+"
  | "Moradia";

export type ListingLifecycle =
  | "draft"
  | "published"
  | "paused"
  | "negotiating"
  | "rented";

export type MatchState =
  | "interested"
  | "conversation"
  | "visit_scheduled"
  | "visit_done"
  | "negotiating"
  | "rental_confirmed"
  | "closed";

export type VisitState =
  | "proposed"
  | "accepted"
  | "rescheduled"
  | "confirmed"
  | "done"
  | "cancelled";

/** Arrendar ou vender. Decide vocabulário, passos do wizard e leitura do preço. */
export type ListingKind = "rent" | "sale";

export type Listing = {
  id: string;
  title: string;
  kind: ListingKind;
  /** Renda mensal se kind="rent"; valor total pedido se kind="sale". Ver priceLabel(). */
  price: number;
  city: string;
  neighborhood: string;
  distanceM: number;
  type: "Quarto" | "Apartamento" | "Casa";
  spaceType: SpaceType;
  lifecycle: ListingLifecycle;
  qualityScore: number;
  pets: boolean;
  smoke: boolean;
  availableFrom: string;
  moveInFrom: string;
  visitAvailability: string[];
  minMonths: number;
  capacity: number;
  description: string;
  amenities: string[];
  rules: string;
  photos: string[];
  owner: { name: string; avatar: string; score: number; responds: string; rating: number; reviews: number };
};

export const listings: Listing[] = [];

// ============ Leitura do preço (fonte única) ============
// O campo `price` é o mesmo; só o kind decide como se lê. Nenhum ecrã escreve
// "/mês" à mão — senão um anúncio de venda apareceria como renda mensal.

// Ponto como separador de milhares: na fonte mono o espaço do pt-PT abre um
// vão enorme no meio do número ("€235 000"), e o ponto é uso corrente em PT.
const euros = (n: number) => `€${n.toLocaleString("pt-PT").replace(/\s/g, ".")}`;

/** Preço completo, pronto a mostrar. Ex: "€450 / mês" ou "€180 000". */
export function priceLabel(l: Pick<Listing, "kind" | "price">): string {
  return l.kind === "sale" ? euros(l.price) : `${euros(l.price)} / mês`;
}

/** Só o sufixo, para quem quer estilizar o número em separado. */
export function priceSuffix(kind: ListingKind): string {
  return kind === "sale" ? "" : "/ mês";
}

/** Valor sem sufixo. */
export function priceAmount(price: number): string {
  return euros(price);
}

/** Escala do slider de preço — mensal e total vivem em ordens de grandeza diferentes. */
export function priceRange(kind: ListingKind): { min: number; max: number; step: number } {
  return kind === "sale" ? { min: 25_000, max: 900_000, step: 5_000 } : { min: 100, max: 2_000, step: 10 };
}

export function compatibilityReasons(l: Listing): string[] {
  // Lê as preferências reais do store (import tardio para evitar ciclo em SSR).
  const prefs = getState().preferences;
  const r: string[] = [];
  // Teto de preço conforme o tipo de negócio do próprio anúncio.
  const ceiling = l.kind === "sale" ? prefs.maxSalePrice : prefs.maxPrice;
  if (ceiling && l.price <= ceiling) r.push("Dentro do orçamento");
  if (l.kind === "rent" && prefs.pets && l.pets) r.push("Aceita animais");
  if ((prefs.spaceTypes[l.kind] ?? []).includes(l.spaceType)) r.push(`${l.spaceType} · o que procuras`);
  if (prefs.city && l.city.toLowerCase() === prefs.city.toLowerCase()) r.push("Na tua cidade");
  return r.slice(0, 3);
}

export type Interest = {
  listingId: string;
  status: "pending" | "accepted" | "passed";
  ago: string;
  daysLeft?: number;
  message?: string;
};
export const interests: Interest[] = [];

export type ChatMessage = { from: "me" | "them"; text: string; at: string };
export type Chat = {
  id: string;
  listingId: string;
  unread: number;
  lastMessage: string;
  lastAt: string;
  messages: ChatMessage[];
  /** Silenciada: continua a receber, deixa de notificar. */
  muted?: boolean;
  /** Arquivada: sai da lista principal mas não se perde. */
  archived?: boolean;
  /** Bloqueada: ninguém escreve mais. Só o próprio pode desbloquear. */
  blocked?: boolean;
};
export const chats: Chat[] = [];

/** Denúncia feita por um utilizador. Fica registada para revisão. */
export type Report = {
  id: string;
  /** O que está a ser denunciado. */
  target: "chat" | "listing" | "user";
  targetId: string;
  reason: ReportReason;
  detail: string;
  at: string;
};

export type ReportReason =
  | "scam"
  | "fake_listing"
  | "offensive"
  | "discrimination"
  | "off_platform_payment"
  | "other";

export const REPORT_REASONS: { id: ReportReason; label: string; hint: string }[] = [
  { id: "scam", label: "Tentativa de burla", hint: "Pediu dinheiro antecipado, sinal ou transferência." },
  { id: "fake_listing", label: "Anúncio falso", hint: "O espaço não existe ou as fotos não são reais." },
  { id: "off_platform_payment", label: "Quer sair da plataforma", hint: "Insiste em tratar tudo fora da app." },
  { id: "offensive", label: "Comportamento ofensivo", hint: "Linguagem agressiva, assédio ou ameaças." },
  { id: "discrimination", label: "Discriminação", hint: "Recusa ou trata mal por origem, género, etnia ou religião." },
  { id: "other", label: "Outro motivo", hint: "Descreve o que se passou." },
];

export type Candidate = {
  name: string;
  avatar: string;
  score: number;
  occupation: string;
  city: string;
  bio: string;
  verifications: { label: string; ok: boolean }[];
};

export type Match = {
  id: string;
  listingId: string;
  chatId: string;
  state: MatchState;
  updatedAt: string;
  reasons: string[];
  candidate?: Candidate;
  message?: string;
};
export const matches: Match[] = [];

// Motivos de fecho de anúncio (wizard /rental-close/$chatId)
export type CloseReason = "homematch" | "outside" | "paused" | "rework";

/**
 * Negócio fechado — arrendamento ou venda. Só existe depois de AMBOS os lados
 * confirmarem. `months` é null numa venda (não há prazo de contrato).
 * Nota: o HomeMatch só regista o que as partes declararam ter acordado; não é
 * parte no contrato nem processa pagamentos (ver /legal/terms).
 */
export type ClosedDeal = {
  id: string;
  kind: ListingKind;
  matchId: string;
  listingId: string;
  /** Data de entrada (arrendamento) ou de escritura prevista (venda). */
  moveIn: string;
  months: number | null;
  /** Renda mensal acordada ou valor da proposta aceite. */
  amount: number;
  landlordConfirmed: boolean;
  seekerConfirmed: boolean;
  at: string;
};

// Avaliação duplo-cego: só visível quando ambos os lados submetem.
export type Review = {
  id: string;
  matchId: string;
  by: "seeker" | "landlord";
  rating: number;
  tags: string[];
  comment: string;
  at: string;
};

/**
 * Fases da negociação. As 4 primeiras são iguais nos dois tipos; só o fecho
 * muda de nome. Passa-se o kind para o mesmo estado nunca ser lido como
 * "Arrendado" num anúncio de venda.
 */
export function matchSteps(kind: ListingKind = "rent"): { key: MatchState; label: string }[] {
  return [
    { key: "interested", label: "Interesse" },
    { key: "conversation", label: "Conversa" },
    { key: "visit_scheduled", label: "Visita marcada" },
    { key: "visit_done", label: "Visita feita" },
    { key: "rental_confirmed", label: kind === "sale" ? "Proposta aceite" : "Arrendado" },
  ];
}

/** Compatibilidade: continua a existir para quem não conhece o kind. */
export const MATCH_STEPS = matchSteps("rent");

/**
 * Fonte ÚNICA do texto de "próxima ação" para um par (estado, role).
 * Equivalência: o que /matches, /chats e a lista de conversas dizem tem de ser
 * exatamente o mesmo facto — nenhum ecrã pode escrever a sua própria versão,
 * senão o mesmo estado passa a ter duas leituras diferentes.
 */
export function nextActionFor(
  state: MatchState,
  role: "tenant" | "landlord" = "tenant",
  kind: ListingKind = "rent",
): string {
  const sale = kind === "sale";
  switch (state) {
    case "interested":
      return role === "landlord" ? "Responder ao interessado" : "Aguardar resposta";
    case "conversation":
      return "Propor visita";
    case "visit_scheduled":
      return role === "landlord" ? "Confirmar visita feita" : "Aguardar confirmação da visita";
    case "visit_done":
      return role === "landlord"
        ? sale ? "Registar proposta" : "Fechar este espaço"
        : sale ? "Aguardar decisão do proprietário" : "Aguardar decisão do senhorio";
    case "negotiating":
      return role === "landlord"
        ? sale ? "Aguardar confirmação do comprador" : "Aguardar confirmação do inquilino"
        : sale ? "Confirmar proposta" : "Confirmar arrendamento";
    case "rental_confirmed":
      return "Deixar avaliação";
    case "closed":
      return "Sem ação — negociação fechada";
  }
}

/**
 * Equivalência UI↔estado: o botão de ação existe se e só se este par
 * (estado, role) tiver mesmo uma ação a executar. Quem só pode aguardar
 * não vê botão nenhum — a UI nunca oferece algo que o estado não permite.
 */
export function canActOn(state: MatchState, role: "tenant" | "landlord" = "tenant"): boolean {
  switch (state) {
    case "interested":
      return role === "landlord";
    case "conversation":
      return true;
    case "visit_scheduled":
    case "visit_done":
      return role === "landlord";
    case "negotiating":
      return role === "tenant";
    case "rental_confirmed":
      return true; // deixar avaliação
    case "closed":
      return false;
  }
}

export type Notification = {
  id: string;
  category: "interest" | "match" | "conversation" | "visit" | "availability" | "marketplace" | "system";
  icon: "match" | "message" | "reminder";
  title: string;
  body: string;
  ago: string;
  unread: boolean;
  to?: string;
};
export const notifications: Notification[] = [];

// Perfil "virgem" — sem nome, sem foto, sem pontos.
export const me = {
  name: "",
  avatar: "",
  email: "",
  bio: "",
  score: 0,
  scoreBreakdown: [
    { label: "Email verificado", pts: 5, done: false },
    { label: "Telemóvel verificado", pts: 10, done: false },
    { label: "Foto de perfil", pts: 5, done: false },
    { label: "Bio preenchida", pts: 5, done: false },
    { label: "NIF declarado", pts: 5, done: false },
    { label: "Identificação declarada", pts: 5, done: false },
    { label: "Rendimento ou estudante", pts: 5, done: false },
    { label: "Termos aceites", pts: 5, done: false },
  ],
};

export function scoreColor(score: number): string {
  if (score >= 80) return "score-blue";
  if (score >= 60) return "score-green";
  if (score >= 40) return "score-amber";
  return "score-red";
}

export type Room = { id: string; listingId: string; name: string; price: number; status: "available" | "reserved" | "occupied"; tenant?: string };
export const rooms: Room[] = [];

/**
 * Uma visita é uma negociação, não um facto: alguém propõe uma data, o outro
 * lado aceita, recusa ou contrapropõe. Guardamos cada proposta como um registo
 * próprio — assim há histórico e nunca se perde quem propôs o quê.
 *
 * pending   → à espera de resposta do OUTRO lado
 * accepted  → data combinada; a visita vai acontecer
 * declined  → recusada (normalmente seguida de contraproposta)
 * done      → aconteceu; destrava o fecho do negócio
 * cancelled → estava combinada e foi desmarcada
 */
export type VisitStatus = "pending" | "accepted" | "declined" | "done" | "cancelled";

export type Visit = {
  id: string;
  listingId: string;
  /** Liga a visita ao match — é o que permite ao status da visita empurrar o estado do match automaticamente. */
  matchId: string;
  /** Quem fez esta proposta. Ninguém aceita a sua própria proposta. */
  proposedBy: "seeker" | "landlord";
  who: string;
  whoAvatar: string;
  /** Data ISO (YYYY-MM-DD) — comparável e ordenável, ao contrário de texto livre. */
  date: string;
  /** Hora HH:MM. */
  time: string;
  status: VisitStatus;
  /** Proposta que esta veio substituir, quando é contraproposta. */
  counterOf?: string;
  /** Motivo dado ao recusar ou cancelar. */
  note?: string;
  createdAt: string;
};
export const visits: Visit[] = [];

/** Formata uma data ISO para leitura humana: "Sáb, 27 jul". */
export function formatVisitDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" });
}

/** Data + hora prontas a mostrar. */
export function formatVisitWhen(v: Pick<Visit, "date" | "time">): string {
  return [formatVisitDate(v.date), v.time].filter(Boolean).join(" · ");
}

/** Já passou a hora marcada? Usado para só então oferecer "marcar como feita". */
export function visitIsPast(v: Pick<Visit, "date" | "time">): boolean {
  if (!v.date) return false;
  return new Date(`${v.date}T${v.time || "23:59"}`).getTime() < Date.now();
}

export const favoriteIds: string[] = [];

export const mapPins: { id: string; x: number; y: number }[] = [];

export const recommendationSections: { title: string; subtitle: string; ids: string[] }[] = [];

export const landlordAccount = {
  fiscalName: "",
  nif: "",
  address: "",
  plan: "Free" as const,
  planLimit: "1 anúncio ativo",
  invoices: [] as { id: string; date: string; label: string; amount: number }[],
};
