// Fachada API: hoje usa store local; amanhã troca por fetch/Supabase sem
// alterar componentes. Todas as funções são async por design.
//
// TODO(backend): substituir cada implementação pela chamada HTTP correspondente.

import { store, getState } from "./store";
import type { Preferences, Profile } from "./store";
import type { Listing, Match, MatchState, Chat, Visit, Notification } from "./mock-data";

const asAsync = <T,>(v: T): Promise<T> => Promise.resolve(v);

export const api = {
  // ---------- Listings ----------
  // TODO(backend): GET /api/listings
  listListings: () => asAsync(getState().listings),
  // TODO(backend): GET /api/listings/:id
  getListing: (id: string) => asAsync(getState().listings.find((l) => l.id === id) ?? null),
  // TODO(backend): POST /api/listings
  createListing: (data: Omit<Listing, "id">) => asAsync(store.createListing(data)),
  // TODO(backend): PATCH /api/listings/:id
  updateListing: (id: string, patch: Partial<Listing>) => asAsync(store.updateListing(id, patch)),
  // TODO(backend): DELETE /api/listings/:id
  deleteListing: (id: string) => asAsync(store.deleteListing(id)),

  // ---------- Favorites ----------
  // TODO(backend): POST/DELETE /api/favorites/:listingId
  toggleFavorite: (listingId: string) => asAsync(store.toggleFavorite(listingId)),

  // ---------- Matches / Interest ----------
  // TODO(backend): POST /api/interests { listingId, message }
  sendInterest: (listingId: string, message?: string) => asAsync(store.sendInterest(listingId, message)),
  // TODO(backend): POST /api/interests/pass
  passListing: (listingId: string) => asAsync(store.passListing(listingId)),
  unpassListing: (listingId: string) => asAsync(store.unpassListing(listingId)),
  resetPassed: () => asAsync(store.resetPassed()),
  // TODO(backend): PATCH /api/matches/:id/state
  setMatchState: (matchId: string, next: MatchState) => asAsync(store.setMatchState(matchId, next)),

  // ---------- Chat ----------
  // TODO(backend): POST /api/chats/:id/messages
  sendMessage: (chatId: string, text: string) => asAsync(store.sendMessage(chatId, text, "me")),

  // ---------- Visits ----------
  // TODO(backend): POST /api/visits
  proposeVisit: (matchId: string, when: { date: string; time: string }, by: "seeker" | "landlord", counterOf?: string) =>
    asAsync(store.proposeVisit(matchId, when, by, counterOf)),
  acceptVisit: (id: string) => asAsync(store.acceptVisit(id)),
  declineVisit: (id: string, note?: string) => asAsync(store.declineVisit(id, note)),
  cancelVisit: (id: string, note?: string) => asAsync(store.cancelVisit(id, note)),
  markVisitDone: (id: string) => asAsync(store.markVisitDone(id)),

  // ---------- Ações da conversa ----------
  // TODO(backend): PATCH /api/chats/:id
  setChatFlag: (chatId: string, patch: { muted?: boolean; archived?: boolean; blocked?: boolean }) =>
    asAsync(store.setChatFlag(chatId, patch)),
  // TODO(backend): POST /api/reports
  submitReport: (target: "chat" | "listing" | "user", targetId: string, reason: import("./mock-data").ReportReason, detail?: string) =>
    asAsync(store.submitReport(target, targetId, reason, detail)),

  // ---------- Notifications ----------
  // TODO(backend): PATCH /api/notifications/:id
  markNotificationRead: (id: string) => asAsync(store.markNotificationRead(id)),
  // TODO(backend): PATCH /api/notifications/read-all
  markAllNotificationsRead: () => asAsync(store.markAllNotificationsRead()),

  // ---------- Reviews (duplo-cego) ----------
  // TODO(backend): POST /api/matches/:id/reviews
  submitReview: (matchId: string, by: "seeker" | "landlord", rating: number, tags: string[], comment: string) =>
    asAsync(store.submitReview(matchId, by, rating, tags, comment)),

  // ---------- Fecho de negócio (arrendamento ou venda) ----------
  // TODO(backend): POST /api/matches/:id/close
  closeListing: (matchId: string, reason: import("./mock-data").CloseReason, details?: { moveIn: string; months: number | null; amount: number }) =>
    asAsync(store.closeListing(matchId, reason, details)),
  // TODO(backend): POST /api/deals/:id/confirm
  confirmDealSeeker: (dealId: string) => asAsync(store.confirmDealSeeker(dealId)),

  // ---------- Plano / subscrição ----------
  // TODO(stripe): createCheckoutSession(plan, period) → redirect; o plano só
  // muda quando o webhook `customer.subscription.updated` confirmar.
  // Devolve false se o plano de destino não comportar os anúncios ativos.
  setPlan: (plan: import("./store").PlanId, period?: import("./store").BillingPeriod) =>
    asAsync(store.setPlan(plan, period)),
  // TODO(stripe): alterar o price da subscrição existente.
  setBillingPeriod: (period: import("./store").BillingPeriod) => asAsync(store.setBillingPeriod(period)),

  // ---------- Definições ----------
  // TODO(backend): PATCH /api/me/notification-prefs
  updateNotificationPrefs: (patch: Partial<import("./store").NotificationPrefs>) =>
    asAsync(store.updateNotificationPrefs(patch)),
  // TODO(backend): PATCH /api/me/privacy
  updatePrivacy: (patch: Partial<import("./store").PrivacyPrefs>) => asAsync(store.updatePrivacy(patch)),
  setLanguage: (l: "pt" | "en") => asAsync(store.setLanguage(l)),

  // ---------- Profile / Preferences ----------
  // TODO(backend): PATCH /api/me
  updateProfile: (patch: Partial<Profile>) => asAsync(store.updateProfile(patch)),
  // TODO(backend): PATCH /api/me/preferences
  updatePreferences: (patch: Partial<Preferences>) => asAsync(store.updatePreferences(patch)),

  // ---------- Reset (dev) ----------
  reset: () => asAsync(store.reset()),
};

export type { Listing, Match, MatchState, Chat, Visit, Notification, Preferences, Profile };
