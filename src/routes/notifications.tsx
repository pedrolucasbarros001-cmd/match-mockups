import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { useRole, type Role } from "@/lib/user-state";
import { api } from "@/lib/api";
import { Heart, MessageCircle, Bell, Home, Calendar, Store, Cog } from "lucide-react";
import type { Notification } from "@/lib/mock-data";
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

// Categorias visíveis por papel — evita "vazamento" entre hóspede e senhorio.
const AUDIENCE: Record<Role, Notification["category"][]> = {
  seeker: ["match", "conversation", "visit", "availability", "system"],
  landlord: ["interest", "conversation", "visit", "marketplace", "system"],
};

type Filter = "all" | "unread" | "today" | "week";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "unread", label: "Não lidas" },
  { key: "today", label: "Hoje" },
  { key: "week", label: "Esta semana" },
];

function matchesFilter(n: Notification, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "unread") return n.unread;
  const ago = (n.ago || "").toLowerCase();
  if (f === "today") return ago.includes("agora") || ago.includes("min") || ago.includes("h") || ago === "hoje";
  if (f === "week") return !ago.includes("mês") && !ago.includes("mes") && !/\d+d/.test(ago) ? true : /^([1-6]|7)d/.test(ago) || ago.includes("dia");
  return true;
}

function NotificationsPage() {
  const role = useRole();
  const notifications = useStore((s) => s.notifications);
  const [filter, setFilter] = useState<Filter>("all");

  const scoped = useMemo(
    () => notifications.filter((n) => AUDIENCE[role].includes(n.category)),
    [notifications, role],
  );
  const items = scoped.filter((n) => matchesFilter(n, filter));

  return (
    <AppShell>
      <PageHeader
        title="Avisos"
        right={
          <button onClick={() => api.markAllNotificationsRead()} className="text-sm font-semibold text-primary">
            Marcar lidas
          </button>
        }
      />
      <div className="px-4 pt-3 pb-2 text-xs text-muted-foreground">
        Log de eventos da tua atividade — {role === "landlord" ? "candidatos, visitas e mercado." : "descoberta, matches e visitas."}
      </div>
      <div className="sticky top-14 z-20 grid grid-cols-4 gap-1 border-b border-border bg-surface/95 px-3 py-2 backdrop-blur">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "h-9 rounded-pill text-xs font-semibold",
              filter === f.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-border">
        {items.map((n) => {
          const c = CAT[n.category];
          const Icon = c?.Icon ?? Bell;
          return (
            <li key={n.id} className={cn("transition", n.unread && "bg-primary/[0.03]")}>
              <Link
                to={n.to ?? "/notifications"}
                onClick={() => api.markNotificationRead(n.id)}
                className="flex gap-3 px-4 py-3 active:bg-muted"
              >
                <div className={cn("grid size-9 shrink-0 place-items-center rounded-pill", c?.color)}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{n.title}</span>
                    <span className="font-num text-[11px] text-muted-foreground">{n.ago}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  <span className="mt-1 inline-block rounded-pill bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {c?.label ?? n.category}
                  </span>
                </div>
                {n.unread && <span className="mt-2 size-2 shrink-0 rounded-pill bg-primary" />}
              </Link>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="p-12 text-center text-sm text-muted-foreground">Sem avisos neste filtro.</li>
        )}
      </ul>
    </AppShell>
  );
}
