import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Search, Home, MapPin, Camera, Info, Check, Sparkles } from "lucide-react";
import { ScoreBadge } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Bem-vindo — HomeMatch" }] }),
  component: Onboarding,
});

const TOTAL = 6;

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"seeker" | "landlord" | null>(null);
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState(10);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [situation, setSituation] = useState("");
  const [phone, setPhone] = useState("");
  const [trust, setTrust] = useState({ nif: false, id: false, income: false, terms: false });

  const score = 40 + (bio.length >= 50 ? 5 : 0) + (name ? 5 : 0) + (phone.length >= 9 ? 10 : 0) + (trust.nif ? 5 : 0) + (trust.id ? 5 : 0) + (trust.income ? 5 : 0) + (trust.terms ? 5 : 0);

  const next = () => setStep((s) => Math.min(TOTAL, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const finish = () => nav({ to: role === "landlord" ? "/dashboard" : "/explore" });

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col bg-background px-5 pb-10">
      <header className="-mx-1 flex h-14 items-center justify-between">
        {step > 1 ? (
          <button onClick={prev} className="grid size-10 place-items-center rounded-full hover:bg-muted">
            <ChevronLeft className="size-5" />
          </button>
        ) : <div className="size-10" />}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span key={i} className={cn("size-2 rounded-pill transition-all", i < step ? "bg-primary w-6" : "bg-border")} />
          ))}
        </div>
        <span className="font-num text-xs text-muted-foreground">{step}/{TOTAL}</span>
      </header>

      {step === 1 && (
        <Section title="Bem-vindo ao HomeMatch 🏠" sub="O que precisas?">
          <div className="mt-4 flex flex-col gap-3">
            <RoleCard active={role === "seeker"} onClick={() => { setRole("seeker"); setTimeout(next, 250); }}
              icon={<Search className="size-7" />} title="Procuro um sítio"
              sub="Quarto, apartamento ou casa para arrendar." />
            <RoleCard active={role === "landlord"} onClick={() => { setRole("landlord"); setTimeout(next, 250); }}
              icon={<Home className="size-7" />} title="Tenho um sítio para arrendar"
              sub="Anuncia e fala com candidatos." />
          </div>
        </Section>
      )}

      {step === 2 && (
        <Section title="Onde é que procuras?" sub="Usamos isto para mostrar imóveis perto de ti.">
          <div className="mt-5 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade ou localidade…"
                className="h-14 w-full rounded-md border border-border bg-surface pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>
            <div className="text-center text-xs text-muted-foreground">ou</div>
            <button onClick={() => setCity("Bragança")} className="flex h-14 items-center justify-center gap-2 rounded-lg border border-border bg-surface font-semibold">
              <MapPin className="size-5 text-primary" /> Usar a minha localização
            </button>

            {city && (
              <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Raio de pesquisa</span>
                  <span className="font-num font-bold text-primary">{radius} km</span>
                </div>
                <input type="range" min={1} max={50} value={radius} onChange={(e) => setRadius(+e.target.value)} className="mt-3 w-full accent-[color:var(--primary)]" />
                <p className="mt-3 text-xs text-muted-foreground">Vais ver imóveis num raio de <b className="text-foreground">{radius} km</b> à volta de <b className="text-foreground">{city}</b>.</p>
              </div>
            )}
            <PrimaryButton onClick={next} disabled={!city}>Continuar</PrimaryButton>
          </div>
        </Section>
      )}

      {step === 3 && (
        <Section title="Apresenta-te" sub="Os proprietários veem isto antes de responder ao teu interesse.">
          <div className="mt-5 flex flex-col gap-4">
            <button className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-surface p-4">
              <div className="grid size-16 place-items-center rounded-pill bg-muted text-muted-foreground"><Camera className="size-6" /></div>
              <div className="text-left">
                <div className="font-semibold">Adicionar foto</div>
                <div className="text-xs font-medium text-success">+5 pts ↑</div>
              </div>
            </button>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo"
              className="h-14 rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <div>
              <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} placeholder="Escreve algo sobre ti…" rows={4}
                className="w-full resize-none rounded-md border border-border bg-surface p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
              <div className="mt-1 flex justify-between text-xs">
                <span className={cn("font-medium", bio.length >= 50 ? "text-success" : "text-muted-foreground")}>Mínimo 50 caracteres para +5 pts</span>
                <span className="font-num text-muted-foreground">{bio.length}/200</span>
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Como te descreves?</div>
              <div className="flex flex-wrap gap-2">
                {["Estudante", "Trabalhador", "Freelancer", "Outro"].map((s) => (
                  <button key={s} onClick={() => setSituation(s)}
                    className={cn("h-10 rounded-pill border px-4 text-sm font-medium transition", situation === s ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-foreground")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <PrimaryButton onClick={next} disabled={!name}>Continuar</PrimaryButton>
            <button onClick={next} className="text-sm text-muted-foreground">Pular por agora</button>
          </div>
        </Section>
      )}

      {step === 4 && (
        <Section title="Adiciona o teu número" sub="Nunca partilhado sem pedires. Serve só para segurança.">
          <div className="mt-2 inline-flex items-center gap-1 rounded-pill bg-success/15 px-3 py-1 text-xs font-semibold text-success">+10 pts no teu score ↑</div>
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex h-14 w-20 items-center justify-center rounded-md border border-border bg-muted text-sm font-semibold">🇵🇹 +351</div>
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="9X XXX XXXX"
                className="h-14 flex-1 rounded-md border border-border bg-surface px-4 font-num outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>
            <PrimaryButton onClick={next} disabled={phone.length < 9}>Confirmar número</PrimaryButton>
            <button onClick={next} className="text-sm text-muted-foreground">Pular por agora</button>
          </div>
        </Section>
      )}

      {step === 5 && (
        <Section title="Mais sobre ti" sub="Sem documentos. Só declaras o que é verdade.">
          <div className="mt-5 flex flex-col gap-3">
            {([
              ["nif", "Tenho NIF português", "+5 pts"],
              ["id", "Tenho identificação válida (CC, Passaporte ou AR)", "+5 pts"],
              ["income", "Tenho rendimento ou sou estudante", "+5 pts"],
              ["terms", "Li os Termos de Responsabilidade", "+5 pts · obrigatório"],
            ] as const).map(([k, l, r]) => (
              <label key={k} className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border bg-surface p-4 transition",
                trust[k] ? "border-primary bg-primary-soft" : "border-border",
              )}>
                <input type="checkbox" checked={trust[k]} onChange={(e) => setTrust((t) => ({ ...t, [k]: e.target.checked }))} className="mt-0.5 size-5 accent-[color:var(--primary)]" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{l}</div>
                  <div className={cn("text-xs font-semibold", k === "terms" ? "text-warning" : "text-success")}>{r}</div>
                </div>
                <Info className="size-4 text-muted-foreground" />
              </label>
            ))}
            <PrimaryButton onClick={next} disabled={!trust.terms}>Continuar</PrimaryButton>
            <button onClick={() => { setTrust((t) => ({ ...t, terms: true })); next(); }} className="text-sm text-muted-foreground">Pular os opcionais</button>
          </div>
        </Section>
      )}

      {step === 6 && (
        <Section title="O teu Trust Score" sub="Quanto mais alto, mais respostas vais ter dos proprietários.">
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="relative grid size-44 place-items-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 276} 276`} className="text-primary transition-all" />
              </svg>
              <div className="text-center">
                <div className="font-num text-5xl font-bold">{score}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">de 100</div>
              </div>
            </div>
            <div className="mt-4"><ScoreBadge score={score} size="md" /></div>
            <p className="mt-6 max-w-xs text-sm text-muted-foreground">
              <Sparkles className="mr-1 inline size-4 text-primary" />
              Boa! Já estás pronto para começar. Podes sempre melhorar o teu score no perfil.
            </p>
            <PrimaryButton onClick={finish} className="mt-8 w-full">
              {role === "landlord" ? "Ir para o dashboard" : "Começar a explorar"}
            </PrimaryButton>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="mt-2">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      {children}
    </div>
  );
}

function RoleCard({ icon, title, sub, active, onClick }: { icon: React.ReactNode; title: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-start gap-4 rounded-2xl border-2 bg-surface p-5 text-left transition",
      active ? "border-primary bg-primary-soft shadow-lift" : "border-border hover:border-foreground/20",
    )}>
      <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-display text-lg font-bold">{title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
      </div>
      {active && <Check className="ml-auto size-5 text-primary" />}
    </button>
  );
}

function PrimaryButton({ children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={cn(
      "h-14 rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground shadow-lift transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
      className,
    )}>{children}</button>
  );
}

// re-export
export { Link };
