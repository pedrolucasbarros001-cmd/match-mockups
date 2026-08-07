import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Escolher data e hora para propor (ou contrapropor) uma visita.
 *
 * O calendário só deixa escolher dias a partir de hoje — propor uma visita
 * para ontem seria uma proposta impossível, e a UI não deve oferecer o que o
 * estado não aceita. As horas sugeridas vêm da disponibilidade do anúncio;
 * havendo essa informação, é fricção desnecessária obrigar a adivinhar.
 */
export function VisitSheet({
  open, onClose, onSubmit, title, cta, suggestedTimes, initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (when: { date: string; time: string }) => void;
  title: string;
  cta: string;
  /** Horários que o anúncio indicou aceitar (ex.: "Sáb 10:00"). */
  suggestedTimes?: string[];
  initial?: { date: string; time: string };
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");

  // Horas extraídas das sugestões do anúncio + grelha normal.
  const times = useMemo(() => {
    const fromListing = (suggestedTimes ?? [])
      .map((s) => s.match(/\d{1,2}:\d{2}/)?.[0])
      .filter((t): t is string => !!t);
    const base = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
    return Array.from(new Set([...fromListing, ...base])).sort();
  }, [suggestedTimes]);

  const canSubmit = !!date && !!time;

  const days = useMemo(() => buildMonth(cursor), [cursor]);
  const monthLabel = cursor.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
  const atFirstMonth = cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/45"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92svh] max-w-[440px] overflow-y-auto rounded-t-[28px] bg-surface p-5 pb-safe"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-pill bg-border" />
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{title}</h2>
              <button onClick={onClose} aria-label="Fechar" className="grid size-9 place-items-center rounded-pill hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>

            {/* Calendário */}
            <div className="mt-4 rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                  disabled={atFirstMonth}
                  aria-label="Mês anterior"
                  className="grid size-9 place-items-center rounded-pill transition hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm font-bold capitalize">{monthLabel}</span>
                <button
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                  aria-label="Mês seguinte"
                  className="grid size-9 place-items-center rounded-pill transition hover:bg-muted"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-muted-foreground">
                {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => <div key={i}>{d}</div>)}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  if (!d) return <div key={`x${i}`} />;
                  const iso = toISO(d);
                  const past = d < today;
                  const selected = iso === date;
                  return (
                    <button
                      key={iso}
                      disabled={past}
                      onClick={() => setDate(iso)}
                      className={cn(
                        "grid h-10 place-items-center rounded-lg font-num text-sm transition",
                        selected ? "bg-primary font-bold text-primary-foreground" : "hover:bg-muted",
                        past && "cursor-not-allowed text-muted-foreground/40 hover:bg-transparent",
                      )}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horas — só depois de haver dia, senão escolher hora não significa nada. */}
            <div className={cn("mt-4 transition", !date && "pointer-events-none opacity-40")}>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Clock className="size-4" /> Hora
              </div>
              <div className="flex flex-wrap gap-2">
                {times.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={cn(
                      "h-10 rounded-pill border px-3.5 font-num text-sm font-semibold transition",
                      time === t ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Contrapositiva: o botão diz o que falta em vez de ficar cinzento e mudo. */}
            <button
              onClick={() => canSubmit && onSubmit({ date, time })}
              disabled={!canSubmit}
              className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display text-base font-semibold text-primary-foreground shadow-lift transition active:scale-[0.98] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              <CalendarIcon className="size-4" />
              {!date ? "Escolhe um dia" : !time ? "Escolhe uma hora" : cta}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Grelha do mês começada à segunda-feira, com espaços vazios à cabeça. */
function buildMonth(cursor: Date): (Date | null)[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay(): 0=domingo. Queremos segunda como primeira coluna.
  const lead = (first.getDay() + 6) % 7;
  return [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
