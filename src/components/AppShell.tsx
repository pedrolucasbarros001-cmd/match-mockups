import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageCircle, Bell, User, LayoutDashboard, Building2, PlusSquare, BadgeCheck, ShieldCheck, Settings, Heart, Calendar, Users } from "lucide-react";
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

/** Atalhos extra que só cabem no desktop (no telemóvel vivem dentro do Perfil). */
const seekerExtra: NavItem[] = [
  { to: "/favorites", label: "Favoritos", Icon: Heart },
  { to: "/visits", label: "Visitas", Icon: Calendar },
];
const landlordExtra: NavItem[] = [
  { to: "/candidates", label: "Candidatos", Icon: Users },
  { to: "/visits-manager", label: "Visitas", Icon: Calendar },
  { to: "/notifications", label: "Avisos", Icon: Bell },
];

/** Larguras de conteúdo por tipo de ecrã — o feed mantém-se estreito por design. */
const widthClass = {
  feed: "max-w-[440px]",
  list: "max-w-[440px] md:max-w-[760px]",
  wide: "max-w-[440px] md:max-w-[1200px]",
} as const;
export type ShellWidth = keyof typeof widthClass;

function isActivePath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(to + "/");
}

/** Sidebar de desktop — substitui a bottom nav a partir de md. */
export function DesktopSidebar({ role }: { role?: Role }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hookRole = useRole();
  const activeRole: Role = role ?? hookRole;
  const nav = activeRole === "landlord" ? landlordNav : seekerNav;
  const extra = activeRole === "landlord" ? landlordExtra : seekerExtra;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col border-r border-border bg-surface lg:w-[240px] md:flex">
      <Link to="/" className="flex h-16 items-center gap-2 px-4 lg:px-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-display text-base font-black text-primary-foreground">H</span>
        <span className="hidden font-display text-lg font-black tracking-tight lg:inline">HomeMatch</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 lg:px-3">
        <ul className="space-y-1">
          {nav.map(({ to, label, Icon }) => (
            <SideLink key={to} to={to} label={label} Icon={Icon} active={isActivePath(pathname, to)} />
          ))}
        </ul>
        {extra.length > 0 && (
          <>
            <div className="mt-5 hidden px-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground lg:block">Atalhos</div>
            <ul className="mt-2 space-y-1">
              {extra.map(({ to, label, Icon }) => (
                <SideLink key={to} to={to} label={label} Icon={Icon} active={isActivePath(pathname, to)} />
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="border-t border-border px-2 py-3 lg:px-3">
        <ul>
          <SideLink to="/settings" label="Definições" Icon={Settings} active={isActivePath(pathname, "/settings")} />
        </ul>
      </div>
    </aside>
  );
}

/** Ecrãs de detalhe/sub-página: sidebar em desktop, sem bottom nav (têm barras próprias). */
export function PageShell({ children, role, width = "list", className }: {
  children: ReactNode; role?: Role; width?: ShellWidth; className?: string;
}) {
  return (
    <div className="min-h-svh bg-background md:pl-[76px] lg:pl-[240px]">
      <DesktopSidebar role={role} />
      <div className={cn("mx-auto min-h-svh w-full bg-background", widthClass[width], className)}>{children}</div>
    </div>
  );
}

export function AppShell({ children, role, maxWidth, width = "list", fullHeight = false, aside }: {
  children: ReactNode; role?: Role;
  /** Override manual (legado). Preferir `width`. */
  maxWidth?: string;
  width?: ShellWidth;
  /** Ecrãs que preenchem o ecrã (feed de swipe) gerem a própria altura. */
  fullHeight?: boolean;
  /**
   * Painel de detalhe, só em desktop. Em telemóvel é ignorado de propósito:
   * o mesmo conteúdo já vive no seu ecrã próprio, alcançável por navegação.
   * Mesmo destino, caminhos diferentes conforme o espaço disponível.
   */
  aside?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hookRole = useRole();
  const activeRole: Role = role ?? hookRole;
  const nav = activeRole === "landlord" ? landlordNav : seekerNav;
  const contentWidth = maxWidth ?? widthClass[width];

  return (
    <div className="min-h-svh bg-background md:pl-[76px] lg:pl-[240px]">
      <DesktopSidebar role={role} />

      {/* Com painel lateral, as duas colunas partilham o espaço; sem ele, o
          conteúdo fica centrado como em qualquer outro ecrã. */}
      <div className={cn(aside && "lg:flex lg:justify-center lg:gap-6 lg:px-6")}>
        {/* pb-32: espaço para a nav flutuante não tapar o fim do conteúdo (só mobile). */}
        <div className={cn(
          "mx-auto w-full bg-background",
          fullHeight ? "flex h-svh flex-col" : "pb-32 md:pb-10",
          aside ? "lg:mx-0 lg:max-w-[460px]" : contentWidth,
        )}>
          {children}
        </div>

        {aside && (
          <aside className="hidden min-w-0 flex-1 py-6 lg:block lg:max-w-[520px]">
            <div className="sticky top-6">{aside}</div>
          </aside>
        )}
      </div>


      {/* Nav flutuante em pill — assenta acima do home indicator. */}
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-safe md:hidden">
        <div className="mx-auto max-w-[440px] px-4 pb-2">
          <ul
            className={cn(
              "pointer-events-auto flex items-center justify-around rounded-pill border border-border/60 px-1.5 py-1.5 shadow-action glass-light",
            )}
          >
            {nav.map(({ to, label, Icon }) => {
              const active = isActivePath(pathname, to);
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

function SideLink({ to, label, Icon, active }: NavItem & { active: boolean }) {
  return (
    <li>
      <Link
        to={to}
        title={label}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
          "justify-center lg:justify-start",
          active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className={cn("size-5 shrink-0", active && "stroke-[2.6]")} />
        <span className="hidden min-w-0 truncate lg:inline">{label}</span>
      </Link>
    </li>
  );
}

export function PageHeader({ title, right, back }: { title: string; right?: ReactNode; back?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 glass-light md:static md:border-b-0 md:bg-transparent md:backdrop-blur-none">
      {/* Recuo da status bar do telefone. */}
      <div className="h-safe-top md:hidden" />
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-20 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {back && (
            <Link to={back} className="-ml-2 grid size-10 shrink-0 place-items-center rounded-pill transition active:scale-90 hover:bg-muted md:hidden">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
            </Link>
          )}
          <h1 className="truncate font-display text-[19px] font-bold tracking-tight md:text-[30px]">{title}</h1>
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
