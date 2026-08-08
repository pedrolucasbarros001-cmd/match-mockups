import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { useStore, getState, trustScoreBreakdown } from "@/lib/store";
import { ChevronRight, Settings, Shield, Heart, LogOut, Edit3, Calendar, Crown, Sliders, User, Building2, Users } from "lucide-react";
import { useRole } from "@/lib/user-state";
import { signOut } from "@/lib/auth";

export const Route = createFileRoute("/profile/")({
  head: () => ({ meta: [{ title: "Perfil — HomeMatch" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const nav = useNavigate();
  const role = useRole();
  // Lê do store.profile real (o que foi preenchido no onboarding).
  const profile = useStore((s) => s.profile);
  const breakdown = useMemo(() => trustScoreBreakdown({ ...getState(), profile }), [profile]);
  const score = breakdown.reduce((a, b) => a + (b.done ? b.pts : 0), 0);
  const missingPts = breakdown.reduce((a, b) => a + (b.done ? 0 : b.pts), 0);
  // Aponta o próximo passo concreto em vez de mandar "completar" às cegas.
  const nextStep = breakdown.find((b) => !b.done)?.label.toLowerCase();
  const displayName = profile.name || "Sem nome";
  const displayEmail = profile.email || "Sem email";
  const displayBio = profile.bio || "Adiciona uma bio.";

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
          {profile.avatar ? (
            <img src={profile.avatar} className="size-16 rounded-pill object-cover" alt="" />
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
          <Link to="/profile/edit" aria-label="Editar perfil" className="grid size-10 shrink-0 place-items-center rounded-pill border border-border transition active:scale-90">
            <Edit3 className="size-4" />
          </Link>
        </div>

        {/* O cartão do score diz o que é verdade agora: convida a completar
            enquanto falta algo, confirma quando já está tudo. Um "Completar
            perfil" num perfil completo é uma instrução que contradiz o estado. */}
        <Link to="/profile/score" className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <ScoreBadge score={score} withIcon />
            <div>
              <div className="font-display text-sm font-bold">
                {missingPts === 0 ? "Perfil completo" : "Completar perfil"}
              </div>
              <div className="text-xs text-muted-foreground">
                {missingPts === 0
                  ? "Tens todas as verificações feitas."
                  : `Faltam ${missingPts} pontos — ${nextStep ?? "vê o que falta"}.`}
              </div>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>

        {role === "seeker" ? (
          <>
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
          </>
        ) : (
          <>
            <div className="mt-6 mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Área senhorio</div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <Row icon={<Building2 className="size-5" />} label="Meus anúncios" onClick={() => nav({ to: "/my-listings" })} />
              <Row icon={<Users className="size-5" />} label="Candidatos" onClick={() => nav({ to: "/candidates" })} />
              <Row icon={<Calendar className="size-5" />} label="Gerir visitas" onClick={() => nav({ to: "/visits-manager" })} />
              <Row icon={<Crown className="size-5" />} label="Conta e plano" onClick={() => nav({ to: "/account" })} last />
            </div>

            <div className="mt-6 mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Confiança</div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <Row icon={<Shield className="size-5" />} label="Verificações" onClick={() => nav({ to: "/profile/score" })} last />
            </div>
          </>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <Row icon={<Settings className="size-5" />} label="Definições" onClick={() => nav({ to: "/settings" })} />
          <Row icon={<LogOut className="size-5" />} label="Terminar sessão" onClick={async () => { await signOut(); nav({ to: "/login" }); }} destructive last />
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
