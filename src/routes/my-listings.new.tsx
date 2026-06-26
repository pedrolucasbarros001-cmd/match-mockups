import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { ChevronLeft, ChevronRight, Camera, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-listings/new")({
  head: () => ({ meta: [{ title: "Novo anúncio — HomeMatch" }] }),
  component: NewListing,
});

const STEPS = ["Tipo", "Localização", "Detalhes", "Fotos", "Preço", "Rever"] as const;

function NewListing() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [price, setPrice] = useState(450);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const next = () => (step === STEPS.length - 1 ? nav({ to: "/my-listings" }) : setStep((s) => s + 1));
  const prev = () => (step === 0 ? nav({ to: "/my-listings" }) : setStep((s) => s - 1));

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col bg-background">
      <PageHeader title={`Novo anúncio · ${STEPS[step]}`} />
      <div className="px-4 pt-3">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-pill", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pt-6 pb-24">
        {step === 0 && (
          <Step title="Que tipo de espaço estás a anunciar?">
            <div className="grid grid-cols-1 gap-3">
              {["Quarto", "Apartamento", "Casa"].map((t) => (
                <button key={t} onClick={() => setType(t)} className={cn(
                  "rounded-2xl border-2 bg-surface p-5 text-left",
                  type === t ? "border-primary bg-primary-soft" : "border-border",
                )}>
                  <div className="font-display text-lg font-bold">{t}</div>
                  <div className="text-sm text-muted-foreground">
                    {t === "Quarto" ? "Quarto numa casa partilhada." : t === "Apartamento" ? "Um T0/T1/T2 só para um arrendatário." : "Casa inteira."}
                  </div>
                </button>
              ))}
            </div>
          </Step>
        )}
        {step === 1 && (
          <Step title="Onde fica?" sub="Cidade e morada (a morada nunca é pública).">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade"
              className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <input placeholder="Rua e número" className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <p className="text-xs text-muted-foreground">A morada exata só é partilhada quando aceitares um candidato.</p>
          </Step>
        )}
        {step === 2 && (
          <Step title="Conta um pouco sobre o sítio">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do anúncio"
              className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (mín. 50 caracteres)" rows={6}
              className="w-full resize-none rounded-md border border-border bg-surface p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <div className="text-xs text-muted-foreground">{desc.length} caracteres</div>
          </Step>
        )}
        {step === 3 && (
          <Step title="Fotos" sub="Mín. 3 fotos. A primeira é a de capa.">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <button key={i} className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-border bg-surface text-muted-foreground hover:border-primary hover:text-primary">
                  <Camera className="size-6" />
                </button>
              ))}
            </div>
          </Step>
        )}
        {step === 4 && (
          <Step title="Quanto custa?">
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <div className="font-num text-5xl font-bold text-primary">€{price}</div>
              <div className="text-sm text-muted-foreground">por mês</div>
              <input type="range" min={100} max={2000} step={10} value={price} onChange={(e) => setPrice(+e.target.value)}
                className="mt-5 w-full accent-[color:var(--primary)]" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[color:var(--primary)]" /> Despesas incluídas
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[color:var(--primary)]" /> Caução exigida
            </label>
          </Step>
        )}
        {step === 5 && (
          <Step title="Tudo pronto?" sub="Confirma e publica.">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="font-display text-lg font-bold">{title || "Novo anúncio"}</div>
              <div className="font-num text-sm text-muted-foreground">€{price}/mês · {city || "Cidade"}</div>
              <div className="mt-3 text-sm text-muted-foreground">{type ?? "Quarto"}</div>
            </div>
            <div className="rounded-2xl border border-border bg-success/10 p-4 text-sm text-success">
              <Check className="mb-1 inline size-4" /> Vais aparecer no feed em segundos.
            </div>
          </Step>
        )}
      </div>

      <div className="sticky bottom-0 flex gap-2 border-t border-border bg-surface px-4 py-3">
        <button onClick={prev} className="grid size-12 place-items-center rounded-lg border border-border">
          <ChevronLeft className="size-5" />
        </button>
        <button onClick={next} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift">
          {step === STEPS.length - 1 ? "Publicar" : "Continuar"} <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
