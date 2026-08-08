// Fachada API: a store local continua a ser o que os ecrãs leem (rápido,
// otimista), mas cada escrita é replicada para o Supabase por `remote`.
// Se a rede falhar, o ecrã não parte — o erro fica em consola e a próxima
// hidratação corrige o estado.

import { store, getState } from "./store";
import type { Preferences, Profile } from "./store";
import { remote } from "./sync";
import type { Listing, Match, MatchState, Chat, Visit, Notification } from "./mock-data";

const asAsync = <T,>(v: T): Promise<T> => Promise.resolve(v);
const fire = (p: Promise<unknown>) => { void p.catch((e) => console.error("[api]", e)); };

const pushVisit = (id: string) => {
  const v = getState().visits.find((x) => x.id === id);
  if (v) fire(remote.updateVisit(v));
};

export const api = {
  // ---------- Listings ----------
  listListings: () => asAsync(getState().listings),
  getListing: (id: string) => asAsync(getState().listings.find((l) => l.id === id) ?? null),
  createListing: (data: Omit<Listing, "id">) => {
    const l = store.createListing(data);
    fire(remote.upsertListing(l));
    return asAsync(l);
  },
  updateListing: (id: string, patch: Partial<Listing>) => {
    store.updateListing(id, patch);
    const l = getState().listings.find((x) => x.id === id);
    if (l) fire(remote.upsertListing(l));
    return asAsync(undefined);
  },
  deleteListing: (id: string) => {
    store.deleteListing(id);
    fire(remote.deleteListing(id));
    return asAsync(undefined);
  },

  // ---------- Favorites ----------
  toggleFavorite: (listingId: string) => {
    const wasFav = getState().favorites.includes(listingId);
    store.toggleFavorite(listingId);
    fire(remote.setFavorite(listingId, !wasFav));
    return asAsync(undefined);
  },

  // ---------- Matches / Interest ----------
  sendInterest: (listingId: string, message = "") => {
    const listing = getState().listings.find((l) => l.id === listingId);
    const res = store.sendInterest(listingId, message);
    if (listing) fire(remote.createInterest(res.match, res.chat, listing, message));
    return asAsync(res);
  },
  passListing: (listingId: string) => {
    store.passListing(listingId);
    fire(remote.setPass(listingId, true));
    return asAsync(undefined);
  },
  unpassListing: (listingId: string) => {
    store.unpassListing(listingId);
    fire(remote.setPass(listingId, false));
    return asAsync(undefined);
  },
  resetPassed: () => {
    store.resetPassed();
    fire(remote.clearPasses());
    return asAsync(undefined);
  },
  setMatchState: (matchId: string, next: MatchState) => {
    store.setMatchState(matchId, next);
    fire(remote.setMatchState(matchId, next));
    return asAsync(undefined);
  },

  // ---------- Chat ----------
  sendMessage: (chatId: string, text: string) => {
    store.sendMessage(chatId, text, "me");
    fire(remote.sendMessage(chatId, text));
    const m = getState().matches.find((x) => x.chatId === chatId);
    if (m && m.state === "conversation") fire(remote.setMatchState(m.id, "conversation"));
    return asAsync(undefined);
  },

  // ---------- Visits ----------
  proposeVisit: (matchId: string, when: { date: string; time: string }, by: "seeker" | "landlord", counterOf?: string) => {
    const v = store.proposeVisit(matchId, when, by, counterOf);
    if (v) fire(remote.upsertVisit(v));
    return asAsync(v);
  },
  acceptVisit: (id: string) => {
    const r = store.acceptVisit(id);
    pushVisit(id);
    const v = getState().visits.find((x) => x.id === id);
    if (v?.matchId) fire(remote.setMatchState(v.matchId, "visit_scheduled"));
    return asAsync(r);
  },
  declineVisit: (id: string, note?: string) => {
    const r = store.declineVisit(id, note);
    pushVisit(id);
    return asAsync(r);
  },
  cancelVisit: (id: string, note?: string) => {
    const r = store.cancelVisit(id, note);
    pushVisit(id);
    return asAsync(r);
  },
  confirmVisitDone: (id: string, side: "seeker" | "landlord") => {
    const r = store.confirmVisitDone(id, side);
    pushVisit(id);
    return asAsync(r);
  },

  // ---------- Ações da conversa ----------
  setChatFlag: (chatId: string, patch: { muted?: boolean; archived?: boolean; blocked?: boolean }) =>
    asAsync(store.setChatFlag(chatId, patch)),
  submitReport: (target: "chat" | "listing" | "user", targetId: string, reason: import("./mock-data").ReportReason, detail = "") => {
    const r = store.submitReport(target, targetId, reason, detail);
    fire(remote.submitReport(target, targetId, reason, detail));
    return asAsync(r);
  },

  // ---------- Notifications ----------
  markNotificationRead: (id: string) => {
    store.markNotificationRead(id);
    fire(remote.markNotifications([id], false));
    return asAsync(undefined);
  },
  markAllNotificationsRead: () => {
    const ids = getState().notifications.filter((n) => n.unread).map((n) => n.id);
    store.markAllNotificationsRead();
    fire(remote.markNotifications(ids, false));
    return asAsync(undefined);
  },

  // ---------- Reviews (duplo-cego) ----------
  submitReview: (matchId: string, by: "seeker" | "landlord", rating: number, tags: string[], comment: string) => {
    const r = store.submitReview(matchId, by, rating, tags, comment);
    fire(remote.submitReview(matchId, by, rating, tags, comment));
    return asAsync(r);
  },

  // ---------- Fecho de negócio (arrendamento ou venda) ----------
  closeListing: (matchId: string, reason: import("./mock-data").CloseReason, details?: { moveIn: string; months: number | null; amount: number }) => {
    const r = store.closeListing(matchId, reason, details);
    const s = getState();
    const match = s.matches.find((m) => m.id === matchId);
    if (match) {
      fire(remote.setMatchState(matchId, match.state));
      const listing = s.listings.find((l) => l.id === match.listingId);
      if (listing) fire(remote.upsertListing(listing));
    }
    return asAsync(r);
  },
  confirmDealSeeker: (dealId: string) => {
    const r = store.confirmDealSeeker(dealId);
    return asAsync(r);
  },

  // ---------- Plano / subscrição ----------
  setPlan: (plan: import("./store").PlanId, period?: import("./store").BillingPeriod) => {
    const ok = store.setPlan(plan, period);
    if (ok !== false) fire(remote.saveAccountFields({ plan, ...(period ? { billing_period: period } : {}) }));
    return asAsync(ok);
  },
  setBillingPeriod: (period: import("./store").BillingPeriod) => {
    const r = store.setBillingPeriod(period);
    fire(remote.saveAccountFields({ billing_period: period }));
    return asAsync(r);
  },

  // ---------- Definições ----------
  updateNotificationPrefs: (patch: Partial<import("./store").NotificationPrefs>) => {
    store.updateNotificationPrefs(patch);
    fire(remote.saveSettings({ notificationPrefs: patch }));
    return asAsync(undefined);
  },
  updatePrivacy: (patch: Partial<import("./store").PrivacyPrefs>) => {
    store.updatePrivacy(patch);
    fire(remote.saveSettings({ privacy: patch }));
    return asAsync(undefined);
  },
  setLanguage: (l: "pt" | "en") => {
    store.setLanguage(l);
    fire(remote.saveAccountFields({ language: l }));
    return asAsync(undefined);
  },

  // ---------- Profile / Preferences ----------
  updateProfile: (patch: Partial<Profile>) => {
    store.updateProfile(patch);
    fire(remote.saveProfile(patch));
    return asAsync(undefined);
  },
  updatePreferences: (patch: Partial<Preferences>) => {
    store.updatePreferences(patch);
    fire(remote.savePreferences());
    return asAsync(undefined);
  },

  reset: () => asAsync(store.reset()),
};

export type { Listing, Match, MatchState, Chat, Visit, Notification, Preferences, Profile };
