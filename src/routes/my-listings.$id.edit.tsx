import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { PhotoSlotPicker, type SlotPhoto } from "@/components/PhotoSlotPicker";
import { useRoleGuard } from "@/lib/user-state";
import { useStore, qualityScore } from "@/lib/store";
import { api } from "@/lib/api";
import { priceAmount, priceRange, priceSuffix } from "@/lib/mock-data";
import { photoPlanFor, analyseListing, hasBlockingWarning } from "@/lib/listing-rules";
import { Lock, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-listings/$id/edit")({
  head: () => ({ meta: [{ title: "Editar anúncio — HomeMatch" }] }),
  component: EditListing,
});

const AMENITIES_RENT = ["Wi-Fi", "Cozinha equipada", "Aquecimento", "Mobilado", "Varanda", "Elevador", "Lavandaria"];
const AMENITIES_SALE = ["Garagem", "Elevador", "Varanda", "Terraço", "Aquecimento central", "Ar condicionado", "Arrecadação"];

function EditListing() {
  useRoleGuard("landlord");
  const { id } = useParams({ from: "/my-listings/$id/edit" });
  const nav = useNavigate();
  const listing = useStore((s) => s.listings.find((l) => l.id === id));
  const matches = useStore((s) => s.matches);

  const [desc, setDesc] = useState(listing?.description ?? "");
  const [price, setPrice] = useState(listing?.price ?? 0);
  const [amenities, setAmenities] = useState<string[]>(listing?.amenities ?? []);
  const [visitSlots, setVisitSlots] = useState<string[]>(listing?.visitAvailability ?? []);
  const [slotPhotos, setSlotPhotos] = useState<SlotPhoto[]>([]);

  /**
   * Anti-isco: com gente a negociar, o que define a natureza e o valor do
   * negócio deixa de ser editável. Trocar um quarto de €380 por um T3 de €900
   * depois de recolher candidatos é a burla clássica de "bait and switch".
   * O que continua editável é o que só melhora a informação: descrição, fotos,
   * comodidades e horários de visita.
   */
  const locked = useMemo(
    () => matches.some((m) => m.listingId === id && !["closed", "rental_confirmed"].includes(m.state)),
    [matches, id],
  );

  if (!listing) {
    return (
      <div className="mx-auto grid min-h-svh w-full max-w-[440px] place-items-center bg-background p-8 text-center">
        <div>
          <h2 className="font-display text-lg font-bold">Anúncio não encontrado</h2>
          <Link to="/my-listings" className="mt-4 inline-flex h-11 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground">
            Voltar aos anúncios
          </Link>
        </div>
      </div>
    );
  }

  const sale = listing.kind === "sale";
  const range = priceRange(listing.kind);
  const amenityOptions = sale ? AMENITIES_SALE : AMENITIES_RENT;
  const photoPlan = photoPlanFor(listing.spaceType);

  // O mesmo rastreio da publicação — editar não pode ser porta de entrada
  // para o que a publicação bloqueia.
  const warnings = analyseListing({
    title: listing.title,
    description: desc,
    price,
    kind: listing.kind,
    spaceType: listing.spaceType,
  });
  const blocked = hasBlockingWarning(warnings);

  const addPhoto = (key: string, file: File) =>
    setSlotPhotos((prev) => {
      const old = prev.find((p) => p.key === key);
      if (old) URL.revokeObjectURL(old.url);
      return [...prev.filter((p) => p.key !== key), { key, url: URL.createObjectURL(file), file }];
    });
  const removePhoto = (key: string) =>
    setSlotPhotos((prev) => {
      const old = prev.find((p) => p.key === key);
      if (old) URL.revokeObjectURL(old.url);
      return prev.filter((p) => p.key !== key);
    });

  const save = () => {
    if (blocked) return;
    const newPhotos = photoPlan
      .map((s) => slotPhotos.find((p) => p.key === s.key)?.url)
      .filter((u): u is string => !!u);
    const patch = {
      description: desc.trim(),
      amenities,
      visitAvailability: visitSlots,
      // Preço só muda se não houver negociação a decorrer.
      ...(locked ? {} : { price }),
      ...(newPhotos.length > 0 ? { photos: newPhotos } : {}),
    };
    api.updateListing(listing.id, {
      ...patch,
      qualityScore: qualityScore({ ...listing, ...patch }),
    });
    nav({ to: "/my-listings" });
  };

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-28 lg:max-w-[560px]">
      <PageHeader title="Editar anúncio" back="/my-listings" />

      <div className="space-y-6 px-5 pt-5">
        {/* O que não é editável está dito à cabeça, com o motivo. */}
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="text-xs leading-relaxed text-muted-foreground">
              O <b className="text-foreground">tipo de negócio</b> e o{" "}
              <b className="text-foreground">tipo de espaço</b> não se alteram depois de publicar —
              quem demonstrou interesse fê-lo com base neles.
              {locked && (
                <> Como há negociações a decorrer, o <b className="text-foreground">preço</b> também está fixo até fecharem.</>
              )}
              {" "}Para mudar isso, cria um anúncio novo.
            </div>
          </div>
        </div>

        {/* Contexto fixo, só leitura. */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
          <img src={listing.photos[0]} alt="" className="size-14 rounded-lg object-cover" />
          <div className="min-w-0">
            <div className="truncate font-display font-bold">{listing.title}</div>
            <div className="text-xs text-muted-foreground">
              {sale ? "Venda" : "Arrendamento"} · {listing.spaceType} · {listing.city}
            </div>
          </div>
        </div>

        <Field label="Descrição">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-lg border border-border bg-surface p-4 text-sm outline-none focus:border-primary"
          />
          <div className="mt-1 text-xs text-muted-foreground">{desc.length} caracteres</div>
        </Field>

        {warnings.length > 0 && (
          <div className="flex flex-col gap-2">
            {warnings.map((w) => (
              <div
                key={w.id}
                className={cn(
                  "flex items-start gap-2 rounded-xl border p-3 text-xs",
                  w.level === "block" ? "border-danger/40 bg-danger/8" : "border-warning/40 bg-warning/10",
                )}
              >
                {w.level === "block"
                  ? <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" />
                  : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />}
                <div>
                  <div className={cn("font-bold", w.level === "block" ? "text-danger" : "text-warning")}>{w.title}</div>
                  <div className="mt-0.5 text-foreground/85">{w.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Field label={`Preço · ${priceAmount(price)} ${priceSuffix(listing.kind)}`}>
          {locked ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              <Lock className="size-4 shrink-0" /> Fixo enquanto houver negociações a decorrer.
            </div>
          ) : (
            <input
              type="range"
              min={range.min}
              max={range.max}
              step={range.step}
              value={price}
              onChange={(e) => setPrice(+e.target.value)}
              className="w-full accent-[color:var(--primary)]"
            />
          )}
        </Field>

        <Field label={sale ? "O que o imóvel tem" : "O que está incluído"}>
          <div className="grid grid-cols-2 gap-2">
            {amenityOptions.map((a) => (
              <button
                key={a}
                onClick={() => setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))}
                className={cn(
                  "rounded-pill border px-3 py-2 text-center text-xs font-medium transition",
                  amenities.includes(a) ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface",
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Horários para visitas">
          <div className="flex flex-wrap gap-2">
            {["Sáb 10:00", "Sáb 15:00", "Dom 11:00", "Sex 18:00", "Ter 17:00", "Qua 18:30"].map((s) => (
              <button
                key={s}
                onClick={() => setVisitSlots((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))}
                className={cn(
                  "h-9 rounded-pill border px-3 text-xs font-semibold transition",
                  visitSlots.includes(s) ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Substituir fotos">
          <p className="mb-2 text-xs text-muted-foreground">
            Só as que anexares aqui substituem as atuais. Deixa vazio para manter as que já tens.
          </p>
          <PhotoSlotPicker slots={photoPlan} photos={slotPhotos} onAdd={addPhoto} onRemove={removePhoto} />
        </Field>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border glass-light pb-safe">
        <div className="mx-auto max-w-[440px] p-3 lg:max-w-[560px]">
          {blocked && (
            <p className="mb-2 text-center text-xs text-danger">Corrige o que está assinalado a vermelho para guardar.</p>
          )}
          <button
            onClick={save}
            disabled={blocked}
            className="h-12 w-full rounded-xl bg-primary font-display font-semibold text-primary-foreground shadow-lift transition active:scale-[0.98] disabled:opacity-40"
          >
            Guardar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
