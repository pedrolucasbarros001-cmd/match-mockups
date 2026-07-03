import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { listings, recommendationSections } from "@/lib/mock-data";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/para-ti")({
  head: () => ({ meta: [{ title: "Para Ti — HomeMatch" }] }),
  component: ParaTi,
});

function ParaTi() {
  return (
    <AppShell>
      <PageHeader title="Para Ti" right={<Sparkles className="size-5 text-primary" />} />
      <div className="space-y-6 px-4 pt-4">
        {recommendationSections.map((sec) => (
          <section key={sec.title}>
            <div className="mb-2 flex items-end justify-between">
              <div>
                <h2 className="font-display text-base font-bold">{sec.title}</h2>
                <p className="text-xs text-muted-foreground">{sec.subtitle}</p>
              </div>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
              {sec.ids
                .map((id) => listings.find((l) => l.id === id)!)
                .filter(Boolean)
                .map((l) => (
                  <Link key={l.id} to="/explore/$id" params={{ id: l.id }} className="w-[220px] shrink-0 overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="relative aspect-[4/5]">
                      <img src={l.photos[0]} className="absolute inset-0 h-full w-full object-cover" alt="" />
                      <div className="absolute right-2 top-2"><ScoreBadge score={l.owner.score} /></div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                        <div className="truncate font-display font-bold">{l.title}</div>
                        <div className="font-num text-sm">€{l.price}/mês · {l.neighborhood}</div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
