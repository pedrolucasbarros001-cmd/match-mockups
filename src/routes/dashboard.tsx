import { createFileRoute, Link } from "@tanstack/react-router";
import { listings, me, matches, visits } from "@/lib/mock-data";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { Plus, ChevronRight, MessageCircle, Calendar, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HomeMatch" }] }),
  component: Dashboard,
});

function Dashboard() {
  const mine = listings.slice(0, 1);
  const activeMatches = matches.filter((m) => m.state !== "closed" && m.state !== "rental_confirmed").length;
  const pendingVisits = visits.filter((v) => v.status === "pending").length;
  return (
    <AppShell role="landlord">
      <PageHeader title={`Olá, ${me.name.split(" ")[0]} 👋`} />
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat n={1} label="Anúncios ativos" />
          <Stat n={activeMatches} label="Matches" />
          <Stat n={pendingVisits} label="Visitas p/ confirmar" />
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
          <Shortcut to="/matches" Icon={MessageCircle} label="Matches" n={activeMatches} />
          <Shortcut to="/visits-manager" Icon={Calendar} label="Visitas" n={pendingVisits} />
        </div>

        <h2 className="mt-6 mb-2 font-display text-base font-bold">Para fazer agora</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <TodoRow to="/matches" icon={<MessageCircle className="size-4 text-primary" />} text="Responder a 2 interessados" />
          <TodoRow to="/visits-manager" icon={<Clock className="size-4 text-warning" />} text="Confirmar visita com João M." last />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Os meus anúncios</h2>
          <Link to="/my-listings" className="text-sm font-semibold text-primary">Ver todos →</Link>
        </div>
        <div className="mt-2 flex flex-col gap-3">
          {mine.map((l) => (
            <Link key={l.id} to="/my-listings" className="flex gap-3 rounded-2xl border border-border bg-surface p-3">
              <img src={l.photos[0]} className="size-20 rounded-xl object-cover" alt="" />
              <div className="flex-1">
                <div className="font-display font-bold">{l.title}</div>
                <div className="font-num text-sm text-muted-foreground">€{l.price}/mês · {l.spaceType}</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-pill bg-success/15 px-2 py-0.5 font-semibold text-success">● Publicado</span>
                  <span className="text-muted-foreground">Qualidade {l.qualityScore}/100</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/publish" className="mt-4 flex h-14 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface font-display font-semibold text-foreground transition active:scale-[0.99]">
          <Plus className="size-5" /> Publicar novo anúncio
        </Link>

        <div className="mt-4 rounded-2xl border border-border bg-primary-soft p-4 text-sm">
          <div className="font-semibold">Plano: Free · 1/1 anúncios</div>
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

function TodoRow({ to, icon, text, last }: { to: string; icon: React.ReactNode; text: string; last?: boolean }) {
  return (
    <Link to={to} className={"flex w-full items-center justify-between px-4 py-3 text-left active:bg-muted " + (last ? "" : "border-b border-border")}>
      <span className="flex items-center gap-2 text-sm font-medium">{icon}{text}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
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
