import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { interests, listings } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MessageCircle, Clock, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/interests")({
  head: () => ({ meta: [{ title: "Os meus likes — HomeMatch" }] }),
  component: InterestsPage,
});

const TABS = [
  { key: "pending", label: "Pendentes" },
  { key: "accepted", label: "Aceites" },
  { key: "passed", label: "Passados" },
] as const;

function InterestsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("pending");
  const counts = {
    pending: interests.filter((i) => i.status === "pending").length,
    accepted: interests.filter((i) => i.status === "accepted").length,
    passed: interests.filter((i) => i.status === "passed").length,
  };
  const items = interests.filter((i) => i.status === tab);

  return (
    <AppShell>
      <PageHeader title="Os meus likes" />
      <div className="sticky top-14 z-20 flex gap-2 border-b border-border bg-surface/95 px-3 py-2 backdrop-blur">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn(
            "flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition",
            tab === t.key ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
          )}>
            {t.label}
            <span className={cn("font-num text-xs", tab === t.key ? "text-background/70" : "text-muted-foreground/70")}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 p-4">
        {items.length === 0 && (
          <div className="mt-12 text-center text-sm text-muted-foreground">Sem itens nesta lista.</div>
        )}
        {items.map((it) => {
          const l = listings.find((x) => x.id === it.listingId);
          if (!l) return null;
          return (
            <Link key={it.listingId} to="/explore/$id" params={{ id: l.id }}
              className={cn("flex gap-3 rounded-2xl border border-border bg-surface p-3 transition active:scale-[0.99]", it.status === "passed" && "opacity-60")}>
              <img src={l.photos[0]} alt="" className="size-24 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-display font-bold">{l.title}</div>
                <div className="font-num text-sm text-muted-foreground">€{l.price}/mês · {l.city}</div>
                <div className="mt-1 text-xs text-muted-foreground">{it.ago}</div>
                {it.status === "pending" && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-pill bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                    <Clock className="size-3" /> A aguardar{it.daysLeft ? ` · ${it.daysLeft}d` : ""}
                  </div>
                )}
                {it.status === "accepted" && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-pill bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                    <Check className="size-3" /> Aceite!
                  </div>
                )}
                {it.status === "passed" && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-pill bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    <X className="size-3" /> Sem resposta
                  </div>
                )}
                {it.message && <p className="mt-2 truncate text-xs italic text-muted-foreground">"{it.message}"</p>}
              </div>
              {it.status === "accepted" && (
                <div className="grid place-items-center">
                  <div className="grid size-10 place-items-center rounded-pill bg-primary text-primary-foreground"><MessageCircle className="size-5" /></div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
