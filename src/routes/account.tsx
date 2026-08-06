import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useRoleGuard } from "@/lib/user-state";
import { AppShell, PageHeader } from "@/components/AppShell";
import {
  useStore, PLANS, activeListingCount, blockersToSwitchPlan,
  type PlanId, type BillingPeriod,
} from "@/lib/store";
import { api } from "@/lib/api";
import { Crown, Check, ExternalLink, ShieldCheck, Info, Zap } from "lucide-react";
import { DowngradeCta } from "@/components/PlanCta";
import { ConfirmByTyping } from "@/components/ConfirmByTyping";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Plano — HomeMatch" }] }),
  component: PlanPage,
});

const euro = (n: number) => `€${n.toFixed(2).replace(".", ",")}`;

function PlanPage() {
  useRoleGuard("landlord");
  const plan = useStore((s) => s.plan);
  const storedPeriod = useStore((s) => s.billingPeriod);
  const active = useStore((s) => activeListingCount(s));
  // Quantos anúncios seria preciso pausar para caber no Free.
  const toPause = useStore((s) => blockersToSwitchPlan("free", s));

  const [period, setPeriod] = useState<BillingPeriod>(storedPeriod);
  const [portalNotice, setPortalNotice] = useState(false);
  const [confirmDowngrade, setConfirmDowngrade] = useState(false);
  const current = PLANS[plan];
  const limit = current.maxActiveListings;

  const proPrice = period === "annual" ? PLANS.pro.annual : PLANS.pro.monthly;
  const proPerMonth = period === "annual" ? PLANS.pro.annual / 12 : PLANS.pro.monthly;
  const annualSaving = PLANS.pro.monthly * 12 - PLANS.pro.annual;

  return (
    <AppShell role="landlord">
      <PageHeader title="Plano" back="/settings" />
      <div className="space-y-5 px-4 pt-4">
        {/* Estado atual — diz o que a pessoa TEM, não o que poderia ter. */}
        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className={cn("grid size-10 place-items-center rounded-pill text-white", plan === "pro" ? "bg-primary" : "bg-muted-foreground")}>
              <Crown className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-bold">Plano {current.name}</div>
              <div className="text-xs text-muted-foreground">
                {limit === null
                  ? `${active} ${active === 1 ? "anúncio ativo" : "anúncios ativos"} · sem limite`
                  : `${active} de ${limit} ${limit === 1 ? "anúncio ativo" : "anúncios ativos"}`}
              </div>
            </div>
            {plan === "pro" && (
              <span className="rounded-pill bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                {storedPeriod === "annual" ? "Anual" : "Mensal"}
              </span>
            )}
          </div>

          {/* Barra de uso só faz sentido quando existe um teto. */}
          {limit !== null && (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-pill bg-muted">
                <div
                  className={cn("h-full rounded-pill transition-all", active >= limit ? "bg-warning" : "bg-primary")}
                  style={{ width: `${Math.min(100, (active / limit) * 100)}%` }}
                />
              </div>
              {active >= limit && (
                <p className="mt-2 text-xs text-warning">
                  Atingiste o limite. Para publicares outro espaço, passa ao Pro ou pausa um anúncio ativo.
                </p>
              )}
            </div>
          )}

          <ul className="mt-3 space-y-1.5 text-xs text-foreground/80">
            {current.features.map((f) => (
              <li key={f} className="flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0 text-success" /> {f}
              </li>
            ))}
          </ul>
        </section>

        {plan === "free" ? (
          <section className="rounded-2xl border border-primary/30 bg-primary-soft p-4">
            <div className="font-display text-base font-bold">Passar ao Pro</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Para quem tem mais do que um espaço em simultâneo.</p>

            {/* Escolha do prazo — o preço mostrado muda com ela, sem letra pequena. */}
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-pill bg-surface/70 p-1">
              {(["monthly", "annual"] as BillingPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "h-9 rounded-pill text-xs font-bold transition",
                    period === p ? "bg-surface text-foreground shadow-card" : "text-muted-foreground",
                  )}
                >
                  {p === "monthly" ? "Mensal" : "Anual"}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-end gap-1.5">
              <span className="font-num text-3xl font-bold">{euro(proPerMonth)}</span>
              <span className="pb-1 text-sm text-muted-foreground">/ mês</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {period === "annual"
                ? `${euro(proPrice)} cobrados uma vez por ano — poupas ${euro(annualSaving)}.`
                : `${euro(proPrice)} por mês. Cancelas quando quiseres.`}
            </p>

            <ul className="mt-3 space-y-1.5 text-xs text-foreground/80">
              {PLANS.pro.features.map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Check className="size-3.5 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>

            {/* TODO(stripe): abre o Checkout; o plano só muda quando o webhook confirmar. */}
            <button
              onClick={() => api.setPlan("pro", period)}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-upgrade font-display font-semibold text-white shadow-lift transition active:scale-[0.98]"
            >
              <Zap className="size-4" fill="currentColor" /> Continuar para pagamento
            </button>
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-surface p-4">
            <div className="font-display text-base font-bold">Gerir subscrição</div>

            {/* Trocar de prazo é uma alteração de subscrição, não um downgrade. */}
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-pill bg-muted p-1">
              {(["monthly", "annual"] as BillingPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => api.setBillingPeriod(p)}
                  className={cn(
                    "h-9 rounded-pill text-xs font-bold transition",
                    storedPeriod === p ? "bg-surface text-foreground shadow-card" : "text-muted-foreground",
                  )}
                >
                  {p === "monthly" ? `Mensal · ${euro(PLANS.pro.monthly)}` : `Anual · ${euro(PLANS.pro.annual)}`}
                </button>
              ))}
            </div>

            {/* Contrapositiva: o botão só existe ativo se o Free comportar o que já está publicado. */}
            {toPause > 0 ? (
              <div className="mt-4">
                <DowngradeCta disabled />
                <p className="mt-2 flex items-start gap-1.5 text-xs text-warning">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  O Free permite {PLANS.free.maxActiveListings} anúncio ativo e tens {active}. Pausa mais{" "}
                  <b>{toPause}</b> {toPause === 1 ? "anúncio" : "anúncios"} em{" "}
                  <Link to="/my-listings" className="underline">Anúncios</Link> para poderes voltar ao Free.
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <DowngradeCta onClick={() => setConfirmDowngrade(true)} />
              </div>
            )}

            {/* Descer de plano perde capacidade — confirma-se por escrito,
                tal como eliminar conta. */}
            {confirmDowngrade && (
              <ConfirmByTyping
                word="VOLTAR"
                title="Voltar ao plano Free"
                body="Passas a poder ter apenas 1 anúncio ativo e perdes o destaque na descoberta. A subscrição é cancelada no fim do período já pago."
                onCancel={() => setConfirmDowngrade(false)}
                onConfirm={() => { api.setPlan("free"); setConfirmDowngrade(false); }}
              />
            )}
          </section>
        )}

        {/* Pagamentos e faturação vivem no Stripe — a app não guarda nada disso. */}
        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
            <div>
              <div className="text-sm font-semibold">Pagamentos e faturas</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                O HomeMatch não guarda dados de pagamento nem dados fiscais. Cartões, faturas e recibos
                são tratados pelo Stripe, e podes consultá-los ou alterá-los no portal seguro deles.
              </p>
              {/* TODO(stripe): abre o Billing Portal com a sessão do cliente.
                  Enquanto não houver ligação, o botão diz que ainda não abre —
                  em vez de parecer avariado. */}
              <button
                onClick={() => setPortalNotice(true)}
                className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold transition active:scale-95"
              >
                Abrir portal de faturação <ExternalLink className="size-3.5" />
              </button>
              {portalNotice && (
                <p className="mt-2 text-xs text-muted-foreground">
                  O portal abre assim que a ligação ao Stripe estiver configurada. Ainda não há
                  pagamentos nem faturas nesta conta.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
