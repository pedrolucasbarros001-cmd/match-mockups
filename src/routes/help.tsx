import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { ChevronDown, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Ajuda — HomeMatch" }] }),
  component: HelpPage,
});

const FAQ = [
  { q: "Como funciona o Trust Score?", a: "O Trust Score reflete a tua verificação (email, telemóvel, NIF, identificação) e comportamento na app. Quanto mais verificado, mais confiança geras nos senhorios." },
  { q: "Posso cancelar uma candidatura?", a: "Sim. Vai a Likes → Pendentes e toca em Cancelar. A candidatura desaparece da lista do senhorio." },
  { q: "Como marco uma visita?", a: "Após o match, abre o chat e propõe uma data. O senhorio confirma e a visita aparece em 'Visitas'." },
  { q: "Quanto custa publicar um imóvel?", a: "O plano Free permite 1 anúncio ativo. O plano Pro remove esse limite e adiciona destaque no feed." },
  { q: "Como elimino a minha conta?", a: "Em Definições → Zona perigosa → Eliminar conta. A ação é irreversível." },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-10">
      <PageHeader title="Ajuda" back="/settings" />
      <div className="px-4 pt-4">
        <div className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">Perguntas frequentes</div>
        <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
          {FAQ.map((it, i) => (
            <li key={i} className={i < FAQ.length - 1 ? "border-b border-border" : ""}>
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
                <span className="text-sm font-semibold">{it.q}</span>
                <ChevronDown className={cn("size-4 text-muted-foreground transition", open === i && "rotate-180")} />
              </button>
              {open === i && <p className="px-4 pb-4 text-sm text-muted-foreground">{it.a}</p>}
            </li>
          ))}
        </ul>

        <div className="mt-6 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">Falar connosco</div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <a href="mailto:ola@homematch.pt" className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface p-4">
            <Mail className="size-5 text-primary" />
            <div className="text-sm font-bold">Email</div>
            <div className="text-xs text-muted-foreground">ola@homematch.pt</div>
          </a>
          <button className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface p-4 text-left">
            <MessageCircle className="size-5 text-primary" />
            <div className="text-sm font-bold">Chat</div>
            <div className="text-xs text-muted-foreground">Seg–Sex · 9h–18h</div>
          </button>
        </div>
      </div>
    </div>
  );
}
