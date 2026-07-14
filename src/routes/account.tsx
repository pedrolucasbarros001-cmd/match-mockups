import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { landlordAccount } from "@/lib/mock-data";
import { Crown, FileText, Receipt } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Conta e Plano — HomeMatch" }] }),
  component: AccountPage,
});

function AccountPage() {
  useRoleGuard("landlord");
  const a = landlordAccount;
  return (
    <AppShell role="landlord">
      <PageHeader title="Conta e plano" back="/profile" />
      <div className="space-y-5 px-4 pt-4">
        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <FileText className="size-4" /> Dados fiscais
          </div>
          <Row label="Nome" value={a.fiscalName} />
          <Row label="NIF" value={a.nif} />
          <Row label="Morada" value={a.address} last />
        </section>

        <section className="rounded-2xl border border-primary/30 bg-primary-soft p-4">
          <div className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-pill bg-primary text-white"><Crown className="size-5" /></div>
            <div className="flex-1">
              <div className="font-display font-bold">Plano {a.plan}</div>
              <div className="text-xs text-muted-foreground">{a.planLimit}</div>
            </div>
          </div>
          <button className="mt-3 h-11 w-full rounded-pill bg-primary font-semibold text-white">Fazer upgrade para Pro</button>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Receipt className="size-4" /> Faturação
          </div>
          <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
            {a.invoices.map((f, i) => (
              <li key={f.id} className={"flex items-center justify-between px-4 py-3 " + (i < a.invoices.length - 1 ? "border-b border-border" : "")}>
                <div>
                  <div className="text-sm font-semibold">{f.label}</div>
                  <div className="font-num text-xs text-muted-foreground">{f.date}</div>
                </div>
                <div className="font-num text-sm font-bold">€{f.amount.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={"flex items-center justify-between py-2.5 " + (last ? "" : "border-b border-border")}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-num text-sm font-semibold">{value}</span>
    </div>
  );
}
