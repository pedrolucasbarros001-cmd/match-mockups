import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: "Termos de Uso — HomeMatch" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-10">
      <PageHeader title="Termos de Uso" back="/settings" />
      <article className="prose prose-sm max-w-none px-4 pt-4 text-sm leading-relaxed text-foreground">
        <p className="text-xs text-muted-foreground">Última atualização: Junho 2026</p>
        <h2 className="mt-4 font-display text-base font-bold">1. Aceitação</h2>
        <p className="mt-1 text-muted-foreground">Ao usar a HomeMatch aceitas estes termos. Se não concordas, não uses a app.</p>
        <h2 className="mt-4 font-display text-base font-bold">2. Conta</h2>
        <p className="mt-1 text-muted-foreground">És responsável pela veracidade dos dados fornecidos e pela segurança da tua conta.</p>
        <h2 className="mt-4 font-display text-base font-bold">3. Anúncios</h2>
        <p className="mt-1 text-muted-foreground">Os anúncios devem descrever imóveis reais. A HomeMatch reserva-se o direito de remover conteúdo enganoso.</p>
        <h2 className="mt-4 font-display text-base font-bold">4. Trust Score</h2>
        <p className="mt-1 text-muted-foreground">O Trust Score é indicativo e não substitui a avaliação do senhorio ou do candidato.</p>
        <h2 className="mt-4 font-display text-base font-bold">5. Limitação de responsabilidade</h2>
        <p className="mt-1 text-muted-foreground">A HomeMatch é uma plataforma de contacto. Não somos parte no contrato de arrendamento.</p>
        <h2 className="mt-4 font-display text-base font-bold">6. Contacto</h2>
        <p className="mt-1 text-muted-foreground">Dúvidas: ola@homematch.pt</p>
      </article>
    </div>
  );
}
