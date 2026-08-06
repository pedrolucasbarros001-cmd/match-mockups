import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore, getState } from "@/lib/store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Download, Lock, Check } from "lucide-react";

export const Route = createFileRoute("/settings/privacy")({
  head: () => ({ meta: [{ title: "Privacidade — HomeMatch" }] }),
  component: PrivacySettings,
});

function PrivacySettings() {
  const privacy = useStore((s) => s.privacy);
  const [downloaded, setDownloaded] = useState(false);

  /**
   * Exportar dados: tudo o que a app guarda sobre o utilizador está no store,
   * por isso a exportação é literalmente esse estado. Quando houver backend,
   * passa a ser um pedido ao servidor — o botão fica igual.
   */
  const downloadData = () => {
    const s = getState();
    const payload = JSON.stringify(
      { profile: s.profile, preferences: s.preferences, privacy: s.privacy, notificationPrefs: s.notificationPrefs },
      null,
      2,
    );
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "homematch-os-meus-dados.json";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-10 lg:max-w-[560px]">
      <PageHeader title="Privacidade e segurança" back="/settings" />
      <div className="space-y-6 px-4 pt-4">
        <section>
          <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Visibilidade</div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <Row
              label="Perfil visível na descoberta"
              hint="Senhorios podem ver o teu perfil antes de enviares interesse."
              on={privacy.discoverable}
              onChange={(v) => api.updatePrivacy({ discoverable: v })}
            />
            <Row
              label="Mostrar quando estou ativo"
              hint="O selo “ativo agora” aparece no teu perfil."
              on={privacy.showActivity}
              onChange={(v) => api.updatePrivacy({ showActivity: v })}
              last
            />
          </div>
        </section>

        <section>
          <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Dados</div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <Row
              label="Sugestões personalizadas"
              hint="Usar o que vês para melhorar as recomendações."
              on={privacy.personalisedSuggestions}
              onChange={(v) => api.updatePrivacy({ personalisedSuggestions: v })}
              last
            />
          </div>

          <button
            onClick={downloadData}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition active:scale-[0.99]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-primary-soft text-primary">
              {downloaded ? <Check className="size-5" strokeWidth={3} /> : <Download className="size-5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Descarregar os meus dados</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {downloaded ? "Ficheiro gerado. Podes voltar a descarregar." : "Ficheiro com o teu perfil e preferências."}
              </span>
            </span>
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="text-xs leading-relaxed text-muted-foreground">
              Os teus contactos (telefone e email) nunca são mostrados a outra pessoa antes de
              aceitares um candidato ou de te aceitarem. Não vendemos nem partilhamos dados com terceiros.
              <Link to="/legal/privacy" className="ml-1 font-semibold text-primary underline">Ler a política</Link>
            </div>
          </div>
        </section>

        <Link
          to="/settings/account"
          className="flex h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold transition active:scale-[0.98]"
        >
          Gerir conta e sessão →
        </Link>
      </div>
    </div>
  );
}

function Row({ label, hint, on, onChange, last }: {
  label: string; hint: string; on: boolean; onChange: (v: boolean) => void; last?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 p-4", !last && "border-b border-border")}>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={cn("relative h-6 w-11 shrink-0 rounded-pill transition", on ? "bg-primary" : "bg-muted")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-pill bg-white shadow-sm transition", on ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}
