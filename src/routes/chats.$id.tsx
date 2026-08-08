import { PageShell } from "@/components/AppShell";
import { ChatList } from "@/components/ChatList";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { nextActionFor, priceLabel, formatVisitWhen, REPORT_REASONS } from "@/lib/mock-data";
import { NegotiationTimeline } from "@/components/NegotiationTimeline";
import { VisitCard } from "@/components/VisitCard";
import { VisitSheet } from "@/components/VisitSheet";
import { ChevronLeft, Send, MoreVertical, Calendar, Check, Star, User, X, MessageCircle, Hourglass, Home, Bell, BellOff, Archive, Flag, Ban } from "lucide-react";
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
  // Visitas deste match, mais recente primeiro. A negociação lê-se daqui.
  const allVisits = useStore((s) => s.visits);
  const visits = useMemo(
    () => (match ? allVisits.filter((v) => v.matchId === match.id) : []),
    [allVisits, match],
  );
  // A que está em jogo agora: pendente ou combinada. Se não houver, a última.
  const visit = visits.find((v) => v.status === "pending" || v.status === "accepted") ?? visits[0];

  const [text, setText] = useState("");
  const [showVisitSheet, setShowVisitSheet] = useState(false);
  /** Quando definido, a folha abre em modo contraproposta da visita indicada. */
  const [counterOf, setCounterOf] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [reporting, setReporting] = useState(false);

  const state = match?.state ?? "conversation";
  const kind = listing?.kind ?? "rent";
  const sale = kind === "sale";
  const rented = state === "rental_confirmed";
  const archived = rented || state === "closed";
  // Já há proposta em jogo? Se sim, o banner não oferece propor outra.
  const hasOpenVisit = !!visit && (visit.status === "pending" || visit.status === "accepted");
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
  // Quem está a ver é sempre um dos dois lados — as ações da visita dependem disso.
  const side: "seeker" | "landlord" = role === "landlord" ? "landlord" : "seeker";

  const submitVisit = async (when: { date: string; time: string }) => {
    if (!match) return;
    await api.proposeVisit(match.id, when, side, counterOf ?? undefined);
    store.sendMessage(
      chat.id,
      `${counterOf ? "Nova data proposta" : "Visita proposta"}: ${formatVisitWhen(when)} ✅`,
      "them",
    );
    setShowVisitSheet(false);
    setCounterOf(null);
  };
  const acceptVisit = () => {
    if (!visit) return;
    api.acceptVisit(visit.id);
    store.sendMessage(chat.id, `Visita combinada para ${formatVisitWhen(visit)} ✅`, "them");
  };
  const declineVisit = () => {
    if (!visit) return;
    api.declineVisit(visit.id);
    store.sendMessage(chat.id, "Proposta de visita recusada ✅", "them");
  };
  const cancelVisit = () => {
    if (!visit) return;
    api.cancelVisit(visit.id);
    store.sendMessage(chat.id, "Visita cancelada ✅", "them");
  };
  const counterVisit = () => {
    if (!visit) return;
    setCounterOf(visit.id);
    setShowVisitSheet(true);
  };
  const markVisitDone = () => {
    if (!visit) return;
    // Só fecha quando ambos confirmam — a mensagem no chat diz qual dos dois casos é.
    const both = store.confirmVisitDone(visit.id, side);
    store.sendMessage(
      chat.id,
      both ? "Visita confirmada pelos dois lados ✅" : "Confirmaste que a visita aconteceu. Falta o outro lado ✅",
      "them",
    );
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
        <button
          onClick={() => setShowMenu(true)}
          aria-label="Ações da conversa"
          className="grid size-10 place-items-center rounded-pill transition hover:bg-muted active:scale-90"
        >
          <MoreVertical className="size-5" />
        </button>
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
          {state === "conversation" && !hasOpenVisit && (
            <button onClick={() => { setCounterOf(null); setShowVisitSheet(true); }} className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              <Calendar className="size-3.5" /> Propor visita
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
        className="sticky top-14 md:top-0 z-20 mx-3 mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-card"
      >
        <img src={listing.photos[0]} className="size-12 rounded-md object-cover" alt="" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold">{listing.title}</div>
          <div className="font-num text-xs text-muted-foreground">{priceLabel(listing)} · {listing.city}</div>
        </div>
      </Link>

      {/* Negociação da visita: quem propôs, o que cada lado pode fazer agora. */}
      {visit && !archived && (
        <VisitCard
          visit={visit}
          mine={visit.proposedBy === side}
          side={side}
          onAccept={acceptVisit}
          onDecline={declineVisit}
          onCounter={counterVisit}
          onCancel={cancelVisit}
          onMarkDone={markVisitDone}
        />
      )}

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
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={chat.blocked ? "Conversa bloqueada" : archived ? "Conversa arquivada" : "Escreve uma mensagem…"} disabled={archived || !!chat.blocked}
            className="h-12 flex-1 rounded-pill border border-border bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-muted" />
          <button type="submit" disabled={!text.trim() || archived || !!chat.blocked} className="grid size-12 place-items-center rounded-pill bg-primary text-primary-foreground active:scale-95 disabled:bg-muted disabled:text-muted-foreground">
            <Send className="size-5" />
          </button>
        </form>
      </div>

      <VisitSheet
        open={showVisitSheet}
        onClose={() => { setShowVisitSheet(false); setCounterOf(null); }}
        onSubmit={submitVisit}
        title={counterOf ? "Propor outra data" : "Propor visita"}
        cta={counterOf ? "Enviar nova data" : "Enviar proposta"}
        suggestedTimes={listing.visitAvailability}
      />

      {showMenu && (
        <Sheet onClose={() => setShowMenu(false)} title="Ações">
          <div className="flex flex-col">
            <MenuItem icon={<Home className="size-4" />} label="Ver anúncio" onClick={() => { setShowMenu(false); nav({ to: "/explore/$id", params: { id: listing.id } }); }} />
            <MenuItem
              icon={chat.muted ? <Bell className="size-4" /> : <BellOff className="size-4" />}
              label={chat.muted ? "Reativar notificações" : "Silenciar conversa"}
              hint={chat.muted ? "Voltas a ser avisado das mensagens." : "Continuas a receber, deixas de ser avisado."}
              onClick={() => { api.setChatFlag(chat.id, { muted: !chat.muted }); setShowMenu(false); }}
            />
            <MenuItem
              icon={<Archive className="size-4" />}
              label={chat.archived ? "Desarquivar" : "Arquivar conversa"}
              hint={chat.archived ? "Volta à lista principal." : "Sai da lista principal, não se perde."}
              onClick={() => { api.setChatFlag(chat.id, { archived: !chat.archived }); setShowMenu(false); }}
            />
            <MenuItem icon={<Flag className="size-4" />} label="Denunciar" hint="Burla, anúncio falso ou comportamento abusivo." onClick={() => { setShowMenu(false); setReporting(true); }} danger />
            <MenuItem
              icon={<Ban className="size-4" />}
              label={chat.blocked ? "Desbloquear" : "Bloquear"}
              hint={chat.blocked ? "Voltam a poder falar." : "Ninguém volta a escrever nesta conversa."}
              onClick={() => { api.setChatFlag(chat.id, { blocked: !chat.blocked }); setShowMenu(false); }}
              danger
            />
          </div>
        </Sheet>
      )}

      {reporting && (
        <Sheet onClose={() => setReporting(false)} title="Denunciar conversa">
          <p className="text-sm text-muted-foreground">O que se passou? A denúncia é confidencial.</p>
          <div className="mt-3 flex flex-col gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  api.submitReport("chat", chat.id, r.id);
                  setReporting(false);
                  store.sendMessage(chat.id, "Denúncia enviada para revisão ✅", "them");
                }}
                className="rounded-xl border border-border bg-surface p-3 text-left transition active:scale-[0.98]"
              >
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{r.hint}</div>
              </button>
            ))}
          </div>
        </Sheet>
      )}

      </div>
    </PageShell>
  );
}

function MenuItem({ icon, label, hint, onClick, danger }: {
  icon: React.ReactNode; label: string; hint?: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick} className="flex items-start gap-3 rounded-xl p-3 text-left transition active:bg-muted">
      <span className={cn("mt-0.5 shrink-0", danger ? "text-danger" : "text-muted-foreground")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm font-semibold", danger && "text-danger")}>{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </button>
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
