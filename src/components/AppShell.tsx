import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Heart, MessageCircle, Bell, User, LayoutDashboard, Building2, Users } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; Icon: typeof Home };

const seekerNav: NavItem[] = [
  { to: "/explore", label: "Início", Icon: Home },
  { to: "/interests", label: "Likes", Icon: Heart },
  { to: "/chats", label: "Chats", Icon: MessageCircle },
  { to: "/notifications", label: "Avisos", Icon: Bell },
  { to: "/profile", label: "Eu", Icon: User },
];

const landlordNav: NavItem[] = [
  { to: "/dashboard", label: "Início", Icon: LayoutDashboard },
  { to: "/my-listings", label: "Anúncios", Icon: Building2 },
  { to: "/candidates", label: "Candidatos", Icon: Users },
  { to: "/chats", label: "Chats", Icon: MessageCircle },
  { to: "/profile", label: "Eu", Icon: User },
];

export function AppShell({ children, role = "seeker", maxWidth = "max-w-[440px]" }: { children: ReactNode; role?: "seeker" | "landlord"; maxWidth?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = role === "landlord" ? landlordNav : seekerNav;
  return (
    <div className="min-h-svh bg-background">
      <div className={cn("mx-auto w-full bg-background pb-24", maxWidth)}>{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
        <ul className={cn("mx-auto grid grid-cols-5", maxWidth)}>
          {nav.map(({ to, label, Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("size-6", active && "stroke-[2.5]")} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({ title, right, back }: { title: string; right?: ReactNode; back?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        {back && (
          <Link to={back} className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full hover:bg-muted">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>
        )}
        <h1 className="truncate font-display text-lg font-bold">{title}</h1>
      </div>
      {right}
    </header>
  );
}

export function ScoreBadge({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const color = score >= 80 ? "bg-score-blue" : score >= 60 ? "bg-score-green" : score >= 40 ? "bg-score-amber" : "bg-score-red";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-pill font-num font-bold text-white",
        color,
        size === "sm" ? "h-6 min-w-[34px] px-2 text-xs" : "h-8 min-w-[44px] px-3 text-sm",
      )}
    >
      {score}
    </span>
  );
}
