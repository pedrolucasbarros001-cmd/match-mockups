import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { userContext, type SpaceType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/preferences")({
  head: () => ({ meta: [{ title: "Preferências — HomeMatch" }] }),
  component: PreferencesPage,
});

const TYPES: SpaceType[] = ["Quarto", "Suite", "Quarto Partilhado", "Estúdio", "T1", "T2", "T3", "T4+"];

function PreferencesPage() {
  const [city, setCity] = useState(userContext.city);
  const [radius, setRadius] = useState(userContext.maxDistanceKm);
  const [types, setTypes] = useState<SpaceType[]>(userContext.spaceTypes);
  const [max, setMax] = useState(userContext.maxPrice);
  const [moveIn, setMoveIn] = useState(userContext.moveInFrom);

  const toggle = (t: SpaceType) => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t]);

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-24">
      <PageHeader title="Preferências" back="/profile" />
      <div className="space-y-6 px-5 pt-5">
        <p className="text-sm text-muted-foreground">
          O que procuras <b>agora</b>. Isto muda a descoberta; não altera o teu perfil.
        </p>

        <Field label="Cidade">
          <input value={city} onChange={(e) => setCity(e.target.value)} className="h-12 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
        </Field>

        <Field label={`Raio · ${radius} km`}>
          <input type="range" min={1} max={30} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-[color:var(--primary)]" />
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
          <input value={moveIn} onChange={(e) => setMoveIn(e.target.value)} className="h-12 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
        </Field>

        <button className="h-12 w-full rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift">Guardar</button>
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
