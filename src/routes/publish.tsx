import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/user-state";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { PhotoSlotPicker, type SlotPhoto } from "@/components/PhotoSlotPicker";
import { ChevronLeft, ChevronRight, Camera, Check, Info, Crown, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpaceType, Listing, ListingKind } from "@/lib/mock-data";
import { priceAmount, priceLabel, priceRange } from "@/lib/mock-data";
import {
  spaceTypesFor, SPACE_TYPE_DESC, isSpaceTypeAllowed, isRoomType,
  photoPlanFor, missingEssentialPhotos, analyseListing, hasBlockingWarning,
  type ListingWarning,
} from "@/lib/listing-rules";
import { api } from "@/lib/api";
import { useStore, canPublishAnother, qualityScore, trustScore, type Profile } from "@/lib/store";

export const Route = createFileRoute("/publish")({
  head: () => ({ meta: [{ title: "Publicar — HomeMatch" }] }),
  component: PublishWizard,
});

/**
 * Passos derivados do tipo de negócio: escolher "Venda" já implica que não há
 * regras de convivência nem data de mudança — não se pergunta o que a escolha
 * anterior já respondeu. A barra de progresso e a navegação leem daqui, por
 * isso nunca podem discordar do que está realmente a ser mostrado.
 */
type StepKey = "kind" | "type" | "place" | "about" | "photos" | "price" | "rules" | "availability" | "review";

function stepsFor(kind: ListingKind | null): { key: StepKey; label: string }[] {
  const base: { key: StepKey; label: string }[] = [
    { key: "kind", label: "Negócio" },
    { key: "type", label: "Tipo" },
    { key: "place", label: "Localização" },
    { key: "about", label: "Características" },
    { key: "photos", label: "Fotos" },
    { key: "price", label: "Preço" },
  ];
  if (kind !== "sale") base.push({ key: "rules", label: "Regras" });
  base.push({ key: "availability", label: kind === "sale" ? "Visitas" : "Disponibilidade" });
  base.push({ key: "review", label: "Rever" });
  return base;
}

/** Comodidades que fazem sentido em cada negócio — quem compra não procura "mobilado". */
const AMENITIES_RENT = ["Wi-Fi", "Cozinha equipada", "Aquecimento", "Mobilado", "Varanda", "Elevador", "Lavandaria"];
const AMENITIES_SALE = ["Garagem", "Elevador", "Varanda", "Terraço", "Aquecimento central", "Ar condicionado", "Arrecadação"];

function PublishWizard() {
  useRoleGuard("landlord");
  const nav = useNavigate();
  const profile = useStore((s) => s.profile);
  const allowed = useStore((s) => canPublishAnother(s));

  // Limite de plano verificado ANTES do wizard — não deixa preencher para depois bloquear.
  if (!allowed) return <PlanBlockScreen />;

  return <WizardInner nav={nav} profile={profile} />;
}

function PlanBlockScreen() {
  return (
    <div className="mx-auto grid min-h-svh w-full max-w-[440px] place-items-center bg-background p-8 text-center">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-pill bg-warning/15 text-warning">
          <Crown className="size-8" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Atingiste o limite do plano Free</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O plano Free permite <b>1 anúncio ativo</b>. Para publicares mais espaços em simultâneo, passa ao Pro — ou arquiva um anúncio ativo primeiro.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/account" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift">
            <Crown className="size-4" /> Conhecer o Pro
          </Link>
          <Link to="/my-listings" className="inline-flex h-12 items-center justify-center rounded-lg border border-border text-sm font-semibold">
            Gerir os meus anúncios
          </Link>
        </div>
      </div>
    </div>
  );
}

function WizardInner({ nav, profile }: { nav: ReturnType<typeof useNavigate>; profile: Profile }) {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<ListingKind | null>(null);
  const [type, setType] = useState<SpaceType | null>(null);
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [price, setPrice] = useState(450);
  const [pets, setPets] = useState(false);
  const [smoke, setSmoke] = useState(false);
  const [students, setStudents] = useState(true);
  const [moveIn, setMoveIn] = useState("");
  const [visitSlots, setVisitSlots] = useState<string[]>([]);
  /** Fotos reais, por slot. O upload para storage entra em api.uploadPhoto. */
  const [slotPhotos, setSlotPhotos] = useState<SlotPhoto[]>([]);
  const photos = slotPhotos.map((p) => p.key);

  const addPhoto = (key: string, file: File) =>
    setSlotPhotos((prev) => {
      // Substituir liberta o object URL antigo para não deixar memória presa.
      const old = prev.find((p) => p.key === key);
      if (old) URL.revokeObjectURL(old.url);
      return [...prev.filter((p) => p.key !== key), { key, url: URL.createObjectURL(file), file }];
    });

  const removePhoto = (key: string) =>
    setSlotPhotos((prev) => {
      const old = prev.find((p) => p.key === key);
      if (old) URL.revokeObjectURL(old.url);
      return prev.filter((p) => p.key !== key);
    });

  const clearPhotos = () =>
    setSlotPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });

  /**
   * Trocar de negócio pode invalidar o tipo escolhido (ninguém vende um quarto).
   * Em vez de deixar o wizard num estado impossível, limpa a escolha — e o
   * mesmo para as comodidades, que também mudam de lista.
   */
  const pickKind = (k: ListingKind) => {
    setKind(k);
    setPrice(k === "sale" ? 180_000 : 450);
    if (type && !isSpaceTypeAllowed(k, type)) setType(null);
    setAmenities([]);
    clearPhotos();
    setTimeout(() => setStep(1), 250);
  };

  /** Mudar de tipo muda o plano de fotos — as que já lá estavam deixam de fazer sentido. */
  const pickType = (t: SpaceType) => {
    if (t !== type) clearPhotos();
    setType(t);
  };

  const sale = kind === "sale";
  const STEPS = stepsFor(kind);
  const stepKey = STEPS[step]?.key ?? "kind";
  const range = priceRange(kind ?? "rent");

  // Tipos, comodidades e plano de fotos vêm todos do tipo de negócio/espaço —
  // o ecrã nunca oferece uma opção que as regras não permitam.
  const typeOptions = spaceTypesFor(kind ?? "rent");
  const amenityOptions = sale ? AMENITIES_SALE : AMENITIES_RENT;
  const photoPlan = photoPlanFor(type);
  const missingPhotos = missingEssentialPhotos(type, photos);

  // Análise em tempo real: burla, incoerências e contactos diretos.
  const warnings = analyseListing({ title, description: desc, price, kind: kind ?? "rent", spaceType: type });
  const blocked = hasBlockingWarning(warnings);

  /**
   * Contrapositiva: em vez de um booleano, devolve a RAZÃO por que não se pode
   * avançar. O botão fica ativo se e só se isto for null e mostra este texto
   * quando está bloqueado — uma só função decide as duas coisas, portanto o
   * utilizador nunca vê um botão cinzento sem saber porquê.
   */
  const blockedBecause: string | null = (() => {
    switch (stepKey) {
      case "kind":
        return kind ? null : "Escolhe se queres arrendar ou vender.";
      case "type":
        return type ? null : "Escolhe o tipo de espaço.";
      case "place":
        return city.trim().length > 1 ? null : "Indica a cidade.";
      case "about":
        if (title.trim().length <= 3) return "Dá um título ao anúncio (mín. 4 caracteres).";
        // Só o que é ilegal ou destrói confiança impede avançar. O resto avisa.
        return blocked ? "Corrige o que está assinalado a vermelho para continuar." : null;
      case "price":
        return price >= range.min ? null : `Define um valor a partir de ${priceAmount(range.min)}.`;
      case "availability":
        return visitSlots.length > 0 ? null : "Escolhe pelo menos um horário para visitas.";
      case "review":
        return blocked ? "Há avisos por resolver no passo das características." : null;
      default:
        return null;
    }
  })();

  // Quality Score calculado dos campos reais (qualityScore em store.ts)
  const quality = qualityScore({
    kind: kind ?? "rent",
    spaceType: type ?? undefined,
    city,
    neighborhood,
    title,
    description: desc,
    amenities,
    price,
    moveInFrom: moveIn,
    visitAvailability: visitSlots,
  });

  /** Capacidade implícita no tipo de espaço — não se pergunta o que já se sabe. */
  const capacityFor = (t: SpaceType | null): number =>
    t === "Moradia" ? 6 : t === "T4+" ? 6 : t === "T3" ? 5 : t === "T2" ? 4 : t === "T1" || t === "Estúdio" ? 2 : 1;

  const publish = async () => {
    const listing: Omit<Listing, "id"> = {
      title: title || `${type} em ${city || "—"}`,
      kind: kind ?? "rent",
      price,
      city,
      neighborhood,
      distanceM: 0,
      type: type === "T1" || type === "T2" || type === "T3" || type === "T4+" || type === "Estúdio" ? "Apartamento" : "Quarto",
      spaceType: type ?? "Quarto",
      lifecycle: "published",
      qualityScore: Math.min(100, quality),
      pets,
      smoke,
      availableFrom: sale ? "Imediato" : moveIn || "Imediato",
      // Data de mudança e prazo mínimo não existem numa venda.
      moveInFrom: sale ? "" : moveIn,
      visitAvailability: visitSlots,
      minMonths: sale ? 0 : 6,
      capacity: capacityFor(type),
      description: desc,
      amenities,
      rules: sale
        ? "Escritura e condições a combinar entre as partes."
        : `${students ? "Aceita estudantes. " : ""}${pets ? "Aceita animais. " : "Sem animais. "}${smoke ? "Fumadores ok." : "Sem fumo."}`,
      // Ordem do plano de fotos, não a ordem em que foram anexadas — a primeira
      // é sempre a divisão principal, que é a que aparece no card do feed.
      // TODO(storage): substituir os object URLs pelos URLs devolvidos pelo upload.
      photos: photoPlan
        .map((s) => slotPhotos.find((p) => p.key === s.key)?.url)
        .filter((u): u is string => !!u),
      owner: {
        name: profile.name || "O meu anúncio",
        avatar: profile.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(profile.name || "Eu"),
        score: trustScore(),
        responds: "Responde em breve",
        rating: 0,
        reviews: 0,
      },
    };
    await api.createListing(listing);
    nav({ to: "/my-listings" });
  };

  const next = () => (step === STEPS.length - 1 ? publish() : setStep((s) => s + 1));
  const prev = () => (step === 0 ? nav({ to: "/my-listings" }) : setStep((s) => s - 1));

  const toggleAmenity = (a: string) => setAmenities(amenities.includes(a) ? amenities.filter((x) => x !== a) : [...amenities, a]);

  return (
    <PageShell width="list" className="flex flex-col">
      <PageHeader title={`Publicar · ${STEPS[step]?.label ?? ""}`} back="/my-listings" />
      <div className="px-4 pt-3">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s.key} className={cn("h-1.5 flex-1 rounded-pill", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">Passo {step + 1} de {STEPS.length}</div>
      </div>

      <div className="flex-1 px-5 pt-6 pb-24">
        {stepKey === "kind" && (
          <Step title="O que queres fazer com este espaço?" sub="Isto define o resto do anúncio.">
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => pickKind("rent")}
                className={cn("rounded-2xl border-2 bg-surface p-4 text-left transition", kind === "rent" ? "border-primary bg-primary-soft" : "border-border")}
              >
                <div className="font-display text-base font-bold">Arrendar</div>
                <div className="mt-1 text-xs leading-snug text-muted-foreground">Renda mensal, com regras de convivência e data de entrada. Podes anunciar a casa inteira ou só um quarto.</div>
              </button>
              <button
                onClick={() => pickKind("sale")}
                className={cn("rounded-2xl border-2 bg-surface p-4 text-left transition", kind === "sale" ? "border-primary bg-primary-soft" : "border-border")}
              >
                <div className="font-display text-base font-bold">Vender</div>
                <div className="mt-1 text-xs leading-snug text-muted-foreground">Valor total pedido. Só unidades autónomas — um quarto de uma casa não se vende.</div>
              </button>
            </div>
            <Tip>O HomeMatch liga-te a interessados e regista o que combinarem. A escritura e o contrato são tratados entre as partes, fora da app.</Tip>
          </Step>
        )}

        {stepKey === "type" && (
          <Step
            title="Que tipo de espaço estás a anunciar?"
            sub={sale
              ? "Só unidades autónomas — o que se vende tem de ser independente."
              : "Um anúncio representa exatamente um espaço."}
          >
            <div className="grid grid-cols-2 gap-2.5">
              {typeOptions.map((t) => (
                <button key={t} onClick={() => pickType(t)} className={cn(
                  "rounded-2xl border-2 bg-surface p-4 text-left transition",
                  type === t ? "border-primary bg-primary-soft" : "border-border",
                )}>
                  <div className="font-display text-base font-bold">{t}</div>
                  <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{SPACE_TYPE_DESC[t]}</div>
                </button>
              ))}
            </div>
            {!sale && type && !isRoomType(type) && type !== "Estúdio" && (
              <Tip>Escolhe {type} apenas se arrendas o espaço inteiro. Para arrendar só um quarto dessa casa, volta atrás e escolhe <b>Quarto</b>.</Tip>
            )}
            {sale && (
              <Tip>Para vender um quarto isolado não há anúncio possível — o que se vende é sempre a fração ou a casa completa.</Tip>
            )}
          </Step>
        )}

        {stepKey === "place" && (
          <Step title="Onde fica?" sub="A morada exata só é partilhada quando aceitares alguém.">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade"
              className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro / referência" className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
            <input placeholder="Rua e número (privado)" className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
          </Step>
        )}

        {stepKey === "about" && (
          <Step title="Conta um pouco sobre o sítio">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do anúncio"
              className="h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (mín. 50 caracteres)" rows={6}
              className="w-full resize-none rounded-md border border-border bg-surface p-4 outline-none focus:border-primary" />
            <div className="text-xs text-muted-foreground">{desc.length} caracteres · sugerido &gt; 50</div>

            {/* Análise em tempo real: burla, discriminação, contactos, incoerências. */}
            <WarningList warnings={warnings} />

            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {sale ? "O que o imóvel tem" : "O que está incluído"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {amenityOptions.map((a) => (
                  <button key={a} onClick={() => toggleAmenity(a)} className={cn(
                    "rounded-pill border px-3 py-2 text-center text-xs font-medium transition",
                    amenities.includes(a) ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface",
                  )}>{a}</button>
                ))}
              </div>
            </div>
          </Step>
        )}

        {stepKey === "photos" && (
          <Step
            title="Fotos"
            sub={
              type
                ? isRoomType(type)
                  ? "Mostra o espaço que arrendas e as áreas que vão ser usadas — é o que evita visitas desperdiçadas."
                  : "Uma foto por divisão principal. Podes publicar sem todas."
                : "Escolhe primeiro o tipo de espaço."
            }
          >
            {/* Slots derivados do tipo: um quarto pede quarto+cozinha+wc, uma
                suite pede a casa de banho privativa, um T2 pede sala e quartos.
                Nenhum é obrigatório — as essenciais só avisam. */}
            <PhotoSlotPicker slots={photoPlan} photos={slotPhotos} onAdd={addPhoto} onRemove={removePhoto} />

            {/* Contrapositiva suave: diz o que falta, mas nunca tranca o passo. */}
            {missingPhotos.length > 0 ? (
              <Warn>
                Faltam fotos de <b>{missingPhotos.map((s) => s.label.toLowerCase()).join(", ")}</b>. Podes publicar
                à mesma — mas anúncios sem estas recebem menos contactos e geram visitas que não avançam.
              </Warn>
            ) : (
              photoPlan.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-success/30 bg-success/5 p-3 text-xs">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} />
                  <div className="text-foreground/85">Tens todas as fotos essenciais. Quem procura consegue decidir sem ter de perguntar.</div>
                </div>
              )
            )}
            <Tip>As fotos ficam no teu dispositivo enquanto o storage não estiver ligado — ao publicares, o anúncio usa-as tal como as anexaste nesta sessão.</Tip>
          </Step>
        )}

        {stepKey === "price" && (
          <Step title={sale ? "Por quanto vendes?" : "Quanto custa?"}>
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <div className="font-num text-5xl font-bold text-primary">{priceAmount(price)}</div>
              <div className="text-sm text-muted-foreground">{sale ? "valor pedido" : "por mês"}</div>
              <input
                type="range"
                min={range.min}
                max={range.max}
                step={range.step}
                value={price}
                onChange={(e) => setPrice(+e.target.value)}
                className="mt-5 w-full accent-[color:var(--primary)]"
              />
            </div>
            {/* Despesas e caução são conceitos de arrendamento — numa venda nem aparecem. */}
            {!sale && (
              <>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[color:var(--primary)]" /> Despesas incluídas</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[color:var(--primary)]" /> Caução exigida</label>
              </>
            )}
            {sale && <Tip>Valor indicativo para atrair interessados. A negociação acontece na conversa, entre as partes.</Tip>}
          </Step>
        )}

        {stepKey === "rules" && (
          <Step title="Regras do espaço" sub="Regras aplicam-se ao anúncio, não a ti como pessoa.">
            <Toggle label="Aceita animais" v={pets} on={setPets} />
            <Toggle label="Pode fumar" v={smoke} on={setSmoke} />
            <Toggle label="Aceita estudantes" v={students} on={setStudents} />
          </Step>
        )}

        {stepKey === "availability" && (
          <Step
            title={sale ? "Quando podes mostrar?" : "Disponibilidade"}
            sub={sale ? "Horários em que aceitas receber visitas." : "Visitas e mudança são coisas separadas."}
          >
            {/* Data de mudança só existe no arrendamento. */}
            {!sale && (
              <Field label="Disponível para mudar em">
                <input value={moveIn} onChange={(e) => setMoveIn(e.target.value)} placeholder="ex. 1 Set 2026"
                  className="h-12 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary" />
              </Field>
            )}
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

        {stepKey === "review" && (
          <Step title="Rever e publicar">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <div className="font-display text-lg font-bold">{title || "Anúncio sem título"}</div>
                <span className="rounded-pill bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">{sale ? "Venda" : "Arrendar"}</span>
              </div>
              <div className="font-num text-sm text-muted-foreground">
                {priceLabel({ kind: kind ?? "rent", price })} · {city || "—"} · {type ?? "—"}
              </div>
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

      <div className="sticky bottom-0 border-t border-border bg-surface px-4 py-3 pb-safe">
        {/* Contrapositiva visível: se o botão está bloqueado, diz-se porquê. */}
        {blockedBecause && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="size-3.5 shrink-0" /> {blockedBecause}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={prev} className="grid size-12 place-items-center rounded-lg border border-border" aria-label="Voltar">
            <ChevronLeft className="size-5" />
          </button>
          <button onClick={next} disabled={!!blockedBecause} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift disabled:opacity-50">
            {step === STEPS.length - 1 ? (<><Check className="size-5" /> Publicar</>) : (<>Continuar <ChevronRight className="size-5" /></>)}
          </button>
        </div>
      </div>
    </PageShell>
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

/**
 * Avisos com dois pesos visuais distintos: vermelho impede publicar (ilegal ou
 * burla), âmbar apenas alerta. A cor diz o peso sem ser preciso ler — e é a
 * mesma informação que o botão de continuar usa para se bloquear.
 */
function WarningList({ warnings }: { warnings: ListingWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {warnings.map((w) => {
        const block = w.level === "block";
        return (
          <div
            key={w.id}
            className={cn(
              "flex items-start gap-2 rounded-xl border p-3 text-xs",
              block ? "border-danger/40 bg-danger/8" : "border-warning/40 bg-warning/10",
            )}
          >
            {block ? (
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            )}
            <div>
              <div className={cn("font-bold", block ? "text-danger" : "text-warning")}>{w.title}</div>
              <div className="mt-0.5 text-foreground/85">{w.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
      <div className="text-foreground/85">{children}</div>
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
