import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Users } from "lucide-react";

export const Route = createFileRoute("/candidates/")({
  head: () => ({ meta: [{ title: "Candidatos — HomeMatch" }] }),
  component: Candidates,
});

function Candidates() {
  return (
    <AppShell role="landlord">
      <PageHeader title="Candidatos" back="/dashboard" />
      <div className="p-4">
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
            <Users className="size-6" />
          </div>
          <h2 className="mt-3 font-display text-base font-bold">Sem candidatos</h2>
          <p className="mt-1 text-xs text-muted-foreground">Quando alguém mostrar interesse nos teus anúncios, aparece aqui.</p>
          <Link to="/publish" className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Publicar anúncio</Link>
        </div>
      </div>
    </AppShell>
  );
}
