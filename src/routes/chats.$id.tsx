import { PageShell } from "@/components/AppShell";
import { ChatList } from "@/components/ChatList";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { nextActionFor, priceLabel } from "@/lib/mock-data";
import { NegotiationTimeline } from "@/components/NegotiationTimeline";
import { ChevronLeft, Send, MoreVertical, Calendar, Check, Star, User, X, MessageCircle, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, store } from "@/lib/store";
import { api } from "@/lib/api";
import { useRole } from "@/lib/user-state";

export const Route = createFileRoute("/chats/$id")({
  head: () => ({ meta: [{ title: "Chat — HomeMatch" }] }),
  component: ChatRoom,
});

function ChatRoom() {
  const { id } = useParams({ from: "/chats/$id" });
  const nav = useNavigate();
  const role = useRole();
  const chat = useStore((s) => s.chats.find((c) => c.id === id));
  const listing = useStore((s) => (chat ? s.listings.find((l) => l.id === chat.listingId) : undefined));
  const match = useStore((s) => (chat ? s.matches.find((m) => m.chatId === chat.id) : undefined));
  const deal = useStore((s) => (match ? s.deals.find((d) => d.matchId === match.id) : undefined));
  // Visita mais recente deste match — é ela que decide se há "visita feita" por marcar.
  const visit = useStore((s) => (match ? s.visits.find((v) => v.matchId === match.id) : undefined));

  const [text, setText] = useState("");
  const [showVisitSheet, setShowVisitSheet] = useState(false);

  const state = match?.state ?? "conversation";
  const kind = listing?.kind ?? "rent";
  const sale = kind === "sale";
  const rented = state === "rental_confirmed";
  const archived = rented || state === "closed";
  const action = nextActionFor(state, role === "landlord" ? "landlord" : "tenant", kind);

  if (!chat || !listing) {
    return (
      <div className="mx-auto grid min-h-svh w-full max-w-[440px] place-items-center bg-background p-8 text-center">
        <div>
          <div className="mx-auto grid size-14 place-items-center rounded-pill bg-muted text-muted-foreground">
            <MessageCircle className="size-6" />
          </div>
          <h2 className="mt-3 font-display text-lg font-bold">Conversa indisponível</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ainda não tens conversas. Dá interesse num anúncio para começar.</p>
          <Link to="/matches" className="mt-4 inline-flex h-11 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground">Ver matches</Link>
        </div>
      </div>
    );
  }

  // Cabeçalho mostra sempre a OUTRA PARTE: seeker vê o senhorio, landlord vê o candidato.
  const other =
    role === "landlord"
      ? { name: match?.candidate?.name || "Candidato", avatar: match?.candidate?.avatar || "" }
      : { name: listing.owner.name, avatar: listing.owner.avatar };

  const send = async () => {
    if (!text.trim() || archived) return;
    await api.sendMessage(chat.id, text.trim());
    setText("");
  };
  const proposeVisit = async (slot: string) => {
    if (!match) return;
    await api.sendMessage(chat.id, `Proposta de visita: ${slot}`);
    await api.proposeVisit(listing.id, match.id, slot);
    setShowVisitSheet(false);
  };
  const markVisitDone = () => {
    // Passa sempre pelo mesmo caminho que /visits-manager: setVisitStatus já
    // empurra o match para "visit_done" automaticamente (ver store.ts).
    if (!visit) return;
    store.setVisitStatus(visit.id, "done");
    store.sendMessage(chat.id, "Visita marcada como realizada ✅", "them");
  };
  const confirmAsSeeker = () => {
    if (!deal) return;
    store.confirmDealSeeker(deal.id);
    store.sendMessage(chat.id, sale ? "Proposta confirmada pelos dois lados ✅" : "Arrendamento confirmado pelos dois lados ✅", "them");
  };

  return (
    <PageShell width="wide" className="flex flex-col md:grid md:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] md:items-start">
      {/* Desktop: lista de conversas fica visível ao lado (padrão master–detail). */}
      <aside className="hidden h-svh overflow-y-auto border-r border-border md:block">
        <ChatList activeId={chat.id} />
      </aside>
      <div className="flex min-h-svh min-w-0 flex-col">
      <div className="sticky top-0 z-30 h-safe-top glass-light md:hidden" />
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 flex items-center gap-2 border-b border-border glass-light px-2 py-2 md:top-0">
        <Link to="/matches" className="grid size-10 place-items-center rounded-pill hover:bg-muted md:hidden"><ChevronLeft className="size-5" /></Link>

        {other.avatar ? (
          <img src={other.avatar} className="size-10 rounded-pill object-cover" alt="" />
        ) : (
          <div className="grid size-10 place-items-center rounded-pill bg-muted text-muted-foreground"><User className="size-5" /></div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-bold">{other.name}</div>
          <div className="truncate text-xs text-muted-foreground">{listing.title}</div>
        </div>
        <button className="grid size-10 place-items-center rounded-pill hover:bg-muted"><MoreVertical className="size-5" /></button>
      </header>

      <NegotiationTimeline state={state} kind={kind} />

      {/* Banner "Próxima ação" — texto e botão mudam por role, estado e tipo de negócio. */}
      {rented ? (
        <div className="border-b border-border bg-success/10 px-4 py-3 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
            <Check className="size-3.5" /> {sale ? "Proposta confirmada pelos dois lados." : "Arrendamento confirmado pelos dois lados."}
          </div>
          {match && (
            <Link to="/feedback/$matchId" params={{ matchId: match.id }} className="mt-1 flex items-center justify-center gap-1 text-xs font-bold text-primary">
              <Star className="size-3" /> Deixar avaliação →
            </Link>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-primary-soft px-4 py-2.5">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wide text-primary/80">Próxima ação</div>
            <div className="truncate text-sm font-semibold text-foreground">{action}</div>
          </div>
          {state === "interested" && role === "landlord" && (
            <Link to="/candidates" className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              Responder
            </Link>
          )}
          {state === "interested" && role === "seeker" && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
              <Hourglass className="size-3.5" /> Aguardar
            </span>
          )}
          {state === "conversation" && (
            <button onClick={() => setShowVisitSheet(true)} className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              <Calendar className="size-3.5" /> Propor visita
            </button>
          )}
          {state === "visit_scheduled" && role === "landlord" && (
            <button onClick={markVisitDone} className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              <Check className="size-3.5" /> Visita feita
            </button>
          )}
          {state === "visit_done" && role === "landlord" && (
            <button
              onClick={() => nav({ to: "/rental-close/$chatId", params: { chatId: chat.id } })}
              className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Check className="size-3.5" /> {sale ? "Registar proposta" : "Fechar este espaço"}
            </button>
          )}
          {state === "negotiating" && role === "seeker" && deal && !deal.seekerConfirmed && (
            <button onClick={confirmAsSeeker} className="inline-flex items-center gap-1 rounded-pill bg-success px-3 py-1.5 text-xs font-bold text-white">
              <Check className="size-3.5" /> Confirmar
            </button>
          )}
        </div>
      )}

      {/* Card do anúncio — sticky, nunca desaparece no scroll. */}
      <Link
        to="/explore/$id"
        params={{ id: listing.id }}
        className="sticky top-14 z-20 mx-3 mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-card"
      >
        <img src={listing.photos[0]} className="size-12 rounded-md object-cover" alt="" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold">{listing.title}</div>
          <div className="font-num text-xs text-muted-foreground">{priceLabel(listing)} · {listing.city}</div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {chat.messages.length === 0 && (
          <div className="mx-auto rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">Envia a primeira mensagem para iniciar a conversa.</div>
        )}
        {chat.messages.map((m, i) => {
          // Mensagens de sistema: centradas, neutras.
          if (m.text.endsWith("✅")) {
            return (
              <div key={i} className="mx-auto rounded-pill bg-muted px-3 py-1.5 text-center text-[11px] font-semibold text-muted-foreground">
                {m.text}
              </div>
            );
          }
          // "me" no store = seeker. O landlord vê as bolhas espelhadas.
          const mine = role === "landlord" ? m.from === "them" : m.from === "me";
          return (
            <div key={i} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
              <div className={cn(
                "max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug",
                mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
              )}>{m.text}</div>
              <span className="mt-1 px-1 font-num text-[10px] text-muted-foreground">{m.at}</span>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface px-3 py-3 pb-safe">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={archived ? "Conversa arquivada" : "Escreve uma mensagem…"} disabled={archived}
            className="h-12 flex-1 rounded-pill border border-border bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-muted" />
          <button type="submit" disabled={!text.trim() || archived} className="grid size-12 place-items-center rounded-pill bg-primary text-primary-foreground active:scale-95 disabled:bg-muted disabled:text-muted-foreground">
            <Send className="size-5" />
          </button>
        </form>
      </div>

      {showVisitSheet && (
        <Sheet onClose={() => setShowVisitSheet(false)} title="Propor visita">
          <p className="text-sm text-muted-foreground">Escolhe um horário disponível.</p>
          <div className="mt-3 flex flex-col gap-2">
            {listing.visitAvailability.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Sem horários definidos pelo senhorio.</p>
            )}
            {listing.visitAvailability.map((s) => (
              <button key={s} onClick={() => proposeVisit(s)} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left">
                <span className="font-semibold">{s}</span>
                <Calendar className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Sheet>
      )}
      </div>
    </PageShell>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40" />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[440px] md:max-w-[760px] rounded-t-[28px] bg-surface p-5 pb-safe">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-pill bg-border" />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-pill hover:bg-muted"><X className="size-4" /></button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </>
  );
}
