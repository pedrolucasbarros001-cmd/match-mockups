import { Calendar, Check, X, RefreshCw, Clock, CalendarCheck } from "lucide-react";
import { formatVisitWhen, visitIsPast, type Visit } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Estado da negociação da visita, com as ações do lado de quem está a ver.
 *
 * Equivalência UI↔estado: quem propôs nunca vê "Aceitar" (ninguém aceita a
 * própria proposta) e quem recebeu nunca vê "Cancelar proposta". A mesma
 * verdade — quem propôs — decide o que cada um pode fazer.
 */
export function VisitCard({
  visit, mine, onAccept, onDecline, onCounter, onCancel, onMarkDone,
}: {
  visit: Visit;
  /** A proposta foi feita por quem está a ver? */
  mine: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onCounter: () => void;
  onCancel: () => void;
  onMarkDone: () => void;
}) {
  const when = formatVisitWhen(visit);
  const past = visitIsPast(visit);

  if (visit.status === "pending") {
    return (
      <Shell tone="pending" icon={<Clock className="size-4" />} label={mine ? "Proposta enviada" : "Visita proposta"} when={when}>
        {mine ? (
          <>
            <p className="mb-2.5 text-xs text-muted-foreground">À espera de resposta. Podes desmarcar ou sugerir outra data.</p>
            <div className="flex gap-2">
              <Action onClick={onCancel} variant="ghost">Retirar</Action>
              <Action onClick={onCounter} variant="ghost"><RefreshCw className="size-3.5" /> Outra data</Action>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Action onClick={onAccept} variant="primary"><Check className="size-3.5" /> Aceitar</Action>
            <Action onClick={onCounter} variant="ghost"><RefreshCw className="size-3.5" /> Propor outra</Action>
            <Action onClick={onDecline} variant="danger"><X className="size-3.5" /> Recusar</Action>
          </div>
        )}
      </Shell>
    );
  }

  if (visit.status === "accepted") {
    return (
      <Shell tone="ok" icon={<CalendarCheck className="size-4" />} label="Visita combinada" when={when}>
        {/* Só depois da hora marcada faz sentido dizer que aconteceu. */}
        {past ? (
          <div className="flex flex-wrap gap-2">
            <Action onClick={onMarkDone} variant="primary"><Check className="size-3.5" /> A visita aconteceu</Action>
            <Action onClick={onCancel} variant="ghost">Não aconteceu</Action>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Action onClick={onCounter} variant="ghost"><RefreshCw className="size-3.5" /> Remarcar</Action>
            <Action onClick={onCancel} variant="danger"><X className="size-3.5" /> Cancelar</Action>
          </div>
        )}
      </Shell>
    );
  }

  if (visit.status === "done") {
    return <Shell tone="done" icon={<Check className="size-4" />} label="Visita realizada" when={when} />;
  }

  const label = visit.status === "cancelled" ? "Visita cancelada" : "Proposta recusada";
  return (
    <Shell tone="off" icon={<X className="size-4" />} label={label} when={when}>
      {visit.note && <p className="text-xs italic text-muted-foreground">"{visit.note}"</p>}
    </Shell>
  );
}

const TONES = {
  pending: "border-warning/40 bg-warning/8",
  ok: "border-primary/35 bg-primary-soft",
  done: "border-success/35 bg-success/8",
  off: "border-border bg-muted/40",
} as const;

const ICON_TONES = {
  pending: "bg-warning/15 text-warning",
  ok: "bg-primary/15 text-primary",
  done: "bg-success/15 text-success",
  off: "bg-muted text-muted-foreground",
} as const;

function Shell({ tone, icon, label, when, children }: {
  tone: keyof typeof TONES;
  icon: React.ReactNode;
  label: string;
  when: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mx-3 mt-3 rounded-2xl border p-3.5", TONES[tone])}>
      <div className="flex items-center gap-2.5">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-pill", ICON_TONES[tone])}>{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="flex items-center gap-1.5 font-display text-sm font-bold capitalize">
            <Calendar className="size-3.5 shrink-0 text-muted-foreground" /> {when}
          </div>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Action({ children, onClick, variant }: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "ghost" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-pill px-3.5 text-xs font-bold transition active:scale-95",
        variant === "primary" && "bg-primary text-primary-foreground shadow-sm",
        variant === "ghost" && "border border-border bg-surface text-foreground",
        variant === "danger" && "border border-danger/40 bg-surface text-danger",
      )}
    >
      {children}
    </button>
  );
}
