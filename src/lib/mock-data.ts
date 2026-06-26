export type Listing = {
  id: string;
  title: string;
  price: number;
  city: string;
  neighborhood: string;
  distanceM: number;
  type: "Quarto" | "Apartamento" | "Casa";
  pets: boolean;
  smoke: boolean;
  availableFrom: string;
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
    pets: true,
    smoke: false,
    availableFrom: "1 Jul",
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
    pets: false,
    smoke: false,
    availableFrom: "15 Jul",
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
    pets: true,
    smoke: false,
    availableFrom: "Imediato",
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
    pets: true,
    smoke: false,
    availableFrom: "1 Ago",
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
    pets: false,
    smoke: false,
    availableFrom: "1 Set",
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

export type Chat = {
  id: string;
  listingId: string;
  unread: number;
  lastMessage: string;
  lastAt: string;
  messages: { from: "me" | "them"; text: string; at: string }[];
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

export type Notification = {
  id: string;
  icon: "match" | "message" | "reminder";
  title: string;
  body: string;
  ago: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  { id: "n1", icon: "match", title: "Tens um match 🎉", body: "Ana P. aceitou o teu interesse no Quarto Largo do Sé.", ago: "há 1h", unread: true },
  { id: "n2", icon: "message", title: "Nova mensagem", body: "Ana P.: Combinado! Vemo-nos sábado às 10h.", ago: "há 2h", unread: true },
  { id: "n3", icon: "reminder", title: "Não perderias isto?", body: "Apareceu 1 novo imóvel na tua zona.", ago: "há 1 dia", unread: false },
];

export const me = {
  name: "Tiago Costa",
  avatar: U("photo-1539571696357-5a69c17a67c6"),
  email: "tiago@homematch.pt",
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
