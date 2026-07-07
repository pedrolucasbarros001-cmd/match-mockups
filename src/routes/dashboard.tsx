import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { me } from "@/lib/mock-data";
import { Plus, ChevronRight, MessageCircle, Calendar } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HomeMatch" }] }),
  component: Dashboard,
});

function Dashboard() {
  const firstName = me.name ? me.name.split(" ")[0] : "Olá";
  return (
    <AppShell role="landlord">
      <PageHeader title={`${firstName ? "Olá, " + firstName : "Olá"} 👋`} />
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat n={0} label="Anúncios ativos" />
          <Stat n={0} label="Matches" />
          <Stat n={0} label="Visitas p/ confirmar" />
        </div>

        <Link to="/profile/score" className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
          <ScoreBadge score={me.score} size="md" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Completar perfil</div>
            <div className="mt-1 h-2 overflow-hidden rounded-pill bg-muted">
              <div className="h-full bg-primary" style={{ width: `${me.score}%` }} />
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Shortcut to="/matches" Icon={MessageCircle} label="Matches" n={0} />
          <Shortcut to="/visits-manager" Icon={Calendar} label="Visitas" n={0} />
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-pill bg-primary-soft text-primary">
            <Plus className="size-6" />
          </div>
          <h2 className="mt-3 font-display text-base font-bold">Ainda não tens anúncios</h2>
          <p className="mt-1 text-xs text-muted-foreground">Publica o teu primeiro espaço em poucos passos.</p>
          <Link to="/publish" className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-5 font-display font-semibold text-primary-foreground shadow-lift">
            <Plus className="size-4" /> Publicar anúncio
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-primary-soft p-4 text-sm">
          <div className="font-semibold">Plano: Free · 0/1 anúncios</div>
          <Link to="/account" className="mt-1 inline-block text-xs font-semibold text-primary">Ver plano →</Link>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-center">
      <div className="font-num text-3xl font-bold">{n}</div>
      <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function Shortcut({ to, Icon, label, n }: { to: string; Icon: typeof MessageCircle; label: string; n: number }) {
  return (
    <Link to={to} className="flex flex-col items-start gap-1 rounded-2xl border border-border bg-surface p-3">
      <div className="flex w-full items-center justify-between">
        <div className="grid size-9 place-items-center rounded-pill bg-primary-soft text-primary"><Icon className="size-4" /></div>
        <span className="font-num text-sm font-bold">{n}</span>
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}
