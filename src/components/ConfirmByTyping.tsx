import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Confirmação por escrito para ações que não têm volta ou que fazem perder
 * capacidade (eliminar conta, descer de plano, apagar anúncio com candidatos).
 *
 * A fricção aqui é intencional e é a única da app: em todo o resto o objetivo
 * é fluidez, mas uma ação irreversível tem de ser difícil de fazer por engano.
 * O botão fica ativo se e só se a palavra estiver escrita — e diz sempre qual.
 */
export function ConfirmByTyping({
  word, title, body, confirmLabel = "Confirmar", onConfirm, onCancel,
}: {
  word: string;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const ok = typed.trim().toUpperCase() === word.toUpperCase();

  return (
    <div className="mt-3 rounded-xl border border-downgrade/40 bg-downgrade/5 p-4">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-downgrade" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-downgrade">{title}</div>
          <p className="mt-1 text-xs leading-relaxed text-foreground/85">{body}</p>
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold text-muted-foreground">
        Escreve <b className="font-num text-foreground">{word}</b> para confirmar
      </label>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        autoCapitalize="characters"
        className="mt-1.5 h-12 w-full rounded-lg border border-border bg-surface px-4 font-num text-sm uppercase outline-none focus:border-downgrade"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={onCancel}
          className="h-11 flex-1 rounded-xl border border-border bg-surface text-sm font-semibold transition active:scale-[0.98]"
        >
          Cancelar
        </button>
        <button
          disabled={!ok}
          onClick={onConfirm}
          className={cn(
            "h-11 flex-1 rounded-xl text-sm font-bold text-white transition active:scale-[0.98]",
            ok ? "bg-downgrade" : "bg-muted text-muted-foreground",
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
