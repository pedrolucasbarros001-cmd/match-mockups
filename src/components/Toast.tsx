import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** Toast simples no topo do ecrã — 2.5s, não bloqueia navegação. */
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMsg(text);
    timer.current = setTimeout(() => setMsg(null), 2500);
  }, []);
  return { msg, show };
}

export function Toast({ msg }: { msg: string | null }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4"
        >
          <div className="max-w-[400px] truncate rounded-pill bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-lift">
            {msg}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
