import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { chats, listings } from "@/lib/mock-data";
import { ChevronLeft, Send, Phone, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chats/$id")({
  head: () => ({ meta: [{ title: "Chat — HomeMatch" }] }),
  component: ChatRoom,
});

function ChatRoom() {
  const { id } = useParams({ from: "/chats/$id" });
  const chat = chats.find((c) => c.id === id)!;
  const listing = listings.find((l) => l.id === chat.listingId)!;
  const [msgs, setMsgs] = useState(chat.messages);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: text.trim(), at: "agora" }]);
    setText("");
  };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/95 px-2 py-2 backdrop-blur">
        <Link to="/chats" className="grid size-10 place-items-center rounded-pill hover:bg-muted"><ChevronLeft className="size-5" /></Link>
        <img src={listing.owner.avatar} className="size-10 rounded-pill object-cover" alt="" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-bold">{listing.owner.name}</div>
          <div className="truncate text-xs text-muted-foreground">{listing.title}</div>
        </div>
        <button className="grid size-10 place-items-center rounded-pill hover:bg-muted"><Phone className="size-5" /></button>
        <button className="grid size-10 place-items-center rounded-pill hover:bg-muted"><MoreVertical className="size-5" /></button>
      </header>

      <Link to="/explore/$id" params={{ id: listing.id }} className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
        <img src={listing.photos[0]} className="size-12 rounded-md object-cover" alt="" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold">{listing.title}</div>
          <div className="font-num text-xs text-muted-foreground">€{listing.price}/mês · {listing.city}</div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex flex-col", m.from === "me" ? "items-end" : "items-start")}>
            <div className={cn(
              "max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug",
              m.from === "me" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
            )}>{m.text}</div>
            <span className="mt-1 px-1 font-num text-[10px] text-muted-foreground">{m.at}</span>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface px-3 py-3">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreve uma mensagem…"
            className="h-12 flex-1 rounded-pill border border-border bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
          <button type="submit" className="grid size-12 place-items-center rounded-pill bg-primary text-primary-foreground active:scale-95 disabled:bg-muted disabled:text-muted-foreground"
            disabled={!text.trim()}>
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
