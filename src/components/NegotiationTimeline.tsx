import { MATCH_STEPS, type MatchState } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/** Timeline fixa no topo do chat: mostra em que fase da negociação está. */
export function NegotiationTimeline({ state }: { state: MatchState }) {
  const idx = MATCH_STEPS.findIndex((s) => s.key === state);
  return (
    <div className="border-b border-border bg-surface px-3 py-3">
      <ol className="flex items-center gap-1">
        {MATCH_STEPS.map((s, i) => {
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
                <div className={cn("h-0.5 flex-1", i === MATCH_STEPS.length - 1 ? "opacity-0" : done ? "bg-primary" : "bg-border")} />
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
