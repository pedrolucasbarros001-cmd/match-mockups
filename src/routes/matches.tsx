import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MATCH_STEPS, nextActionFor, type MatchState } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
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
  const matches = useStore((s) => s.matches);
  const listings = useStore((s) => s.listings);
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

      {items.length === 0 ? (
        <div className="p-8">
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
              <MessageCircle className="size-6" />
            </div>
            <h2 className="mt-3 font-display text-base font-bold">Sem matches</h2>
            <p className="mt-1 text-xs text-muted-foreground">{tab === "all" ? "Dá interesse num anúncio para gerar o primeiro match." : "Nenhum match nesta fase."}</p>
            {tab === "all" && (
              <Link to="/explore" className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Explorar imóveis</Link>
            )}
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((m) => {
            const l = listings.find((x) => x.id === m.listingId);
            if (!l) return null;
            const stepIdx = MATCH_STEPS.findIndex((s) => s.key === m.state);
            const step = MATCH_STEPS[Math.max(0, stepIdx)];
            const action = nextActionFor(m.state);
            return (
              <li key={m.id}>
                <Link to="/chats/$id" params={{ id: m.chatId }} className="flex items-center gap-3 px-4 py-3 active:bg-muted">
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
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
