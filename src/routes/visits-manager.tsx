import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Check, X, Calendar, Clock, User } from "lucide-react";
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
  const visits = useStore((s) => s.visits);
  const listings = useStore((s) => s.listings);
  // Só visitas dos anúncios deste senhorio (frontend-only: todos os anúncios pertencem ao utilizador atual).
  const items = visits.filter((v) => listings.some((l) => l.id === v.listingId));

  return (
    <AppShell role="landlord">
      <PageHeader title="Gerir visitas" back="/profile" />
      {items.length === 0 ? (
        <div className="p-8">
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
              <Calendar className="size-6" />
            </div>
            <h2 className="mt-3 font-display text-base font-bold">Sem visitas para gerir</h2>
            <p className="mt-1 text-xs text-muted-foreground">Quando um candidato propuser uma visita, aparecerá aqui.</p>
            <Link to="/candidates" className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Ver candidatos</Link>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 px-4 pt-4">
          {items.map((v) => {
            const l = listings.find((x) => x.id === v.listingId);
            if (!l) return null;
            const s = STATUS[v.status] ?? STATUS.pending;
            return (
              <li key={v.id} className="rounded-2xl border border-border bg-surface p-3">
                <div className="flex items-center gap-3">
                  {v.whoAvatar ? (
                    <img src={v.whoAvatar} className="size-12 rounded-pill object-cover" alt="" />
                  ) : (
                    <div className="grid size-12 place-items-center rounded-pill bg-muted text-muted-foreground">
                      <User className="size-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-display font-bold">{v.who || "Candidato"}</span>
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
                    <button
                      onClick={() => api.setVisitStatus(v.id, "cancelled")}
                      className="flex h-10 items-center justify-center gap-1 rounded-pill border border-border text-sm font-semibold"
                    >
                      <X className="size-4" /> Recusar
                    </button>
                    <button
                      onClick={() => api.setVisitStatus(v.id, "confirmed")}
                      className="flex h-10 items-center justify-center gap-1 rounded-pill bg-primary text-sm font-semibold text-white"
                    >
                      <Check className="size-4" /> Confirmar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
