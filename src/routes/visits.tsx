import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { visits, listings } from "@/lib/mock-data";
import { Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/visits")({
  head: () => ({ meta: [{ title: "Visitas — HomeMatch" }] }),
  component: VisitsPage,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendente", cls: "bg-warning/15 text-warning" },
  confirmed: { label: "Confirmada", cls: "bg-success/15 text-success" },
  done: { label: "Concluída", cls: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelada", cls: "bg-danger/15 text-danger" },
};

function VisitsPage() {
  return (
    <AppShell>
      <PageHeader title="As minhas visitas" back="/profile" />
      <ul className="flex flex-col gap-3 px-4 pt-4">
        {visits.map((v) => {
          const l = listings.find((x) => x.id === v.listingId)!;
          const s = STATUS[v.status];
          return (
            <li key={v.id}>
              <Link to="/explore/$id" params={{ id: l.id }} className="flex gap-3 rounded-2xl border border-border bg-surface p-3">
                <img src={l.photos[0]} className="size-20 rounded-xl object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate font-display font-bold">{l.title}</span>
                    <span className={cn("rounded-pill px-2 py-0.5 text-[11px] font-bold", s.cls)}>{s.label}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {l.neighborhood}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 font-num font-semibold">
                      <Calendar className="size-3.5" /> {v.date}
                    </span>
                    <span className="inline-flex items-center gap-1 font-num font-semibold">
                      <Clock className="size-3.5" /> {v.time}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
