import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageShell } from "@/components/AppShell";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: "Termos de Uso — HomeMatch" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell width="list" className="pb-10">
      <PageHeader title="Termos de Uso" back="/settings" />
      <article className="prose prose-sm max-w-none px-4 pt-4 text-sm leading-relaxed text-foreground">
        <p className="text-xs text-muted-foreground">Última atualização: Junho 2026</p>
        <h2 className="mt-4 font-display text-base font-bold">1. Aceitação</h2>
        <p className="mt-1 text-muted-foreground">Ao usar a HomeMatch aceitas estes termos. Se não concordas, não uses a app.</p>
        <h2 className="mt-4 font-display text-base font-bold">2. Conta</h2>
        <p className="mt-1 text-muted-foreground">És responsável pela veracidade dos dados fornecidos e pela segurança da tua conta.</p>
        <h2 className="mt-4 font-display text-base font-bold">3. Anúncios</h2>
        <p className="mt-1 text-muted-foreground">Os anúncios devem descrever imóveis reais, para arrendamento ou venda. A HomeMatch reserva-se o direito de remover conteúdo enganoso.</p>
        <h2 className="mt-4 font-display text-base font-bold">4. Trust Score</h2>
        <p className="mt-1 text-muted-foreground">O Trust Score é indicativo e não substitui a avaliação que cada parte deve fazer da outra.</p>

        <h2 className="mt-4 font-display text-base font-bold">5. O que a HomeMatch faz — e o que não faz</h2>
        <p className="mt-1 text-muted-foreground">
          A HomeMatch é um <b>facilitador de contacto</b>: mostra anúncios, permite demonstrar interesse, conversar e
          combinar visitas. Tudo o que acontece a seguir é entre as partes.
        </p>
        <p className="mt-2 text-muted-foreground">Em concreto, a HomeMatch <b>não</b>:</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>é parte no contrato de arrendamento ou no contrato de compra e venda;</li>
          <li>redige, revê, valida ou guarda contratos, escrituras ou documentação legal;</li>
          <li>verifica a titularidade do imóvel, o registo predial ou a situação fiscal de quem anuncia;</li>
          <li>processa, intermedeia ou garante pagamentos — rendas, cauções, sinais ou o preço de venda;</li>
          <li>presta serviços de mediação imobiliária, aconselhamento jurídico, fiscal ou financeiro;</li>
          <li>garante que um negócio se concretiza, nem responde por acordos que não se cumpram.</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Quando marcas um arrendamento ou uma proposta como aceite, a HomeMatch está apenas a <b>registar o que as
          partes declararam ter combinado</b>. Esse registo é para vosso acompanhamento — não constitui contrato,
          promessa, recibo nem prova de negócio.
        </p>
        <p className="mt-2 text-muted-foreground">
          Recomendamos que, antes de assinar seja o que for ou de entregar dinheiro, confirmes a identidade da outra
          parte e a documentação do imóvel, e que procures aconselhamento profissional — em especial numa compra e venda.
        </p>

        <h2 className="mt-4 font-display text-base font-bold">6. Contacto</h2>
        <p className="mt-1 text-muted-foreground">Dúvidas: ola@homematch.pt</p>
      </article>
    </PageShell>
  );
}
