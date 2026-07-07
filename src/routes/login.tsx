import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setSession, getRole } from "@/lib/user-state";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — HomeMatch" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col bg-background px-6 pb-10 pt-20">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">HomeMatch</h1>
        <p className="mt-2 text-sm text-muted-foreground">Encontra onde viver. Sem dramas.</p>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSession("in");
          nav({ to: getRole() === "landlord" ? "/dashboard" : "/explore" });
        }}
      >
        <Field>
          <input type="email" required placeholder="Email" autoComplete="email"
            className="h-14 w-full rounded-md border border-border bg-surface px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
        </Field>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            placeholder="Password"
            autoComplete="current-password"
            className="h-14 w-full rounded-md border border-border bg-surface px-4 pr-12 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute inset-y-0 right-3 grid place-items-center text-muted-foreground">
            {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>

        <button type="submit" className="mt-2 h-14 rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground shadow-lift transition active:scale-[0.98]">
          Entrar
        </button>

        <Link to="/reset-password" className="mt-1 self-start text-sm text-muted-foreground hover:text-foreground">
          Esqueceste a password? →
        </Link>
      </form>

      <Divider />

      <button className="flex h-14 items-center justify-center gap-3 rounded-lg border border-border bg-surface text-sm font-semibold">
        <GoogleIcon /> Continuar com Google
      </button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Ainda não tens conta?{" "}
        <Link to="/register" className="font-semibold text-primary">Criar →</Link>
      </p>
    </div>
  );
}

export function Field({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}
export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
      <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
    </div>
  );
}
export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.12a6.6 6.6 0 0 1 0-4.24V7.04H2.18a11 11 0 0 0 0 9.92l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
  );
}
