import { createFileRoute, Link } from "@tanstack/react-router";
import { nextActionFor } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/chats/")({
  head: () => ({ meta: [{ title: "Conversas — HomeMatch" }] }),
  component: ChatsList,
});

function ChatsList() {
  const chats = useStore((s) => s.chats);
  const listings = useStore((s) => s.listings);
  const matches = useStore((s) => s.matches);

  return (
    <AppShell>
      <PageHeader title="Conversas" />
      {chats.length === 0 ? (
        <div className="p-8">
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
              <MessageCircle className="size-6" />
            </div>
            <h2 className="mt-3 font-display text-base font-bold">Ainda sem conversas</h2>
            <p className="mt-1 text-xs text-muted-foreground">Dá interesse num anúncio para começar.</p>
            <Link to="/explore" className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Explorar imóveis</Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {chats.map((c) => {
            const l = listings.find((x) => x.id === c.listingId);
            if (!l) return null;
            const m = matches.find((x) => x.chatId === c.id);
            const action = m ? nextActionFor(m.state) : null;
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
                    {action && (
                      <div className="mt-0.5 truncate text-[11px] font-semibold text-primary">Próximo: {action}</div>
                    )}
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
      )}
    </AppShell>
  );
}
