import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageCircle, Bell, User, LayoutDashboard, Building2, PlusSquare, BadgeCheck, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useRole, type Role } from "@/lib/user-state";

type NavItem = { to: string; label: string; Icon: typeof Home };

const seekerNav: NavItem[] = [
  { to: "/explore", label: "Feed", Icon: Home },
  { to: "/matches", label: "Matches", Icon: MessageCircle },
  { to: "/notifications", label: "Avisos", Icon: Bell },
  { to: "/profile", label: "Eu", Icon: User },
];

const landlordNav: NavItem[] = [
  { to: "/dashboard", label: "Início", Icon: LayoutDashboard },
  { to: "/my-listings", label: "Anúncios", Icon: Building2 },
  { to: "/publish", label: "Publicar", Icon: PlusSquare },
  { to: "/matches", label: "Matches", Icon: MessageCircle },
  { to: "/profile", label: "Eu", Icon: User },
];

export function AppShell({ children, role, maxWidth = "max-w-[440px]", fullHeight = false }: {
  children: ReactNode; role?: Role; maxWidth?: string;
  /** Ecrãs que preenchem o ecrã (feed de swipe) gerem a própria altura. */
  fullHeight?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hookRole = useRole();
  const activeRole: Role = role ?? hookRole;
  const nav = activeRole === "landlord" ? landlordNav : seekerNav;

  return (
    <div className="min-h-svh bg-background">
      {/* pb-32: espaço para a nav flutuante não tapar o fim do conteúdo. */}
      <div className={cn("mx-auto w-full bg-background", fullHeight ? "flex h-svh flex-col" : "pb-32", maxWidth)}>{children}</div>

      {/* Nav flutuante em pill — assenta acima do home indicator. */}
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-safe">
        <div className={cn("mx-auto px-4 pb-2", maxWidth)}>
          <ul
            className={cn(
              "pointer-events-auto flex items-center justify-around rounded-pill border border-border/60 px-1.5 py-1.5 shadow-action glass-light",
            )}
          >
            {nav.map(({ to, label, Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              const isPublish = to === "/publish";
              if (isPublish) {
                return (
                  <li key={to}>
                    <Link to={to} aria-label={label} className="grid place-items-center px-1.5">
                      <span className="grid size-11 place-items-center rounded-pill bg-primary text-primary-foreground shadow-lift transition active:scale-90">
                        <Icon className="size-5" strokeWidth={2.6} />
                      </span>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      "flex min-w-[58px] flex-col items-center gap-0.5 rounded-pill px-2 py-1.5 text-[10px] font-semibold transition",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Icon className={cn("size-[22px] transition", active && "stroke-[2.6]")} />
                    <span>{label}</span>
                    {/* Ponto de estado activo — mais discreto que pintar o fundo. */}
                    <span className={cn("h-1 w-1 rounded-pill transition", active ? "bg-primary" : "bg-transparent")} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({ title, right, back }: { title: string; right?: ReactNode; back?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 glass-light">
      {/* Recuo da status bar do telefone. */}
      <div className="h-safe-top" />
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2">
          {back && (
            <Link to={back} className="-ml-2 grid size-10 shrink-0 place-items-center rounded-pill transition active:scale-90 hover:bg-muted">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
            </Link>
          )}
          <h1 className="truncate font-display text-[19px] font-bold tracking-tight">{title}</h1>
        </div>
        {right}
      </div>
    </header>
  );
}

export function ScoreBadge({ score, size = "sm", withIcon = false }: { score: number; size?: "sm" | "md"; withIcon?: boolean }) {
  const color = score >= 80 ? "bg-score-blue" : score >= 60 ? "bg-score-green" : score >= 40 ? "bg-score-amber" : "bg-score-red";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-pill font-num font-bold text-white shadow-sm",
        color,
        size === "sm" ? "h-6 min-w-[34px] px-2 text-xs" : "h-8 min-w-[44px] px-3 text-sm",
      )}
    >
      {withIcon && <ShieldCheck className={size === "sm" ? "size-3" : "size-3.5"} strokeWidth={2.6} />}
      {score}
    </span>
  );
}

/** Selo de perfil verificado — sinal de confiança, não um número. */
export function VerifiedBadge({ label = "Verificado" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
      <BadgeCheck className="size-3.5" strokeWidth={2.6} /> {label}
    </span>
  );
}

/** Indicador de presença — verde a pulsar quando alguém está ativo agora. */
export function ActiveNowBadge({ label = "Ativo agora" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-success/12 px-2 py-0.5 text-[11px] font-bold text-success">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-pill bg-success opacity-70" />
        <span className="relative inline-flex size-1.5 rounded-pill bg-success" />
      </span>
      {label}
    </span>
  );
}

/** Chips de razão (2–3) que explicam a compatibilidade — nunca números. */
export function CompatibilityReasons({ reasons, dark = false }: { reasons: string[]; dark?: boolean }) {
  if (!reasons.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {reasons.map((r) => (
        <span
          key={r}
          className={cn(
            "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold",
            dark ? "glass text-white" : "bg-primary-soft text-primary",
          )}
        >
          ✓ {r}
        </span>
      ))}
    </div>
  );
}
