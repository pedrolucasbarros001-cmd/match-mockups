// Fachada API: hoje usa store local; amanhã troca por fetch/Supabase sem
// alterar componentes. Todas as funções são async por design.
//
// TODO(backend): substituir cada implementação pela chamada HTTP correspondente.

import { store, getState } from "./store";
import type { Feedback, Preferences, Profile } from "./store";
import type { Listing, Match, MatchState, Chat, Visit, VisitState, Notification } from "./mock-data";

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
  // TODO(backend): PATCH /api/matches/:id/state
  setMatchState: (matchId: string, next: MatchState) => asAsync(store.setMatchState(matchId, next)),

  // ---------- Chat ----------
  // TODO(backend): POST /api/chats/:id/messages
  sendMessage: (chatId: string, text: string) => asAsync(store.sendMessage(chatId, text, "me")),

  // ---------- Visits ----------
  // TODO(backend): POST /api/visits
  proposeVisit: (listingId: string, matchId: string, slot: string) =>
    asAsync(store.proposeVisit(listingId, matchId, slot)),
  // TODO(backend): PATCH /api/visits/:id
  setVisitStatus: (id: string, status: VisitState) => asAsync(store.setVisitStatus(id, status)),

  // ---------- Notifications ----------
  // TODO(backend): PATCH /api/notifications/:id
  markNotificationRead: (id: string) => asAsync(store.markNotificationRead(id)),
  // TODO(backend): PATCH /api/notifications/read-all
  markAllNotificationsRead: () => asAsync(store.markAllNotificationsRead()),

  // ---------- Feedback ----------
  // TODO(backend): POST /api/feedback
  saveFeedback: (matchId: string, rating: number, comment: string) =>
    asAsync(store.saveFeedback(matchId, rating, comment)),

  // ---------- Profile / Preferences ----------
  // TODO(backend): PATCH /api/me
  updateProfile: (patch: Partial<Profile>) => asAsync(store.updateProfile(patch)),
  // TODO(backend): PATCH /api/me/preferences
  updatePreferences: (patch: Partial<Preferences>) => asAsync(store.updatePreferences(patch)),

  // ---------- Reset (dev) ----------
  reset: () => asAsync(store.reset()),
};

export type { Listing, Match, MatchState, Chat, Visit, VisitState, Notification, Feedback, Preferences, Profile };
