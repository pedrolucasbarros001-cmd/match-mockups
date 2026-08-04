import { createFileRoute, Link } from "@tanstack/react-router";
import { nextActionFor } from "@/lib/mock-data";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { useRole } from "@/lib/user-state";
import { MessageCircle, User } from "lucide-react";

export const Route = createFileRoute("/chats/")({
  head: () => ({ meta: [{ title: "Conversas — HomeMatch" }] }),
  component: ChatsList,
});

function ChatsList() {
  const role = useRole();
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
            const action = m ? nextActionFor(m.state, role === "landlord" ? "landlord" : "tenant", l.kind) : null;
            // Avatar e nome da OUTRA PARTE: seeker vê o senhorio, landlord vê o candidato — nunca a foto do imóvel.
            const other =
              role === "landlord"
                ? { name: m?.candidate?.name || "Candidato", avatar: m?.candidate?.avatar || "" }
                : { name: l.owner.name, avatar: l.owner.avatar };
            return (
              <li key={c.id}>
                <Link to="/chats/$id" params={{ id: c.id }} className="flex items-center gap-3 px-4 py-3 active:bg-muted">
                  <div className="relative shrink-0">
                    {other.avatar ? (
                      <img src={other.avatar} alt="" className="size-14 rounded-pill bg-muted object-cover" />
                    ) : (
                      <div className="grid size-14 place-items-center rounded-pill bg-muted text-muted-foreground">
                        <User className="size-6" />
                      </div>
                    )}
                    {/* Ponto de não lidas sobre o avatar — leitura imediata. */}
                    {c.unread > 0 && <span className="absolute right-0 top-0 size-3.5 rounded-pill border-2 border-surface bg-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-display font-bold">{other.name}</span>
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
