import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { ChevronLeft, ChevronRight, Camera, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpaceType } from "@/lib/mock-data";

export const Route = createFileRoute("/publish")({
  head: () => ({ meta: [{ title: "Publicar — HomeMatch" }] }),
  component: PublishWizard,
});

const STEPS = ["Tipo", "Localização", "Características", "Fotos", "Preço", "Regras", "Disponibilidade", "Rever"] as const;

const SPACE_TYPES: { key: SpaceType; desc: string; photos: string[] }[] = [
  { key: "Quarto", desc: "Um quarto numa casa partilhada.", photos: ["Quarto", "Cozinha", "Casa de banho"] },
  { key: "Suite", desc: "Quarto com casa de banho privativa.", photos: ["Suite", "Casa de banho", "Cozinha"] },
  { key: "Quarto Partilhado", desc: "Cama num quarto partilhado.", photos: ["Quarto", "Cozinha"] },
  { key: "Estúdio", desc: "Espaço aberto individual.", photos: ["Sala/quarto", "Cozinha", "Casa de banho"] },
  { key: "T1", desc: "1 quarto separado.", photos: ["Sala", "Cozinha", "Quarto", "Casa de banho"] },
  { key: "T2", desc: "2 quartos.", photos: ["Sala", "Cozinha", "Quarto principal", "Casa de banho"] },
  { key: "T3", desc: "3 quartos.", photos: ["Sala", "Cozinha", "Quarto principal", "Casa de banho"] },
  { key: "T4+", desc: "4 ou mais quartos.", photos: ["Sala", "Cozinha", "Quarto principal", "Casa de banho"] },
];

function PublishWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<SpaceType | null>(null);
  const [city, setCity] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(450);
  const [pets, setPets] = useState(false);
  const [smoke, setSmoke] = useState(false);
  const [students, setStudents] = useState(true);
  const [moveIn, setMoveIn] = useState("");
  const [visitSlots, setVisitSlots] = useState<string[]>([]);

  const selected = SPACE_TYPES.find((t) => t.key === type);

  const canGoNext =
    (step === 0 && !!type) ||
    (step === 1 && city.length > 1) ||
    step === 2 ||
    step === 3 ||
    (step === 4 && price >= 100) ||
    step >= 5;

  const next = () => (step === STEPS.length - 1 ? nav({ to: "/my-listings" }) : setStep((s) => s + 1));
  const prev = () => (step === 0 ? nav({ to: "/my-listings" }) : setStep((s) => s - 1));

  // Quality score interno (mock)
  const quality =
    (type ? 20 : 0) +
    (city.length > 1 ? 15 : 0) +
    (title.length > 3 ? 10 : 0) +
    (desc.length > 50 ? 15 : 0) +
    (price >= 100 ? 10 : 0) +
    (moveIn ? 10 : 0) +
    (visitSlots.length ? 10 : 0) +
    10;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col bg-background">
      <PageHeader title={`Publicar · ${STEPS[step]}`} back="/my-listings" />
      <div className="px-4 pt-3">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-pill", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">Passo {step + 1} de {STEPS.length}</div>
      </div>

      <div className="flex-1 px-5 pt-6 pb-24">
        {step === 0 && (
          <Step title="Que tipo de espaço estás a anunciar?" sub="Um anúncio representa exatamente um espaço.">
            <div className="grid grid-cols-2 gap-2.5">
              {SPACE_TYPES.map((t) => (
                <button key={t.key} onClick={() => setType(t.key)} className={cn(
                  "rounded-2xl border-2 bg-surface p-4 text-left",
                  type === t.key ? "border-primary bg-primary-soft" : "border-border",
                )}>
                  <div className="font-display text-base font-bold">{t.key}</div>
                  <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{t.desc}</div>
                </button>
              ))}
            </div>
            {(type === "T2" || type === "T3" || type === "T4+") && (
              <Tip>Escolhe {type} apenas se arrendas o apartamento inteiro. Para arrendar um quarto, escolhe <b>Quarto</b>.</Tip>
            )}
          </Step>
        )}

        {step === 1 && (
          <Step title="Onde fica?" sub="A morada exata só é partilhada quando aceitares alguém.">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade"
              className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <input placeholder="Bairro / referência" className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
            <input placeholder="Rua e número (privado)" className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
          </Step>
        )}

        {step === 2 && (
          <Step title="Conta um pouco sobre o sítio">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do anúncio"
              className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (mín. 50 caracteres)" rows={6}
              className="w-full resize-none rounded-md border border-border bg-surface p-4 outline-none focus:border-primary" />
            <div className="text-xs text-muted-foreground">{desc.length} caracteres · sugerido &gt; 50</div>
            <div className="grid grid-cols-3 gap-2">
              {["Wi-Fi", "Cozinha", "Aquecimento", "Mobilado", "Varanda", "Elevador"].map((a) => (
                <span key={a} className="rounded-pill border border-border bg-surface px-3 py-1.5 text-center text-xs">{a}</span>
              ))}
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title="Fotos" sub={selected ? `Recomendado para ${selected.key}: ${selected.photos.join(" · ")}` : "Escolhe primeiro o tipo."}>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <button key={i} className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-border bg-surface text-muted-foreground hover:border-primary hover:text-primary">
                  <Camera className="size-6" />
                </button>
              ))}
            </div>
            <Tip>Ensinamos, não bloqueamos. Podes publicar com menos, mas o teu anúncio sobe mais na descoberta com as fotos recomendadas.</Tip>
          </Step>
        )}

        {step === 4 && (
          <Step title="Quanto custa?">
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <div className="font-num text-5xl font-bold text-primary">€{price}</div>
              <div className="text-sm text-muted-foreground">por mês</div>
              <input type="range" min={100} max={2000} step={10} value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-5 w-full accent-[color:var(--primary)]" />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[color:var(--primary)]" /> Despesas incluídas</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[color:var(--primary)]" /> Caução exigida</label>
          </Step>
        )}

        {step === 5 && (
          <Step title="Regras do espaço" sub="Regras aplicam-se ao anúncio, não a ti como pessoa.">
            <Toggle label="Aceita animais" v={pets} on={setPets} />
            <Toggle label="Pode fumar" v={smoke} on={setSmoke} />
            <Toggle label="Aceita estudantes" v={students} on={setStudents} />
          </Step>
        )}

        {step === 6 && (
          <Step title="Disponibilidade" sub="Visitas e mudança são coisas separadas.">
            <Field label="Disponível para mudar em">
              <input value={moveIn} onChange={(e) => setMoveIn(e.target.value)} placeholder="ex. 1 Set 2026"
                className="h-12 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
            </Field>
            <Field label="Horários que aceitas para visitas">
              <div className="flex flex-wrap gap-2">
                {["Sáb 10:00", "Sáb 15:00", "Dom 11:00", "Sex 18:00", "Ter 17:00"].map((s) => {
                  const on = visitSlots.includes(s);
                  return (
                    <button key={s} onClick={() => setVisitSlots(on ? visitSlots.filter((x) => x !== s) : [...visitSlots, s])}
                      className={cn("h-9 rounded-pill border px-3 text-xs font-semibold",
                        on ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>{s}</button>
                  );
                })}
              </div>
            </Field>
          </Step>
        )}

        {step === 7 && (
          <Step title="Rever e publicar">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="font-display text-lg font-bold">{title || "Anúncio sem título"}</div>
              <div className="font-num text-sm text-muted-foreground">€{price}/mês · {city || "—"} · {type ?? "—"}</div>
              <div className="mt-2 text-sm text-muted-foreground">{desc || "Sem descrição."}</div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Qualidade do anúncio (interno)</div>
              <div className="h-2 overflow-hidden rounded-pill bg-muted">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, quality)}%` }} />
              </div>
              <div className="mt-2 font-num text-xs text-muted-foreground">{Math.min(100, quality)}/100 · afeta a tua posição na descoberta.</div>
            </div>
            {quality < 70 && <Tip>Podes publicar já. Sugerimos adicionar mais informação para melhorares a descoberta.</Tip>}
          </Step>
        )}
      </div>

      <div className="sticky bottom-0 flex gap-2 border-t border-border bg-surface px-4 py-3">
        <button onClick={prev} className="grid size-12 place-items-center rounded-lg border border-border">
          <ChevronLeft className="size-5" />
        </button>
        <button onClick={next} disabled={!canGoNext} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift disabled:opacity-50">
          {step === STEPS.length - 1 ? (<><Check className="size-5" /> Publicar</>) : (<>Continuar <ChevronRight className="size-5" /></>)}
        </button>
      </div>
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold leading-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary-soft/60 p-3 text-xs text-primary">
      <Info className="mt-0.5 size-4 shrink-0" />
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (b: boolean) => void }) {
  return (
    <button onClick={() => on(!v)} className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
      <span className="text-sm font-semibold">{label}</span>
      <span className={cn("relative h-6 w-11 rounded-pill transition", v ? "bg-primary" : "bg-muted")}>
        <span className={cn("absolute top-0.5 size-5 rounded-pill bg-white transition", v ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
