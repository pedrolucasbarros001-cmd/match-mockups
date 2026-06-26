import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader, ScoreBadge } from "@/components/AppShell";
import { Check, X, MessageCircle, Phone, Mail, Shield } from "lucide-react";

export const Route = createFileRoute("/candidates/$requestId")({
  head: () => ({ meta: [{ title: "Candidato — HomeMatch" }] }),
  component: CandidateDetail,
});

function CandidateDetail() {
  useParams({ from: "/candidates/$requestId" });
  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-32">
      <PageHeader title="Perfil do candidato" back="/candidates" />
      <div className="px-5 pt-6">
        <div className="flex flex-col items-center text-center">
          <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=70" className="size-24 rounded-pill object-cover" alt="" />
          <h2 className="mt-3 font-display text-xl font-bold">Tiago Costa</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">Estudante · 24 anos</div>
          <div className="mt-3"><ScoreBadge score={78} size="md" /></div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-2 font-display text-sm font-bold">Sobre</h3>
          <p className="text-sm text-foreground/90">
            Olá! Estudo Engenharia Informática no IPB. Procuro um quarto tranquilo, não fumo
            e sou bastante organizado. Disponível desde 1 de Setembro.
          </p>
        </div>

        <div className="mt-3 rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-3 font-display text-sm font-bold">Verificações</h3>
          <ul className="space-y-2 text-sm">
            <Verif label="Email verificado" ok />
            <Verif label="Telemóvel verificado" ok />
            <Verif label="NIF português" ok />
            <Verif label="Identificação válida" ok={false} />
            <Verif label="Rendimento ou estudante" ok />
          </ul>
        </div>

        <div className="mt-3 rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-2 font-display text-sm font-bold">Mensagem</h3>
          <p className="text-sm italic text-foreground/90">"Olá, procuro um sítio para Setembro. Tudo o que precisar é só dizer."</p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Contact icon={<Phone className="size-4" />} label="Tel." />
          <Contact icon={<Mail className="size-4" />} label="Email" />
          <Contact icon={<Shield className="size-4" />} label="Docs" />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">Contactos partilhados após aceitares.</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[440px] gap-2 p-3">
          <button className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-semibold text-danger">
            <X className="size-4" /> Rejeitar
          </button>
          <button className="grid size-12 place-items-center rounded-lg border border-border">
            <MessageCircle className="size-5" />
          </button>
          <button className="inline-flex h-12 flex-[2] items-center justify-center gap-1.5 rounded-lg bg-success font-display font-semibold text-white shadow-lift">
            <Check className="size-4" /> Aceitar candidato
          </button>
        </div>
      </div>
    </div>
  );
}

function Verif({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className={"grid size-5 place-items-center rounded-pill " + (ok ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
        {ok ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
      </span>
      <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

function Contact({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="grid h-14 place-items-center rounded-lg border border-dashed border-border bg-surface text-muted-foreground">
      <div className="flex flex-col items-center gap-0.5 text-xs">{icon}{label}</div>
    </div>
  );
}
