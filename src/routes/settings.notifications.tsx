import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bell, BellOff } from "lucide-react";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({ meta: [{ title: "Notificações — HomeMatch" }] }),
  component: NotificationSettings,
});

/**
 * Categorias iguais às das notificações reais (Notification["category"]) —
 * desligar uma aqui tem de silenciar exatamente aquelas, senão o interruptor
 * e o efeito seriam duas coisas diferentes.
 */
const GROUPS: { key: keyof NotificationPrefsShape; label: string; hint: string }[] = [
  { key: "interest", label: "Novos interesses", hint: "Quando alguém demonstra interesse num anúncio teu." },
  { key: "conversation", label: "Mensagens", hint: "Novas mensagens nas tuas conversas." },
  { key: "visit", label: "Visitas", hint: "Propostas, confirmações e lembretes de visita." },
  { key: "match", label: "Negócio", hint: "Confirmações de arrendamento ou proposta aceite." },
  { key: "marketplace", label: "Sugestões", hint: "Anúncios novos que encaixam no que procuras." },
];

type NotificationPrefsShape = {
  interest: boolean;
  conversation: boolean;
  visit: boolean;
  match: boolean;
  marketplace: boolean;
};

function NotificationSettings() {
  const prefs = useStore((s) => s.notificationPrefs);
  const allOff = GROUPS.every((g) => !prefs[g.key]);

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-10 lg:max-w-[560px]">
      <PageHeader title="Notificações" back="/settings" />
      <div className="px-4 pt-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Escolhe o que queres receber. Isto vale para as notificações dentro da app;
          as push entram quando ligarmos o envio.
        </p>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {GROUPS.map((g, i) => (
            <div key={g.key} className={cn("flex items-center gap-3 p-4", i < GROUPS.length - 1 && "border-b border-border")}>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{g.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{g.hint}</div>
              </div>
              <Toggle
                on={prefs[g.key]}
                onChange={(v) => api.updateNotificationPrefs({ [g.key]: v })}
                label={g.label}
              />
            </div>
          ))}
        </div>

        {/* Contrapositiva: se está tudo desligado, diz o que isso implica. */}
        {allOff && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs">
            <BellOff className="mt-0.5 size-4 shrink-0 text-warning" />
            <div className="text-foreground/85">
              Com tudo desligado não te avisamos de nada — nem de mensagens nem de visitas.
              Vais ter de abrir a app para saber o que aconteceu.
            </div>
          </div>
        )}

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
          <Bell className="mt-0.5 size-4 shrink-0" />
          <div>Avisos essenciais de segurança e de conta são sempre enviados.</div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn("relative h-6 w-11 shrink-0 rounded-pill transition", on ? "bg-primary" : "bg-muted")}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-pill bg-white shadow-sm transition", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}
