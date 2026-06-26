import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, MailCheck } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Recuperar password — HomeMatch" }] }),
  component: ResetPage,
});

function ResetPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col bg-background px-6 pb-10">
      <header className="-mx-2 flex h-16 items-center">
        <Link to="/login" className="grid size-10 place-items-center rounded-full hover:bg-muted"><ChevronLeft className="size-5" /></Link>
      </header>
      {sent ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="grid size-16 place-items-center rounded-pill bg-success/15 text-success">
            <MailCheck className="size-8" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold">Link enviado!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Verifica o teu email. O link expira em 1 hora.</p>
          <p className="mt-8 text-sm text-muted-foreground">Não chegou? <button className="font-semibold text-muted-foreground/60" disabled>Reenviar (60s)</button></p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-2 flex flex-col gap-3">
          <h1 className="font-display text-2xl font-bold">Recuperar password</h1>
          <p className="text-sm text-muted-foreground">Envia-nos o teu email e mandamos um link para entrares.</p>
          <input type="email" required placeholder="Email"
            className="mt-4 h-14 rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
          <button type="submit" className="mt-2 h-14 rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground shadow-lift">Enviar link</button>
        </form>
      )}
    </div>
  );
}
