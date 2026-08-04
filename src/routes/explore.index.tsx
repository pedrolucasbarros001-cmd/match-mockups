import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "motion/react";
import { Heart, X, Info, SlidersHorizontal, MapPin, BedDouble, RotateCcw, Map as MapIcon, Sparkles } from "lucide-react";
import { compatibilityReasons, priceAmount, priceSuffix, priceRange, type Listing, type ListingKind } from "@/lib/mock-data";
import { AppShell, CompatibilityReasons, ScoreBadge } from "@/components/AppShell";
import { Toast, useToast } from "@/components/Toast";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore/")({
  head: () => ({ meta: [{ title: "Explorar — HomeMatch" }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const { msg, show } = useToast();
  const allListings = useStore((s) => s.listings);
  const passed = useStore((s) => s.passed);
  // Seleciona a fatia crua e deriva com useMemo: um selector que faz .map()
  // devolve um array novo a cada chamada e faria o useSyncExternalStore
  // re-renderizar em ciclo infinito.
  const matches = useStore((s) => s.matches);
  const interestedIds = useMemo(() => matches.map((m) => m.listingId), [matches]);
  const prefs = useStore((s) => s.preferences);
  const kind = prefs.kind;

  // Equivalência: "está na pilha" ↔ "corresponde aos filtros ativos E publicado
  // E não dispensado E sem interesse enviado". Tudo derivado do store persistido —
  // recarregar a app não ressuscita cards já vistos, e mexer nos filtros mexe
  // mesmo no que aparece (senão o painel de filtros seria decorativo).
  const matchesFilters = (l: Listing) => {
    if (l.kind !== kind) return false;
    if (l.price > (kind === "sale" ? prefs.maxSalePrice : prefs.maxPrice)) return false;
    const types = prefs.spaceTypes[kind] ?? [];
    if (types.length > 0 && !types.includes(l.spaceType)) return false;
    if (kind === "rent" && prefs.pets && !l.pets) return false;
    if (kind === "rent" && prefs.needsFurnished && !l.amenities.includes("Mobilado")) return false;
    return true;
  };

  const stack = useMemo(
    () =>
      allListings.filter(
        (l) => l.lifecycle === "published" && matchesFilters(l) && !passed.includes(l.id) && !interestedIds.includes(l.id),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allListings, passed, interestedIds, prefs],
  );
  // Distingue "não há nada deste tipo" de "os filtros é que estão apertados".
  const anyPublished = allListings.some((l) => l.kind === kind && l.lifecycle === "published");
  const notSeenYet = allListings.filter(
    (l) => l.kind === kind && l.lifecycle === "published" && !passed.includes(l.id) && !interestedIds.includes(l.id),
  );
  const filtersHide = stack.length === 0 && notSeenYet.length > 0;

  const clearFilters = () =>
    api.updatePreferences({
      spaceTypes: { ...prefs.spaceTypes, [kind]: [] },
      ...(kind === "sale"
        ? { maxSalePrice: priceRange("sale").max }
        : { maxPrice: priceRange("rent").max, pets: false, needsFurnished: false }),
    });
  const [lastRemoved, setLastRemoved] = useState<Listing | null>(null);
  const [forceDir, setForceDir] = useState<"left" | "right" | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const current = stack[0];

  const onSwiped = async (dir: "left" | "right") => {
    if (!current) return;
    setLastRemoved(current);
    setForceDir(null);
    if (dir === "right") {
      // Sai da pilha por passar a ter match — não é preciso marcar como dispensado.
      await api.sendInterest(current.id);
      show(`❤️ Interesse enviado em "${current.title}"`);
    } else {
      await api.passListing(current.id);
    }
  };

  // Desfazer só reverte o que é reversível: um "passei" limpa-se, um interesse
  // enviado não — por isso o botão só existe quando há mesmo algo a desfazer.
  const undoable = lastRemoved && passed.includes(lastRemoved.id) ? lastRemoved : null;
  const undo = () => {
    if (!undoable) return;
    api.unpassListing(undoable.id);
    setLastRemoved(null);
  };

  return (
    <AppShell fullHeight width="feed">
      <header className="z-30 shrink-0 glass-light">
        <div className="h-safe-top" />
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="font-display text-[22px] font-extrabold tracking-tight">HomeMatch</div>
          <div className="flex items-center gap-1.5">
            <Link to="/para-ti" className="grid size-10 place-items-center rounded-pill border border-border bg-surface transition active:scale-90" aria-label="Para ti">
              <Sparkles className="size-[18px] text-primary" />
            </Link>
            <Link to="/explore/mapa" className="grid size-10 place-items-center rounded-pill border border-border bg-surface transition active:scale-90" aria-label="Mapa">
              <MapIcon className="size-[18px]" />
            </Link>
            <button onClick={() => setShowFilters(true)} className="grid size-10 place-items-center rounded-pill border border-border bg-surface transition active:scale-90" aria-label="Filtros">
              <SlidersHorizontal className="size-[18px]" />
            </button>
          </div>
        </div>
        {/* Arrendar ↔ Comprar: escreve nas preferências, que é o que o feed lê. */}
        <div className="px-4 pb-2.5">
          <div className="grid grid-cols-2 gap-1 rounded-pill bg-muted p-1">
            {(["rent", "sale"] as ListingKind[]).map((k) => (
              <button
                key={k}
                onClick={() => api.updatePreferences({ kind: k })}
                className={cn(
                  "h-9 rounded-pill text-sm font-bold transition",
                  kind === k ? "bg-surface text-foreground shadow-card" : "text-muted-foreground",
                )}
              >
                {k === "rent" ? "Arrendar" : "Comprar"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* min-h-0: deixa o card encolher dentro do flex em vez de transbordar. */}
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
        <div className="relative mx-auto min-h-0 w-full max-w-md flex-1">
          {stack.length === 0 ? (
            <EmptyState
              hasAny={anyPublished}
              filtersHide={filtersHide}
              onOpenFilters={() => setShowFilters(true)}
              onClearFilters={clearFilters}
              onReset={() => api.resetPassed()}
            />
          ) : (
            stack.slice(0, 3).reverse().map((l, idx, arr) => {
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
            })
          )}
        </div>

        {current && (
          // pb: afasta os botões da nav flutuante (que mede ~72px + safe area).
          <div className="mx-auto flex max-w-md shrink-0 items-center justify-center gap-3.5 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
            <ActionButton onClick={undo} disabled={!undoable} aria-label="Desfazer" tone="undo" size="sm">
              <RotateCcw className="size-[22px]" strokeWidth={2.6} />
            </ActionButton>
            <ActionButton onClick={() => setForceDir("left")} aria-label="Passar" tone="nope" size="lg">
              <X className="size-8" strokeWidth={3} />
            </ActionButton>
            <ActionButton onClick={() => setForceDir("right")} aria-label="Interesse" tone="like" size="lg">
              <Heart className="size-7" fill="currentColor" />
            </ActionButton>
            <Link
              to="/explore/$id"
              params={{ id: current.id }}
              aria-label="Ver detalhe"
              className={cn("grid place-items-center rounded-pill border-2 bg-surface shadow-action transition active:scale-90", TONES.info, SIZES.sm)}
            >
              <Info className="size-[22px]" strokeWidth={2.6} />
            </Link>
          </div>
        )}
      </div>

      <FiltersSheet open={showFilters} onClose={() => setShowFilters(false)} />
      <Toast msg={msg} />
    </AppShell>
  );
}

// Cada ação tem a sua cor — reconhecível sem ler o ícone.
const TONES = {
  like: "text-like border-like/25",
  nope: "text-nope border-nope/25",
  undo: "text-undo border-undo/30",
  info: "text-info border-border",
} as const;

const SIZES = {
  lg: "size-[68px]",
  sm: "size-[52px]",
} as const;

function ActionButton({
  children, className, tone, size, ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone: keyof typeof TONES; size: keyof typeof SIZES }) {
  return (
    <button
      {...p}
      className={cn(
        "grid place-items-center rounded-pill border-2 bg-surface shadow-action transition active:scale-90 disabled:opacity-35",
        TONES[tone],
        SIZES[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

function SwipeCard({ listing, depth, interactive, forceDir, onSwiped }: {
  listing: Listing; depth: number; interactive: boolean;
  forceDir: "left" | "right" | null;
  onSwiped: (dir: "left" | "right") => void;
}) {
  const nav = useNavigate();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0]);
  // Tint de cor sobre a foto durante o arrasto — feedback antes de largar.
  const likeTint = useTransform(x, [0, 180], [0, 0.42]);
  const nopeTint = useTransform(x, [-180, 0], [0.42, 0]);
  const [photoIdx, setPhotoIdx] = useState(0);

  const onEnd = (_: unknown, info: PanInfo) => {
    const off = info.offset.x;
    if (off > 110) onSwiped("right");
    else if (off < -110) onSwiped("left");
    else x.set(0);
  };

  if (forceDir && interactive) {
    const target = forceDir === "right" ? 600 : -600;
    setTimeout(() => onSwiped(forceDir), 240);
    return (
      <motion.div animate={{ x: target, rotate: forceDir === "right" ? 18 : -18, opacity: 0 }} transition={{ duration: 0.24 }} className="absolute inset-0">
        <CardInner listing={listing} photoIdx={photoIdx} setPhotoIdx={setPhotoIdx} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x: interactive ? x : 0, rotate: interactive ? rotate : 0, scale: 1 - depth * 0.035, y: depth * 10, zIndex: 10 - depth }}
      drag={interactive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={onEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      <CardInner listing={listing} photoIdx={photoIdx} setPhotoIdx={setPhotoIdx}
        onTapInfo={() => nav({ to: "/explore/$id", params: { id: listing.id } })} />
      {interactive && (
        <>
          <motion.div style={{ opacity: likeTint }} className="pointer-events-none absolute inset-0 rounded-[28px] bg-like" />
          <motion.div style={{ opacity: nopeTint }} className="pointer-events-none absolute inset-0 rounded-[28px] bg-nope" />
          <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute left-6 top-8 rotate-[-12deg] rounded-xl border-[5px] border-white px-4 py-1 font-display text-3xl font-extrabold uppercase tracking-wide text-white drop-shadow">Interesse</motion.div>
          <motion.div style={{ opacity: nopeOpacity }} className="pointer-events-none absolute right-6 top-8 rotate-[12deg] rounded-xl border-[5px] border-white px-4 py-1 font-display text-3xl font-extrabold uppercase tracking-wide text-white drop-shadow">Passo</motion.div>
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
    <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-muted shadow-swipe">
      <div className="absolute inset-0 select-none">
        <img src={photo} alt={listing.title} className="h-full w-full object-cover" draggable={false} />
      </div>

      {/* Zonas de toque para trocar de foto (metade esquerda/direita). */}
      <div className="absolute inset-x-0 top-0 z-10 flex h-[62%]">
        <button onClick={(e) => { e.stopPropagation(); setPhotoIdx(Math.max(0, photoIdx - 1)); }} className="h-full w-1/2" aria-label="Foto anterior" />
        <button onClick={(e) => { e.stopPropagation(); setPhotoIdx(Math.min(listing.photos.length - 1, photoIdx + 1)); }} className="h-full w-1/2" aria-label="Foto seguinte" />
      </div>

      {/* Barras de progresso das fotos. */}
      <div className="absolute inset-x-3.5 top-3.5 z-20 flex gap-1.5">
        {listing.photos.map((_, i) => (
          <span key={i} className={cn("h-[3px] flex-1 rounded-pill transition-all", i === photoIdx ? "bg-white" : "bg-white/35")} />
        ))}
      </div>

      {/* Score do senhorio — sinal de confiança no canto. */}
      <div className="absolute right-3.5 top-7 z-20">
        <ScoreBadge score={listing.owner.score} withIcon />
      </div>

      <button type="button" onClick={onTapInfo} className="absolute inset-x-0 bottom-0 z-20 cursor-pointer bg-gradient-to-t from-black/90 via-black/45 to-transparent px-5 pb-6 pt-28 text-left text-white">
        <div className="flex items-end gap-2">
          <span className="font-num text-[34px] font-bold leading-none tracking-tight">{priceAmount(listing.price)}</span>
          {priceSuffix(listing.kind) && <span className="pb-0.5 text-sm font-medium opacity-85">{priceSuffix(listing.kind)}</span>}
        </div>
        <div className="mt-1.5 font-display text-[22px] font-bold leading-tight">{listing.title}</div>
        <div className="mt-1 flex items-center gap-1 text-sm text-white/85">
          <MapPin className="size-4" /> {listing.neighborhood || listing.city} · ~{listing.distanceM}m
        </div>
        <div className="mt-3">
          <CompatibilityReasons reasons={compatibilityReasons(listing)} dark />
        </div>
      </button>
    </div>
  );
}

/**
 * Contrapositiva: se não aparece nada, o ecrã diz qual das três causas é —
 * não há anúncios, os filtros escondem tudo, ou já se viu tudo — e oferece
 * exatamente a ação que resolve essa causa.
 */
function EmptyState({ hasAny, filtersHide, onOpenFilters, onClearFilters, onReset }: {
  hasAny: boolean; filtersHide: boolean;
  onOpenFilters: () => void; onClearFilters: () => void; onReset: () => void;
}) {
  const title = !hasAny ? "Sem anúncios ainda." : filtersHide ? "Nada corresponde aos filtros." : "Já viste tudo por aqui.";
  const body = !hasAny
    ? "Troca para senhorio e cria um anúncio para testar a descoberta."
    : filtersHide
      ? "Há anúncios disponíveis, mas os teus filtros estão a escondê-los."
      : "Volta mais tarde ou reinicia o feed.";

  return (
    <div className="grid h-full place-items-center rounded-[28px] border border-dashed border-border bg-surface text-center">
      <div className="px-6">
        <div className="mx-auto grid size-16 place-items-center rounded-pill bg-primary-soft text-primary">
          {filtersHide && hasAny ? <SlidersHorizontal className="size-8" /> : <BedDouble className="size-8" />}
        </div>
        <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        {!hasAny ? (
          <Link to="/switch-user" className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-display font-semibold text-primary-foreground shadow-lift">Trocar de utilizador</Link>
        ) : filtersHide ? (
          <div className="mt-6 flex flex-col gap-2">
            <button onClick={onClearFilters} className="h-12 rounded-xl bg-primary px-6 font-display font-semibold text-primary-foreground shadow-lift transition active:scale-95">Limpar filtros</button>
            <button onClick={onOpenFilters} className="text-sm font-semibold text-primary">Rever filtros</button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            <button onClick={onReset} className="h-12 rounded-xl bg-primary px-6 font-display font-semibold text-primary-foreground shadow-lift transition active:scale-95">Reiniciar feed</button>
            <button onClick={onOpenFilters} className="text-sm font-semibold text-primary">Abrir filtros</button>
          </div>
        )}
      </div>
    </div>
  );
}

const SPACE_TYPE_OPTIONS = ["Quarto", "Suite", "Estúdio", "T1", "T2", "T3", "T4+"];

/**
 * Filtros ligados às preferências reais do store — o que se vê aqui é
 * exatamente o que o feed usa. (Antes eram estado local: mexer nos filtros
 * não mudava o feed, portanto controlo e efeito não eram equivalentes.)
 */
function FiltersSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const prefs = useStore((s) => s.preferences);
  const sale = prefs.kind === "sale";
  const range = priceRange(prefs.kind);
  const maxPrice = sale ? prefs.maxSalePrice : prefs.maxPrice;

  const types = prefs.spaceTypes[prefs.kind] ?? [];

  const setMax = (v: number) => api.updatePreferences(sale ? { maxSalePrice: v } : { maxPrice: v });
  // Mexe só nos tipos deste kind — a outra pesquisa fica intacta.
  const toggleType = (t: string) =>
    api.updatePreferences({
      spaceTypes: { ...prefs.spaceTypes, [prefs.kind]: types.includes(t) ? types.filter((x) => x !== t) : [...types, t] },
    });
  const clearAll = () =>
    api.updatePreferences({
      spaceTypes: { ...prefs.spaceTypes, [prefs.kind]: [] },
      ...(sale ? { maxSalePrice: range.max } : { maxPrice: range.max, pets: false, needsFurnished: false }),
    });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/45" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }} className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[440px] rounded-t-[28px] bg-surface p-5 pb-safe">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-pill bg-border" />
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filtros · {sale ? "Comprar" : "Arrendar"}</h2>
              <button onClick={clearAll} className="text-sm font-semibold text-muted-foreground">Limpar tudo</button>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-sm font-semibold">Tipo de espaço</div>
              <div className="flex flex-wrap gap-2">
                {SPACE_TYPE_OPTIONS.map((t) => (
                  <Chip key={t} active={types.includes(t)} onClick={() => toggleType(t)}>{t}</Chip>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Preço máximo</span>
                <span className="font-num text-sm font-bold text-primary">
                  {priceAmount(maxPrice)} {priceSuffix(prefs.kind)}
                </span>
              </div>
              <input
                type="range"
                min={range.min}
                max={range.max}
                step={range.step}
                value={maxPrice}
                onChange={(e) => setMax(+e.target.value)}
                className="w-full accent-[color:var(--primary)]"
              />
            </div>

            {/* Só aparece no arrendamento — quem compra não tem regras de convivência. */}
            {!sale && (
              <div className="mt-5">
                <div className="mb-2 text-sm font-semibold">Preferências</div>
                <div className="flex flex-wrap gap-2">
                  <Chip active={prefs.pets} onClick={() => api.updatePreferences({ pets: !prefs.pets })}>🐾 Aceita animais</Chip>
                  <Chip active={prefs.needsFurnished} onClick={() => api.updatePreferences({ needsFurnished: !prefs.needsFurnished })}>🛋 Mobilado</Chip>
                </div>
              </div>
            )}

            <button onClick={onClose} className="mt-8 mb-2 h-14 w-full rounded-xl bg-primary font-display text-base font-semibold text-primary-foreground shadow-lift transition active:scale-[0.98]">
              Aplicar
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
      "h-10 rounded-pill border px-4 text-sm font-medium transition active:scale-95",
      active ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-foreground",
    )}>{children}</button>
  );
}
