import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { rooms, listings } from "@/lib/mock-data";
import { Plus, DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rooms")({
  head: () => ({ meta: [{ title: "Quartos — HomeMatch" }] }),
  component: RoomsPage,
});

const STATUS = {
  available: { label: "Disponível", dot: "bg-success", cls: "text-success" },
  reserved: { label: "Reservado", dot: "bg-warning", cls: "text-warning" },
  occupied: { label: "Ocupado", dot: "bg-muted-foreground", cls: "text-muted-foreground" },
} as const;

function RoomsPage() {
  const byListing = listings
    .map((l) => ({ listing: l, rooms: rooms.filter((r) => r.listingId === l.id) }))
    .filter((g) => g.rooms.length > 0);
  return (
    <AppShell role="landlord">
      <PageHeader title="Quartos" back="/dashboard" right={
        <button className="grid size-10 place-items-center rounded-pill bg-primary text-white"><Plus className="size-5" /></button>
      } />
      <div className="space-y-6 px-4 pt-4">
        {byListing.map(({ listing, rooms: rs }) => (
          <section key={listing.id}>
            <div className="mb-2 flex items-center gap-2">
              <img src={listing.photos[0]} className="size-8 rounded-lg object-cover" alt="" />
              <div className="font-display text-sm font-bold">{listing.title}</div>
            </div>
            <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
              {rs.map((r, i) => {
                const s = STATUS[r.status];
                return (
                  <li key={r.id} className={cn("flex items-center gap-3 px-4 py-3", i < rs.length - 1 && "border-b border-border")}>
                    <div className="grid size-10 place-items-center rounded-pill bg-primary-soft text-primary">
                      <DoorOpen className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm font-bold">{r.name}</div>
                      <div className={cn("mt-0.5 flex items-center gap-1.5 text-xs font-medium", s.cls)}>
                        <span className={cn("size-1.5 rounded-pill", s.dot)} /> {s.label}
                        {r.tenant && <span className="text-muted-foreground">· {r.tenant}</span>}
                      </div>
                    </div>
                    <div className="font-num text-sm font-bold">€{r.price}</div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
