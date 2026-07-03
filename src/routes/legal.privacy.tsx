import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Política de Privacidade — HomeMatch" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-10">
      <PageHeader title="Privacidade" back="/settings" />
      <article className="prose prose-sm max-w-none px-4 pt-4 text-sm leading-relaxed text-foreground">
        <p className="text-xs text-muted-foreground">Última atualização: Junho 2026</p>
        <h2 className="mt-4 font-display text-base font-bold">Dados que recolhemos</h2>
        <p className="mt-1 text-muted-foreground">Nome, email, telemóvel, foto, preferências de habitação, mensagens trocadas na app.</p>
        <h2 className="mt-4 font-display text-base font-bold">Como usamos</h2>
        <p className="mt-1 text-muted-foreground">Para te ligar a senhorios ou candidatos compatíveis, calcular o Trust Score e melhorar o serviço.</p>
        <h2 className="mt-4 font-display text-base font-bold">Partilha</h2>
        <p className="mt-1 text-muted-foreground">Só partilhamos o teu perfil com o senhorio depois de tu enviares o interesse. Nunca vendemos os teus dados.</p>
        <h2 className="mt-4 font-display text-base font-bold">Os teus direitos</h2>
        <p className="mt-1 text-muted-foreground">Podes aceder, corrigir ou eliminar os teus dados em qualquer momento nas Definições.</p>
        <h2 className="mt-4 font-display text-base font-bold">Contacto</h2>
        <p className="mt-1 text-muted-foreground">Encarregado de proteção de dados: privacidade@homematch.pt</p>
      </article>
    </div>
  );
}
