import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useRoleGuard } from "@/lib/user-state";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Plus, Building2, MoreVertical, Pencil, Eye, Pause } from "lucide-react";
import { priceLabel } from "@/lib/mock-data";
import { UpgradeCta } from "@/components/PlanCta";
import { ConfirmByTyping } from "@/components/ConfirmByTyping";
import { useStore, canPublishAnother } from "@/lib/store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-listings/")({
  head: () => ({ meta: [{ title: "Anúncios — HomeMatch" }] }),
  component: MyListings,
});

const LIFE: Record<string, { label: string; cls: string }> = {
  draft: { label: "Rascunho", cls: "bg-muted text-muted-foreground" },
  published: { label: "Publicado", cls: "bg-success/15 text-success" },
  paused: { label: "Pausado", cls: "bg-warning/15 text-warning" },
  negotiating: { label: "Em negociação", cls: "bg-warning/15 text-warning" },
  rented: { label: "Arrendado", cls: "bg-primary/15 text-primary" },
};

function MyListings() {
  useRoleGuard("landlord");
  const listings = useStore((s) => s.listings);
  const matches = useStore((s) => s.matches);
  const allowNewActive = useStore((s) => canPublishAnother(s));
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [deleteFor, setDeleteFor] = useState<string | null>(null);

  // P → Q: reativar só é permitido se o plano ainda tiver margem — o mesmo
  // guard que bloqueia o wizard em /publish, aplicado aqui sem passo manual.
  const reactivate = (id: string) => {
    // O guard continua aqui: reativar é publicar outra vez.
    if (!allowNewActive) return;
    api.updateListing(id, { lifecycle: "published" });
  };

  return (
    <AppShell role="landlord" wide>
      {/* Com o limite atingido o botão deixa de prometer o que não pode dar:
          mostra-se como caminho de upgrade, em verde e com raio. */}
      <PageHeader title="Anúncios" right={
        allowNewActive ? (
          <Link to="/publish" className="inline-flex h-10 items-center gap-1 rounded-pill bg-primary px-3 text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" /> Novo
          </Link>
        ) : (
          <UpgradeCta label="Novo · Pro" compact />
        )
      } />

      {listings.length === 0 ? (
        <div className="flex flex-col gap-3 p-4">
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
              <Building2 className="size-6" />
            </div>
            <h2 className="mt-3 font-display text-base font-bold">Ainda sem anúncios</h2>
            <p className="mt-1 text-xs text-muted-foreground">Cada anúncio representa um espaço (quarto, estúdio, T1…).</p>
            <Link to="/publish" className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-5 font-display font-semibold text-primary-foreground shadow-lift">
              <Plus className="size-4" /> Publicar novo anúncio
            </Link>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 p-4 lg:grid lg:grid-cols-2 lg:content-start">
          {listings.map((l) => {
            const s = LIFE[l.lifecycle] ?? LIFE.published;
            // Só é seguro fechar aqui diretamente se não houver ninguém em negociação —
            // havendo candidato, o fecho tem de passar pelo wizard (senão o seeker
            // nunca é avisado e a dupla confirmação fica por fazer).
            const hasActiveMatch = matches.some(
              (m) => m.listingId === l.id && !["closed", "rental_confirmed"].includes(m.state),
            );
            return (
              <li key={l.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="flex gap-3 p-3">
                  <img src={l.photos[0]} className="size-20 shrink-0 rounded-xl object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link to="/explore/$id" params={{ id: l.id }} className="min-w-0 flex-1">
                        <div className="truncate font-display text-base font-bold">{l.title}</div>
                        <div className="font-num text-sm text-muted-foreground">{priceLabel(l)} · {l.city}</div>
                      </Link>
                      <button
                        onClick={() => setMenuFor(menuFor === l.id ? null : l.id)}
                        aria-label={`Ações de ${l.title}`}
                        className="grid size-8 shrink-0 place-items-center rounded-pill text-muted-foreground transition hover:bg-muted"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={cn("rounded-pill px-2 py-0.5 text-[11px] font-bold", s.cls)}>
                        {/* "Arrendado" num anúncio de venda seria factualmente errado. */}
                        {l.lifecycle === "rented" && l.kind === "sale" ? "Vendido" : s.label}
                      </span>
                      <span className="font-num text-[11px] text-muted-foreground">Qualidade {l.qualityScore}/100</span>
                    </div>
                  </div>
                </div>
                <div className="flex divide-x divide-border border-t border-border text-xs font-semibold">
                  <Link to="/candidates" className="flex-1 py-2.5 text-center text-primary">Candidatos</Link>
                  {l.lifecycle === "draft" ? (
                    <Link to="/publish" className="flex-1 py-2.5 text-center text-primary">Continuar anúncio</Link>
                  ) : l.lifecycle === "rented" || l.lifecycle === "paused" ? (
                    <button onClick={() => reactivate(l.id)} className="flex-1 py-2.5 text-center text-primary">Reativar</button>
                  ) : hasActiveMatch ? (
                    <Link to="/matches" className="flex-1 py-2.5 text-center text-muted-foreground">Fechar pela conversa</Link>
                  ) : (
                    <button
                      onClick={() => api.updateListing(l.id, { lifecycle: "rented" })}
                      className="flex-1 py-2.5 text-center text-muted-foreground"
                    >{l.kind === "sale" ? "Marcar vendido" : "Marcar arrendado"}</button>
                  )}
                  <button
                    onClick={() => setDeleteFor(l.id)}
                    className="flex-1 py-2.5 text-center text-danger"
                  >Apagar</button>
                </div>

                {/* Menu de ações — as mesmas do rodapé mais a edição, para não
                    haver duas listas de ações que possam discordar. */}
                {menuFor === l.id && (
                  <div className="border-t border-border bg-muted/40 p-2">
                    <Link
                      to="/my-listings/$id/edit"
                      params={{ id: l.id }}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-surface"
                    >
                      <Pencil className="size-4 text-muted-foreground" /> Editar anúncio
                    </Link>
                    <Link
                      to="/explore/$id"
                      params={{ id: l.id }}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-surface"
                    >
                      <Eye className="size-4 text-muted-foreground" /> Ver como quem procura
                    </Link>
                    {l.lifecycle === "published" && (
                      <button
                        onClick={() => { api.updateListing(l.id, { lifecycle: "paused" }); setMenuFor(null); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-surface"
                      >
                        <Pause className="size-4 text-muted-foreground" /> Pausar (sai da descoberta)
                      </button>
                    )}
                  </div>
                )}

                {/* Apagar é irreversível: confirma-se por escrito, e o aviso
                    muda se houver gente a meio de uma negociação. */}
                {deleteFor === l.id && (
                  <div className="border-t border-border p-3">
                    <ConfirmByTyping
                      word="APAGAR"
                      title={`Apagar "${l.title}"`}
                      body={hasActiveMatch
                        ? "Há candidatos com negociação a decorrer neste anúncio. Apagar remove o anúncio, as conversas associadas e o histórico — sem forma de recuperar."
                        : "O anúncio, as suas fotos e o histórico são removidos. Não há forma de recuperar."}
                      confirmLabel="Apagar"
                      onCancel={() => setDeleteFor(null)}
                      onConfirm={() => { api.deleteListing(l.id); setDeleteFor(null); }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
