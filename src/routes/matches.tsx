import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { matches, listings, MATCH_STEPS, nextActionFor, type MatchState } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { MessageCircle, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Matches — HomeMatch" }] }),
  component: MatchesPage,
});

const GROUPS: { key: MatchState | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "interested", label: "Interesse" },
  { key: "conversation", label: "Em conversa" },
  { key: "visit_scheduled", label: "Visita marcada" },
  { key: "visit_done", label: "Visita feita" },
  { key: "rental_confirmed", label: "Arrendado" },
  { key: "closed", label: "Fechado" },
];

function MatchesPage() {
  const [tab, setTab] = useState<(typeof GROUPS)[number]["key"]>("all");
  const items = tab === "all" ? matches : matches.filter((m) => m.state === tab);

  return (
    <AppShell>
      <PageHeader title="Matches" />
      <div className="sticky top-14 z-20 flex gap-2 overflow-x-auto border-b border-border bg-surface/95 px-3 py-2 backdrop-blur">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setTab(g.key)}
            className={cn(
              "shrink-0 rounded-pill px-3.5 py-1.5 text-xs font-semibold transition",
              tab === g.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-border">
        {items.length === 0 && (
          <li className="p-12 text-center text-sm text-muted-foreground">Sem matches nesta fase.</li>
        )}
        {items.map((m) => {
          const l = listings.find((x) => x.id === m.listingId);
          if (!l) return null;
          const stepIdx = MATCH_STEPS.findIndex((s) => s.key === m.state);
          const step = MATCH_STEPS[Math.max(0, stepIdx)];
          const action = nextActionFor(m.state);
          const to = m.chatId ? "/chats/$id" : "/explore/$id";
          const params = m.chatId ? { id: m.chatId } : { id: l.id };
          return (
            <li key={m.id}>
              <Link to={to} params={params} className="flex items-center gap-3 px-4 py-3 active:bg-muted">
                <img src={l.photos[0]} className="size-14 shrink-0 rounded-2xl object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-display font-bold">{l.title}</span>
                    <span className="font-num text-[11px] text-muted-foreground">{m.updatedAt}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs">
                    <span className="rounded-pill bg-primary-soft px-2 py-0.5 font-semibold text-primary">
                      {step?.label ?? m.state}
                    </span>
                    <span className="truncate text-muted-foreground">Próximo: {action}</span>
                  </div>
                </div>
                {m.chatId ? (
                  <MessageCircle className="size-5 text-primary" />
                ) : (
                  <ChevronRight className="size-5 text-muted-foreground" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
