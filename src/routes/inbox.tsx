import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { chats, listings } from "@/lib/mock-data";

export const Route = createFileRoute("/inbox")({
  head: () => ({ meta: [{ title: "Inbox — HomeMatch" }] }),
  component: InboxPage,
});

function InboxPage() {
  const groups = listings
    .map((l) => ({ listing: l, chats: chats.filter((c) => c.listingId === l.id) }))
    .filter((g) => g.chats.length > 0);
  return (
    <AppShell role="landlord">
      <PageHeader title="Inbox" />
      <div className="space-y-5 px-4 pt-4">
        {groups.map(({ listing, chats: cs }) => (
          <section key={listing.id}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={listing.photos[0]} className="size-8 rounded-lg object-cover" alt="" />
                <div className="font-display text-sm font-bold">{listing.title}</div>
              </div>
              <span className="font-num text-xs text-muted-foreground">{cs.length} conversas</span>
            </div>
            <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
              {cs.map((c, i) => (
                <li key={c.id}>
                  <Link to="/chats/$id" params={{ id: c.id }} className={"flex items-center gap-3 px-4 py-3 active:bg-muted " + (i < cs.length - 1 ? "border-b border-border" : "")}>
                    <img src={listing.owner.avatar} className="size-11 rounded-pill object-cover" alt="" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-display text-sm font-bold">Candidato</span>
                        <span className="font-num text-xs text-muted-foreground">{c.lastAt}</span>
                      </div>
                      <div className="truncate text-sm text-muted-foreground">{c.lastMessage}</div>
                    </div>
                    {c.unread > 0 && (
                      <span className="grid size-5 place-items-center rounded-pill bg-primary font-num text-[11px] font-bold text-white">{c.unread}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
