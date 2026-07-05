import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { listings, type ListingLifecycle } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Plus, Pencil, Users, Calendar, RefreshCcw, Archive, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-listings/")({
  head: () => ({ meta: [{ title: "Anúncios — HomeMatch" }] }),
  component: MyListings,
});

const LIFE: Record<ListingLifecycle, { label: string; cls: string }> = {
  draft: { label: "Rascunho", cls: "bg-muted text-muted-foreground" },
  published: { label: "Publicado", cls: "bg-success/15 text-success" },
  negotiating: { label: "Em negociação", cls: "bg-warning/15 text-warning" },
  rented: { label: "Arrendado", cls: "bg-primary/15 text-primary" },
};

function MyListings() {
  // Assume os dois primeiros são meus, e simula um "arrendado".
  const initial = [
    { ...listings[0] },
    { ...listings[1], lifecycle: "negotiating" as ListingLifecycle },
  ];
  const [items, setItems] = useState(initial);

  const setState = (id: string, s: ListingLifecycle) =>
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, lifecycle: s } : x)));

  return (
    <AppShell role="landlord">
      <PageHeader title="Anúncios" right={
        <Link to="/publish" className="inline-flex h-10 items-center gap-1 rounded-pill bg-primary px-3 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Novo
        </Link>
      } />
      <div className="flex flex-col gap-3 p-4">
        {items.map((l) => {
          const life = LIFE[l.lifecycle];
          return (
            <div key={l.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex gap-3 p-3">
                <img src={l.photos[0]} className="size-24 rounded-xl object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display font-bold">{l.title}</div>
                  <div className="font-num text-sm text-muted-foreground">€{l.price}/mês · {l.spaceType}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={cn("inline-flex items-center gap-1 rounded-pill px-2 py-0.5 font-semibold", life.cls)}>● {life.label}</span>
                    <span className="text-muted-foreground">Qualidade {l.qualityScore}/100</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 border-t border-border p-3">
                <ActionBtn icon={<Pencil className="size-4" />} label="Editar" />
                <Link to="/matches" className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-semibold active:bg-muted">
                  <Users className="size-4" /> Interessados
                </Link>
                <Link to="/visits-manager" className="inline-flex size-10 items-center justify-center rounded-lg border border-border active:bg-muted" aria-label="Visitas">
                  <Calendar className="size-4" />
                </Link>
                <ActionBtn icon={<MoreHorizontal className="size-4" />} label="" square />
              </div>
              {l.lifecycle === "rented" ? (
                <button onClick={() => setState(l.id, "published")} className="flex w-full items-center justify-center gap-2 border-t border-border bg-primary-soft px-3 py-2.5 text-sm font-semibold text-primary">
                  <RefreshCcw className="size-4" /> Reativar
                </button>
              ) : l.lifecycle === "negotiating" ? (
                <button onClick={() => setState(l.id, "rented")} className="flex w-full items-center justify-center gap-2 border-t border-border bg-muted px-3 py-2.5 text-sm font-semibold text-foreground">
                  <Archive className="size-4" /> Marcar arrendado
                </button>
              ) : null}
            </div>
          );
        })}

        <Link to="/publish" className="flex h-14 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface font-display font-semibold">
          <Plus className="size-5" /> Publicar novo anúncio
        </Link>
      </div>
    </AppShell>
  );
}

function ActionBtn({ icon, label, square }: { icon: React.ReactNode; label: string; square?: boolean }) {
  return (
    <button className={"inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-semibold active:bg-muted " + (square ? "w-10" : "flex-1")}>
      {icon} {label}
    </button>
  );
}
