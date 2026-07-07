import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { me } from "@/lib/mock-data";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { ChevronRight, Settings, Shield, Heart, LogOut, Edit3, Calendar, Crown, Sliders, User } from "lucide-react";
import { useRole, setSession } from "@/lib/user-state";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Perfil — HomeMatch" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const nav = useNavigate();
  const role = useRole();
  const displayName = me.name || "Sem nome";
  const displayEmail = me.email || "Sem email";
  const displayBio = me.bio || "Adiciona uma bio.";

  return (
    <AppShell>
      <PageHeader title="O meu perfil" right={
        <Link to="/settings" className="grid size-10 place-items-center rounded-pill hover:bg-muted">
          <Settings className="size-5" />
        </Link>
      } />
      <div className="px-4 pt-5">
        {/* Identidade */}
        <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Identidade</div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
          {me.avatar ? (
            <img src={me.avatar} className="size-16 rounded-pill object-cover" alt="" />
          ) : (
            <div className="grid size-16 place-items-center rounded-pill bg-muted text-muted-foreground">
              <User className="size-7" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-lg font-bold">{displayName}</div>
            <div className="truncate text-xs text-muted-foreground">{displayEmail}</div>
            <div className="truncate text-xs text-muted-foreground">{displayBio}</div>
          </div>
          <button className="grid size-10 place-items-center rounded-pill border border-border"><Edit3 className="size-4" /></button>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-primary-soft p-4 text-sm">
          <div>
            <div className="font-display font-bold">Modo atual: {role === "landlord" ? "Senhorio" : "Hóspede"}</div>
            <div className="text-xs text-muted-foreground">Alterna em Definições para testar o outro fluxo.</div>
          </div>
          <Link to="/settings" className="rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Alterar</Link>
        </div>

        <Link to="/profile/score" className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <ScoreBadge score={me.score} />
            <div>
              <div className="font-display text-sm font-bold">Completar perfil</div>
              <div className="text-xs text-muted-foreground">Progresso interno de confiança.</div>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>

        {/* Contexto */}
        <div className="mt-6 mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">O que procuro agora</div>
        <Link to="/preferences" className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-pill bg-primary-soft text-primary"><Sliders className="size-5" /></div>
            <div>
              <div className="font-display text-sm font-bold">Preferências</div>
              <div className="text-xs text-muted-foreground">Cidade, orçamento, tipo, data de entrada.</div>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>

        <div className="mt-6 mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Atividade</div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <Row icon={<Shield className="size-5" />} label="Verificações" onClick={() => nav({ to: "/profile/score" })} />
          <Row icon={<Heart className="size-5" />} label="Favoritos" onClick={() => nav({ to: "/favorites" })} />
          <Row icon={<Calendar className="size-5" />} label="As minhas visitas" onClick={() => nav({ to: "/visits" })} last />
        </div>

        <div className="mt-6 mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Área senhorio</div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <Row icon={<Calendar className="size-5" />} label="Gerir visitas" onClick={() => nav({ to: "/visits-manager" })} />
          <Row icon={<Crown className="size-5" />} label="Conta e plano" onClick={() => nav({ to: "/account" })} last />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <Row icon={<Settings className="size-5" />} label="Definições" onClick={() => nav({ to: "/settings" })} />
          <Row icon={<LogOut className="size-5" />} label="Terminar sessão" onClick={() => { setSession("out"); nav({ to: "/login" }); }} destructive last />
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">HomeMatch v1.0</div>
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
