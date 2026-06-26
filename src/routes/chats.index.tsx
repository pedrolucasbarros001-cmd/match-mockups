import { createFileRoute, Link } from "@tanstack/react-router";
import { chats, listings } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/chats/")({
  head: () => ({ meta: [{ title: "Conversas — HomeMatch" }] }),
  component: ChatsList,
});

function ChatsList() {
  return (
    <AppShell>
      <PageHeader title="Conversas" />
      <ul className="divide-y divide-border">
        {chats.map((c) => {
          const l = listings.find((x) => x.id === c.listingId)!;
          return (
            <li key={c.id}>
              <Link to="/chats/$id" params={{ id: c.id }} className="flex items-center gap-3 px-4 py-3 active:bg-muted">
                <img src={l.photos[0]} alt="" className="size-14 shrink-0 rounded-pill object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-display font-bold">{l.owner.name}</span>
                    <span className="font-num text-xs text-muted-foreground">{c.lastAt}</span>
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{c.lastMessage}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground/80">sobre · {l.title}</div>
                </div>
                {c.unread > 0 && (
                  <span className="grid size-6 place-items-center rounded-pill bg-primary font-num text-xs font-bold text-primary-foreground">
                    {c.unread}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      {chats.length === 0 && (
        <div className="p-12 text-center text-sm text-muted-foreground">
          Ainda sem conversas. Dá likes para começar.
        </div>
      )}
    </AppShell>
  );
}
