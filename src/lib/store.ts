// Store client-side reativo com persistência em localStorage.
// Uma única fonte de verdade para todo o frontend. Trocar por backend depois
// mexe só em src/lib/api.ts — os componentes não sabem que existe store.

import { useSyncExternalStore } from "react";
import type {
  Listing,
  Match,
  MatchState,
  Chat,
  ChatMessage,
  Visit,
  VisitState,
  Notification,
  ClosedDeal,
  Review,
  CloseReason,
  ListingKind,
} from "./mock-data";

const KEY = "hm.store.v1";
const EVENT = "hm.store";

export type Preferences = {
  /** Arrendar ou comprar. Decide o que entra no feed. */
  kind: ListingKind;
  city: string;
  maxDistanceKm: number;
  /**
   * Tipos de espaço guardados por tipo de negócio: procurar um quarto para
   * arrendar não deve filtrar a pesquisa de compra (e vice-versa). São duas
   * pesquisas distintas, logo não podem partilhar o mesmo campo.
   */
  spaceTypes: Record<ListingKind, string[]>;
  minPrice: number;
  /** Teto de renda mensal quando kind="rent". */
  maxPrice: number;
  /** Teto de valor total quando kind="sale" — escalas diferentes não podem partilhar campo. */
  maxSalePrice: number;
  moveInFrom: string;
  pets: boolean;
  needsFurnished: boolean;
};

export type Profile = {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  /** Estudante, trabalhador, freelancer… — mostrado a quem vê o perfil. */
  occupation: string;
  phone: string;
  nif: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  /**
   * Documento de identificação declarado. Ter qualquer um destes implica ter
   * NIF, por isso o NIF não se pergunta em separado — seria perguntar duas
   * vezes o mesmo facto.
   */
  documentType: DocumentType | null;
  /** Reside em Portugal (afeta o tipo de documento esperado). */
  residentInPortugal: boolean;
  /**
   * Rendimento e estudante são independentes, não alternativas: um estudante
   * que vive sozinho tem quase sempre rendimento (bolsa, trabalho, apoio).
   * Tratá-los como opostos obrigava a pessoa a esconder metade da verdade.
   */
  hasIncome: boolean;
  isStudent: boolean;
  /** Declarações de quem anuncia — não se aplicam a quem procura. */
  authorizedToList: boolean;
  propertyDocsInOrder: boolean;
  termsAccepted: boolean;
};

export type DocumentType = "cc" | "passaporte" | "titulo-residencia";

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  cc: "Cartão de Cidadão",
  passaporte: "Passaporte",
  "titulo-residencia": "Título de residência",
};

/** Uma chave por categoria de Notification — ver settings.notifications. */
export type NotificationPrefs = {
  interest: boolean;
  conversation: boolean;
  visit: boolean;
  match: boolean;
  marketplace: boolean;
};

export type PrivacyPrefs = {
  /** Perfil visível a senhorios antes de enviares interesse. */
  discoverable: boolean;
  /** Mostrar "ativo agora" aos outros. */
  showActivity: boolean;
  /** Receber sugestões baseadas no que vais vendo. */
  personalisedSuggestions: boolean;
};

export type StoreState = {
  listings: Listing[];
  matches: Match[];
  chats: Chat[];
  visits: Visit[];
  notifications: Notification[];
  /**
   * Anúncios dispensados no feed. É a ÚNICA verdade não derivável sobre o feed —
   * "já demonstrei interesse" deriva-se de matches, não se guarda em separado
   * (guardar os dois lados fazia-os divergir quando o match mudava de estado).
   */
  passed: string[];
  favorites: string[];
  deals: ClosedDeal[];
  reviews: Review[];
  plan: PlanId;
  billingPeriod: BillingPeriod;
  notificationPrefs: NotificationPrefs;
  /** Idioma da interface. A tradução real entra depois; a escolha já persiste. */
  language: "pt" | "en";
  privacy: PrivacyPrefs;
  profile: Profile;
  preferences: Preferences;
};

const emptyProfile: Profile = {
  name: "",
  email: "",
  avatar: "",
  bio: "",
  occupation: "",
  phone: "",
  nif: "",
  emailVerified: false,
  phoneVerified: false,
  documentType: null,
  residentInPortugal: true,
  hasIncome: false,
  isStudent: false,
  authorizedToList: false,
  propertyDocsInOrder: false,
  termsAccepted: false,
};

const emptyPreferences: Preferences = {
  kind: "rent",
  city: "",
  maxDistanceKm: 5,
  spaceTypes: { rent: [], sale: [] },
  minPrice: 0,
  maxPrice: 2000,
  maxSalePrice: 400_000,
  moveInFrom: "",
  pets: false,
  needsFurnished: false,
};

const initialState: StoreState = {
  listings: [],
  matches: [],
  chats: [],
  visits: [],
  notifications: [],
  passed: [],
  favorites: [],
  deals: [],
  reviews: [],
  plan: "free",
  billingPeriod: "monthly",
  notificationPrefs: { interest: true, conversation: true, visit: true, match: true, marketplace: false },
  language: "pt",
  privacy: { discoverable: true, showActivity: true, personalisedSuggestions: true },
  profile: emptyProfile,
  preferences: emptyPreferences,
};

let state: StoreState = load();

function load(): StoreState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    return reconcile({ ...initialState, ...JSON.parse(raw) });
  } catch {
    return initialState;
  }
}

/**
 * Corrige estados que a app proíbe mas que podem ter ficado guardados por uma
 * versão anterior. Sem isto, "Free com 6 anúncios ativos" sobrevivia para
 * sempre em localStorage e nenhum ecrã sabia como o mostrar honestamente.
 * Um limite excedido só pode ter duas leituras — ou o plano está errado, ou os
 * anúncios estão. Assumimos que os anúncios são o facto e corrigimos o plano.
 */
function reconcile(s: StoreState): StoreState {
  const limit = PLANS[s.plan]?.maxActiveListings;
  if (limit === null || limit === undefined) return s;
  const active = s.listings.filter((l) => l.lifecycle === "published" || l.lifecycle === "negotiating").length;
  return active > limit ? { ...s, plan: "pro" } : s;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // quota — ignora
  }
  window.dispatchEvent(new Event(EVENT));
}

function set(mut: (s: StoreState) => StoreState) {
  state = mut(state);
  persist();
}

export function getState(): StoreState {
  return state;
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
const nowISO = () => new Date().toISOString();
const ago = () => "agora";

// ============ Scores calculados (nunca hardcoded) ============

export type ScoreItem = { label: string; pts: number; done: boolean; to?: string };

/** Breakdown do Trust Score a partir do perfil real. Soma máxima = 100. */
export function trustScoreBreakdown(s: StoreState = state, role: "seeker" | "landlord" = "seeker"): ScoreItem[] {
  const p = s.profile;
  return [
    { label: "Conta criada", pts: 50, done: true },
    { label: "Nome preenchido", pts: 5, done: p.name.trim().length > 0, to: "/profile" },
    { label: "Email verificado", pts: 5, done: p.emailVerified, to: "/settings" },
    { label: "Telemóvel verificado", pts: 10, done: p.phoneVerified, to: "/onboarding" },
    { label: "Foto de perfil", pts: 5, done: p.avatar.length > 0, to: "/profile" },
    { label: "Bio preenchida", pts: 5, done: p.bio.trim().length > 0, to: "/profile" },
    // Documento vale mais porque é o que dá confiança real; o NIF deixou de ser
    // um item à parte por ser consequência de ter qualquer um destes documentos.
    { label: "Documento de identificação", pts: 10, done: p.documentType !== null, to: "/onboarding" },
    // Cada papel pontua o que é relevante para o outro lado decidir: quem
    // procura mostra que consegue pagar, quem anuncia mostra legitimidade.
    role === "landlord"
      ? { label: "Autorizado a anunciar", pts: 5, done: p.authorizedToList, to: "/onboarding" }
      : { label: "Rendimento próprio", pts: 5, done: p.hasIncome, to: "/onboarding" },
    { label: "Termos aceites", pts: 5, done: p.termsAccepted, to: "/legal/terms" },
  ];
}

export function trustScore(s: StoreState = state, role: "seeker" | "landlord" = "seeker"): number {
  return trustScoreBreakdown(s, role).reduce((acc, i) => acc + (i.done ? i.pts : 0), 0);
}

/**
 * Quality Score do anúncio a partir dos campos realmente preenchidos. Máx 100.
 * Numa venda não existe "data de mudança" — esses 10 pontos passam para a
 * descrição, senão um anúncio de venda completo nunca chegaria aos 100.
 */
export function qualityScore(l: Partial<Listing>): number {
  const sale = l.kind === "sale";
  let q = 0;
  if (l.spaceType) q += 15;
  if ((l.city ?? "").length > 1) q += 10;
  if ((l.neighborhood ?? "").length > 1) q += 5;
  if ((l.title ?? "").length > 3) q += 10;
  const desc = l.description ?? "";
  const descMax = sale ? 30 : 20;
  q += desc.length > 120 ? descMax : desc.length > 50 ? Math.round(descMax * 0.6) : desc.length > 0 ? 5 : 0;
  if ((l.amenities ?? []).length >= 3) q += 10;
  else if ((l.amenities ?? []).length > 0) q += 5;
  if ((l.price ?? 0) > 0) q += 10;
  if (!sale && (l.moveInFrom || l.availableFrom)) q += 10;
  if ((l.visitAvailability ?? []).length > 0) q += 10;
  return Math.min(100, q);
}

/** Limite de plano: Free = 1 anúncio ativo. */
// ============ Plano: limites e invariantes ============

export type PlanId = "free" | "pro";
export type BillingPeriod = "monthly" | "annual";

/**
 * Limites por plano. `maxActiveListings: null` = sem limite.
 * Esta é a única definição — ecrãs, guards e avisos leem daqui, por isso não
 * pode existir um sítio que permita o que outro proíbe.
 */
export const PLANS: Record<PlanId, {
  name: string;
  maxActiveListings: number | null;
  monthly: number;
  annual: number;
  features: string[];
}> = {
  free: {
    name: "Free",
    maxActiveListings: 1,
    monthly: 0,
    annual: 0,
    features: ["1 anúncio ativo", "Candidatos ilimitados", "Conversas e visitas", "Trust Score"],
  },
  pro: {
    name: "Pro",
    maxActiveListings: null,
    monthly: 9.99,
    annual: 95.9, // ~2 meses grátis
    features: ["Anúncios ilimitados", "Destaque na descoberta", "Estatísticas de candidatos", "Apoio prioritário"],
  },
};

/** Um anúncio conta para o limite enquanto estiver visível ou em negociação. */
export function activeListingCount(s: StoreState = state): number {
  return s.listings.filter((l) => l.lifecycle === "published" || l.lifecycle === "negotiating").length;
}

export function canPublishAnother(s: StoreState = state): boolean {
  const limit = PLANS[s.plan].maxActiveListings;
  return limit === null || activeListingCount(s) < limit;
}

/**
 * Contrapositiva do limite: em vez de um booleano, diz quantos anúncios é
 * preciso pausar para caber no plano de destino. `null` = pode mudar já.
 * É o que impede o estado impossível "Free com 6 anúncios ativos" — a mudança
 * de plano nunca acontece deixando os dados inválidos.
 */
export function blockersToSwitchPlan(to: PlanId, s: StoreState = state): number {
  const limit = PLANS[to].maxActiveListings;
  if (limit === null) return 0;
  return Math.max(0, activeListingCount(s) - limit);
}

/** Avaliações do match — duplo-cego: só visíveis quando ambos submetem. */
export function reviewsVisible(matchId: string, s: StoreState = state): boolean {
  const rs = s.reviews.filter((r) => r.matchId === matchId);
  return rs.some((r) => r.by === "seeker") && rs.some((r) => r.by === "landlord");
}

// ============ Mutations ============

export const store = {
  reset() {
    state = initialState;
    persist();
  },

  // Listings
  createListing(data: Omit<Listing, "id">): Listing {
    const l: Listing = { ...data, id: uid() };
    set((s) => ({ ...s, listings: [l, ...s.listings] }));
    return l;
  },
  updateListing(id: string, patch: Partial<Listing>) {
    set((s) => ({ ...s, listings: s.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  },
  deleteListing(id: string) {
    set((s) => ({ ...s, listings: s.listings.filter((l) => l.id !== id) }));
  },

  // Favorites
  toggleFavorite(listingId: string) {
    set((s) => ({
      ...s,
      favorites: s.favorites.includes(listingId) ? s.favorites.filter((x) => x !== listingId) : [...s.favorites, listingId],
    }));
  },

  // Interest → cria match + chat
  sendInterest(listingId: string, message = ""): { match: Match; chat: Chat } {
    const listing = state.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error("Listing not found");

    const chat: Chat = {
      id: uid(),
      listingId,
      unread: 0,
      lastMessage: message || "Novo interesse.",
      lastAt: ago(),
      messages: message ? [{ from: "me", text: message, at: ago() }] : [],
    };
    const p = state.profile;
    const match: Match = {
      id: uid(),
      listingId,
      chatId: chat.id,
      state: "interested",
      updatedAt: ago(),
      reasons: [],
      message,
      // No mock, o candidato é o próprio perfil do seeker atual.
      candidate: {
        name: p.name || "Candidato",
        avatar: p.avatar,
        score: trustScore(),
        occupation: "",
        city: state.preferences.city,
        bio: p.bio,
        verifications: [
          { label: "Email verificado", ok: p.emailVerified },
          { label: "Telemóvel verificado", ok: p.phoneVerified },
          // Mostra o documento concreto — "identificação declarada" não diz nada
          // a quem tem de decidir se confia.
          { label: p.documentType ? DOCUMENT_LABELS[p.documentType] : "Documento", ok: p.documentType !== null },
          { label: "Rendimento próprio", ok: p.hasIncome },
          { label: "Estudante", ok: p.isStudent },
        ],
      },
    };
    const notif: Notification = {
      id: uid(),
      category: "interest",
      icon: "match",
      title: "Novo interesse",
      body: `Alguém demonstrou interesse em "${listing.title}".`,
      ago: ago(),
      unread: true,
      to: `/candidates`,
    };
    set((s) => ({
      ...s,
      chats: [chat, ...s.chats],
      matches: [match, ...s.matches],
      notifications: [notif, ...s.notifications],
    }));
    return { match, chat };
  },
  passListing(listingId: string) {
    set((s) => (s.passed.includes(listingId) ? s : { ...s, passed: [listingId, ...s.passed] }));
  },
  /** Desfazer no feed — devolve o anúncio à pilha. */
  unpassListing(listingId: string) {
    set((s) => ({ ...s, passed: s.passed.filter((id) => id !== listingId) }));
  },
  /** "Reiniciar feed" no empty state: limpa só os dispensados, nunca os interesses já enviados. */
  resetPassed() {
    set((s) => ({ ...s, passed: [] }));
  },

  // Chat
  sendMessage(chatId: string, text: string, from: "me" | "them" = "me") {
    const msg: ChatMessage = { from, text, at: ago() };
    set((s) => ({
      ...s,
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastAt: ago() } : c,
      ),
      matches: s.matches.map((m) =>
        m.chatId === chatId && m.state === "interested" ? { ...m, state: "conversation", updatedAt: ago() } : m,
      ),
    }));
  },
  setMatchState(matchId: string, next: MatchState) {
    set((s) => ({
      ...s,
      matches: s.matches.map((m) => (m.id === matchId ? { ...m, state: next, updatedAt: ago() } : m)),
    }));
  },

  // Visits
  proposeVisit(listingId: string, matchId: string, slot: string) {
    const v: Visit = {
      id: uid(),
      listingId,
      matchId,
      who: "Interessado",
      whoAvatar: "",
      date: slot,
      time: slot,
      status: "pending",
    };
    set((s) => ({
      ...s,
      visits: [v, ...s.visits],
      matches: s.matches.map((m) => (m.id === matchId ? { ...m, state: "visit_scheduled", updatedAt: ago() } : m)),
    }));
    return v;
  },
  /**
   * P → Q: o status da visita é a causa, o estado do match é a consequência —
   * andam sempre juntos, sem passo manual extra em cada ecrã que toca visitas.
   * done → match "visit_done" (destrava o fecho do espaço)
   * cancelled → match volta a "conversation" (liberta para propor nova visita)
   */
  setVisitStatus(id: string, status: VisitState) {
    const v = state.visits.find((x) => x.id === id);
    set((s) => ({
      ...s,
      visits: s.visits.map((x) => (x.id === id ? { ...x, status: status as Visit["status"] } : x)),
      matches: !v
        ? s.matches
        : s.matches.map((m) => {
            if (m.id !== v.matchId) return m;
            if (status === "done") return { ...m, state: "visit_done", updatedAt: ago() };
            if (status === "cancelled" && m.state === "visit_scheduled") return { ...m, state: "conversation", updatedAt: ago() };
            return m;
          }),
    }));
  },

  // Notifications
  markNotificationRead(id: string) {
    set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)) }));
  },
  markAllNotificationsRead() {
    set((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, unread: false })) }));
  },

  // Profile & Preferences
  updateProfile(patch: Partial<Profile>) {
    set((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  },
  updatePreferences(patch: Partial<Preferences>) {
    set((s) => ({ ...s, preferences: { ...s.preferences, ...patch } }));
  },

  /**
   * Muda de plano. Recusa se o destino não comportar os anúncios ativos —
   * a alternativa seria deixar o utilizador num estado que a app proíbe
   * ("Free com 6 anúncios"), e depois já não haveria forma coerente de o ler.
   * Devolve true se mudou.
   *
   * TODO(stripe): a mudança real passa a ser confirmada pelo webhook da
   * subscrição; isto fica só a refletir o estado que o Stripe reportar.
   */
  setPlan(plan: PlanId, period: BillingPeriod = state.billingPeriod): boolean {
    if (blockersToSwitchPlan(plan) > 0) return false;
    set((s) => ({ ...s, plan, billingPeriod: period }));
    return true;
  },
  setBillingPeriod(period: BillingPeriod) {
    set((s) => ({ ...s, billingPeriod: period }));
  },

  // Definições
  updateNotificationPrefs(patch: Partial<NotificationPrefs>) {
    set((s) => ({ ...s, notificationPrefs: { ...s.notificationPrefs, ...patch } }));
  },
  updatePrivacy(patch: Partial<PrivacyPrefs>) {
    set((s) => ({ ...s, privacy: { ...s.privacy, ...patch } }));
  },
  setLanguage(language: "pt" | "en") {
    set((s) => ({ ...s, language }));
  },

  /**
   * Fecho de anúncio com motivo (wizard /rental-close/$chatId).
   * Só "homematch" cria um ClosedDeal pendente associado ao seeker do chat —
   * o estado final só acontece quando AMBOS confirmarem.
   * Serve arrendamento e venda: o kind vem do próprio anúncio, nunca é pedido
   * outra vez ao utilizador (já está decidido desde a publicação).
   */
  closeListing(
    matchId: string,
    reason: CloseReason,
    details?: { moveIn: string; months: number | null; amount: number },
  ) {
    const m = state.matches.find((x) => x.id === matchId);
    if (!m) return;
    const listingId = m.listingId;
    const kind: ListingKind = state.listings.find((l) => l.id === listingId)?.kind ?? "rent";

    if (reason === "paused" || reason === "rework") {
      // "paused" tem de sair do feed — reusar "published" aqui desfazia o próprio propósito do botão.
      set((s) => ({
        ...s,
        listings: s.listings.map((l) =>
          l.id === listingId ? { ...l, lifecycle: reason === "rework" ? "draft" : "paused" } : l,
        ),
        matches: s.matches.map((x) => (x.id === matchId ? { ...x, state: "closed" as MatchState, updatedAt: ago() } : x)),
      }));
      return;
    }

    if (reason === "outside") {
      // Negócio fechado fora do app: fecha sem associar o seeker deste chat.
      set((s) => ({
        ...s,
        listings: s.listings.map((l) => (l.id === listingId ? { ...l, lifecycle: "rented" } : l)),
        matches: s.matches.map((x) =>
          x.listingId === listingId ? { ...x, state: "closed" as MatchState, updatedAt: ago() } : x,
        ),
      }));
      return;
    }

    // reason === "homematch": ClosedDeal pendente de confirmação do seeker.
    const deal: ClosedDeal = {
      id: uid(),
      kind,
      matchId,
      listingId,
      moveIn: details?.moveIn ?? "",
      // Prazo de contrato não existe numa venda.
      months: kind === "sale" ? null : details?.months ?? null,
      amount: details?.amount ?? 0,
      landlordConfirmed: true,
      seekerConfirmed: false,
      at: nowISO(),
    };
    const listing = state.listings.find((l) => l.id === listingId);
    const sale = kind === "sale";
    const notif: Notification = {
      id: uid(),
      category: "match",
      icon: "match",
      title: sale ? "Confirma a proposta" : "Confirma o teu arrendamento",
      body: sale
        ? `O proprietário registou uma proposta aceite para "${listing?.title ?? "o imóvel"}". Confirma nos teus matches.`
        : `O senhorio indicou que arrendou "${listing?.title ?? "o espaço"}" contigo. Confirma nos teus matches.`,
      ago: ago(),
      unread: true,
      to: "/matches",
    };
    set((s) => ({
      ...s,
      deals: [deal, ...s.deals],
      matches: s.matches.map((x) => (x.id === matchId ? { ...x, state: "negotiating" as MatchState, updatedAt: ago() } : x)),
      notifications: [notif, ...s.notifications],
    }));
  },

  /** Confirmação do lado do seeker/comprador — fecha o ciclo dos dois lados. */
  confirmDealSeeker(dealId: string) {
    const d = state.deals.find((x) => x.id === dealId);
    if (!d) return;
    set((s) => ({
      ...s,
      deals: s.deals.map((x) => (x.id === dealId ? { ...x, seekerConfirmed: true } : x)),
      matches: s.matches.map((m) =>
        m.id === d.matchId ? { ...m, state: "rental_confirmed" as MatchState, updatedAt: ago() } : m,
      ),
      listings: s.listings.map((l) => (l.id === d.listingId ? { ...l, lifecycle: "rented" } : l)),
    }));
  },

  /** Avaliação duplo-cego: guarda o lado; visibilidade via reviewsVisible(). */
  submitReview(matchId: string, by: "seeker" | "landlord", rating: number, tags: string[], comment: string) {
    const r: Review = { id: uid(), matchId, by, rating, tags, comment, at: nowISO() };
    set((s) => ({ ...s, reviews: [r, ...s.reviews.filter((x) => !(x.matchId === matchId && x.by === by))] }));
    return r;
  },

  /** Usado pelo seed de desenvolvimento para popular o store de uma vez. */
  importState(partial: Partial<StoreState>) {
    set((s) => ({ ...s, ...partial }));
  },
};
