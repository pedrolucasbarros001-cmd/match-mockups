import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Heart, MessageCircle, Bell, Home, Calendar, Store, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notificações — HomeMatch" }] }),
  component: NotificationsPage,
});

const CAT = {
  interest: { label: "Interesse", Icon: Heart, color: "bg-primary/15 text-primary" },
  match: { label: "Match", Icon: Heart, color: "bg-primary/15 text-primary" },
  conversation: { label: "Conversa", Icon: MessageCircle, color: "bg-success/15 text-success" },
  visit: { label: "Visita", Icon: Calendar, color: "bg-warning/15 text-warning" },
  availability: { label: "Disponibilidade", Icon: Home, color: "bg-primary/10 text-primary" },
  marketplace: { label: "Marketplace", Icon: Store, color: "bg-muted text-foreground/70" },
  system: { label: "Sistema", Icon: Cog, color: "bg-muted text-muted-foreground" },
} as const;

const TABS: (keyof typeof CAT | "all")[] = ["all", "interest", "match", "conversation", "visit", "availability", "marketplace", "system"];

function NotificationsPage() {
  const notifications = useStore((s) => s.notifications);
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const items = tab === "all" ? notifications : notifications.filter((n) => n.category === tab);

  return (
    <AppShell>
      <PageHeader title="Notificações" right={
        <button onClick={() => api.markAllNotificationsRead()} className="text-sm font-semibold text-primary">Marcar lidas</button>
      } />
      <div className="sticky top-14 z-20 flex gap-2 overflow-x-auto border-b border-border bg-surface/95 px-3 py-2 backdrop-blur">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "shrink-0 rounded-pill px-3 py-1.5 text-xs font-semibold",
            tab === t ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
          )}>
            {t === "all" ? "Todas" : CAT[t].label}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-border">
        {items.map((n) => {
          const c = CAT[n.category];
          const Icon = c.Icon ?? Bell;
          return (
            <li key={n.id} className={cn("transition", n.unread && "bg-primary/[0.03]")}>
              <Link to={n.to ?? "/notifications"} onClick={() => api.markNotificationRead(n.id)} className="flex gap-3 px-4 py-4 active:bg-muted">
                <div className={cn("grid size-10 shrink-0 place-items-center rounded-pill", c.color)}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold">{n.title}</span>
                    <span className="font-num text-xs text-muted-foreground">{n.ago}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">{c.label}</div>
                </div>
                {n.unread && <span className="mt-1.5 size-2 shrink-0 rounded-pill bg-primary" />}
              </Link>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="p-12 text-center text-sm text-muted-foreground">Sem notificações nesta categoria.</li>
        )}
      </ul>
    </AppShell>
  );
}
