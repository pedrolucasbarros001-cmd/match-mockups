import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Ecrãs de entrada (login, registo, recuperação, onboarding).
 * Mobile: coluna única, como antes. Desktop: painel de marca à esquerda e
 * formulário numa coluna estreita à direita — em vez de um formulário solto.
 */
export function AuthLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex min-h-svh bg-background">
      <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/15 font-display text-lg font-black">H</span>
          <span className="font-display text-xl font-black tracking-tight">HomeMatch</span>
        </div>
        <div className="max-w-[420px]">
          <h2 className="font-display text-4xl font-black leading-tight tracking-tight">Encontra onde viver. Sem dramas.</h2>
          <p className="mt-4 text-base text-primary-foreground/80">
            Dá interesse, conversa, marca a visita e fecha o arrendamento — tudo no mesmo sítio.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/70">Protótipo · dados locais de teste</p>
        <span className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-pill bg-primary-foreground/10" />
        <span className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-pill bg-primary-foreground/10" />
      </aside>

      <div className="flex w-full flex-col lg:w-[min(560px,45vw)] lg:justify-center lg:px-10">
        <div className={cn("mx-auto flex w-full max-w-[440px] flex-1 flex-col lg:flex-none", className)}>{children}</div>
      </div>
    </div>
  );
}
