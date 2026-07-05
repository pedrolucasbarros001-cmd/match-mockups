import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "motion/react";
import { Heart, X, Info, SlidersHorizontal, MapPin, PawPrint, Cigarette, BedDouble, RotateCcw, Map as MapIcon, Sparkles } from "lucide-react";
import { listings, compatibilityReasons, type Listing } from "@/lib/mock-data";
import { AppShell, CompatibilityReasons } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore/")({
  head: () => ({ meta: [{ title: "Explorar — HomeMatch" }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const [stack, setStack] = useState(listings);
  const [lastRemoved, setLastRemoved] = useState<{ listing: Listing; dir: "left" | "right" } | null>(null);
  const [forceDir, setForceDir] = useState<"left" | "right" | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const current = stack[0];

  const onSwiped = (dir: "left" | "right") => {
    if (!current) return;
    setLastRemoved({ listing: current, dir });
    setStack((s) => s.slice(1));
    setForceDir(null);
  };

  const undo = () => {
    if (!lastRemoved) return;
    setStack((s) => [lastRemoved.listing, ...s]);
    setLastRemoved(null);
  };

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur">
        <div className="font-display text-lg font-extrabold tracking-tight">HomeMatch</div>
        <div className="flex items-center gap-2">
          {lastRemoved && (
            <button onClick={undo} className="grid size-10 place-items-center rounded-pill border border-border bg-surface text-muted-foreground">
              <RotateCcw className="size-4" />
            </button>
          )}
          <Link to="/para-ti" className="grid size-10 place-items-center rounded-pill border border-border bg-surface" aria-label="Para ti">
            <Sparkles className="size-4 text-primary" />
          </Link>
          <Link to="/explore/mapa" className="grid size-10 place-items-center rounded-pill border border-border bg-surface" aria-label="Mapa">
            <MapIcon className="size-4" />
          </Link>
          <button onClick={() => setShowFilters(true)} className="grid size-10 place-items-center rounded-pill border border-border bg-surface">
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </header>

      <div className="px-4 pt-4">
        <div className="relative mx-auto aspect-[3/4.4] w-full max-w-md">
          {stack.length === 0 ? (
            <EmptyState onOpenFilters={() => setShowFilters(true)} />
          ) : (
            <>
              {stack.slice(0, 3).reverse().map((l, idx, arr) => {
                const depth = arr.length - 1 - idx;
                const isTop = depth === 0;
                return (
                  <SwipeCard
                    key={l.id}
                    listing={l}
                    depth={depth}
                    interactive={isTop}
                    forceDir={isTop ? forceDir : null}
                    onSwiped={onSwiped}
                  />
                );
              })}
            </>
          )}
        </div>

        {current && (
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-6">
            <ActionButton onClick={() => setForceDir("left")} aria-label="Passar" className="text-danger">
              <X className="size-7" strokeWidth={2.8} />
            </ActionButton>
            <ActionButton onClick={() => {}} aria-label="Detalhes" className="size-12 text-muted-foreground" >
              <Info className="size-5" />
            </ActionButton>
            <ActionButton onClick={() => setForceDir("right")} aria-label="Like" className="bg-primary text-primary-foreground border-transparent">
              <Heart className="size-7" fill="currentColor" />
            </ActionButton>
          </div>
        )}
      </div>

      <FiltersSheet open={showFilters} onClose={() => setShowFilters(false)} />
    </AppShell>
  );
}

function ActionButton({ children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={cn(
      "grid size-16 place-items-center rounded-pill border border-border bg-surface shadow-card transition active:scale-95",
      className,
    )}>{children}</button>
  );
}

function SwipeCard({ listing, depth, interactive, forceDir, onSwiped }: {
  listing: Listing; depth: number; interactive: boolean;
  forceDir: "left" | "right" | null;
  onSwiped: (dir: "left" | "right") => void;
}) {
  const nav = useNavigate();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0]);
  const [photoIdx, setPhotoIdx] = useState(0);

  const onEnd = (_: unknown, info: PanInfo) => {
    const off = info.offset.x;
    if (off > 120) onSwiped("right");
    else if (off < -120) onSwiped("left");
    else x.set(0);
  };

  // External trigger
  if (forceDir && interactive) {
    const target = forceDir === "right" ? 600 : -600;
    setTimeout(() => onSwiped(forceDir), 250);
    return (
      <motion.div
        animate={{ x: target, rotate: forceDir === "right" ? 20 : -20, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0"
      >
        <CardInner listing={listing} photoIdx={photoIdx} setPhotoIdx={setPhotoIdx} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: interactive ? x : 0,
        rotate: interactive ? rotate : 0,
        scale: 1 - depth * 0.04,
        y: depth * 8,
        zIndex: 10 - depth,
      }}
      drag={interactive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={onEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      <CardInner listing={listing} photoIdx={photoIdx} setPhotoIdx={setPhotoIdx}
        onTapInfo={() => nav({ to: "/explore/$id", params: { id: listing.id } })} />
      {interactive && (
        <>
          <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute left-6 top-8 rotate-[-12deg] rounded-lg border-4 border-success px-4 py-1 font-display text-2xl font-extrabold uppercase text-success">
            Like
          </motion.div>
          <motion.div style={{ opacity: nopeOpacity }} className="pointer-events-none absolute right-6 top-8 rotate-[12deg] rounded-lg border-4 border-danger px-4 py-1 font-display text-2xl font-extrabold uppercase text-danger">
            Nope
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

function CardInner({ listing, photoIdx, setPhotoIdx, onTapInfo }: {
  listing: Listing; photoIdx: number; setPhotoIdx: (n: number) => void; onTapInfo?: () => void;
}) {
  const photo = listing.photos[photoIdx];
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-muted shadow-card">
      <div className="absolute inset-0 select-none">
        <img src={photo} alt={listing.title} className="h-full w-full object-cover" draggable={false} />
      </div>

      {/* photo tap zones */}
      <div className="absolute inset-x-0 top-0 z-10 flex h-[65%]">
        <button onClick={(e) => { e.stopPropagation(); setPhotoIdx(Math.max(0, photoIdx - 1)); }} className="h-full w-1/2" aria-label="Foto anterior" />
        <button onClick={(e) => { e.stopPropagation(); setPhotoIdx(Math.min(listing.photos.length - 1, photoIdx + 1)); }} className="h-full w-1/2" aria-label="Foto seguinte" />
      </div>

      {/* photo dots */}
      <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
        {listing.photos.map((_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-pill bg-white/40", i === photoIdx && "bg-white")} />
        ))}
      </div>

      {/* gradient + content */}
      <button
        type="button"
        onClick={onTapInfo}
        className="absolute inset-x-0 bottom-0 z-20 cursor-pointer bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-5 pt-24 text-left text-white"
      >
        <div className="font-num text-3xl font-bold">€{listing.price}<span className="ml-1 text-base font-medium opacity-80">/ mês</span></div>
        <div className="font-display text-xl font-bold">{listing.title}</div>
        <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
          <MapPin className="size-4" /> {listing.neighborhood} · ~{listing.distanceM}m
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/90">
          <span className="inline-flex items-center gap-1"><BedDouble className="size-3.5" /> {listing.type}</span>
          {listing.pets && <span className="inline-flex items-center gap-1"><PawPrint className="size-3.5" /> Pets</span>}
          {!listing.smoke && <span className="inline-flex items-center gap-1"><Cigarette className="size-3.5" /> Sem fumo</span>}
        </div>

        <div className="mt-3">
          <CompatibilityReasons reasons={compatibilityReasons(listing)} dark />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <img src={listing.owner.avatar} alt="" className="size-6 rounded-pill border border-white/30 object-cover" />
          <span className="text-sm font-semibold">{listing.owner.name}</span>
        </div>
      </button>
    </div>
  );
}

function EmptyState({ onOpenFilters }: { onOpenFilters: () => void }) {
  return (
    <div className="grid h-full place-items-center rounded-3xl border border-dashed border-border bg-surface text-center">
      <div className="px-6">
        <div className="mx-auto grid size-16 place-items-center rounded-pill bg-primary-soft text-primary">
          <BedDouble className="size-8" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold">Já viste tudo por aqui.</h2>
        <p className="mt-1 text-sm text-muted-foreground">Volta mais tarde ou alarga a tua área de pesquisa.</p>
        <button onClick={onOpenFilters} className="mt-6 h-12 rounded-lg bg-primary px-6 font-display font-semibold text-primary-foreground shadow-lift">
          Abrir filtros
        </button>
      </div>
    </div>
  );
}

function FiltersSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [types, setTypes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(750);
  const [prefs, setPrefs] = useState<string[]>([]);
  const count = useMemo(() => Math.max(1, 12 - types.length - prefs.length), [types, prefs]);

  const togg = (arr: string[], v: string, setter: (a: string[]) => void) =>
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-black/40" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[440px] rounded-t-3xl bg-surface p-5 pb-8">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-pill bg-border" />
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filtros</h2>
              <button onClick={() => { setTypes([]); setPrefs([]); setMaxPrice(2000); }} className="text-sm font-semibold text-muted-foreground">Limpar tudo</button>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-sm font-semibold">Tipo de espaço</div>
              <div className="flex flex-wrap gap-2">
                {["Quarto", "Apartamento", "Casa"].map((t) => (
                  <Chip key={t} active={types.includes(t)} onClick={() => togg(types, t, setTypes)}>{t}</Chip>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Preço máximo</span>
                <span className="font-num text-sm font-bold text-primary">€{maxPrice} / mês</span>
              </div>
              <input type="range" min={200} max={2000} step={50} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-[color:var(--primary)]" />
            </div>

            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold">Preferências</div>
              <div className="flex flex-wrap gap-2">
                {["🐾 Pets OK", "🚭 Sem fumo", "👥 Aceito partilha"].map((p) => (
                  <Chip key={p} active={prefs.includes(p)} onClick={() => togg(prefs, p, setPrefs)}>{p}</Chip>
                ))}
              </div>
            </div>

            <button onClick={onClose} className="mt-8 h-14 w-full rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground shadow-lift">
              Ver resultados ({count})
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Chip({ active, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button {...p} className={cn(
      "h-10 rounded-pill border px-4 text-sm font-medium transition",
      active ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-foreground",
    )}>{children}</button>
  );
}
