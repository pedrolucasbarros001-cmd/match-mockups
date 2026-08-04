import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Building2, Check, ArrowRight } from "lucide-react";
import { PageHeader, PageShell } from "@/components/AppShell";
import { useRole, setRole, type Role } from "@/lib/user-state";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/switch-user")({
  head: () => ({ meta: [{ title: "Trocar de utilizador — HomeMatch" }] }),
  component: SwitchUserPage,
});

function SwitchUserPage() {
  const nav = useNavigate();
  const role = useRole();
  const listings = useStore((s) => s.listings);
  const matches = useStore((s) => s.matches);

  const pendingCandidates = matches.filter((m) => m.state === "interested").length;
  const activeMatches = matches.filter((m) => m.state !== "closed").length;

  const go = (r: Role) => {
    setRole(r);
    nav({ to: r === "landlord" ? "/dashboard" : "/explore" });
  };

  return (
    <PageShell width="list">
      <PageHeader title="Trocar de utilizador" back="/profile" />
      <div className="px-5 pt-5">
        <p className="text-sm text-muted-foreground">
          A app tem dois lados. Escolhe com qual queres testar — os dados são partilhados,
          por isso o anúncio que publicas como senhorio aparece no feed do inquilino.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <RoleCard
            active={role === "seeker"}
            icon={<Search className="size-6" />}
            title="Inquilino"
            subtitle="Procura um sítio para viver"
            stats={[`${activeMatches} matches ativos`, "Feed de swipe · Favoritos · Visitas"]}
            onClick={() => go("seeker")}
          />
          <RoleCard
            active={role === "landlord"}
            icon={<Building2 className="size-6" />}
            title="Senhorio"
            subtitle="Tem espaços para arrendar"
            stats={[`${listings.length} anúncios · ${pendingCandidates} candidatos por responder`, "Dashboard · Publicar · Candidatos"]}
            onClick={() => go("landlord")}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-muted/60 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Como testar o ciclo completo</div>
          <ol className="mt-2 space-y-1.5 text-sm text-foreground/85">
            <li><b>1.</b> Como <b>inquilino</b>, dá interesse num anúncio no feed.</li>
            <li><b>2.</b> Troca para <b>senhorio</b> e aceita o candidato em Candidatos.</li>
            <li><b>3.</b> Na conversa, propõe visita e marca como feita.</li>
            <li><b>4.</b> Fecha o espaço ("Arrendei — veio daqui").</li>
            <li><b>5.</b> Volta a <b>inquilino</b> e confirma o arrendamento.</li>
          </ol>
        </div>
      </div>
    </PageShell>
  );
}

function RoleCard({ active, icon, title, subtitle, stats, onClick }: {
  active: boolean; icon: React.ReactNode; title: string; subtitle: string; stats: string[]; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition active:scale-[0.98]",
        active ? "border-primary bg-primary-soft" : "border-border bg-surface",
      )}
    >
      <span className={cn(
        "grid size-12 shrink-0 place-items-center rounded-pill",
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
      )}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display text-lg font-bold">{title}</span>
          {active && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              <Check className="size-3" strokeWidth={3} /> ATIVO
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{subtitle}</span>
        {stats.map((s) => (
          <span key={s} className="mt-1 block text-xs text-muted-foreground">{s}</span>
        ))}
      </span>
      {!active && <ArrowRight className="mt-3 size-5 shrink-0 text-muted-foreground" />}
    </button>
  );
}
