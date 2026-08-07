import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageShell } from "@/components/AppShell";
import { useRoleGuard } from "@/lib/user-state";
import { useStore, store } from "@/lib/store";
import type { CloseReason } from "@/lib/mock-data";
import { priceAmount } from "@/lib/mock-data";
import { Home, Link2, Pause, PenLine, Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rental-close/$chatId")({
  head: () => ({ meta: [{ title: "Fechar espaço — HomeMatch" }] }),
  component: RentalCloseWizard,
});

const DURATIONS: { label: string; months: number | null }[] = [
  { label: "3 meses", months: 3 },
  { label: "6 meses", months: 6 },
  { label: "12 meses", months: 12 },
  { label: "18 meses", months: 18 },
  { label: "24 meses", months: 24 },
  { label: "Sem prazo", months: null },
];

function RentalCloseWizard() {
  useRoleGuard("landlord");
  const { chatId } = useParams({ from: "/rental-close/$chatId" });
  const nav = useNavigate();
  const chat = useStore((s) => s.chats.find((c) => c.id === chatId));
  const match = useStore((s) => (chat ? s.matches.find((m) => m.chatId === chat.id) : undefined));
  const listing = useStore((s) => (chat ? s.listings.find((l) => l.id === chat.listingId) : undefined));

  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<CloseReason | null>(null);
  const [moveIn, setMoveIn] = useState("");
  const [months, setMonths] = useState<number | null>(12);
  const [amount, setAmount] = useState(listing?.price ?? 0);
  const [done, setDone] = useState(false);

  if (!chat || !match || !listing) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Conversa não encontrada.</div>;
  }

  // O tipo de negócio vem do anúncio — nunca se volta a perguntar.
  const sale = listing.kind === "sale";
  // Numa venda não há prazo de contrato: o passo da duração desaparece.
  const TOTAL_STEPS = sale ? 2 : 3;

  const pickReason = (r: CloseReason) => {
    setReason(r);
    if (r === "paused" || r === "rework") {
      // Fecha direto, sem os passos seguintes.
      store.closeListing(match.id, r);
      setDone(true);
    } else {
      // Auto-avança 300ms depois da seleção.
      setTimeout(() => setStep(1), 300);
    }
  };

  const confirm = () => {
    if (!reason) return;
    store.closeListing(match.id, reason, { moveIn, months: sale ? null : months, amount });
    if (reason === "homematch") {
      store.sendMessage(
        chat.id,
        sale
          ? "O proprietário registou a proposta aceite. Falta a tua confirmação ✅"
          : "O senhorio confirmou o arrendamento. Falta a tua confirmação ✅",
        "them",
      );
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto grid min-h-svh w-full max-w-[440px] place-items-center bg-background p-8 text-center">
        <div>
          <div className="mx-auto grid size-16 place-items-center rounded-pill bg-success/15 text-success">
            <Check className="size-8" strokeWidth={3} />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold">
            {reason === "homematch"
              ? "Confirmação enviada"
              : reason === "outside"
                ? "Anúncio fechado"
                : reason === "paused"
                  ? "Anúncio pausado"
                  : "Anúncio voltou a rascunho"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {reason === "homematch"
              ? `${sale ? "O comprador" : "O candidato"} vai receber um pedido de confirmação. Só fecha quando ambos confirmarem.`
              : "Podes reativar ou editar o anúncio em Meus anúncios."}
          </p>
          <button onClick={() => nav({ to: "/my-listings" })} className="mt-6 h-12 rounded-lg bg-primary px-6 font-display font-semibold text-primary-foreground shadow-lift">
            Ir para os meus anúncios
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageShell width="list" className="flex flex-col">
      <PageHeader title={sale ? "Registar proposta" : "Fechar este espaço"} back={`/chats/${chatId}`} />
      <div className="px-4 pt-3">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-pill", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">Passo {step + 1} de {TOTAL_STEPS}</div>
      </div>

      <div className="flex-1 px-5 pt-6 pb-24">
        {step === 0 && (
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">O que aconteceu com "{listing.title}"?</h1>
            <div className="mt-5 flex flex-col gap-2.5">
              <ReasonCard
                icon={<Home className="size-5" />}
                title={sale ? "Vendi — comprador veio daqui" : "Arrendei — veio daqui"}
                sub={sale ? "O comprador veio do HomeMatch. Regista a proposta aceite." : "O inquilino veio do HomeMatch. Cria o arrendamento associado."}
                active={reason === "homematch"}
                onClick={() => pickReason("homematch")}
              />
              <ReasonCard
                icon={<Link2 className="size-5" />}
                title={sale ? "Vendi — veio doutra forma" : "Arrendei — veio doutra forma"}
                sub={sale ? "Vendeste fora do app. Fecha sem associar interessado." : "Arrendaste fora do app. Fecha sem associar candidato."}
                active={reason === "outside"}
                onClick={() => pickReason("outside")}
              />
              <ReasonCard icon={<Pause className="size-5" />} title="Pausar por agora" sub="O anúncio sai da descoberta mas mantém tudo." active={reason === "paused"} onClick={() => pickReason("paused")} />
              <ReasonCard icon={<PenLine className="size-5" />} title="Vou reformular" sub="Volta a rascunho para editares com calma." active={reason === "rework"} onClick={() => pickReason("rework")} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">
              {sale ? "Qual foi o valor acordado?" : "Quando entra o inquilino?"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {sale
                ? "Valor da proposta aceite. O HomeMatch só regista o que declaram — a escritura é tratada entre as partes."
                : "Data de entrada acordada."}
            </p>
            {sale ? (
              <>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value)}
                  className="mt-5 h-14 w-full rounded-md border border-border bg-surface px-4 font-num text-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <div className="mt-2 text-xs text-muted-foreground">Pedido no anúncio: {priceAmount(listing.price)}</div>
                <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Data prevista de escritura (opcional)</label>
                <input
                  type="date"
                  value={moveIn}
                  onChange={(e) => setMoveIn(e.target.value)}
                  className="mt-2 h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary"
                />
              </>
            ) : (
              <input
                type="date"
                value={moveIn}
                onChange={(e) => setMoveIn(e.target.value)}
                className="mt-5 h-14 w-full rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            )}
            {/* Numa venda este é o último passo: confirma já em vez de pedir duração. */}
            <button
              onClick={() => (sale ? confirm() : setStep(2))}
              disabled={sale ? amount < 1 : !moveIn}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift disabled:opacity-50"
            >
              {sale ? (<><Check className="size-5" /> Confirmar proposta</>) : "Seguinte"}
            </button>
          </div>
        )}

        {step === 2 && !sale && (
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">Duração e renda</h1>
            <div className="mt-5">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Duração do contrato</div>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setMonths(d.months)}
                    className={cn(
                      "h-10 rounded-pill border px-4 text-sm font-semibold transition",
                      months === d.months ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Renda mensal (€)</div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                className="h-14 w-full rounded-md border border-border bg-surface px-4 font-num text-lg outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">Pré-preenchido com o valor do anúncio. Podes ajustar.</p>
            </div>
            <button
              onClick={confirm}
              disabled={amount < 1}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-success font-display font-semibold text-white shadow-lift disabled:opacity-50"
            >
              <Check className="size-5" /> Confirmar arrendamento
            </button>
          </div>
        )}
      </div>

      {step > 0 && (
        <div className="sticky bottom-0 border-t border-border bg-surface px-4 py-3 pb-safe">
          <button onClick={() => setStep((s) => s - 1)} className="inline-flex h-11 items-center gap-1 rounded-lg border border-border px-4 text-sm font-semibold">
            <ChevronLeft className="size-4" /> Voltar
          </button>
        </div>
      )}
    </PageShell>
  );
}

function ReasonCard({ icon, title, sub, active, onClick }: {
  icon: React.ReactNode; title: string; sub: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 bg-surface p-4 text-left transition",
        active ? "border-primary bg-primary-soft" : "border-border",
      )}
    >
      <span className={cn("mt-0.5 grid size-10 shrink-0 place-items-center rounded-pill", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        {icon}
      </span>
      <span>
        <span className="block font-display text-base font-bold">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{sub}</span>
      </span>
    </button>
  );
}
