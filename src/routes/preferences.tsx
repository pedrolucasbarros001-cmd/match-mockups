import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/user-state";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { getState } from "@/lib/store";
import { api } from "@/lib/api";
import type { SpaceType, ListingKind } from "@/lib/mock-data";
import { priceAmount, priceRange, priceSuffix } from "@/lib/mock-data";
import { spaceTypesFor } from "@/lib/listing-rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/preferences")({
  head: () => ({ meta: [{ title: "Preferências — HomeMatch" }] }),
  component: PreferencesPage,
});

function PreferencesPage() {
  useRoleGuard("seeker");
  const nav = useNavigate();
  // Estado inicial vem do store real; guarda tudo de uma vez no fim.
  const prefs = getState().preferences;
  /**
   * A pesquisa de arrendar e a de comprar são independentes: tipos, orçamento e
   * requisitos não se traduzem de uma para a outra. Este ecrã edita a que
   * estiver ativa, tal como o feed.
   */
  const [kind, setKind] = useState<ListingKind>(prefs.kind);
  const sale = kind === "sale";
  const range = priceRange(kind);

  const [city, setCity] = useState(prefs.city);
  const [radius, setRadius] = useState(prefs.maxDistanceKm);
  const [typesByKind, setTypesByKind] = useState(prefs.spaceTypes);
  const [maxRent, setMaxRent] = useState(prefs.maxPrice);
  const [maxSale, setMaxSale] = useState(prefs.maxSalePrice);
  const [moveIn, setMoveIn] = useState(prefs.moveInFrom);
  const [pets, setPets] = useState(prefs.pets);
  const [furnished, setFurnished] = useState(prefs.needsFurnished);

  const types = typesByKind[kind] ?? [];
  const max = sale ? maxSale : maxRent;
  const setMax = sale ? setMaxSale : setMaxRent;

  const toggle = (t: SpaceType) =>
    setTypesByKind((prev) => ({
      ...prev,
      [kind]: (prev[kind] ?? []).includes(t) ? (prev[kind] ?? []).filter((x) => x !== t) : [...(prev[kind] ?? []), t],
    }));

  const save = async () => {
    await api.updatePreferences({
      kind,
      city,
      maxDistanceKm: radius,
      spaceTypes: typesByKind,
      maxPrice: maxRent,
      maxSalePrice: maxSale,
      moveInFrom: moveIn,
      pets,
      needsFurnished: furnished,
    });
    // Feed atualiza imediatamente (compatibilityReasons lê do store).
    nav({ to: "/explore" });
  };

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-24">
      <PageHeader title="Preferências" back="/profile" />
      <div className="space-y-6 px-5 pt-5">
        <p className="text-sm text-muted-foreground">
          O teu perfil de procura. Os campos de tipo e preço são os mesmos dos
          filtros do feed — aqui tens tudo, incluindo cidade e datas.
        </p>

        {/* Arrendar e comprar são duas procuras distintas, cada uma com os seus valores. */}
        <Field label="Estou a procurar">
          <div className="grid grid-cols-2 gap-1 rounded-pill bg-muted p-1">
            {(["rent", "sale"] as ListingKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cn(
                  "h-9 rounded-pill text-sm font-bold transition",
                  kind === k ? "bg-surface text-foreground shadow-card" : "text-muted-foreground",
                )}
              >
                {k === "rent" ? "Arrendar" : "Comprar"}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Cidade">
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="ex. Braga" className="h-12 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
        </Field>

        <Field label={`Raio · ${radius} km`}>
          <input type="range" min={1} max={50} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-[color:var(--primary)]" />
        </Field>

        <Field label="Tipos de espaço">
          <div className="flex flex-wrap gap-2">
            {spaceTypesFor(kind).map((t) => (
              <button key={t} onClick={() => toggle(t)} className={cn(
                "h-9 rounded-pill border px-3 text-xs font-semibold transition",
                types.includes(t) ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-foreground",
              )}>{t}</button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {sale ? "Só unidades autónomas — um quarto não se compra." : "Inclui partes de casa (quarto, suite) e casas inteiras."}
          </p>
        </Field>

        <Field label={`Preço máximo · ${priceAmount(max)} ${priceSuffix(kind)}`}>
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={range.step}
            value={max}
            onChange={(e) => setMax(+e.target.value)}
            className="w-full accent-[color:var(--primary)]"
          />
        </Field>

        {/* Data de entrada e requisitos de convivência só existem no arrendamento. */}
        {!sale && (
          <>
            <Field label="Disponível a partir de">
              <input value={moveIn} onChange={(e) => setMoveIn(e.target.value)} placeholder="ex. 1 Set 2026" className="h-12 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
            </Field>

            <Field label="Requisitos">
              <ToggleRow label="Tem de aceitar animais" v={pets} on={setPets} />
              <ToggleRow label="Tem de estar mobilado" v={furnished} on={setFurnished} />
            </Field>
          </>
        )}

        <button onClick={save} className="h-12 w-full rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift transition active:scale-[0.98]">
          Guardar e ver resultados
        </button>
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

function ToggleRow({ label, v, on }: { label: string; v: boolean; on: (b: boolean) => void }) {
  return (
    <button onClick={() => on(!v)} className="mb-2 flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
      <span className="text-sm font-semibold">{label}</span>
      <span className={cn("relative h-6 w-11 rounded-pill transition", v ? "bg-primary" : "bg-muted")}>
        <span className={cn("absolute top-0.5 size-5 rounded-pill bg-white transition", v ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}
