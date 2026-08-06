import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ChevronLeft, Search, Home, MapPin, Camera, ImagePlus, Info, Check, Sparkles } from "lucide-react";
import { ScoreBadge } from "@/components/AppShell";
import { getState, trustScore, DOCUMENT_LABELS, type DocumentType } from "@/lib/store";
import { api } from "@/lib/api";
import { setRole as setRoleGlobal } from "@/lib/user-state";
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
  const [trust, setTrust] = useState({ terms: false });
  const [resident, setResident] = useState(true);
  const [docType, setDocType] = useState<DocumentType | null>(null);
  const [hasIncome, setHasIncome] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [docsInOrder, setDocsInOrder] = useState(false);
  const [avatar, setAvatar] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);
  const avatarCamRef = useRef<HTMLInputElement>(null);
  const isLandlord = role === "landlord";

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    // TODO(storage): trocar o object URL pelo URL devolvido por api.uploadPhoto.
    if (avatar) URL.revokeObjectURL(avatar);
    setAvatar(URL.createObjectURL(file));
  };

  /**
   * O que se preenche aqui é guardado de verdade. Antes o onboarding não
   * escrevia nada: a pessoa preenchia tudo e acabava com o perfil vazio.
   * Grava-se a cada passo para não se perder nada se a app fechar a meio.
   */
  const persist = () =>
    api.updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      avatar,
      phone,
      phoneVerified: phone.length >= 9,
      residentInPortugal: resident,
      documentType: docType,
      // Só se guarda o que faz sentido para o papel escolhido.
      hasIncome: isLandlord ? false : hasIncome,
      isStudent: isLandlord ? false : isStudent,
      authorizedToList: isLandlord ? authorized : false,
      propertyDocsInOrder: isLandlord ? docsInOrder : false,
      termsAccepted: trust.terms,
    });

  // O score mostrado é o mesmo que /profile/score calcula — nunca uma fórmula à parte.
  const score = useMemo(
    () => trustScore({ ...getState(), profile: { ...getState().profile, name, bio, phone, phoneVerified: phone.length >= 9, documentType: docType, hasIncome, isStudent, termsAccepted: trust.terms } }),
    [name, bio, phone, docType, hasIncome, isStudent, trust.terms],
  );

  const next = () => { persist(); setStep((s) => Math.min(TOTAL, s + 1)); };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const finish = () => {
    persist();
    if (role) setRoleGlobal(role);
    nav({ to: role === "landlord" ? "/dashboard" : "/explore" });
  };

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
            {/* Escolher o papel é sê-lo já: fixa-se aqui e não no fim, senão
                o resto do onboarding — e o destino final — podiam divergir
                do que a pessoa escolheu. */}
            <RoleCard active={role === "seeker"} onClick={() => { setRole("seeker"); setRoleGlobal("seeker"); setTimeout(next, 250); }}
              icon={<Search className="size-7" />} title="Procuro um sítio"
              sub="Quarto, apartamento ou casa para arrendar ou comprar." />
            <RoleCard active={role === "landlord"} onClick={() => { setRole("landlord"); setRoleGlobal("landlord"); setTimeout(next, 250); }}
              icon={<Home className="size-7" />} title="Tenho um sítio para anunciar"
              sub="Arrenda ou vende, e fala com interessados." />
          </div>
        </Section>
      )}

      {step === 2 && (
        <Section
          title={isLandlord ? "Onde fica o teu espaço?" : "Onde é que procuras?"}
          sub={isLandlord ? "A morada exata só é partilhada depois de aceitares alguém." : "Usamos isto para mostrar imóveis perto de ti."}
        >
          <div className="mt-5 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              {/* TODO(api): autocomplete de localidades + seleção por pin no mapa. */}
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade ou localidade…"
                className="h-14 w-full rounded-md border border-border bg-surface pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>
            <div className="text-center text-xs text-muted-foreground">ou</div>
            <button onClick={() => setCity("Braga")} className="flex h-14 items-center justify-center gap-2 rounded-lg border border-border bg-surface font-semibold">
              <MapPin className="size-5 text-primary" /> Usar a minha localização
            </button>

            {/* Raio é de quem procura; quem anuncia tem uma morada, não um raio. */}
            {city && !isLandlord && (
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
        <Section
          title={isLandlord ? "Como queres aparecer?" : "Apresenta-te"}
          sub={isLandlord
            ? "É isto que os interessados veem antes de te contactarem."
            : "Os proprietários veem isto antes de responder ao teu interesse."}
        >
          <div className="mt-5 flex flex-col gap-4">
            {/* Foto real: anexar da galeria ou tirar na hora. */}
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-surface p-4">
              {avatar ? (
                <img src={avatar} alt="" className="size-16 rounded-pill bg-muted object-cover" />
              ) : (
                <div className="grid size-16 place-items-center rounded-pill bg-muted text-muted-foreground"><Camera className="size-6" /></div>
              )}
              <div className="min-w-0 flex-1 text-left">
                <div className="font-semibold">{avatar ? "Foto adicionada" : "Adicionar foto"}</div>
                <div className={cn("text-xs font-medium", avatar ? "text-success" : "text-muted-foreground")}>
                  {avatar ? "+5 pts garantidos ✓" : "+5 pts ↑"}
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => avatarCamRef.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-border px-3 text-xs font-semibold">
                    <Camera className="size-3.5" /> Tirar
                  </button>
                  <button onClick={() => avatarRef.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-border px-3 text-xs font-semibold">
                    <ImagePlus className="size-3.5" /> Anexar
                  </button>
                  {avatar && (
                    <button onClick={() => { URL.revokeObjectURL(avatar); setAvatar(""); }} className="inline-flex h-9 items-center rounded-pill border border-border px-3 text-xs font-semibold text-muted-foreground">
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={pickAvatar} className="hidden" />
              <input ref={avatarCamRef} type="file" accept="image/*" capture="user" onChange={pickAvatar} className="hidden" />
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={isLandlord ? "Nome ou nome da empresa" : "Nome completo"}
              className="h-14 rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <div>
              <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} placeholder="Escreve algo sobre ti…" rows={4}
                className="w-full resize-none rounded-md border border-border bg-surface p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
              <div className="mt-1 flex justify-between text-xs">
                <span className={cn("font-medium", bio.length >= 50 ? "text-success" : "text-muted-foreground")}>Mínimo 50 caracteres para +5 pts</span>
                <span className="font-num text-muted-foreground">{bio.length}/200</span>
              </div>
            </div>
            {/* Nome e bio chegam. A situação de vida já é declarada no passo
                seguinte (rendimento/estudante), e para quem anuncia não existe
                sequer — pedir duas vezes o mesmo facto é fricção sem retorno. */}
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
        <Section
          title={isLandlord ? "Confiança do teu anúncio" : "Mais sobre ti"}
          sub="Sem enviar documentos. Só declaras o que é verdade."
        >
          <div className="mt-5 flex flex-col gap-5">
            {/* Residência decide que documento faz sentido pedir a seguir. */}
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Vives em Portugal?</div>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setResident(v)}
                    className={cn(
                      "h-11 rounded-xl border text-sm font-semibold transition",
                      resident === v ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface",
                    )}
                  >
                    {v ? "Sim" : "Ainda não"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Que documento tens? <span className="text-success">+10 pts</span>
              </div>
              <div className="flex flex-col gap-2">
                {(Object.keys(DOCUMENT_LABELS) as DocumentType[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDocType(docType === d ? null : d)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                      docType === d ? "border-primary bg-primary-soft" : "border-border bg-surface",
                    )}
                  >
                    <span className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-pill border-2",
                      docType === d ? "border-primary bg-primary text-white" : "border-border",
                    )}>
                      {docType === d && <Check className="size-3" strokeWidth={4} />}
                    </span>
                    <span className="text-sm font-medium">{DOCUMENT_LABELS[d]}</span>
                  </button>
                ))}
              </div>
              {/* Equivalência: qualquer destes documentos implica ter NIF —
                  perguntá-lo à parte seria pedir duas vezes o mesmo facto. */}
              {docType && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  Com {DOCUMENT_LABELS[docType].toLowerCase()} já tens NIF associado — não precisamos de o perguntar.
                </p>
              )}
            </div>

            {/*
              Cada papel declara o que é relevante para o outro lado decidir.
              Quem procura mostra que consegue pagar; quem anuncia mostra que
              tem legitimidade para anunciar. Perguntar rendimento a um
              proprietário não serve ninguém.
            */}
            {isLandlord ? (
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Sobre o que vais anunciar</div>
                <div className="flex flex-col gap-2">
                  <CheckRow
                    label="Sou proprietário ou estou autorizado a anunciar"
                    hint="Proprietário, herdeiro, procurador ou mediador com autorização."
                    bonus="+5 pts"
                    checked={authorized}
                    onChange={setAuthorized}
                  />
                  <CheckRow
                    label="A documentação do imóvel está em ordem"
                    hint="Licença de habitação e certificado energético válidos."
                    checked={docsInOrder}
                    onChange={setDocsInOrder}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">A tua situação</div>
                <div className="flex flex-col gap-2">
                  <CheckRow
                    label="Tenho rendimento próprio"
                    hint="Salário, bolsa, apoio familiar ou trabalho independente."
                    bonus="+5 pts"
                    checked={hasIncome}
                    onChange={setHasIncome}
                  />
                  <CheckRow
                    label="Sou estudante"
                    hint="Podes ser as duas coisas — muitos estudantes têm rendimento."
                    checked={isStudent}
                    onChange={setIsStudent}
                  />
                </div>
              </div>
            )}

            <CheckRow
              label="Li e aceito os Termos de Responsabilidade"
              bonus="+5 pts · obrigatório"
              required
              checked={trust.terms}
              onChange={(v) => setTrust((t) => ({ ...t, terms: v }))}
            />

            <div className="flex flex-col gap-3">
              <PrimaryButton onClick={next} disabled={!trust.terms}>Continuar</PrimaryButton>
              {!trust.terms && (
                <p className="text-center text-xs text-muted-foreground">Aceitar os termos é obrigatório para continuar.</p>
              )}
            </div>
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

/** Declaração independente — nada aqui exclui outra opção. */
function CheckRow({ label, hint, bonus, required, checked, onChange }: {
  label: string; hint?: string; bonus?: string; required?: boolean;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className={cn(
      "flex cursor-pointer items-start gap-3 rounded-xl border bg-surface p-4 transition",
      checked ? "border-primary bg-primary-soft" : "border-border",
    )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 accent-[color:var(--primary)]"
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
        {bonus && <div className={cn("mt-0.5 text-xs font-semibold", required ? "text-warning" : "text-success")}>{bonus}</div>}
      </div>
    </label>
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
