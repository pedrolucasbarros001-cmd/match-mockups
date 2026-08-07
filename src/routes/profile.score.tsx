import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ScoreBadge, PageShell } from "@/components/AppShell";
import { useMemo } from "react";
import { useStore, getState, trustScoreBreakdown } from "@/lib/store";
import { Check, Plus } from "lucide-react";

export const Route = createFileRoute("/profile/score")({
  head: () => ({ meta: [{ title: "Trust Score — HomeMatch" }] }),
  component: ScorePage,
});

function levelLabel(score: number) {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Em progresso";
  return "Início";
}

function ScorePage() {
  // Calculado a partir do perfil real do store — nunca estático.
  // Deriva do perfil (fatia estável) — se o selector construísse o array,
  // cada render devolvia uma referência nova e o store re-renderizava em ciclo.
  const profile = useStore((s) => s.profile);
  const breakdown = useMemo(() => trustScoreBreakdown({ ...getState(), profile }), [profile]);
  const total = breakdown.reduce((a, b) => a + (b.done ? b.pts : 0), 0);
  const max = breakdown.reduce((a, b) => a + b.pts, 0);

  return (
    <PageShell width="list" className="pb-10">
      <PageHeader title="Trust Score" back="/profile" />
      <div className="px-5 pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative grid size-44 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"
                strokeDasharray={`${(total / 100) * 276} 276`} className="text-primary transition-all duration-700" />
            </svg>
            <div>
              <div className="font-num text-5xl font-bold">{total}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">de 100</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <ScoreBadge score={total} size="md" />
            <span className="text-sm font-semibold text-muted-foreground">{levelLabel(total)}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Faltam <b className="text-foreground">{max - total} pontos</b> para chegares ao máximo.
          </p>
        </div>

        <h2 className="mt-8 mb-2 font-display text-base font-bold">Como subir o score</h2>
        <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
          {breakdown.map((b, i) => (
            <li key={b.label} className={"flex items-center gap-3 px-4 py-3 " + (i < breakdown.length - 1 ? "border-b border-border" : "")}>
              <div className={"grid size-9 place-items-center rounded-pill " + (b.done ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                {b.done ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" />}
              </div>
              <div className="flex-1 text-sm font-medium">{b.label}</div>
              <div className="font-num text-sm font-bold text-muted-foreground">+{b.pts}</div>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
