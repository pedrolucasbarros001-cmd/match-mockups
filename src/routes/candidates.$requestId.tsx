import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader, ScoreBadge } from "@/components/AppShell";
import { priceLabel } from "@/lib/mock-data";
import { useStore, store } from "@/lib/store";
import { Check, X, Phone, Mail, Shield, User } from "lucide-react";

export const Route = createFileRoute("/candidates/$requestId")({
  head: () => ({ meta: [{ title: "Candidato — HomeMatch" }] }),
  component: CandidateDetail,
});

function CandidateDetail() {
  const { requestId } = useParams({ from: "/candidates/$requestId" });
  const nav = useNavigate();
  const match = useStore((s) => s.matches.find((m) => m.id === requestId));
  const listing = useStore((s) => (match ? s.listings.find((l) => l.id === match.listingId) : undefined));
  // Fatia crua + useMemo: um selector que filtra devolve array novo a cada
  // chamada e faz o useSyncExternalStore entrar em ciclo.
  const allMatches = useStore((s) => s.matches);
  const otherMatches = useMemo(
    () =>
      match?.candidate
        ? allMatches.filter((m) => m.id !== match.id && m.candidate?.name === match.candidate?.name && m.state === "interested")
        : [],
    [allMatches, match],
  );
  const listings = useStore((s) => s.listings);

  if (!match || !listing) {
    return (
      <div className="mx-auto grid min-h-svh w-full max-w-[440px] place-items-center bg-background p-8 text-center">
        <div>
          <h2 className="font-display text-lg font-bold">Candidato não encontrado</h2>
          <Link to="/candidates" className="mt-4 inline-flex h-11 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground">Voltar aos candidatos</Link>
        </div>
      </div>
    );
  }

  const c = match.candidate;
  const pending = match.state === "interested";

  const accept = (m = match) => {
    store.setMatchState(m.id, "conversation");
    nav({ to: "/chats/$id", params: { id: m.chatId } });
  };
  const ignore = (m = match) => {
    store.setMatchState(m.id, "closed");
    if (m.id === match.id) nav({ to: "/candidates" });
  };

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-32">
      <PageHeader title="Perfil do candidato" back="/candidates" />
      <div className="px-5 pt-6">
        <div className="flex flex-col items-center text-center">
          {c?.avatar ? (
            <img src={c.avatar} className="size-24 rounded-pill object-cover" alt="" />
          ) : (
            <div className="grid size-24 place-items-center rounded-pill bg-muted text-muted-foreground"><User className="size-10" /></div>
          )}
          <h2 className="mt-3 font-display text-xl font-bold">{c?.name ?? "Candidato"}</h2>
          {(c?.occupation || c?.city) && (
            <div className="mt-1 text-sm text-muted-foreground">{[c?.occupation, c?.city].filter(Boolean).join(" · ")}</div>
          )}
          <div className="mt-3"><ScoreBadge score={c?.score ?? 0} size="md" /></div>
        </div>

        {c?.bio && (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
            <h3 className="mb-2 font-display text-sm font-bold">Sobre</h3>
            <p className="text-sm text-foreground/90">{c.bio}</p>
          </div>
        )}

        {/* Mostra só o que o candidato TEM — nunca o que falta. */}
        {c && c.verifications.some((v) => v.ok) && (
          <div className="mt-3 rounded-2xl border border-border bg-surface p-4">
            <h3 className="mb-3 font-display text-sm font-bold">Verificações</h3>
            <ul className="space-y-2 text-sm">
              {c.verifications.filter((v) => v.ok).map((v) => (
                <li key={v.label} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-pill bg-success/15 text-success">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span>{v.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.message && (
          <div className="mt-3 rounded-2xl border border-border bg-surface p-4">
            <h3 className="mb-2 font-display text-sm font-bold">Mensagem</h3>
            <p className="text-sm italic text-foreground/90">"{match.message}"</p>
          </div>
        )}

        <div className="mt-3 rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-2 font-display text-sm font-bold">Interesse em</h3>
          <div className="flex items-center gap-3">
            <img src={listing.photos[0]} className="size-12 rounded-xl object-cover" alt="" />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{listing.title}</div>
              <div className="font-num text-xs text-muted-foreground">{priceLabel(listing)} · {listing.city}</div>
            </div>
          </div>
        </div>

        {otherMatches.length > 0 && (
          <div className="mt-3 rounded-2xl border border-warning/30 bg-warning/5 p-4">
            <h3 className="mb-2 font-display text-sm font-bold">Também interessado noutros anúncios</h3>
            {otherMatches.map((m) => {
              const l = listings.find((x) => x.id === m.listingId);
              if (!l) return null;
              return (
                <div key={m.id} className="mt-2 flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm">{l.title}</span>
                  <button onClick={() => ignore(m)} className="rounded-pill border border-border px-3 py-1 text-xs font-semibold text-danger">Ignorar</button>
                  <button onClick={() => accept(m)} className="rounded-pill bg-success px-3 py-1 text-xs font-bold text-white">Aceitar</button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Contact icon={<Phone className="size-4" />} label="Tel." />
          <Contact icon={<Mail className="size-4" />} label="Email" />
          <Contact icon={<Shield className="size-4" />} label="Docs" />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">Contactos partilhados após aceitares.</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border glass-light pb-safe">
        <div className="mx-auto flex max-w-[440px] gap-2 p-3">
          {pending ? (
            <>
              <button onClick={() => ignore()} className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-semibold text-danger">
                <X className="size-4" /> Ignorar
              </button>
              <button onClick={() => accept()} className="inline-flex h-12 flex-[2] items-center justify-center gap-1.5 rounded-lg bg-success font-display font-semibold text-white shadow-lift">
                <Check className="size-4" /> Aceitar candidato
              </button>
            </>
          ) : (
            <Link
              to="/chats/$id"
              params={{ id: match.chatId }}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift"
            >
              Abrir conversa
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Contact({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="grid h-14 place-items-center rounded-lg border border-dashed border-border bg-surface text-muted-foreground">
      <div className="flex flex-col items-center gap-0.5 text-xs">{icon}{label}</div>
    </div>
  );
}
