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
  Interest,
} from "./mock-data";

const KEY = "hm.store.v1";
const EVENT = "hm.store";

export type Feedback = {
  id: string;
  matchId: string;
  rating: number;
  comment: string;
  at: string;
};

export type Preferences = {
  city: string;
  maxDistanceKm: number;
  spaceTypes: string[];
  minPrice: number;
  maxPrice: number;
  moveInFrom: string;
  pets: boolean;
  needsFurnished: boolean;
};

export type Profile = {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  phone: string;
  nif: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityDeclared: boolean;
  incomeDeclared: boolean;
  termsAccepted: boolean;
};

export type StoreState = {
  listings: Listing[];
  matches: Match[];
  chats: Chat[];
  visits: Visit[];
  notifications: Notification[];
  interests: Interest[];
  favorites: string[];
  feedback: Feedback[];
  profile: Profile;
  preferences: Preferences;
};

const emptyProfile: Profile = {
  name: "",
  email: "",
  avatar: "",
  bio: "",
  phone: "",
  nif: "",
  emailVerified: false,
  phoneVerified: false,
  identityDeclared: false,
  incomeDeclared: false,
  termsAccepted: false,
};

const emptyPreferences: Preferences = {
  city: "",
  maxDistanceKm: 5,
  spaceTypes: [],
  minPrice: 0,
  maxPrice: 2000,
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
  interests: [],
  favorites: [],
  feedback: [],
  profile: emptyProfile,
  preferences: emptyPreferences,
};

let state: StoreState = load();

function load(): StoreState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
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
    const match: Match = {
      id: uid(),
      listingId,
      chatId: chat.id,
      state: "interested",
      updatedAt: ago(),
      reasons: [],
    };
    const interest: Interest = { listingId, status: "pending", ago: ago(), message };
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
      interests: [interest, ...s.interests],
      notifications: [notif, ...s.notifications],
    }));
    return { match, chat };
  },
  passListing(listingId: string) {
    set((s) => ({ ...s, interests: [{ listingId, status: "passed", ago: ago() }, ...s.interests] }));
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
  setVisitStatus(id: string, status: VisitState) {
    // VisitState superset — Visit.status é menor. Casteamos ao subset esperado.
    set((s) => ({
      ...s,
      visits: s.visits.map((v) =>
        v.id === id ? { ...v, status: status as Visit["status"] } : v,
      ),
    }));
  },

  // Notifications
  markNotificationRead(id: string) {
    set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)) }));
  },
  markAllNotificationsRead() {
    set((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, unread: false })) }));
  },

  // Feedback
  saveFeedback(matchId: string, rating: number, comment: string) {
    const f: Feedback = { id: uid(), matchId, rating, comment, at: nowISO() };
    set((s) => ({ ...s, feedback: [f, ...s.feedback] }));
    return f;
  },

  // Profile & Preferences
  updateProfile(patch: Partial<Profile>) {
    set((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  },
  updatePreferences(patch: Partial<Preferences>) {
    set((s) => ({ ...s, preferences: { ...s.preferences, ...patch } }));
  },
};
