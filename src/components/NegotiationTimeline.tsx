import { matchSteps, type MatchState, type ListingKind } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/** Timeline fixa no topo do chat: mostra em que fase da negociação está. */
export function NegotiationTimeline({ state, kind = "rent" }: { state: MatchState; kind?: ListingKind }) {
  const STEPS = matchSteps(kind);
  // "negotiating" e "closed" não são fases próprias da timeline, mas têm de
  // mapear para uma — senão o stepper mostrava tudo por fazer num negócio
  // que já está à espera da última confirmação.
  const shown: MatchState = state === "negotiating" ? "visit_done" : state === "closed" ? "rental_confirmed" : state;
  const idx = STEPS.findIndex((s) => s.key === shown);
  return (
    <div className="border-b border-border bg-surface px-3 py-3">
      <ol className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li key={s.key} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-center">
                <div className={cn("h-0.5 flex-1", i === 0 ? "opacity-0" : done || active ? "bg-primary" : "bg-border")} />
                <div className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-pill border-2 text-[10px] font-bold",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary-soft text-primary",
                  !done && !active && "border-border bg-surface text-muted-foreground",
                )}>
                  {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                </div>
                <div className={cn("h-0.5 flex-1", i === STEPS.length - 1 ? "opacity-0" : done ? "bg-primary" : "bg-border")} />
              </div>
              <span className={cn("text-center text-[10px] leading-tight", active ? "font-bold text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
