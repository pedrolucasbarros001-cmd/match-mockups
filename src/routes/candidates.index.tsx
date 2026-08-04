import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRoleGuard } from "@/lib/user-state";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { useStore, store } from "@/lib/store";
import type { Match, MatchState } from "@/lib/mock-data";
import { Users, User, Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/candidates/")({
  head: () => ({ meta: [{ title: "Candidatos — HomeMatch" }] }),
  component: Candidates,
});

type SubTab = "pending" | "talking" | "visit" | "closed";
const SUB_TABS: { key: SubTab; label: string; states: MatchState[] }[] = [
  { key: "pending", label: "Pendentes", states: ["interested"] },
  { key: "talking", label: "Em conversa", states: ["conversation", "negotiating"] },
  { key: "visit", label: "Visita", states: ["visit_scheduled", "visit_done"] },
  { key: "closed", label: "Fechados", states: ["rental_confirmed", "closed"] },
];

type Sort = "score" | "recent" | "oldest";

function Candidates() {
  useRoleGuard("landlord");
  const nav = useNavigate();
  const listings = useStore((s) => s.listings);
  const matches = useStore((s) => s.matches);

  const myListingIds = useMemo(() => new Set(listings.map((l) => l.id)), [listings]);
  const all = useMemo(() => matches.filter((m) => myListingIds.has(m.listingId)), [matches, myListingIds]);

  // Tabs por anúncio (só se houver mais do que um com candidatos)
  const listingsWithCandidates = listings.filter((l) => all.some((m) => m.listingId === l.id));
  const [listingTab, setListingTab] = useState<string | null>(null);
  const activeListingId = listingTab ?? listingsWithCandidates[0]?.id ?? null;

  const [subTab, setSubTab] = useState<SubTab>("pending");
  const [sort, setSort] = useState<Sort>("score");

  const sub = SUB_TABS.find((t) => t.key === subTab)!;
  const items = all
    .filter((m) => (activeListingId ? m.listingId === activeListingId : true))
    .filter((m) => sub.states.includes(m.state))
    .sort((a, b) => {
      if (sort === "score") return (b.candidate?.score ?? 0) - (a.candidate?.score ?? 0);
      if (sort === "oldest") return all.indexOf(b) - all.indexOf(a);
      return all.indexOf(a) - all.indexOf(b);
    });

  const pendingCount = (listingId: string) => all.filter((m) => m.listingId === listingId && m.state === "interested").length;
  const crossListing = (m: Match) =>
    m.candidate ? all.find((x) => x.id !== m.id && x.candidate?.name === m.candidate?.name) : undefined;

  const accept = (m: Match) => {
    store.setMatchState(m.id, "conversation");
    nav({ to: "/chats/$id", params: { id: m.chatId } });
  };
  const ignore = (m: Match) => store.setMatchState(m.id, "closed");

  return (
    <AppShell role="landlord" width="wide">
      <PageHeader title="Candidatos" back="/dashboard" />

      {all.length === 0 ? (
        <div className="p-4">
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
              <Users className="size-6" />
            </div>
            <h2 className="mt-3 font-display text-base font-bold">Sem candidatos</h2>
            <p className="mt-1 text-xs text-muted-foreground">Quando alguém mostrar interesse nos teus anúncios, aparece aqui.</p>
            {listings.length === 0 && (
              <Link to="/publish" className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Publicar anúncio</Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {listingsWithCandidates.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-b border-border px-3 py-2">
              {listingsWithCandidates.map((l) => {
                const n = pendingCount(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => setListingTab(l.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-semibold",
                      activeListingId === l.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface",
                    )}
                  >
                    <span className="max-w-[140px] truncate">{l.title}</span>
                    {n > 0 && <span className="grid size-5 place-items-center rounded-pill bg-primary font-num text-[10px] font-bold text-primary-foreground">{n}</span>}
                  </button>
                );
              })}
            </div>
          )}

          <div className="sticky top-14 z-20 border-b border-border bg-surface/95 backdrop-blur">
            <div className="grid grid-cols-4 gap-1 px-3 py-2">
              {SUB_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSubTab(t.key)}
                  className={cn(
                    "h-9 rounded-pill text-xs font-semibold transition",
                    subTab === t.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 px-4 pb-2 text-xs text-muted-foreground">
              Ordenar:
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold outline-none">
                <option value="score">Trust Score</option>
                <option value="recent">Mais recente</option>
                <option value="oldest">Mais antigo</option>
              </select>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Nada em "{sub.label}" para este anúncio.</p>
          ) : (
            <ul className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((m) => {
                const c = m.candidate;
                const cross = crossListing(m);
                const crossL = cross && listings.find((l) => l.id === cross.listingId);
                return (
                  <li key={m.id} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                    <div className="flex items-center gap-3">
                      {c?.avatar ? (
                        <img src={c.avatar} className="size-12 rounded-pill bg-muted object-cover" alt="" />
                      ) : (
                        <div className="grid size-12 place-items-center rounded-pill bg-muted text-muted-foreground"><User className="size-6" /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-display font-bold">{c?.name ?? "Candidato"}</span>
                          <ScoreBadge score={c?.score ?? 0} withIcon />
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {[c?.occupation, c?.city].filter(Boolean).join(" · ") || "Sem detalhes"}
                        </div>
                      </div>
                      <span className="shrink-0 font-num text-[11px] text-muted-foreground">{m.updatedAt}</span>
                    </div>
                    {m.message && <p className="mt-2 text-sm italic text-foreground/80">"{m.message}"</p>}
                    {crossL && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning">
                        <AlertTriangle className="size-3" /> Também interessado em "{crossL.title}"
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Link
                        to="/candidates/$requestId"
                        params={{ requestId: m.id }}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border text-xs font-semibold"
                      >
                        Ver perfil
                      </Link>
                      {m.state === "interested" && (
                        <>
                          <button onClick={() => ignore(m)} className="inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-danger">
                            <X className="size-3.5" /> Ignorar
                          </button>
                          <button onClick={() => accept(m)} className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-success text-xs font-bold text-white">
                            <Check className="size-3.5" /> Aceitar
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </AppShell>
  );
}
