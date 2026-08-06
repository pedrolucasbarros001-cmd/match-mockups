// Modo visual da app: arrendar (azul) ou comprar (esmeralda).
//
// O modo não é uma preferência de tema — é um reflexo do que a pessoa está a
// fazer. Por isso não há botão de "tema": quem procura arrendar vê a app azul,
// quem procura comprar vê-a verde, e o seletor do feed é a única forma de
// mudar. Assim a cor e o conteúdo nunca podem discordar.

import { useEffect } from "react";
import type { ListingKind } from "./mock-data";

export function applyMode(kind: ListingKind) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  if (kind === "sale") el.setAttribute("data-mode", "sale");
  else el.removeAttribute("data-mode");
}

/** Mantém o `data-mode` do <html> igual ao kind que o ecrã está a mostrar. */
export function useMode(kind: ListingKind) {
  useEffect(() => {
    applyMode(kind);
  }, [kind]);
}
