// Dados de demonstração para desenvolvimento local.
// Sem isto, todos os ecrãs mostram sempre o estado vazio.
// Corre uma única vez (flag em localStorage); "Repor demo" nas Definições limpa e re-semeia.

import { store, getState } from "./store";
import type { Preferences, Profile } from "./store";
import type { Listing, Match, Chat, Visit, Notification, Candidate } from "./mock-data";

const SEED_FLAG = "hm.seeded.v1";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
const face = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_FLAG)) return;
  if (getState().listings.length > 0) {
    window.localStorage.setItem(SEED_FLAG, "1");
    return;
  }

  const listings: Listing[] = [
    {
      id: "l1",
      title: "Quarto luminoso no centro",
      kind: "rent",
      price: 380,
      city: "Braga",
      neighborhood: "São Vítor",
      distanceM: 600,
      type: "Quarto",
      spaceType: "Quarto",
      lifecycle: "published",
      qualityScore: 84,
      pets: true,
      smoke: false,
      availableFrom: "1 Set 2026",
      moveInFrom: "1 Set 2026",
      visitAvailability: ["Sáb 10:00", "Sáb 15:00", "Ter 17:00"],
      minMonths: 6,
      capacity: 1,
      description:
        "Quarto amplo com muita luz natural, numa casa partilhada com mais dois estudantes. Cozinha equipada, internet fibra e sala comum. A 5 minutos a pé da Universidade do Minho.",
      amenities: ["Wi-Fi", "Cozinha", "Lavandaria", "Aquecimento"],
      rules: "Aceita estudantes. Aceita animais pequenos. Sem fumo dentro de casa.",
      photos: [img("photo-1522708323590-d24dbb6b0267"), img("photo-1560448204-e02f11c3d0e2"), img("photo-1502672260266-1c1ef2d93688")],
      owner: { name: "Maria Fernandes", avatar: face("maria"), score: 86, responds: "Responde em ~2h", rating: 4.8, reviews: 12 },
    },
    {
      id: "l2",
      title: "Estúdio renovado junto à estação",
      kind: "rent",
      price: 560,
      city: "Braga",
      neighborhood: "Maximinos",
      distanceM: 1400,
      type: "Apartamento",
      spaceType: "Estúdio",
      lifecycle: "published",
      qualityScore: 76,
      pets: false,
      smoke: false,
      availableFrom: "Imediato",
      moveInFrom: "",
      visitAvailability: ["Dom 11:00", "Sex 18:00"],
      minMonths: 12,
      capacity: 2,
      description:
        "Estúdio totalmente renovado em 2025, mobilado e equipado. Ideal para casal ou profissional. Despesas de condomínio incluídas.",
      amenities: ["Wi-Fi", "Cozinha", "AC", "Mobilado"],
      rules: "Sem animais. Sem fumo. Contrato mínimo de 12 meses.",
      photos: [img("photo-1536376072261-38c75010e6c9"), img("photo-1493809842364-78817add7ffb")],
      owner: { name: "João Pereira", avatar: face("joao"), score: 72, responds: "Responde em ~1 dia", rating: 4.5, reviews: 6 },
    },
    {
      id: "l3",
      title: "Suite com varanda em casa tranquila",
      kind: "rent",
      price: 450,
      city: "Guimarães",
      neighborhood: "Costa",
      distanceM: 5200,
      type: "Quarto",
      spaceType: "Suite",
      lifecycle: "published",
      qualityScore: 68,
      pets: true,
      smoke: false,
      availableFrom: "15 Ago 2026",
      moveInFrom: "15 Ago 2026",
      visitAvailability: ["Sáb 10:00"],
      minMonths: 6,
      capacity: 1,
      description: "Suite com casa de banho privativa e varanda, em moradia com jardim. Zona muito sossegada, bom acesso de carro.",
      amenities: ["Wi-Fi", "Garagem", "Aquecimento"],
      rules: "Aceita animais. Sem fumo.",
      photos: [img("photo-1505693416388-ac5ce068fe85"), img("photo-1484154218962-a197022b5858")],
      owner: { name: "Ana Ribeiro", avatar: face("ana"), score: 91, responds: "Responde em ~30min", rating: 4.9, reviews: 21 },
    },
    // Sem candidato associado — garante que o feed de arrendar nasce com conteúdo.
    {
      id: "l6",
      title: "T1 mobilado perto do hospital",
      kind: "rent",
      price: 620,
      city: "Braga",
      neighborhood: "São Vicente",
      distanceM: 900,
      type: "Apartamento",
      spaceType: "T1",
      lifecycle: "published",
      qualityScore: 80,
      pets: false,
      smoke: false,
      availableFrom: "1 Out 2026",
      moveInFrom: "1 Out 2026",
      visitAvailability: ["Qui 18:00", "Sáb 11:00"],
      minMonths: 12,
      capacity: 2,
      description:
        "T1 mobilado e equipado, num prédio com elevador. Quarto com roupeiro embutido, sala com varanda e cozinha independente. A 10 minutos a pé do Hospital de Braga.",
      amenities: ["Wi-Fi", "Cozinha", "Mobilado", "Elevador", "Aquecimento"],
      rules: "Sem animais. Sem fumo. Contrato mínimo de 12 meses.",
      photos: [img("photo-1554995207-c18c203602cb"), img("photo-1586023492125-27b2c045efd7")],
      owner: { name: "Carlos Lima", avatar: face("carlos"), score: 68, responds: "Responde em ~6h", rating: 4.2, reviews: 3 },
    },
    // ---- Venda: campos de convivência e prazo não se aplicam ----
    {
      id: "l4",
      title: "T2 renovado com vista de rio",
      kind: "sale",
      price: 235_000,
      city: "Porto",
      neighborhood: "Massarelos",
      distanceM: 2100,
      type: "Apartamento",
      spaceType: "T2",
      lifecycle: "published",
      qualityScore: 88,
      pets: true,
      smoke: true,
      availableFrom: "Imediato",
      moveInFrom: "",
      visitAvailability: ["Sáb 11:00", "Qua 18:30"],
      minMonths: 0,
      capacity: 4,
      description:
        "T2 totalmente remodelado em 2024, com vista desafogada sobre o Douro. Cozinha equipada, janelas com vidro duplo, certificado energético B. Zona servida por metro e comércio local. Lugar de garagem incluído.",
      amenities: ["Garagem", "Elevador", "AC", "Varanda"],
      rules: "Escritura a combinar entre as partes.",
      photos: [img("photo-1512917774080-9991f1c4c750"), img("photo-1502005229762-cf1b2da7c5d6")],
      owner: { name: "Rui Marques", avatar: face("rui"), score: 79, responds: "Responde em ~4h", rating: 4.6, reviews: 8 },
    },
    {
      id: "l5",
      title: "Moradia T3 com jardim",
      kind: "sale",
      price: 310_000,
      city: "Braga",
      neighborhood: "Nogueira",
      distanceM: 6400,
      type: "Casa",
      spaceType: "T3",
      lifecycle: "published",
      qualityScore: 72,
      pets: true,
      smoke: true,
      availableFrom: "Imediato",
      moveInFrom: "",
      visitAvailability: ["Sáb 15:00"],
      minMonths: 0,
      capacity: 6,
      description:
        "Moradia isolada com jardim de 400m², três quartos e sótão amplo. Precisa de obras de modernização nas casas de banho, refletido no preço.",
      amenities: ["Garagem", "Aquecimento"],
      rules: "Visitas acompanhadas pelo proprietário.",
      photos: [img("photo-1568605114967-8130f3a36994"), img("photo-1570129477492-45c003edd2be")],
      owner: { name: "Helena Dias", avatar: face("helena"), score: 84, responds: "Responde em ~1 dia", rating: 4.7, reviews: 5 },
    },
  ];

  const cand = (name: string, seed: string, score: number, occupation: string, city: string, bio: string): Candidate => ({
    name,
    avatar: face(seed),
    score,
    occupation,
    city,
    bio,
    verifications: [
      { label: "Email verificado", ok: true },
      { label: "Telemóvel verificado", ok: score >= 70 },
      { label: "Cartão de Cidadão", ok: score >= 80 },
      { label: "Rendimento próprio", ok: true },
      { label: "Estudante", ok: score < 80 },
    ],
  });

  const chats: Chat[] = [
    {
      id: "c1",
      listingId: "l1",
      unread: 1,
      lastMessage: "Perfeito, então fica combinado sábado às 10h!",
      lastAt: "10:24",
      messages: [
        { from: "me", text: "Olá! O quarto ainda está disponível para setembro?", at: "09:02" },
        { from: "them", text: "Olá! Sim, está. Queres marcar uma visita?", at: "09:15" },
        { from: "me", text: "Sim, pode ser no sábado de manhã?", at: "09:40" },
        { from: "them", text: "Perfeito, então fica combinado sábado às 10h!", at: "10:24" },
      ],
    },
    {
      id: "c2",
      listingId: "l2",
      unread: 0,
      lastMessage: "Novo interesse.",
      lastAt: "ontem",
      messages: [],
    },
    {
      id: "c3",
      listingId: "l3",
      unread: 0,
      lastMessage: "A visita correu muito bem, obrigada!",
      lastAt: "seg",
      messages: [
        { from: "me", text: "Boa tarde! Adorei o anúncio da suite.", at: "seg 14:00" },
        { from: "them", text: "Obrigada! Passa cá no sábado para veres.", at: "seg 15:10" },
        { from: "me", text: "A visita correu muito bem, obrigada!", at: "seg 19:30" },
      ],
    },
  ];

  const matches: Match[] = [
    {
      id: "m1",
      listingId: "l1",
      chatId: "c1",
      // A visita v1 está PROPOSTA, não aceite — logo ainda se está em conversa.
      // Um match em "visita marcada" com proposta pendente seria contraditório.
      state: "conversation",
      updatedAt: "10:24",
      reasons: ["Dentro do orçamento"],
      message: "Olá! O quarto ainda está disponível para setembro?",
      candidate: cand("Tiago Costa", "tiago", 78, "Estudante · Eng. Informática", "Braga", "Estudo Engenharia Informática na UMinho. Não fumo e sou bastante organizado. Disponível desde 1 de setembro."),
    },
    {
      id: "m2",
      listingId: "l2",
      chatId: "c2",
      state: "interested",
      updatedAt: "ontem",
      reasons: [],
      message: "Olá, procuro um estúdio para começar já. Tudo o que precisar é só dizer.",
      candidate: cand("Sofia Almeida", "sofia", 88, "Enfermeira", "Braga", "Enfermeira no Hospital de Braga, horários estáveis. Procuro um espaço só para mim, sossegado."),
    },
    {
      id: "m3",
      listingId: "l3",
      chatId: "c3",
      state: "visit_done",
      updatedAt: "seg",
      reasons: ["Aceita animais"],
      message: "Boa tarde! Adorei o anúncio da suite.",
      candidate: cand("Miguel Santos", "miguel", 64, "Freelancer · Design", "Guimarães", "Designer freelancer, trabalho a partir de casa. Tenho um gato calmo chamado Simão."),
    },
  ];

  // Datas relativas a hoje para o estado da demo nunca ficar no passado.
  const iso = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().slice(0, 10);
  };

  const visits: Visit[] = [
    // Proposta do candidato à espera de resposta do senhorio.
    {
      id: "v1", listingId: "l1", matchId: "m1", proposedBy: "seeker",
      who: "Tiago Costa", whoAvatar: face("tiago"),
      date: iso(3), time: "10:00", status: "pending", createdAt: new Date().toISOString(),
    },
    // Visita que já aconteceu — destravou o fecho do negócio.
    {
      id: "v2", listingId: "l3", matchId: "m3", proposedBy: "landlord",
      who: "Ana Ribeiro", whoAvatar: face("ana"),
      date: iso(-4), time: "18:00", status: "done", createdAt: new Date().toISOString(),
    },
  ];

  const notifications: Notification[] = [
    { id: "n1", category: "visit", icon: "reminder", title: "Visita amanhã", body: "Visita ao 'Quarto luminoso no centro' sábado às 10:00.", ago: "2h", unread: true, to: "/chats/c1" },
    { id: "n2", category: "interest", icon: "match", title: "Novo interesse", body: "Sofia Almeida demonstrou interesse em 'Estúdio renovado junto à estação'.", ago: "ontem", unread: true, to: "/candidates" },
    { id: "n3", category: "conversation", icon: "message", title: "Nova mensagem", body: "Maria Fernandes: 'Perfeito, então fica combinado sábado às 10h!'", ago: "2h", unread: false, to: "/chats/c1" },
  ];

  // Perfil de demonstração — sem isto o /profile e o Trust Score ficam a zero.
  const profile: Profile = {
    name: "Pedro Barros",
    email: "pedro@exemplo.pt",
    avatar: face("pedro"),
    bio: "Procuro um sítio tranquilo em Braga. Não fumo, trabalho em casa e sou organizado.",
    occupation: "Trabalhador",
    phone: "912 345 678",
    nif: "123456789",
    emailVerified: true,
    phoneVerified: true,
    documentType: "cc",
    residentInPortugal: true,
    hasIncome: true,
    isStudent: false,
    // O perfil de demonstração serve os dois papéis (o /switch-user alterna).
    authorizedToList: true,
    propertyDocsInOrder: true,
    termsAccepted: true,
  };

  /**
   * Filtros de demonstração deliberadamente largos: uma demo que abre com o
   * feed vazio por causa dos próprios filtros semeados dá a impressão de que a
   * app está partida. Quem quiser apertar, aperta — mas o estado inicial tem
   * de mostrar conteúdo.
   */
  const preferences: Preferences = {
    kind: "rent",
    city: "Braga",
    maxDistanceKm: 25,
    spaceTypes: { rent: [], sale: [] },
    minPrice: 0,
    maxPrice: 2000,
    maxSalePrice: 400_000,
    moveInFrom: "1 Set 2026",
    pets: false,
    needsFurnished: false,
  };

  // O plano tem de ser coerente com os dados: 6 anúncios ativos só existem no
  // Pro. Semear Free com 6 anúncios criava um estado que a própria app proíbe,
  // e trancava o wizard de publicar logo à primeira utilização.
  store.importState({ listings, chats, matches, visits, notifications, profile, preferences, plan: "pro" });
  window.localStorage.setItem(SEED_FLAG, "1");
}

/** Limpa tudo e volta a semear (botão "Repor demo" nas Definições). */
export function reseed() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SEED_FLAG);
  store.reset();
  seedIfEmpty();
}
