import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { listings, mapPins } from "@/lib/mock-data";
import { LayoutGrid, MapPin } from "lucide-react";

export const Route = createFileRoute("/explore/mapa")({
  head: () => ({ meta: [{ title: "Mapa — HomeMatch" }] }),
  component: MapaPage,
});

function MapaPage() {
  const [selected, setSelected] = useState<string | null>("3");
  const active = listings.find((l) => l.id === selected);
  return (
    <AppShell>
      <PageHeader
        title="Mapa · Bragança"
        right={
          <Link to="/explore" className="flex items-center gap-1 rounded-pill border border-border px-3 py-1.5 text-xs font-semibold">
            <LayoutGrid className="size-4" /> Cards
          </Link>
        }
      />
      <div className="relative mx-4 mt-4 aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-soft to-muted">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-40">
          <path d="M0 60 Q30 50 50 55 T100 50 L100 100 L0 100 Z" fill="hsl(var(--success)/0.15)" />
          <path d="M10 30 Q40 20 60 30 T100 25" stroke="hsl(var(--border))" strokeWidth="0.4" fill="none" />
          <path d="M20 70 L80 40" stroke="hsl(var(--border))" strokeWidth="0.4" fill="none" />
          <circle cx="50" cy="50" r="1" fill="hsl(var(--muted-foreground))" />
        </svg>
        {mapPins.map((p) => {
          const l = listings.find((x) => x.id === p.id)!;
          const isSel = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={"absolute -translate-x-1/2 -translate-y-full transition " + (isSel ? "scale-110 z-10" : "")}
            >
              <div className={"flex items-center gap-1 rounded-pill px-2.5 py-1 font-num text-xs font-bold shadow-lg " + (isSel ? "bg-primary text-white" : "bg-white text-foreground")}>
                <MapPin className="size-3" /> €{l.price}
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <Link to="/explore/$id" params={{ id: active.id }} className="mx-4 mt-4 flex gap-3 rounded-2xl border border-border bg-surface p-3 shadow-md">
          <img src={active.photos[0]} className="size-20 rounded-xl object-cover" alt="" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-display font-bold">{active.title}</span>
              <ScoreBadge score={active.owner.score} />
            </div>
            <div className="font-num text-sm text-muted-foreground">€{active.price}/mês · {active.neighborhood}</div>
            <div className="mt-1 text-xs text-muted-foreground">{active.distanceM} m · {active.type}</div>
          </div>
        </Link>
      )}
    </AppShell>
  );
}
