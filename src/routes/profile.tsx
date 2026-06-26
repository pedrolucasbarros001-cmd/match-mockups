import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { me } from "@/lib/mock-data";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { ChevronRight, Settings, Shield, Heart, LogOut, Edit3 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Perfil — HomeMatch" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const nav = useNavigate();
  return (
    <AppShell>
      <PageHeader title="O meu perfil" right={
        <Link to="/settings" className="grid size-10 place-items-center rounded-pill hover:bg-muted">
          <Settings className="size-5" />
        </Link>
      } />
      <div className="px-4 pt-5">
        <div className="flex items-center gap-4">
          <img src={me.avatar} className="size-20 rounded-pill object-cover" alt="" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-xl font-bold">{me.name}</div>
            <div className="truncate text-sm text-muted-foreground">{me.email}</div>
            <div className="mt-2 flex items-center gap-2">
              <ScoreBadge score={me.score} />
              <span className="text-xs text-muted-foreground">Trust Score</span>
            </div>
          </div>
          <button className="grid size-10 place-items-center rounded-pill border border-border">
            <Edit3 className="size-4" />
          </button>
        </div>

        <Link to="/profile/score" className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
          <div>
            <div className="font-display text-base font-bold">Melhorar o teu score</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Faltam alguns passos para chegares aos 100.</div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>

        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
          <Row icon={<Shield className="size-5" />} label="Verificações" />
          <Row icon={<Heart className="size-5" />} label="Imóveis guardados" />
          <Row icon={<Settings className="size-5" />} label="Definições" onClick={() => nav({ to: "/settings" })} />
          <Row icon={<LogOut className="size-5" />} label="Terminar sessão" onClick={() => nav({ to: "/login" })} destructive last />
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">HomeMatch v1.0 · Junho 2026</div>
      </div>
    </AppShell>
  );
}

function Row({ icon, label, onClick, destructive, last }: { icon: React.ReactNode; label: string; onClick?: () => void; destructive?: boolean; last?: boolean }) {
  return (
    <button onClick={onClick} className={"flex w-full items-center justify-between px-4 py-4 text-left active:bg-muted " + (last ? "" : "border-b border-border")}>
      <div className={"flex items-center gap-3 " + (destructive ? "text-danger" : "")}>
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {!destructive && <ChevronRight className="size-4 text-muted-foreground" />}
    </button>
  );
}
