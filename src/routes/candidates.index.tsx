import { createFileRoute, Link } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/user-state";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Users, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/candidates/")({
  head: () => ({ meta: [{ title: "Candidatos — HomeMatch" }] }),
  component: Candidates,
});

function Candidates() {
  useRoleGuard("landlord");
  const listings = useStore((s) => s.listings);
  const matches = useStore((s) => s.matches);
  const myListingIds = new Set(listings.map((l) => l.id));
  const items = matches.filter((m) => myListingIds.has(m.listingId));

  return (
    <AppShell role="landlord">
      <PageHeader title="Candidatos" back="/dashboard" />
      {items.length === 0 ? (
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
        <ul className="divide-y divide-border">
          {items.map((m) => {
            const l = listings.find((x) => x.id === m.listingId);
            if (!l) return null;
            return (
              <li key={m.id}>
                <Link to="/chats/$id" params={{ id: m.chatId }} className="flex items-center gap-3 px-4 py-3 active:bg-muted">
                  <img src={l.photos[0]} className="size-12 rounded-xl object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-bold">{l.title}</div>
                    <div className="text-xs text-muted-foreground">Interessado · {m.state}</div>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
