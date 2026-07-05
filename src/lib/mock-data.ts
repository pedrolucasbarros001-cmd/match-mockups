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
  type: "Quarto" | "Apartamento" | "Casa"; // legado (usado por listagens antigas)
  spaceType: SpaceType;
  lifecycle: ListingLifecycle;
  qualityScore: number; // interno, nunca público
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

const U = (q: string, i = 0) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=900&q=70&ix=${i}`;

export const listings: Listing[] = [
  {
    id: "1",
    title: "Quarto luminoso na Sé",
    price: 450,
    city: "Bragança",
    neighborhood: "Bairro da Sé",
    distanceM: 800,
    type: "Quarto",
    spaceType: "Quarto",
    lifecycle: "published",
    qualityScore: 82,
    pets: true,
    smoke: false,
    availableFrom: "1 Jul",
    moveInFrom: "1 Jul 2026",
    visitAvailability: ["Sáb 10:00", "Sáb 15:00", "Dom 11:00"],
    minMonths: 6,
    capacity: 1,
    description:
      "Quarto individual com cama de casal, roupeiro grande e secretária. Casa de banho partilhada com mais uma pessoa. Cozinha equipada, sala comum espaçosa. Wi-Fi rápido incluído. Excelente para estudantes ou jovens trabalhadores.",
    amenities: ["Wi-Fi", "Cozinha", "Lavandaria", "Aquecimento"],
    rules: "Sem festas. Respeitar silêncio depois das 22h. Sem visitas a dormir sem aviso.",
    photos: [
      "photo-1505691938895-1758d7feb511",
      "photo-1522708323590-d24dbb6b0267",
      "photo-1493809842364-78817add7ffb",
      "photo-1560448204-e02f11c3d0e2",
    ].map((p) => `https://images.unsplash.com/${p}?auto=format&fit=crop&w=900&q=70`),
    owner: { name: "João M.", avatar: U("photo-1535713875002-d1d0cf377fde"), score: 82, responds: "Responde em < 2h", rating: 4.8, reviews: 9 },
  },
  {
    id: "2",
    title: "T1 com varanda no Centro",
    price: 620,
    city: "Bragança",
    neighborhood: "Centro",
    distanceM: 300,
    type: "Apartamento",
    spaceType: "T1",
    lifecycle: "negotiating",
    qualityScore: 74,
    pets: false,
    smoke: false,
    availableFrom: "15 Jul",
    moveInFrom: "15 Jul 2026",
    visitAvailability: ["Sex 18:00", "Sáb 12:00"],
    minMonths: 12,
    capacity: 2,
    description:
      "T1 totalmente mobilado, com varanda virada a sul e muita luz natural. Cozinha americana equipada. Edifício com elevador e arrecadação.",
    amenities: ["Wi-Fi", "Cozinha", "Aquecimento", "Varanda", "Elevador"],
    rules: "Sem animais. Sem fumar dentro de casa.",
    photos: [
      "photo-1502672260266-1c1ef2d93688",
      "photo-1484154218962-a197022b5858",
      "photo-1556909114-f6e7ad7d3136",
      "photo-1494203484021-3c454daf695d",
    ].map((p) => `https://images.unsplash.com/${p}?auto=format&fit=crop&w=900&q=70`),
    owner: { name: "Marta R.", avatar: U("photo-1438761681033-6461ffad8d80"), score: 76, responds: "Responde no dia", rating: 4.6, reviews: 4 },
  },
  {
    id: "3",
    title: "Quarto acolhedor no Largo do Sé",
    price: 380,
    city: "Bragança",
    neighborhood: "Sé",
    distanceM: 500,
    type: "Quarto",
    spaceType: "Quarto",
    lifecycle: "published",
    qualityScore: 88,
    pets: true,
    smoke: false,
    availableFrom: "Imediato",
    moveInFrom: "Imediato",
    visitAvailability: ["Sáb 10:00", "Dom 16:00"],
    minMonths: 3,
    capacity: 1,
    description: "Quarto pequeno mas muito acolhedor. Ideal para estudantes. Inclui despesas.",
    amenities: ["Wi-Fi", "Cozinha", "Despesas incluídas"],
    rules: "Sem festas.",
    photos: [
      "photo-1540518614846-7eded433c457",
      "photo-1505693416388-ac5ce068fe85",
      "photo-1513694203232-719a280e022f",
    ].map((p) => `https://images.unsplash.com/${p}?auto=format&fit=crop&w=900&q=70`),
    owner: { name: "Ana P.", avatar: U("photo-1544005313-94ddf0286df2"), score: 91, responds: "Responde em < 1h", rating: 4.9, reviews: 23 },
  },
  {
    id: "4",
    title: "Casa T3 com jardim",
    price: 950,
    city: "Bragança",
    neighborhood: "Santa Maria",
    distanceM: 1800,
    type: "Casa",
    spaceType: "T3",
    lifecycle: "published",
    qualityScore: 66,
    pets: true,
    smoke: false,
    availableFrom: "1 Ago",
    moveInFrom: "1 Ago 2026",
    visitAvailability: ["Sáb 11:00"],
    minMonths: 12,
    capacity: 4,
    description: "Casa familiar com 3 quartos, 2 wcs, jardim privativo e garagem para 2 carros.",
    amenities: ["Wi-Fi", "Cozinha", "Garagem", "Jardim", "Lavandaria"],
    rules: "Família ou grupo de até 4 pessoas. Sem festas.",
    photos: [
      "photo-1568605114967-8130f3a36994",
      "photo-1570129477492-45c003edd2be",
      "photo-1600585154340-be6161a56a0c",
    ].map((p) => `https://images.unsplash.com/${p}?auto=format&fit=crop&w=900&q=70`),
    owner: { name: "Pedro S.", avatar: U("photo-1500648767791-00dcc994a43e"), score: 68, responds: "Responde em 2 dias", rating: 4.3, reviews: 6 },
  },
  {
    id: "5",
    title: "Estúdio moderno perto da Universidade",
    price: 520,
    city: "Bragança",
    neighborhood: "Campus",
    distanceM: 200,
    type: "Apartamento",
    spaceType: "Estúdio",
    lifecycle: "published",
    qualityScore: 79,
    pets: false,
    smoke: false,
    availableFrom: "1 Set",
    moveInFrom: "1 Set 2026",
    visitAvailability: ["Ter 17:00", "Qui 18:00"],
    minMonths: 9,
    capacity: 1,
    description: "Estúdio recém-renovado, ideal para um estudante. A 2 minutos a pé do IPB.",
    amenities: ["Wi-Fi", "Cozinha", "Aquecimento", "Mobilado"],
    rules: "Só estudantes. Sem fumar.",
    photos: [
      "photo-1522444195799-478538b28823",
      "photo-1554995207-c18c203602cb",
      "photo-1598928506311-c55ded91a20c",
    ].map((p) => `https://images.unsplash.com/${p}?auto=format&fit=crop&w=900&q=70`),
    owner: { name: "Sofia L.", avatar: U("photo-1487412720507-e7ab37603c6f"), score: 88, responds: "Responde em < 3h", rating: 4.7, reviews: 12 },
  },
];

// --- Contexto (o que o utilizador procura AGORA) ---
export const userContext = {
  city: "Bragança",
  maxDistanceKm: 3,
  spaceTypes: ["Quarto", "Estúdio", "T1"] as SpaceType[],
  minPrice: 250,
  maxPrice: 600,
  moveInFrom: "1 Jul 2026",
  pets: true,
  needsFurnished: true,
};

// Devolve 2–3 razões (nunca um número) que explicam a compatibilidade
export function compatibilityReasons(l: Listing): string[] {
  const r: string[] = [];
  if (l.price <= userContext.maxPrice && l.price >= userContext.minPrice) r.push("Dentro do orçamento");
  if (userContext.pets && l.pets) r.push("Aceita animais");
  if (userContext.spaceTypes.includes(l.spaceType)) r.push(`${l.spaceType} · o que procuras`);
  if (l.distanceM <= userContext.maxDistanceKm * 1000) r.push(`A ${(l.distanceM / 1000).toFixed(1)} km de ti`);
  if (l.amenities.includes("Mobilado") || l.amenities.includes("Cozinha")) r.push("Mobilado");
  return r.slice(0, 3);
}

export type Interest = {
  listingId: string;
  status: "pending" | "accepted" | "passed";
  ago: string;
  daysLeft?: number;
  message?: string;
};

export const interests: Interest[] = [
  { listingId: "1", status: "pending", ago: "há 2h", daysLeft: 7, message: "Olá! Tenho interesse e procuro um sítio tranquilo perto do centro." },
  { listingId: "2", status: "pending", ago: "há 1 dia", daysLeft: 6 },
  { listingId: "3", status: "accepted", ago: "há 3 dias" },
  { listingId: "5", status: "passed", ago: "há 8 dias" },
];

export type ChatMessage = { from: "me" | "them"; text: string; at: string };
export type Chat = {
  id: string;
  listingId: string;
  unread: number;
  lastMessage: string;
  lastAt: string;
  messages: ChatMessage[];
};

export const chats: Chat[] = [
  {
    id: "c1",
    listingId: "3",
    unread: 2,
    lastMessage: "Combinado! Vemo-nos sábado às 10h.",
    lastAt: "14:32",
    messages: [
      { from: "them", text: "Olá! Recebi o teu pedido, tudo bem?", at: "14:10" },
      { from: "me", text: "Olá Ana! Tudo, gostei muito do quarto. Podemos marcar uma visita?", at: "14:18" },
      { from: "them", text: "Claro. Que tal sábado de manhã?", at: "14:25" },
      { from: "me", text: "Por mim perfeito. 10h?", at: "14:28" },
      { from: "them", text: "Combinado! Vemo-nos sábado às 10h.", at: "14:32" },
    ],
  },
  {
    id: "c2",
    listingId: "2",
    unread: 0,
    lastMessage: "Obrigada pelo interesse, vou rever os pedidos amanhã.",
    lastAt: "ontem",
    messages: [
      { from: "me", text: "Olá, gostei muito do apartamento.", at: "ontem 10:00" },
      { from: "them", text: "Obrigada pelo interesse, vou rever os pedidos amanhã.", at: "ontem 18:14" },
    ],
  },
];

// --- Matches (o "estado" de cada negociação) ---
export type Match = {
  id: string;
  listingId: string;
  chatId: string;
  state: MatchState;
  updatedAt: string;
  reasons: string[];
};

export const matches: Match[] = [
  { id: "m1", listingId: "3", chatId: "c1", state: "visit_scheduled", updatedAt: "há 2h", reasons: ["Aceita animais", "Dentro do orçamento"] },
  { id: "m2", listingId: "2", chatId: "c2", state: "conversation", updatedAt: "ontem", reasons: ["Perto do centro", "Mobilado"] },
  { id: "m3", listingId: "1", chatId: "", state: "interested", updatedAt: "há 2h", reasons: ["Dentro do orçamento", "Aceita animais"] },
  { id: "m4", listingId: "5", chatId: "", state: "closed", updatedAt: "há 8 dias", reasons: [] },
];

// Passos canónicos usados pela NegotiationTimeline
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

export const notifications: Notification[] = [
  { id: "n1", category: "match", icon: "match", title: "Tens um match 🎉", body: "Ana P. aceitou o teu interesse no Quarto Largo do Sé.", ago: "há 1h", unread: true, to: "/matches" },
  { id: "n2", category: "conversation", icon: "message", title: "Nova mensagem", body: "Ana P.: Combinado! Vemo-nos sábado às 10h.", ago: "há 2h", unread: true, to: "/chats" },
  { id: "n3", category: "visit", icon: "reminder", title: "Visita amanhã", body: "Sábado às 10h no Largo do Sé.", ago: "há 4h", unread: true, to: "/visits" },
  { id: "n4", category: "interest", icon: "match", title: "Novo interessado", body: "Rui M. mostrou interesse no teu Quarto Rua das Flores.", ago: "há 1 dia", unread: false, to: "/matches" },
  { id: "n5", category: "availability", icon: "reminder", title: "Novo perto de ti", body: "Apareceu 1 estúdio a 500m.", ago: "há 1 dia", unread: false, to: "/explore" },
  { id: "n6", category: "marketplace", icon: "reminder", title: "Melhora o teu anúncio", body: "Adiciona fotos da cozinha para subir na descoberta.", ago: "há 2 dias", unread: false, to: "/my-listings" },
  { id: "n7", category: "system", icon: "reminder", title: "Plano Free", body: "1 de 1 anúncios ativos.", ago: "há 3 dias", unread: false, to: "/account" },
];

export const me = {
  name: "Tiago Costa",
  avatar: U("photo-1539571696357-5a69c17a67c6"),
  email: "tiago@homematch.pt",
  bio: "Estudante do IPB, tranquilo, gosto de cozinhar.",
  score: 78,
  scoreBreakdown: [
    { label: "Email verificado", pts: 5, done: true },
    { label: "Telemóvel verificado", pts: 10, done: true },
    { label: "Foto de perfil", pts: 5, done: true },
    { label: "Bio preenchida", pts: 5, done: true },
    { label: "NIF declarado", pts: 5, done: true },
    { label: "Identificação declarada", pts: 5, done: false },
    { label: "Rendimento ou estudante", pts: 5, done: true },
    { label: "Termos aceites", pts: 5, done: true },
  ],
};

export function scoreColor(score: number): string {
  if (score >= 80) return "score-blue";
  if (score >= 60) return "score-green";
  if (score >= 40) return "score-amber";
  return "score-red";
}

// Legado (mantido para compat, mas /rooms agora redireciona)
export type Room = { id: string; listingId: string; name: string; price: number; status: "available" | "reserved" | "occupied"; tenant?: string };
export const rooms: Room[] = [
  { id: "r1", listingId: "1", name: "Suite A", price: 450, status: "available" },
];

export type Visit = { id: string; listingId: string; who: string; whoAvatar: string; date: string; time: string; status: "pending" | "confirmed" | "done" | "cancelled" };
export const visits: Visit[] = [
  { id: "v1", listingId: "3", who: "Ana P.", whoAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=70", date: "Sáb, 6 Jul", time: "10:00", status: "confirmed" },
  { id: "v2", listingId: "1", who: "João M.", whoAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=70", date: "Dom, 7 Jul", time: "15:30", status: "pending" },
  { id: "v3", listingId: "2", who: "Marta R.", whoAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=70", date: "Ter, 2 Jul", time: "18:00", status: "done" },
];

export const favoriteIds = ["2", "4", "5"];

export const mapPins = [
  { id: "1", x: 30, y: 42 },
  { id: "2", x: 52, y: 55 },
  { id: "3", x: 44, y: 38 },
  { id: "4", x: 68, y: 62 },
  { id: "5", x: 40, y: 72 },
];

export const recommendationSections = [
  { title: "Match do dia", subtitle: "O mais alinhado contigo hoje", ids: ["3"] },
  { title: "Novos perto de ti", subtitle: "A menos de 1 km", ids: ["1", "2", "5"] },
  { title: "Baseado nos teus gostos", subtitle: "Com jardim ou varanda", ids: ["4", "2"] },
];

export const landlordAccount = {
  fiscalName: "Tiago Costa",
  nif: "•••• ••789",
  address: "Rua da Sé, 12 · Bragança",
  plan: "Free" as const,
  planLimit: "1 anúncio ativo",
  invoices: [
    { id: "f1", date: "01 Jun 2026", label: "Plano Free", amount: 0 },
  ],
};
