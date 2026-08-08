// Ponte entre a store local (que os ecrãs leem) e o Supabase (a verdade).
// A store passa a ser cache: hidrata-se no arranque e cada escrita é enviada
// para a base de dados. Falhas de rede não partem o ecrã — ficam em consola.

import { supabase } from "@/integrations/supabase/client";
import { store, getState, type Profile, type Preferences, type NotificationPrefs, type PrivacyPrefs, type PlanId, type BillingPeriod } from "./store";
import type { Listing, Match, Chat, Visit, Notification, MatchState } from "./mock-data";

const log = (where: string, error: unknown) => {
  if (error) console.error(`[sync:${where}]`, error);
};

// ---------- Mapeadores ----------

type Row = Record<string, any>;

function rowToListing(r: Row): Listing {
  return {
    id: r.id,
    ownerId: r.owner_id,
    title: r.title,
    kind: r.kind,
    price: r.price,
    city: r.city,
    neighborhood: r.neighborhood,
    distanceM: r.distance_m,
    type: r.type,
    spaceType: r.space_type,
    lifecycle: r.lifecycle,
    qualityScore: r.quality_score,
    pets: r.pets,
    smoke: r.smoke,
    availableFrom: r.available_from,
    moveInFrom: r.move_in_from,
    visitAvailability: r.visit_availability ?? [],
    minMonths: r.min_months,
    capacity: r.capacity,
    description: r.description,
    amenities: r.amenities ?? [],
    rules: r.rules,
    photos: r.photos ?? [],
    owner: {
      name: r.owner_card?.name ?? "",
      avatar: r.owner_card?.avatar ?? "",
      score: r.owner_card?.score ?? 0,
      responds: r.owner_card?.responds ?? "",
      rating: r.owner_card?.rating ?? 0,
      reviews: r.owner_card?.reviews ?? 0,
    },
  } as Listing;
}

function listingToRow(l: Listing, ownerId: string): Row {
  return {
    id: l.id,
    owner_id: ownerId,
    title: l.title,
    kind: l.kind,
    price: l.price,
    city: l.city,
    neighborhood: l.neighborhood,
    distance_m: l.distanceM ?? 0,
    type: l.type,
    space_type: l.spaceType,
    lifecycle: l.lifecycle,
    quality_score: l.qualityScore ?? 0,
    pets: !!l.pets,
    smoke: !!l.smoke,
    available_from: l.availableFrom ?? "",
    move_in_from: l.moveInFrom ?? "",
    visit_availability: l.visitAvailability ?? [],
    min_months: l.minMonths ?? 0,
    capacity: l.capacity ?? 1,
    description: l.description ?? "",
    amenities: l.amenities ?? [],
    rules: l.rules ?? "",
    photos: l.photos ?? [],
    owner_card: l.owner ?? {},
  };
}

function rowToProfile(r: Row): Profile {
  return {
    name: r.name,
    email: r.email,
    avatar: r.avatar_url,
    bio: r.bio,
    occupation: r.occupation,
    phone: r.phone,
    nif: r.nif,
    emailVerified: r.email_verified,
    phoneVerified: r.phone_verified,
    documentType: r.document_type,
    residentInPortugal: r.resident_in_portugal,
    hasIncome: r.has_income,
    isStudent: r.is_student,
    authorizedToList: r.authorized_to_list,
    propertyDocsInOrder: r.property_docs_in_order,
    termsAccepted: r.terms_accepted,
  };
}

function profileToRow(p: Partial<Profile>): Row {
  const r: Row = {};
  if (p.name !== undefined) r.name = p.name;
  if (p.avatar !== undefined) r.avatar_url = p.avatar;
  if (p.bio !== undefined) r.bio = p.bio;
  if (p.occupation !== undefined) r.occupation = p.occupation;
  if (p.phone !== undefined) r.phone = p.phone;
  if (p.nif !== undefined) r.nif = p.nif;
  if (p.emailVerified !== undefined) r.email_verified = p.emailVerified;
  if (p.phoneVerified !== undefined) r.phone_verified = p.phoneVerified;
  if (p.documentType !== undefined) r.document_type = p.documentType;
  if (p.residentInPortugal !== undefined) r.resident_in_portugal = p.residentInPortugal;
  if (p.hasIncome !== undefined) r.has_income = p.hasIncome;
  if (p.isStudent !== undefined) r.is_student = p.isStudent;
  if (p.authorizedToList !== undefined) r.authorized_to_list = p.authorizedToList;
  if (p.propertyDocsInOrder !== undefined) r.property_docs_in_order = p.propertyDocsInOrder;
  if (p.termsAccepted !== undefined) r.terms_accepted = p.termsAccepted;
  return r;
}

function rowToPreferences(r: Row): Preferences {
  return {
    kind: r.kind,
    city: r.city,
    maxDistanceKm: r.max_distance_km,
    spaceTypes: { rent: r.space_types_rent ?? [], sale: r.space_types_sale ?? [] },
    minPrice: r.min_price,
    maxPrice: r.max_price,
    maxSalePrice: r.max_sale_price,
    moveInFrom: r.move_in_from,
    pets: r.pets,
    needsFurnished: r.needs_furnished,
  };
}

function preferencesToRow(p: Preferences): Row {
  return {
    kind: p.kind,
    city: p.city,
    max_distance_km: p.maxDistanceKm,
    space_types_rent: p.spaceTypes.rent,
    space_types_sale: p.spaceTypes.sale,
    min_price: p.minPrice,
    max_price: p.maxPrice,
    max_sale_price: p.maxSalePrice,
    move_in_from: p.moveInFrom,
    pets: p.pets,
    needs_furnished: p.needsFurnished,
  };
}

function rowToVisit(r: Row): Visit {
  return {
    id: r.id,
    listingId: r.listing_id,
    matchId: r.match_id,
    proposedBy: r.proposed_by_side,
    who: r.who,
    whoAvatar: r.who_avatar,
    date: r.visit_date,
    time: r.visit_time,
    status: r.status === "proposed" ? "pending" : r.status,
    counterOf: r.counter_of ?? undefined,
    note: r.notes || undefined,
    createdAt: r.created_at,
    seekerConfirmedDone: r.seeker_confirmed_done,
    landlordConfirmedDone: r.landlord_confirmed_done,
  } as Visit;
}

function visitToRow(v: Visit): Row {
  return {
    id: v.id,
    match_id: v.matchId,
    listing_id: v.listingId,
    slot: `${v.date} ${v.time}`.trim(),
    visit_date: v.date,
    visit_time: v.time,
    status: v.status,
    proposed_by_side: v.proposedBy,
    who: v.who,
    who_avatar: v.whoAvatar,
    counter_of: v.counterOf ?? null,
    notes: v.note ?? "",
    seeker_confirmed_done: !!v.seekerConfirmedDone,
    landlord_confirmed_done: !!v.landlordConfirmedDone,
  };
}

// ---------- Hidratação ----------

export async function hydrate(userId: string, role: "seeker" | "landlord") {
  const [profileRes, prefsRes, settingsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  log("profile", profileRes.error);

  const [listingsRes, favRes, passRes, matchRes, chatRes, msgRes, visitRes, notifRes] = await Promise.all([
    role === "landlord"
      ? supabase.from("listings").select("*").eq("owner_id", userId).order("created_at", { ascending: false })
      : supabase.from("listings").select("*").in("lifecycle", ["published", "negotiating"]).order("created_at", { ascending: false }),
    supabase.from("favorites").select("listing_id"),
    supabase.from("listing_passes").select("listing_id"),
    supabase.from("matches").select("*").order("updated_at", { ascending: false }),
    supabase.from("chats").select("*").order("last_at", { ascending: false }),
    supabase.from("messages").select("*").order("created_at", { ascending: true }),
    supabase.from("visits").select("*").order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
  ]);
  log("listings", listingsRes.error);

  const listings = (listingsRes.data ?? []).map(rowToListing);

  // Um inquilino também tem de ver os anúncios com que já interage, mesmo que
  // tenham saído do feed (pausados, arrendados) — senão a conversa fica órfã.
  const knownIds = new Set(listings.map((l) => l.id));
  const missing = (matchRes.data ?? []).map((m: Row) => m.listing_id).filter((id: string) => !knownIds.has(id));
  if (missing.length) {
    const extra = await supabase.from("listings").select("*").in("id", missing);
    (extra.data ?? []).forEach((r: Row) => listings.push(rowToListing(r)));
  }

  const messagesByChat = new Map<string, Row[]>();
  (msgRes.data ?? []).forEach((m: Row) => {
    const arr = messagesByChat.get(m.chat_id) ?? [];
    arr.push(m);
    messagesByChat.set(m.chat_id, arr);
  });

  const chats: Chat[] = (chatRes.data ?? []).map((c: Row) => ({
    id: c.id,
    listingId: c.listing_id,
    unread: (messagesByChat.get(c.id) ?? []).filter((m) => m.sender_id !== userId && !m.read_at).length,
    lastMessage: c.last_message,
    lastAt: new Date(c.last_at).toLocaleDateString("pt-PT"),
    messages: (messagesByChat.get(c.id) ?? []).map((m) => ({
      from: m.sender_id === userId ? "me" : "them",
      text: m.body,
      at: new Date(m.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
    })),
  }));

  const matches: Match[] = (matchRes.data ?? []).map((m: Row) => ({
    id: m.id,
    listingId: m.listing_id,
    chatId: m.chat_id ?? "",
    state: m.state as MatchState,
    updatedAt: new Date(m.updated_at).toLocaleDateString("pt-PT"),
    reasons: m.reasons ?? [],
    message: m.message,
    candidate: m.candidate && Object.keys(m.candidate).length ? m.candidate : undefined,
  }));

  const notifications: Notification[] = (notifRes.data ?? []).map((n: Row) => ({
    id: n.id,
    category: n.category,
    icon: n.icon,
    title: n.title,
    body: n.body,
    ago: new Date(n.created_at).toLocaleDateString("pt-PT"),
    unread: n.unread,
    to: n.link ?? undefined,
  }));

  store.importState({
    listings,
    matches,
    chats,
    visits: (visitRes.data ?? []).map(rowToVisit),
    notifications,
    favorites: (favRes.data ?? []).map((f: Row) => f.listing_id),
    passed: (passRes.data ?? []).map((p: Row) => p.listing_id),
    ...(profileRes.data ? { profile: rowToProfile(profileRes.data), plan: profileRes.data.plan as PlanId, billingPeriod: profileRes.data.billing_period as BillingPeriod, language: profileRes.data.language as "pt" | "en" } : {}),
    ...(prefsRes.data ? { preferences: rowToPreferences(prefsRes.data) } : {}),
    ...(settingsRes.data
      ? {
          notificationPrefs: {
            interest: settingsRes.data.notif_interest,
            conversation: settingsRes.data.notif_conversation,
            visit: settingsRes.data.notif_visit,
            match: settingsRes.data.notif_match,
            marketplace: settingsRes.data.notif_marketplace,
          },
          privacy: {
            discoverable: settingsRes.data.privacy_discoverable,
            showActivity: settingsRes.data.privacy_show_activity,
            personalisedSuggestions: settingsRes.data.privacy_personalised,
          },
        }
      : {}),
  });
}

// ---------- Escritas ----------

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export const remote = {
  async saveProfile(patch: Partial<Profile>) {
    const id = await uid();
    if (!id) return;
    const row = profileToRow(patch);
    if (!Object.keys(row).length) return;
    log("saveProfile", (await supabase.from("profiles").update(row as never).eq("id", id)).error);
  },

  async savePreferences() {
    const id = await uid();
    if (!id) return;
    log("savePreferences", (await supabase.from("user_preferences").update(preferencesToRow(getState().preferences) as never).eq("user_id", id)).error);
  },

  async saveSettings(patch: { notificationPrefs?: Partial<NotificationPrefs>; privacy?: Partial<PrivacyPrefs> }) {
    const id = await uid();
    if (!id) return;
    const s = getState();
    const n = { ...s.notificationPrefs, ...patch.notificationPrefs };
    const p = { ...s.privacy, ...patch.privacy };
    log("saveSettings", (await supabase.from("user_settings").update({
      notif_interest: n.interest,
      notif_conversation: n.conversation,
      notif_visit: n.visit,
      notif_match: n.match,
      notif_marketplace: n.marketplace,
      privacy_discoverable: p.discoverable,
      privacy_show_activity: p.showActivity,
      privacy_personalised: p.personalisedSuggestions,
    }).eq("user_id", id)).error);
  },

  async saveAccountFields(fields: { plan?: PlanId; billing_period?: BillingPeriod; language?: string }) {
    const id = await uid();
    if (!id) return;
    log("saveAccountFields", (await supabase.from("profiles").update(fields).eq("id", id)).error);
  },

  async upsertListing(l: Listing) {
    const id = await uid();
    if (!id) return;
    log("upsertListing", (await supabase.from("listings").upsert(listingToRow(l, id) as never).select().maybeSingle()).error);
  },

  async deleteListing(listingId: string) {
    log("deleteListing", (await supabase.from("listings").delete().eq("id", listingId)).error);
  },

  async setFavorite(listingId: string, on: boolean) {
    const id = await uid();
    if (!id) return;
    if (on) log("favorite", (await supabase.from("favorites").insert({ user_id: id, listing_id: listingId })).error);
    else log("unfavorite", (await supabase.from("favorites").delete().eq("user_id", id).eq("listing_id", listingId)).error);
  },

  async setPass(listingId: string, on: boolean) {
    const id = await uid();
    if (!id) return;
    if (on) log("pass", (await supabase.from("listing_passes").insert({ user_id: id, listing_id: listingId })).error);
    else log("unpass", (await supabase.from("listing_passes").delete().eq("user_id", id).eq("listing_id", listingId)).error);
  },

  async clearPasses() {
    const id = await uid();
    if (!id) return;
    log("clearPasses", (await supabase.from("listing_passes").delete().eq("user_id", id)).error);
  },

  /** Interesse: cria match + chat (+ 1ª mensagem) e avisa o senhorio. */
  async createInterest(match: Match, chat: Chat, listing: Listing, message: string) {
    const id = await uid();
    if (!id || !listing.ownerId) return;
    log("match", (await supabase.from("matches").insert({
      id: match.id,
      listing_id: listing.id,
      seeker_id: id,
      landlord_id: listing.ownerId,
      state: "interested",
      message,
      reasons: match.reasons ?? [],
      candidate: match.candidate ?? {},
      chat_id: chat.id,
    })).error);
    log("chat", (await supabase.from("chats").insert({
      id: chat.id,
      match_id: match.id,
      listing_id: listing.id,
      last_message: chat.lastMessage,
    })).error);
    if (message) {
      log("firstMessage", (await supabase.from("messages").insert({ chat_id: chat.id, sender_id: id, body: message })).error);
    }
    log("notifyOwner", (await supabase.from("notifications").insert({
      user_id: listing.ownerId,
      category: "interest",
      icon: "match",
      title: "Novo interesse",
      body: `Alguém demonstrou interesse em "${listing.title}".`,
      link: "/candidates",
    })).error);
  },

  async setMatchState(matchId: string, next: MatchState) {
    log("matchState", (await supabase.from("matches").update({ state: next }).eq("id", matchId)).error);
  },

  async sendMessage(chatId: string, text: string) {
    const id = await uid();
    if (!id) return;
    log("message", (await supabase.from("messages").insert({ chat_id: chatId, sender_id: id, body: text })).error);
    log("chatMeta", (await supabase.from("chats").update({ last_message: text, last_at: new Date().toISOString() }).eq("id", chatId)).error);
  },

  async upsertVisit(v: Visit) {
    log("visit", (await supabase.from("visits").upsert(visitToRow(v) as never).select().maybeSingle()).error);
  },

  async updateVisit(v: Visit) {
    log("visitUpdate", (await supabase.from("visits").update(visitToRow(v) as never).eq("id", v.id)).error);
  },

  async markNotifications(ids: string[], unread: boolean) {
    if (!ids.length) return;
    log("notifRead", (await supabase.from("notifications").update({ unread }).in("id", ids)).error);
  },

  async submitReport(target: string, targetId: string, reason: string, detail: string) {
    const id = await uid();
    if (!id) return;
    log("report", (await supabase.from("reports").insert({ reporter_id: id, target, target_id: targetId, reason, detail })).error);
  },

  async submitReview(matchId: string, by: "seeker" | "landlord", rating: number, tags: string[], comment: string) {
    const id = await uid();
    if (!id) return;
    log("review", (await supabase.from("reviews").upsert({
      match_id: matchId,
      author_id: id,
      by_role: by === "seeker" ? "seeker" : "landlord",
      rating,
      tags,
      comment,
    }, { onConflict: "match_id,author_id" })).error);
  },

  async upsertDeal(deal: { id: string; matchId: string; listingId: string; kind: string; moveIn: string; months: number | null; amount: number; landlordConfirmed: boolean; seekerConfirmed: boolean }, reason: string) {
    log("deal", (await supabase.from("deals").upsert({
      id: deal.id,
      match_id: deal.matchId,
      listing_id: deal.listingId,
      kind: deal.kind as "rent" | "sale",
      reason: reason as "homematch" | "outside" | "paused" | "rework",
      move_in: deal.moveIn,
      months: deal.months,
      amount: deal.amount,
      landlord_confirmed: deal.landlordConfirmed,
      seeker_confirmed: deal.seekerConfirmed,
    }, { onConflict: "match_id" })).error);
  },
};
