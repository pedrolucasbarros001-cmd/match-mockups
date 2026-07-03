import { createFileRoute, Link } from "@tanstack/react-router";
import { listings, me } from "@/lib/mock-data";
import { AppShell, PageHeader, ScoreBadge } from "@/components/AppShell";
import { Plus, ChevronRight, Inbox, DoorOpen, Calendar } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HomeMatch" }] }),
  component: Dashboard,
});

function Dashboard() {
  const mine = listings.slice(0, 1);
  return (
    <AppShell role="landlord">
      <PageHeader title={`Olá, ${me.name.split(" ")[0]} 👋`} />
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat n={1} label="Anúncios" />
          <Stat n={5} label="Interessados" />
          <Stat n={2} label="Chats" />
        </div>

        <Link to="/profile/score" className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
          <ScoreBadge score={me.score} size="md" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Trust Score</div>
            <div className="mt-1 h-2 overflow-hidden rounded-pill bg-muted">
              <div className="h-full bg-primary" style={{ width: `${me.score}%` }} />
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Shortcut to="/inbox" Icon={Inbox} label="Inbox" n={2} />
          <Shortcut to="/rooms" Icon={DoorOpen} label="Quartos" n={5} />
          <Shortcut to="/visits-manager" Icon={Calendar} label="Visitas" n={3} />
        </div>

        <h2 className="mt-6 mb-2 font-display text-base font-bold">Para fazer agora</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <TodoRow text="3 interessados no Quarto Rua das Flores" />
          <TodoRow text="Confirmar arrendamento com Ana P." last />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Os meus anúncios</h2>
          <Link to="/my-listings" className="text-sm font-semibold text-primary">Ver todos →</Link>
        </div>
        <div className="mt-2 flex flex-col gap-3">
          {mine.map((l) => (
            <Link key={l.id} to="/my-listings" className="flex gap-3 rounded-2xl border border-border bg-surface p-3">
              <img src={l.photos[0]} className="size-20 rounded-xl object-cover" alt="" />
              <div className="flex-1">
                <div className="font-display font-bold">{l.title}</div>
                <div className="font-num text-sm text-muted-foreground">€{l.price}/mês</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-pill bg-success/15 px-2 py-0.5 font-semibold text-success">● Ativo</span>
                  <span className="text-muted-foreground">5 interessados</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/my-listings/new" className="mt-4 flex h-14 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface font-display font-semibold text-foreground transition active:scale-[0.99]">
          <Plus className="size-5" /> Novo anúncio
        </Link>

        <div className="mt-4 rounded-2xl border border-border bg-primary-soft p-4 text-sm">
          <div className="font-semibold">Plano: Free · 1/1 anúncios</div>
          <button className="mt-1 text-xs font-semibold text-primary">Precisas de mais? →</button>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-center">
      <div className="font-num text-3xl font-bold">{n}</div>
      <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function TodoRow({ text, last }: { text: string; last?: boolean }) {
  return (
    <button className={"flex w-full items-center justify-between px-4 py-3 text-left active:bg-muted " + (last ? "" : "border-b border-border")}>
      <span className="text-sm font-medium">· {text}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

function Shortcut({ to, Icon, label, n }: { to: string; Icon: typeof Inbox; label: string; n: number }) {
  return (
    <Link to={to} className="flex flex-col items-start gap-1 rounded-2xl border border-border bg-surface p-3">
      <div className="flex w-full items-center justify-between">
        <div className="grid size-9 place-items-center rounded-pill bg-primary-soft text-primary"><Icon className="size-4" /></div>
        <span className="font-num text-sm font-bold">{n}</span>
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}
