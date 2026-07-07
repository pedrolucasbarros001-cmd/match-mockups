// Estado "virgem": tudo vazio, sem dados fictícios.
// Mantemos os tipos e helpers para não partir imports pelas telas.

export type SpaceType =
  | "Quarto"
  | "Suite"
  | "Quarto Partilhado"
  | "Estúdio"
  | "T1"
  | "T2"
  | "T3"
  | "T4+";

export type ListingLifecycle =
  | "draft"
  | "published"
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

export type Listing = {
  id: string;
  title: string;
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

// Contexto de pesquisa (o que o utilizador procura AGORA). Vazio por defeito.
export const userContext = {
  city: "",
  maxDistanceKm: 5,
  spaceTypes: [] as SpaceType[],
  minPrice: 0,
  maxPrice: 2000,
  moveInFrom: "",
  pets: false,
  needsFurnished: false,
};

export function compatibilityReasons(l: Listing): string[] {
  const r: string[] = [];
  if (userContext.maxPrice && l.price <= userContext.maxPrice && l.price >= userContext.minPrice) r.push("Dentro do orçamento");
  if (userContext.pets && l.pets) r.push("Aceita animais");
  if (userContext.spaceTypes.includes(l.spaceType)) r.push(`${l.spaceType} · o que procuras`);
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
};
export const chats: Chat[] = [];

export type Match = {
  id: string;
  listingId: string;
  chatId: string;
  state: MatchState;
  updatedAt: string;
  reasons: string[];
};
export const matches: Match[] = [];

export const MATCH_STEPS: { key: MatchState; label: string }[] = [
  { key: "interested", label: "Interesse" },
  { key: "conversation", label: "Conversa" },
  { key: "visit_scheduled", label: "Visita marcada" },
  { key: "visit_done", label: "Visita feita" },
  { key: "rental_confirmed", label: "Arrendado" },
];

export function nextActionFor(state: MatchState, role: "tenant" | "landlord" = "tenant"): string {
  switch (state) {
    case "interested":
      return role === "landlord" ? "Responder ao interessado" : "Aguardar resposta";
    case "conversation":
      return "Propor visita";
    case "visit_scheduled":
      return role === "landlord" ? "Confirmar visita" : "Confirmar presença";
    case "visit_done":
      return "Confirmar arrendamento";
    case "negotiating":
      return "Confirmar arrendamento";
    case "rental_confirmed":
      return "Arrendado";
    case "closed":
      return "Reativar anúncio";
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

export type Visit = { id: string; listingId: string; who: string; whoAvatar: string; date: string; time: string; status: "pending" | "confirmed" | "done" | "cancelled" };
export const visits: Visit[] = [];

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
