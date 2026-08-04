import { Link } from "@tanstack/react-router";
import { nextActionFor } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useRole } from "@/lib/user-state";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

/** Lista de conversas — usada no ecrã /chats e como coluna esquerda em desktop. */
export function ChatList({ activeId }: { activeId?: string }) {
  const role = useRole();
  const chats = useStore((s) => s.chats);
  const listings = useStore((s) => s.listings);
  const matches = useStore((s) => s.matches);

  return (
    <ul className="divide-y divide-border">
      {chats.map((c) => {
        const l = listings.find((x) => x.id === c.listingId);
        if (!l) return null;
        const m = matches.find((x) => x.chatId === c.id);
        const action = m ? nextActionFor(m.state, role === "landlord" ? "landlord" : "tenant", l.kind) : null;
        // Avatar e nome da OUTRA PARTE: seeker vê o senhorio, landlord vê o candidato.
        const other =
          role === "landlord"
            ? { name: m?.candidate?.name || "Candidato", avatar: m?.candidate?.avatar || "" }
            : { name: l.owner.name, avatar: l.owner.avatar };
        return (
          <li key={c.id}>
            <Link
              to="/chats/$id"
              params={{ id: c.id }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 active:bg-muted md:hover:bg-muted",
                activeId === c.id && "bg-primary-soft",
              )}
            >
              <div className="relative shrink-0">
                {other.avatar ? (
                  <img src={other.avatar} alt="" className="size-14 rounded-pill bg-muted object-cover" />
                ) : (
                  <div className="grid size-14 place-items-center rounded-pill bg-muted text-muted-foreground">
                    <User className="size-6" />
                  </div>
                )}
                {c.unread > 0 && <span className="absolute right-0 top-0 size-3.5 rounded-pill border-2 border-surface bg-primary" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-display font-bold">{other.name}</span>
                  <span className="shrink-0 font-num text-xs text-muted-foreground">{c.lastAt}</span>
                </div>
                <div className="truncate text-sm text-muted-foreground">{c.lastMessage}</div>
                {action && <div className="mt-0.5 truncate text-[11px] font-semibold text-primary">Próximo: {action}</div>}
              </div>
              {c.unread > 0 && (
                <span className="grid size-6 shrink-0 place-items-center rounded-pill bg-primary font-num text-xs font-bold text-primary-foreground">
                  {c.unread}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
