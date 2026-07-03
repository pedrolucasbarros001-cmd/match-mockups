import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Bell, Globe, Lock, FileText, Trash2, HelpCircle, ChevronRight } from "lucide-react";



export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Definições — HomeMatch" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const nav = useNavigate();
  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-10">
      <PageHeader title="Definições" back="/profile" />
      <div className="px-4 pt-4">
        <Group title="Conta">
          <Item icon={<Lock className="size-5" />} label="Privacidade e segurança" />
          <Item icon={<Bell className="size-5" />} label="Notificações" />
          <Item icon={<Globe className="size-5" />} label="Idioma" hint="Português" />
        </Group>
        <Group title="Sobre">
          <Item icon={<FileText className="size-5" />} label="Termos de Uso" onClick={() => nav({ to: "/legal/terms" })} />
          <Item icon={<FileText className="size-5" />} label="Política de Privacidade" onClick={() => nav({ to: "/legal/privacy" })} />
          <Item icon={<HelpCircle className="size-5" />} label="Ajuda" onClick={() => nav({ to: "/help" })} />
        </Group>
        <Group title="Zona perigosa">
          <Item icon={<Trash2 className="size-5" />} label="Eliminar conta" destructive
            onClick={() => nav({ to: "/login" })} />
        </Group>
        <p className="mt-8 text-center text-xs text-muted-foreground">HomeMatch v1.0</p>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">{children}</div>
    </section>
  );
}

function Item({ icon, label, hint, destructive, onClick }: { icon: React.ReactNode; label: string; hint?: string; destructive?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={"flex w-full items-center justify-between border-b border-border px-4 py-3.5 text-left last:border-0 active:bg-muted " + (destructive ? "text-danger" : "")}>
      <div className="flex items-center gap-3">
        <span className={destructive ? "text-danger" : "text-muted-foreground"}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {hint} <ChevronRight className="size-4" />
      </div>
    </button>
  );
}
