import { createFileRoute, Link } from "@tanstack/react-router";
import { listings } from "@/lib/mock-data";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { Check, X, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/candidates/")({
  head: () => ({ meta: [{ title: "Candidatos — HomeMatch" }] }),
  component: Candidates,
});

const fake = [
  { id: "r1", name: "Tiago Costa", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=70", score: 78, ago: "há 2h", listingId: "1", msg: "Olá, procuro um sítio para Setembro." },
  { id: "r2", name: "Inês Mota", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=70", score: 65, ago: "há 5h", listingId: "1", msg: "Estudo no IPB, super tranquila." },
  { id: "r3", name: "Rui Oliveira", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=70", score: 84, ago: "há 1 dia", listingId: "1", msg: "Trabalho remoto, sem fumar, sem pets." },
];

function Candidates() {
  return (
    <AppShell role="landlord">
      <PageHeader title="Candidatos" />
      <div className="flex flex-col gap-3 p-4">
        {fake.map((c) => {
          const l = listings.find((x) => x.id === c.listingId)!;
          return (
            <Link key={c.id} to="/candidates/$requestId" params={{ requestId: c.id }} className="rounded-2xl border border-border bg-surface p-4 active:scale-[0.99]">
              <div className="flex items-center gap-3">
                <img src={c.avatar} className="size-12 rounded-pill object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display font-bold">{c.name}</span>
                    <ScoreBadge score={c.score} />
                  </div>
                  <div className="text-xs text-muted-foreground">{c.ago} · sobre {l.title}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-foreground/90">"{c.msg}"</p>
              <div className="mt-3 flex gap-2">
                <button className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-semibold text-danger active:bg-muted">
                  <X className="size-4" /> Rejeitar
                </button>
                <button className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-success text-sm font-semibold text-white active:scale-95">
                  <Check className="size-4" /> Aceitar
                </button>
                <button className="grid size-10 place-items-center rounded-lg border border-border">
                  <MessageCircle className="size-4" />
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
