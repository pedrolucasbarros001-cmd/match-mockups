import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ChatList } from "@/components/ChatList";
import { useStore } from "@/lib/store";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/chats/")({
  head: () => ({
    meta: [
      { title: "Conversas — HomeMatch" },
      { name: "description", content: "As tuas conversas de arrendamento no HomeMatch." },
      { property: "og:title", content: "Conversas — HomeMatch" },
      { property: "og:description", content: "As tuas conversas de arrendamento no HomeMatch." },
    ],
  }),
  component: ChatsList,
});

function ChatsList() {
  const chats = useStore((s) => s.chats);

  return (
    <AppShell width="wide">
      <PageHeader title="Conversas" />
      {chats.length === 0 ? (
        <div className="p-8">
          <div className="mx-auto max-w-[520px] rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
              <MessageCircle className="size-6" />
            </div>
            <h2 className="mt-3 font-display text-base font-bold">Ainda sem conversas</h2>
            <p className="mt-1 text-xs text-muted-foreground">Dá interesse num anúncio para começar.</p>
            <Link to="/explore" className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Explorar imóveis</Link>
          </div>
        </div>
      ) : (
        // Desktop: lista à esquerda + painel de contexto à direita (master–detail).
        <div className="md:grid md:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] md:gap-6 md:px-6">
          <div className="md:overflow-hidden md:rounded-2xl md:border md:border-border md:bg-surface">
            <ChatList />
          </div>
          <div className="hidden place-items-center rounded-2xl border border-dashed border-border p-10 text-center md:grid">
            <div>
              <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
                <MessageCircle className="size-6" />
              </div>
              <h2 className="mt-3 font-display text-base font-bold">Escolhe uma conversa</h2>
              <p className="mt-1 text-sm text-muted-foreground">Seleciona à esquerda para abrir a negociação.</p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
