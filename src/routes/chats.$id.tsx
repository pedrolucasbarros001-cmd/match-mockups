import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { chats, listings, matches, nextActionFor } from "@/lib/mock-data";
import { NegotiationTimeline } from "@/components/NegotiationTimeline";
import { ChevronLeft, Send, MoreVertical, Calendar, Check, Lock, RefreshCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chats/$id")({
  head: () => ({ meta: [{ title: "Chat — HomeMatch" }] }),
  component: ChatRoom,
});

function ChatRoom() {
  const { id } = useParams({ from: "/chats/$id" });
  const chat = chats.find((c) => c.id === id);
  const listing = chat ? listings.find((l) => l.id === chat.listingId) : undefined;
  const match = chat ? matches.find((m) => m.chatId === chat.id) : undefined;

  const [msgs, setMsgs] = useState<{ from: "me" | "them"; text: string; at: string }[]>(chat?.messages ?? []);
  const [text, setText] = useState("");
  const [state, setState] = useState(match?.state ?? "conversation");
  const [showVisitSheet, setShowVisitSheet] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [landlordConfirmed, setLandlordConfirmed] = useState(false);
  const [tenantConfirmed, setTenantConfirmed] = useState(false);

  const rented = state === "rental_confirmed";
  const action = useMemo(() => nextActionFor(state), [state]);

  const send = () => {
    if (!text.trim() || rented) return;
    setMsgs((m) => [...m, { from: "me", text: text.trim(), at: "agora" }]);
    setText("");
  };

  const proposeVisit = (slot: string) => {
    setMsgs((m) => [...m, { from: "me", text: `Proposta de visita: ${slot}`, at: "agora" }]);
    setState("visit_scheduled");
    setShowVisitSheet(false);
  };

  const markVisitDone = () => setState("visit_done");

  const doConfirm = (side: "landlord" | "tenant") => {
    if (side === "landlord") setLandlordConfirmed(true);
    else setTenantConfirmed(true);
    if ((side === "landlord" ? true : landlordConfirmed) && (side === "tenant" ? true : tenantConfirmed)) {
      setState("rental_confirmed");
      setShowConfirmSheet(false);
      setMsgs((m) => [...m, { from: "me", text: "Arrendamento confirmado ✅", at: "agora" }]);
    }
  };

  const reactivate = () => {
    setState("conversation");
    setLandlordConfirmed(false);
    setTenantConfirmed(false);
    setMsgs((m) => [...m, { from: "them", text: "O anúncio foi reativado. Continuamos onde parámos.", at: "agora" }]);
  };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/95 px-2 py-2 backdrop-blur">
        <Link to="/matches" className="grid size-10 place-items-center rounded-pill hover:bg-muted"><ChevronLeft className="size-5" /></Link>
        <img src={listing.owner.avatar} className="size-10 rounded-pill object-cover" alt="" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-bold">{listing.owner.name}</div>
          <div className="truncate text-xs text-muted-foreground">{listing.title}</div>
        </div>
        <button className="grid size-10 place-items-center rounded-pill hover:bg-muted"><MoreVertical className="size-5" /></button>
      </header>

      <NegotiationTimeline state={state} />

      {/* Próxima acção */}
      {!rented ? (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-primary-soft px-4 py-2.5">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wide text-primary/80">Próxima ação</div>
            <div className="truncate text-sm font-semibold text-foreground">{action}</div>
          </div>
          {state === "conversation" && (
            <button onClick={() => setShowVisitSheet(true)} className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              <Calendar className="size-3.5" /> Propor
            </button>
          )}
          {state === "visit_scheduled" && (
            <button onClick={markVisitDone} className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              <Check className="size-3.5" /> Visita feita
            </button>
          )}
          {state === "visit_done" && (
            <button onClick={() => setShowConfirmSheet(true)} className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              <Check className="size-3.5" /> Confirmar
            </button>
          )}
        </div>
      ) : (
        <div className="border-b border-border bg-muted px-4 py-3 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Lock className="size-3.5" /> Este espaço foi arrendado. A conversa fica no histórico.
          </div>
          <button onClick={reactivate} className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-primary">
            <RefreshCcw className="size-3" /> Reativar (mock)
          </button>
        </div>
      )}

      <Link to="/explore/$id" params={{ id: listing.id }} className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
        <img src={listing.photos[0]} className="size-12 rounded-md object-cover" alt="" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold">{listing.title}</div>
          <div className="font-num text-xs text-muted-foreground">€{listing.price}/mês · {listing.city}</div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex flex-col", m.from === "me" ? "items-end" : "items-start")}>
            <div className={cn(
              "max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug",
              m.from === "me" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
            )}>{m.text}</div>
            <span className="mt-1 px-1 font-num text-[10px] text-muted-foreground">{m.at}</span>
          </div>
        ))}
        {rented && (
          <Link to="/feedback/$matchId" params={{ matchId: match?.id ?? "m1" }} className="mx-auto mt-3 inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-xs font-semibold">
            Deixar feedback →
          </Link>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface px-3 py-3">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={rented ? "Conversa arquivada" : "Escreve uma mensagem…"} disabled={rented}
            className="h-12 flex-1 rounded-pill border border-border bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-muted" />
          <button type="submit" disabled={!text.trim() || rented} className="grid size-12 place-items-center rounded-pill bg-primary text-primary-foreground active:scale-95 disabled:bg-muted disabled:text-muted-foreground">
            <Send className="size-5" />
          </button>
        </form>
      </div>

      {/* Sheets */}
      {showVisitSheet && (
        <Sheet onClose={() => setShowVisitSheet(false)} title="Propor visita">
          <p className="text-sm text-muted-foreground">Escolhe um horário disponível.</p>
          <div className="mt-3 flex flex-col gap-2">
            {listing.visitAvailability.map((s) => (
              <button key={s} onClick={() => proposeVisit(s)} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left">
                <span className="font-semibold">{s}</span>
                <Calendar className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {showConfirmSheet && (
        <Sheet onClose={() => setShowConfirmSheet(false)} title="Confirmar arrendamento">
          <p className="text-sm text-muted-foreground">Os dois lados precisam de confirmar. O anúncio só sai do feed depois disso.</p>
          <div className="mt-4 space-y-2">
            <ConfirmRow label="Proprietário" ok={landlordConfirmed} onClick={() => doConfirm("landlord")} />
            <ConfirmRow label="Inquilino" ok={tenantConfirmed} onClick={() => doConfirm("tenant")} />
          </div>
          {landlordConfirmed && tenantConfirmed && (
            <div className="mt-3 rounded-xl bg-success/10 p-3 text-sm text-success">Ambos confirmaram. A finalizar…</div>
          )}
        </Sheet>
      )}
    </div>
  );
}

function ConfirmRow({ label, ok, onClick }: { label: string; ok: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={ok} className={cn(
      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left",
      ok ? "border-success bg-success/10" : "border-border bg-surface",
    )}>
      <span className="font-semibold">{label}</span>
      {ok ? <Check className="size-5 text-success" /> : <span className="text-xs font-semibold text-primary">Confirmar →</span>}
    </button>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40" />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[440px] rounded-t-3xl bg-surface p-5 pb-8">
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
