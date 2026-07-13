import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ScoreBadge } from "@/components/AppShell";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Users, PawPrint, Cigarette, MoreHorizontal, Heart, X, Star, Wifi, ChefHat, Shirt, Wind, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/explore/$id")({
  head: () => ({ meta: [{ title: "Imóvel — HomeMatch" }] }),
  component: DetailPage,
});

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  "Wi-Fi": Wifi, "Cozinha": ChefHat, "Lavandaria": Shirt, "Aquecimento": Wind, "AC": Wind, "Garagem": Car,
};

function DetailPage() {
  const { id } = useParams({ from: "/explore/$id" });
  const nav = useNavigate();
  const listing = useStore((s) => s.listings.find((l) => l.id === id));
  const favorites = useStore((s) => s.favorites);
  const [photoIdx, setPhotoIdx] = useState(0);

  if (!listing) {
    return (
      <div className="mx-auto grid min-h-svh w-full max-w-[440px] place-items-center bg-background p-8 text-center">
        <div>
          <h2 className="font-display text-lg font-bold">Anúncio não encontrado</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pode ter sido removido ou nunca existiu.</p>
          <Link to="/explore" className="mt-4 inline-flex h-11 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground">Voltar ao feed</Link>
        </div>
      </div>
    );
  }

  const isFav = favorites.includes(listing.id);

  const showInterest = async () => {
    const { chat } = await api.sendInterest(listing.id);
    nav({ to: "/chats/$id", params: { id: chat.id } });
  };

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-28">
      <div className="relative aspect-[4/3] w-full bg-muted">
        <img src={listing.photos[photoIdx]} alt={listing.title} className="h-full w-full object-cover" />
        <div className="absolute inset-x-3 top-3 flex gap-1">
          {listing.photos.map((_, i) => (
            <span key={i} className={cn("h-1 flex-1 rounded-pill bg-white/40", i === photoIdx && "bg-white")} />
          ))}
        </div>
        <Link to="/explore" className="absolute left-3 top-6 grid size-10 place-items-center rounded-pill bg-black/40 text-white backdrop-blur">
          <ChevronLeft className="size-5" />
        </Link>
        <button onClick={() => api.toggleFavorite(listing.id)} className="absolute right-3 top-6 grid size-10 place-items-center rounded-pill bg-black/40 text-white backdrop-blur">
          <Heart className={cn("size-5", isFav && "fill-danger text-danger")} />
        </button>
        {photoIdx > 0 && (
          <button onClick={() => setPhotoIdx((i) => i - 1)} className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-pill bg-black/40 text-white">
            <ChevronLeft className="size-5" />
          </button>
        )}
        {photoIdx < listing.photos.length - 1 && (
          <button onClick={() => setPhotoIdx((i) => i + 1)} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-pill bg-black/40 text-white">
            <ChevronRight className="size-5" />
          </button>
        )}
        <button className="absolute right-14 top-6 grid size-10 place-items-center rounded-pill bg-black/40 text-white backdrop-blur">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <div className="px-5 pt-5">
        <div className="font-num text-3xl font-bold">€{listing.price}<span className="ml-1 text-base font-medium text-muted-foreground">/ mês</span></div>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight">{listing.title}</h1>

        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><MapPin className="size-4" /> {listing.neighborhood} · {listing.city}</p>
          <p className="flex items-center gap-2"><Calendar className="size-4" /> Disponível {listing.availableFrom} · mín. {listing.minMonths} meses</p>
          <p className="flex items-center gap-2"><Users className="size-4" /> {listing.capacity} pessoa{listing.capacity > 1 ? "s" : ""}
            {listing.pets && <> · <PawPrint className="ml-1 size-4" /> Pets ok</>}
            {!listing.smoke && <> · <Cigarette className="ml-1 size-4" /> Sem fumo</>}
          </p>
        </div>

        <Divider />
        <Section title="O espaço"><p className="text-[15px] leading-relaxed text-foreground/90">{listing.description || "Sem descrição."}</p></Section>

        {listing.amenities.length > 0 && (
          <>
            <Divider />
            <Section title="O que tem">
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a] ?? Wifi;
                  return (
                    <span key={a} className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-sm">
                      <Icon className="size-4 text-muted-foreground" /> {a}
                    </span>
                  );
                })}
              </div>
            </Section>
          </>
        )}

        <Divider />
        <Section title="Regras"><p className="text-[15px] leading-relaxed text-foreground/90">{listing.rules}</p></Section>

        <Divider />
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <img src={listing.owner.avatar} className="size-12 rounded-pill object-cover" alt="" />
            <div className="flex-1">
              <div className="flex items-center gap-2"><span className="font-display font-bold">{listing.owner.name}</span><ScoreBadge score={listing.owner.score} /></div>
              <div className="text-xs text-muted-foreground">{listing.owner.responds}</div>
            </div>
          </div>
          {listing.owner.reviews > 0 && (
            <div className="mt-3 flex items-center gap-1 text-sm">
              <Star className="size-4 fill-warning text-warning" />
              <span className="font-semibold">{listing.owner.rating}</span>
              <span className="text-muted-foreground">· {listing.owner.reviews} avaliações</span>
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[440px] items-center justify-around px-6 py-3">
          <button onClick={() => nav({ to: "/explore" })} className="grid size-14 place-items-center rounded-pill border border-border text-danger active:scale-95">
            <X className="size-6" strokeWidth={2.8} />
          </button>
          <button onClick={showInterest} className="grid size-14 place-items-center rounded-pill bg-primary text-primary-foreground shadow-lift active:scale-95">
            <Heart className="size-6" fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mt-5"><h2 className="mb-2 font-display text-base font-bold">{title}</h2>{children}</div>;
}
function Divider() { return <div className="my-5 h-px bg-border" />; }
