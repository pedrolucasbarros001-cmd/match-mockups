import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favoritos — HomeMatch" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const favorites = useStore((s) => s.favorites);
  const listings = useStore((s) => s.listings);
  const items = listings.filter((l) => favorites.includes(l.id));

  return (
    <AppShell>
      <PageHeader title="Favoritos" back="/profile" />
      {items.length === 0 ? (
        <Empty />
      ) : (
        <ul className="grid grid-cols-2 gap-3 px-4 pt-4">
          {items.map((l) => (
            <li key={l.id}>
              <Link to="/explore/$id" params={{ id: l.id }} className="block overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="relative aspect-square">
                  <img src={l.photos[0]} className="absolute inset-0 h-full w-full object-cover" alt="" />
                  <button
                    onClick={(e) => { e.preventDefault(); api.toggleFavorite(l.id); }}
                    className="absolute right-2 top-2 grid size-9 place-items-center rounded-pill bg-white/95"
                  >
                    <Heart className="size-4 fill-danger text-danger" />
                  </button>
                </div>
                <div className="p-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-display text-sm font-bold">{l.title}</span>
                    <ScoreBadge score={l.owner.score} />
                  </div>
                  <div className="font-num text-xs text-muted-foreground">€{l.price}/mês</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}

function Empty() {
  return (
    <div className="grid place-items-center px-8 py-24 text-center">
      <div className="grid size-16 place-items-center rounded-pill bg-primary-soft">
        <Heart className="size-8 text-primary" />
      </div>
      <h2 className="mt-4 font-display text-lg font-bold">Ainda sem favoritos</h2>
      <p className="mt-1 text-sm text-muted-foreground">Toca no coração dos imóveis que gostares para os guardar aqui.</p>
      <Link to="/explore" className="mt-6 rounded-pill bg-primary px-5 py-2.5 text-sm font-semibold text-white">Explorar imóveis</Link>
    </div>
  );
}
