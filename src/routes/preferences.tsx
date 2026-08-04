import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/user-state";
import { useState } from "react";
import { PageHeader, PageShell } from "@/components/AppShell";
import { getState } from "@/lib/store";
import { api } from "@/lib/api";
import type { SpaceType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/preferences")({
  head: () => ({ meta: [{ title: "Preferências — HomeMatch" }] }),
  component: PreferencesPage,
});

const TYPES: SpaceType[] = ["Quarto", "Suite", "Quarto Partilhado", "Estúdio", "T1", "T2", "T3", "T4+"];

function PreferencesPage() {
  useRoleGuard("seeker");
  const nav = useNavigate();
  // Estado inicial vem do store real; guarda tudo de uma vez no fim.
  const prefs = getState().preferences;
  // Este ecrã é do inquilino: edita sempre as preferências de arrendamento.
  const kind = "rent" as const;
  const [city, setCity] = useState(prefs.city);
  const [radius, setRadius] = useState(prefs.maxDistanceKm);
  const [types, setTypes] = useState<string[]>(prefs.spaceTypes[kind] ?? []);
  const [max, setMax] = useState(prefs.maxPrice);
  const [moveIn, setMoveIn] = useState(prefs.moveInFrom);
  const [pets, setPets] = useState(prefs.pets);
  const [furnished, setFurnished] = useState(prefs.needsFurnished);

  const toggle = (t: SpaceType) => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t]);

  const save = async () => {
    await api.updatePreferences({
      city,
      maxDistanceKm: radius,
      spaceTypes: { ...getState().preferences.spaceTypes, [kind]: types },
      maxPrice: max,
      moveInFrom: moveIn,
      pets,
      needsFurnished: furnished,
    });
    // Feed atualiza imediatamente (compatibilityReasons lê do store).
    nav({ to: "/explore" });
  };

  return (
    <PageShell width="list" className="pb-24">
      <PageHeader title="Preferências" back="/profile" />
      <div className="space-y-6 px-5 pt-5">
        <p className="text-sm text-muted-foreground">
          O que procuras <b>agora</b>. Isto muda a descoberta; não altera o teu perfil.
        </p>

        <Field label="Cidade">
          <input value={city} onChange={(e) => setCity(e.target.value)} className="h-12 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
        </Field>

        <Field label={`Raio · ${radius} km`}>
          <input type="range" min={1} max={50} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-[color:var(--primary)]" />
        </Field>

        <Field label="Tipos de espaço">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t} onClick={() => toggle(t)} className={cn(
                "h-9 rounded-pill border px-3 text-xs font-semibold transition",
                types.includes(t) ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-foreground",
              )}>{t}</button>
            ))}
          </div>
        </Field>

        <Field label={`Preço máximo · €${max}`}>
          <input type="range" min={150} max={2000} step={10} value={max} onChange={(e) => setMax(+e.target.value)} className="w-full accent-[color:var(--primary)]" />
        </Field>

        <Field label="Disponível a partir de">
          <input value={moveIn} onChange={(e) => setMoveIn(e.target.value)} placeholder="ex. 1 Set 2026" className="h-12 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
        </Field>

        <Field label="Preferências">
          <ToggleRow label="Tenho / quero animais" v={pets} on={setPets} />
          <ToggleRow label="Preciso de mobilado" v={furnished} on={setFurnished} />
        </Field>

        <button onClick={save} className="h-12 w-full rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift">Guardar</button>
      </div>
    </PageShell>
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
