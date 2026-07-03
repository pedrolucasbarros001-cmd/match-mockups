import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { visits, listings } from "@/lib/mock-data";
import { Check, X, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/visits-manager")({
  head: () => ({ meta: [{ title: "Gerir visitas — HomeMatch" }] }),
  component: VisitsManager,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendente", cls: "bg-warning/15 text-warning" },
  confirmed: { label: "Confirmada", cls: "bg-success/15 text-success" },
  done: { label: "Concluída", cls: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelada", cls: "bg-danger/15 text-danger" },
};

function VisitsManager() {
  return (
    <AppShell role="landlord">
      <PageHeader title="Gerir visitas" back="/dashboard" />
      <ul className="flex flex-col gap-3 px-4 pt-4">
        {visits.map((v) => {
          const l = listings.find((x) => x.id === v.listingId)!;
          const s = STATUS[v.status];
          return (
            <li key={v.id} className="rounded-2xl border border-border bg-surface p-3">
              <div className="flex items-center gap-3">
                <img src={v.whoAvatar} className="size-12 rounded-pill object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-display font-bold">{v.who}</span>
                    <span className={cn("rounded-pill px-2 py-0.5 text-[11px] font-bold", s.cls)}>{s.label}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{l.title}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 font-num font-semibold"><Calendar className="size-3.5" /> {v.date}</span>
                    <span className="inline-flex items-center gap-1 font-num font-semibold"><Clock className="size-3.5" /> {v.time}</span>
                  </div>
                </div>
              </div>
              {v.status === "pending" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="flex h-10 items-center justify-center gap-1 rounded-pill border border-border text-sm font-semibold">
                    <X className="size-4" /> Recusar
                  </button>
                  <button className="flex h-10 items-center justify-center gap-1 rounded-pill bg-primary text-sm font-semibold text-white">
                    <Check className="size-4" /> Confirmar
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
