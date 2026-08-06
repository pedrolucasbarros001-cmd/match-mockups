import { Link } from "@tanstack/react-router";
import { Zap, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ações de plano têm cor e ícone próprios, independentes do modo da app:
 * subir de plano é sempre verde com raio, descer é sempre vermelho.
 * O significado não muda com o contexto, por isso a cor também não muda —
 * é o oposto do resto da UI, que segue o modo arrendar/comprar.
 */
export function UpgradeCta({ label = "Passar ao Pro", to = "/account", className, compact = false }: {
  label?: string; to?: string; className?: string; compact?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl bg-upgrade font-semibold text-white shadow-lift transition active:scale-[0.97]",
        compact ? "h-10 px-3 text-xs" : "h-12 w-full text-sm",
        className,
      )}
    >
      <Zap className={compact ? "size-3.5" : "size-4"} fill="currentColor" />
      {label}
    </Link>
  );
}

export function DowngradeCta({ label = "Voltar ao Free", onClick, disabled, className }: {
  label?: string; onClick?: () => void; disabled?: boolean; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-downgrade text-sm font-semibold text-downgrade transition active:scale-[0.98] disabled:border-border disabled:text-muted-foreground",
        className,
      )}
    >
      <TrendingDown className="size-4" />
      {label}
    </button>
  );
}

/**
 * Botão de criar anúncio que muda de aparência quando o limite do plano já
 * foi atingido: em vez de parecer disponível e falhar ao clicar, mostra-se
 * como o que na prática é — um caminho para o upgrade.
 */
export function CreateListingCta({ blocked, compact = false }: { blocked: boolean; compact?: boolean }) {
  if (blocked) return <UpgradeCta label="Publicar mais — Pro" compact={compact} />;
  return (
    <Link
      to="/publish"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary font-semibold text-primary-foreground shadow-lift transition active:scale-[0.97]",
        compact ? "h-10 px-3 text-xs" : "h-12 w-full text-sm",
      )}
    >
      Publicar anúncio
    </Link>
  );
}
