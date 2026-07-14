import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MATCH_STEPS, nextActionFor, type MatchState } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { useRole } from "@/lib/user-state";
import { cn } from "@/lib/utils";
import { MessageCircle, ChevronRight, User } from "lucide-react";

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Matches — HomeMatch" }] }),
  component: MatchesPage,
});

type Group = "active" | "visit" | "closed";
const GROUPS: { key: Group; label: string; states: MatchState[] }[] = [
  { key: "active", label: "Ativas", states: ["interested", "conversation", "negotiating"] },
  { key: "visit", label: "Visita", states: ["visit_scheduled", "visit_done"] },
  { key: "closed", label: "Fechadas", states: ["rental_confirmed", "closed"] },
];

function MatchesPage() {
  const role = useRole();
  const matches = useStore((s) => s.matches);
  const listings = useStore((s) => s.listings);
  const [tab, setTab] = useState<Group>("active");

  const activeCount = matches.filter((m) => GROUPS[0].states.includes(m.state)).length;
  const closedCount = matches.filter((m) => GROUPS[2].states.includes(m.state)).length;
  const currentStates = GROUPS.find((g) => g.key === tab)!.states;
  const items = matches.filter((m) => currentStates.includes(m.state));
  const totalStepIndex = MATCH_STEPS.length;

  return (
    <AppShell>
      <PageHeader title={role === "landlord" ? "Candidaturas" : "Matches"} />
      <div className="px-4 pt-3 pb-2 text-xs text-muted-foreground">
        <span className="font-num font-bold text-foreground">{activeCount}</span> ativas ·{" "}
        <span className="font-num font-bold text-foreground">{closedCount}</span> fechadas
        <div className="mt-0.5">{role === "landlord" ? "As tuas negociações com candidatos." : "As tuas negociações com senhorios."}</div>
      </div>

      <div className="sticky top-14 z-20 grid grid-cols-3 gap-1 border-b border-border bg-surface/95 px-3 py-2 backdrop-blur">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setTab(g.key)}
            className={cn(
              "h-9 rounded-pill text-xs font-semibold transition",
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
            <h2 className="mt-3 font-display text-base font-bold">Sem negociações {tab === "active" ? "ativas" : tab === "visit" ? "em fase de visita" : "fechadas"}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {role === "landlord"
                ? "Publica um anúncio para receber candidatos."
                : "Dá interesse num anúncio para iniciar."}
            </p>
            <Link
              to={role === "landlord" ? "/publish" : "/explore"}
              className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              {role === "landlord" ? "Publicar anúncio" : "Explorar imóveis"}
            </Link>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 px-4 pt-4">
          {items.map((m) => {
            const l = listings.find((x) => x.id === m.listingId);
            if (!l) return null;
            const stepIdx = Math.max(0, MATCH_STEPS.findIndex((s) => s.key === m.state));
            const step = MATCH_STEPS[stepIdx];
            const action = nextActionFor(m.state, role === "landlord" ? "landlord" : "tenant");
            const primaryName = role === "landlord" ? "Candidato" : l.title;
            const secondary = role === "landlord" ? l.title : `${l.neighborhood} · €${l.price}`;
            return (
              <li key={m.id}>
                <Link
                  to="/chats/$id"
                  params={{ id: m.chatId }}
                  className="block rounded-2xl border border-border bg-surface p-3 active:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    {role === "landlord" ? (
                      <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground">
                        <User className="size-6" />
                      </div>
                    ) : (
                      <img src={l.photos[0]} className="size-14 shrink-0 rounded-2xl object-cover" alt="" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-display font-bold">{primaryName}</span>
                        <span className="font-num text-[11px] text-muted-foreground">{m.updatedAt}</span>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{secondary}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex gap-1">
                          {Array.from({ length: totalStepIndex }).map((_, i) => (
                            <span
                              key={i}
                              className={cn(
                                "size-1.5 rounded-pill",
                                i <= stepIdx ? "bg-primary" : "bg-muted",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-primary">{step?.label}</span>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-primary-soft px-3 py-2">
                    <span className="truncate text-xs font-semibold text-primary">Próximo: {action}</span>
                    <span className="shrink-0 text-[11px] font-bold text-primary">Abrir conversa →</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
