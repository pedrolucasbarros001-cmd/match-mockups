import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Plus, Building2, MoreVertical } from "lucide-react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-listings/")({
  head: () => ({ meta: [{ title: "Anúncios — HomeMatch" }] }),
  component: MyListings,
});

const LIFE: Record<string, { label: string; cls: string }> = {
  draft: { label: "Rascunho", cls: "bg-muted text-muted-foreground" },
  published: { label: "Publicado", cls: "bg-success/15 text-success" },
  negotiating: { label: "Em negociação", cls: "bg-warning/15 text-warning" },
  rented: { label: "Arrendado", cls: "bg-primary/15 text-primary" },
};

function MyListings() {
  useRoleGuard("landlord");
  const listings = useStore((s) => s.listings);

  return (
    <AppShell role="landlord">
      <PageHeader title="Anúncios" right={
        <Link to="/publish" className="inline-flex h-10 items-center gap-1 rounded-pill bg-primary px-3 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Novo
        </Link>
      } />

      {listings.length === 0 ? (
        <div className="flex flex-col gap-3 p-4">
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
              <Building2 className="size-6" />
            </div>
            <h2 className="mt-3 font-display text-base font-bold">Ainda sem anúncios</h2>
            <p className="mt-1 text-xs text-muted-foreground">Cada anúncio representa um espaço (quarto, estúdio, T1…).</p>
            <Link to="/publish" className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-5 font-display font-semibold text-primary-foreground shadow-lift">
              <Plus className="size-4" /> Publicar novo anúncio
            </Link>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 p-4">
          {listings.map((l) => {
            const s = LIFE[l.lifecycle] ?? LIFE.published;
            return (
              <li key={l.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="flex gap-3 p-3">
                  <img src={l.photos[0]} className="size-20 shrink-0 rounded-xl object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link to="/explore/$id" params={{ id: l.id }} className="min-w-0 flex-1">
                        <div className="truncate font-display text-base font-bold">{l.title}</div>
                        <div className="font-num text-sm text-muted-foreground">€{l.price}/mês · {l.city}</div>
                      </Link>
                      <button className="grid size-8 shrink-0 place-items-center rounded-pill text-muted-foreground hover:bg-muted">
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={cn("rounded-pill px-2 py-0.5 text-[11px] font-bold", s.cls)}>{s.label}</span>
                      <span className="font-num text-[11px] text-muted-foreground">Qualidade {l.qualityScore}/100</span>
                    </div>
                  </div>
                </div>
                <div className="flex divide-x divide-border border-t border-border text-xs font-semibold">
                  <Link to="/candidates" className="flex-1 py-2.5 text-center text-primary">Candidatos</Link>
                  {l.lifecycle === "rented" ? (
                    <button
                      onClick={() => api.updateListing(l.id, { lifecycle: "published" })}
                      className="flex-1 py-2.5 text-center text-primary"
                    >Reativar</button>
                  ) : (
                    <button
                      onClick={() => api.updateListing(l.id, { lifecycle: "rented" })}
                      className="flex-1 py-2.5 text-center text-muted-foreground"
                    >Marcar arrendado</button>
                  )}
                  <button
                    onClick={() => confirm("Apagar anúncio?") && api.deleteListing(l.id)}
                    className="flex-1 py-2.5 text-center text-danger"
                  >Apagar</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
