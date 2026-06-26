import { createFileRoute, Link } from "@tanstack/react-router";
import { listings } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Plus, Pencil, Users, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/my-listings/")({
  head: () => ({ meta: [{ title: "Anúncios — HomeMatch" }] }),
  component: MyListings,
});

function MyListings() {
  const mine = listings.slice(0, 2);
  return (
    <AppShell role="landlord">
      <PageHeader title="Anúncios" right={
        <Link to="/my-listings/new" className="inline-flex h-10 items-center gap-1 rounded-pill bg-primary px-3 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Novo
        </Link>
      } />
      <div className="flex flex-col gap-3 p-4">
        {mine.map((l) => (
          <div key={l.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex gap-3 p-3">
              <img src={l.photos[0]} className="size-24 rounded-xl object-cover" alt="" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-display font-bold">{l.title}</div>
                <div className="font-num text-sm text-muted-foreground">€{l.price}/mês</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-pill bg-success/15 px-2 py-0.5 font-semibold text-success">● Ativo</span>
                  <span className="text-muted-foreground">5 interessados</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-border p-3">
              <ActionBtn icon={<Pencil className="size-4" />} label="Editar" />
              <Link to="/candidates" className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-semibold active:bg-muted">
                <Users className="size-4" /> Ver
              </Link>
              <ActionBtn icon={<MoreHorizontal className="size-4" />} label="" square />
            </div>
          </div>
        ))}
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
