import { createFileRoute } from "@tanstack/react-router";
import { notifications } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Heart, MessageCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notificações — HomeMatch" }] }),
  component: NotificationsPage,
});

const ICONS = {
  match: { Icon: Heart, color: "bg-primary/15 text-primary" },
  message: { Icon: MessageCircle, color: "bg-success/15 text-success" },
  reminder: { Icon: Bell, color: "bg-warning/15 text-warning" },
} as const;

function NotificationsPage() {
  return (
    <AppShell>
      <PageHeader title="Notificações" right={
        <button className="text-sm font-semibold text-primary">Marcar lidas</button>
      } />
      <ul className="divide-y divide-border">
        {notifications.map((n) => {
          const { Icon, color } = ICONS[n.icon];
          return (
            <li key={n.id} className={cn("flex gap-3 px-4 py-4 transition", n.unread && "bg-primary/[0.03]")}>
              <div className={cn("grid size-10 shrink-0 place-items-center rounded-pill", color)}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-bold">{n.title}</span>
                  <span className="font-num text-xs text-muted-foreground">{n.ago}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              </div>
              {n.unread && <span className="mt-1.5 size-2 shrink-0 rounded-pill bg-primary" />}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
