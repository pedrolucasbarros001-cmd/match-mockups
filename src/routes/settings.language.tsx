import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Check, Languages } from "lucide-react";

export const Route = createFileRoute("/settings/language")({
  head: () => ({ meta: [{ title: "Idioma — HomeMatch" }] }),
  component: LanguageSettings,
});

const LANGUAGES: { id: "pt" | "en"; label: string; native: string; ready: boolean }[] = [
  { id: "pt", label: "Português", native: "Português (Portugal)", ready: true },
  { id: "en", label: "Inglês", native: "English", ready: false },
];

function LanguageSettings() {
  const language = useStore((s) => s.language);

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-10 lg:max-w-[560px]">
      <PageHeader title="Idioma" back="/settings" />
      <div className="px-4 pt-4">
        <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
          {LANGUAGES.map((l, i) => (
            <li key={l.id} className={cn(i < LANGUAGES.length - 1 && "border-b border-border")}>
              <button
                onClick={() => api.setLanguage(l.id)}
                className="flex w-full items-center gap-3 p-4 text-left transition active:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {l.label}
                    {/* Honestidade: um idioma sem tradução feita diz-se, não se esconde. */}
                    {!l.ready && (
                      <span className="rounded-pill bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        em preparação
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{l.native}</div>
                </div>
                {language === l.id && <Check className="size-5 shrink-0 text-primary" strokeWidth={3} />}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <Languages className="mt-0.5 size-4 shrink-0" />
          <div>
            A escolha fica guardada. Enquanto a tradução para inglês não estiver concluída,
            a app continua a mostrar-se em português.
          </div>
        </div>
      </div>
    </div>
  );
}
