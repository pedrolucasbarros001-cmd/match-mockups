import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { Divider, GoogleIcon } from "./login";
import { setSession } from "@/lib/user-state";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta — HomeMatch" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [email, setEmail] = useState("");

  const validEmail = /.+@.+\..+/.test(email);
  const strength = pw.length >= 12 ? "Forte" : pw.length >= 8 ? "Média" : pw.length > 0 ? "Fraca" : "";
  const strengthColor = strength === "Forte" ? "bg-success" : strength === "Média" ? "bg-warning" : "bg-danger";
  const match = pw.length > 0 && pw === pw2;
  const ok = validEmail && pw.length >= 8 && match && terms;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col bg-background px-6 pb-10">
      <header className="-mx-2 flex h-16 items-center justify-between">
        <Link to="/login" className="grid size-10 place-items-center rounded-full hover:bg-muted"><ChevronLeft className="size-5" /></Link>
        <span className="font-display text-base font-bold">HomeMatch</span>
        <div className="size-10" />
      </header>

      <h1 className="font-display text-2xl font-bold">Cria a tua conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">Demora 1 minuto.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); if (ok) nav({ to: "/onboarding" }); }}
        className="mt-6 flex flex-col gap-3"
      >
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())}
          className="h-14 rounded-md border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />

        <div>
          <div className="relative">
            <input type={show ? "text" : "password"} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)}
              className="h-14 w-full rounded-md border border-border bg-surface px-4 pr-12 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 right-3 grid place-items-center text-muted-foreground">
              {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {pw.length > 0 ? (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-muted">
                <div className={`h-full ${strengthColor}`} style={{ width: Math.min(100, pw.length * 9) + "%" }} />
              </div>
              <span className="font-medium text-muted-foreground">{strength}</span>
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Mínimo 8 caracteres</p>
          )}
        </div>

        <div className="relative">
          <input type={show ? "text" : "password"} placeholder="Confirmar password" value={pw2} onChange={(e) => setPw2(e.target.value)}
            className="h-14 w-full rounded-md border border-border bg-surface px-4 pr-12 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
          {pw2.length > 0 && (
            <span className={`absolute inset-y-0 right-12 grid place-items-center text-xs font-semibold ${match ? "text-success" : "text-danger"}`}>
              {match ? "✓" : "≠"}
            </span>
          )}
        </div>

        <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-md p-2 text-sm">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 size-5 accent-[color:var(--primary)]" />
          <span>Aceito os <a className="font-semibold text-primary">Termos de Uso</a> e a <a className="font-semibold text-primary">Política de Privacidade</a>.</span>
        </label>

        <button type="submit" disabled={!ok}
          className="mt-2 h-14 rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground shadow-lift transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none">
          Criar conta
        </button>
      </form>

      <Divider />

      <button className="flex h-14 items-center justify-center gap-3 rounded-lg border border-border bg-surface text-sm font-semibold">
        <GoogleIcon /> Continuar com Google
      </button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Já tens conta? <Link to="/login" className="font-semibold text-primary">Entrar →</Link>
      </p>
    </div>
  );
}
