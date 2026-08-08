import { AuthLayout } from "@/components/AuthLayout";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — HomeMatch" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error, role } = await signIn(email.trim(), pw);
    setBusy(false);
    if (error) {
      setError(error === "Invalid login credentials" ? "Email ou password incorretos." : error);
      return;
    }
    nav({ to: role === "landlord" ? "/dashboard" : "/explore" });
  };

  return (
    <AuthLayout className="px-6 pb-10 pt-20">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">HomeMatch</h1>
        <p className="mt-2 text-sm text-muted-foreground">Encontra onde viver. Sem dramas.</p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={submit}>
        <Field>
          <input type="email" required placeholder="Email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            className="h-14 w-full rounded-md border border-border bg-surface px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
        </Field>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            placeholder="Password"
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="h-14 w-full rounded-md border border-border bg-surface px-4 pr-12 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute inset-y-0 right-3 grid place-items-center text-muted-foreground">
            {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>

        {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <button type="submit" disabled={busy} className="mt-2 h-14 rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground shadow-lift transition active:scale-[0.98] disabled:opacity-60">
          {busy ? "A entrar…" : "Entrar"}
        </button>

        <Link to="/reset-password" className="mt-1 self-start text-sm text-muted-foreground hover:text-foreground">
          Esqueceste a password? →
        </Link>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Ainda não tens conta?{" "}
        <Link to="/register" className="font-semibold text-primary">Criar →</Link>
      </p>
    </AuthLayout>
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
