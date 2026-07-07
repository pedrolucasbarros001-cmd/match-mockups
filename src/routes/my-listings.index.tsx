import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Plus, Building2 } from "lucide-react";

export const Route = createFileRoute("/my-listings/")({
  head: () => ({ meta: [{ title: "Anúncios — HomeMatch" }] }),
  component: MyListings,
});

function MyListings() {
  return (
    <AppShell role="landlord">
      <PageHeader title="Anúncios" right={
        <Link to="/publish" className="inline-flex h-10 items-center gap-1 rounded-pill bg-primary px-3 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Novo
        </Link>
      } />
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
    </AppShell>
  );
}
