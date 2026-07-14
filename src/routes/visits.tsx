import { createFileRoute, Link } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/user-state";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
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
  useRoleGuard("seeker");
  const visits = useStore((s) => s.visits);
  const listings = useStore((s) => s.listings);

  return (
    <AppShell>
      <PageHeader title="As minhas visitas" back="/profile" />
      {visits.length === 0 ? (
        <div className="p-8">
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
              <Calendar className="size-6" />
            </div>
            <h2 className="mt-3 font-display text-base font-bold">Sem visitas agendadas</h2>
            <p className="mt-1 text-xs text-muted-foreground">Propõe uma visita a partir de uma conversa.</p>
            <Link to="/matches" className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Ver matches</Link>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 px-4 pt-4">
          {visits.map((v) => {
            const l = listings.find((x) => x.id === v.listingId);
            if (!l) return null;
            const s = STATUS[v.status] ?? STATUS.pending;
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
      )}
    </AppShell>
  );
}
