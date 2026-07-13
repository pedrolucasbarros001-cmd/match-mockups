import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feedback/$matchId")({
  head: () => ({ meta: [{ title: "Feedback — HomeMatch" }] }),
  component: FeedbackPage,
});

const TOPICS = [
  "As fotos representam a realidade",
  "A informação estava correta",
  "A descrição foi útil",
  "A disponibilidade correspondia",
  "A localização estava certa",
];

function FeedbackPage() {
  const { matchId } = useParams({ from: "/feedback/$matchId" });
  const nav = useNavigate();
  const m = useStore((s) => s.matches.find((x) => x.id === matchId));
  const l = useStore((s) => (m ? s.listings.find((x) => x.id === m.listingId) : undefined));
  const [rating, setRating] = useState(0);
  const [topics, setTopics] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  if (!m || !l) return <div className="p-8 text-center text-sm text-muted-foreground">Feedback não disponível.</div>;

  const toggle = (t: string) => setTopics(topics.includes(t) ? topics.filter((x) => x !== t) : [...topics, t]);
  const submit = async () => {
    const comment = [note, topics.join("; ")].filter(Boolean).join(" | ");
    await api.saveFeedback(matchId, rating, comment);
    setDone(true);
  };

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-16">
      <PageHeader title="Feedback" back="/matches" />
      <div className="space-y-5 px-5 pt-5">
        <div className="flex items-center gap-3">
          <img src={l.photos[0]} className="size-14 rounded-2xl object-cover" alt="" />
          <div>
            <div className="font-display text-base font-bold">{l.title}</div>
            <div className="text-xs text-muted-foreground">O feedback é privado. Ajuda a melhorar a plataforma.</div>
          </div>
        </div>

        {done ? (
          <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-center text-success">
            <Check className="mx-auto mb-1 size-6" /> Obrigado. O teu feedback foi guardado.
            <button onClick={() => nav({ to: "/matches" })} className="mt-3 text-sm font-semibold underline">Voltar aos matches</button>
          </div>
        ) : (
          <>
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Avaliação geral</div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)}>
                    <Star className={cn("size-8", n <= rating ? "fill-warning text-warning" : "text-muted-foreground")} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">O que correu bem</div>
              <div className="flex flex-col gap-2">
                {TOPICS.map((t) => (
                  <button key={t} onClick={() => toggle(t)} className={cn(
                    "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm",
                    topics.includes(t) ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface",
                  )}>
                    <span>{t}</span>
                    {topics.includes(t) && <Check className="size-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Comentário (opcional)</div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
                className="w-full resize-none rounded-md border border-border bg-surface p-3 outline-none focus:border-primary" />
            </div>

            <button onClick={submit} disabled={rating === 0} className="h-12 w-full rounded-lg bg-primary font-display font-semibold text-primary-foreground shadow-lift disabled:opacity-50">
              Enviar feedback
            </button>
          </>
        )}
      </div>
    </div>
  );
}
