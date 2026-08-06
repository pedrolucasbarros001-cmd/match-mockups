import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { setSession } from "@/lib/user-state";
import { cn } from "@/lib/utils";
import { Mail, Lock, Phone, Check, AlertTriangle, Trash2 } from "lucide-react";

export const Route = createFileRoute("/settings/account")({
  head: () => ({ meta: [{ title: "Conta — HomeMatch" }] }),
  component: AccountSettings,
});

type Panel = "email" | "password" | "phone" | null;

function AccountSettings() {
  const nav = useNavigate();
  const profile = useStore((s) => s.profile);
  const [open, setOpen] = useState<Panel>(null);
  const [done, setDone] = useState<Panel>(null);

  const finish = (p: Panel) => {
    setDone(p);
    setOpen(null);
    setTimeout(() => setDone(null), 4000);
  };

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-10 lg:max-w-[560px]">
      <PageHeader title="Conta" back="/settings" />
      <div className="space-y-6 px-4 pt-4">
        <section>
          <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Credenciais</div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <RowButton
              icon={<Mail className="size-5" />}
              label="Email"
              value={profile.email || "Sem email"}
              verified={profile.emailVerified}
              onClick={() => setOpen(open === "email" ? null : "email")}
              open={open === "email"}
            />
            {open === "email" && (
              <EditPanel
                label="Novo email"
                type="email"
                initial={profile.email}
                cta="Enviar confirmação"
                // TODO(resend): envia email de verificação; só troca depois de confirmado.
                note="Vamos enviar um link de confirmação. O email só muda depois de o abrires."
                onSave={(v) => { api.updateProfile({ email: v, emailVerified: false }); finish("email"); }}
              />
            )}

            <RowButton
              icon={<Lock className="size-5" />}
              label="Password"
              value="••••••••"
              onClick={() => setOpen(open === "password" ? null : "password")}
              open={open === "password"}
            />
            {open === "password" && (
              <EditPanel
                label="Nova password"
                type="password"
                initial=""
                cta="Guardar password"
                note="Mínimo 8 caracteres."
                validate={(v) => (v.length >= 8 ? null : "A password precisa de pelo menos 8 caracteres.")}
                onSave={() => finish("password")}
              />
            )}

            <RowButton
              icon={<Phone className="size-5" />}
              label="Telemóvel"
              value={profile.phone || "Sem telemóvel"}
              verified={profile.phoneVerified}
              onClick={() => setOpen(open === "phone" ? null : "phone")}
              open={open === "phone"}
              last
            />
            {open === "phone" && (
              <EditPanel
                label="Número de telemóvel"
                type="tel"
                initial={profile.phone}
                cta="Enviar código"
                // TODO(otp): envia SMS e abre a verificação de 6 dígitos.
                note="Enviamos um código por SMS para confirmar o número."
                validate={(v) => (v.replace(/\D/g, "").length >= 9 ? null : "Indica um número válido (9 dígitos).")}
                onSave={(v) => { api.updateProfile({ phone: v, phoneVerified: false }); finish("phone"); }}
              />
            )}
          </div>

          {done && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-success">
              <Check className="size-3.5" strokeWidth={3} />
              {done === "password" ? "Password atualizada." : "Pedido registado — confirma para concluir."}
            </p>
          )}
        </section>

        <section>
          <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Sessão</div>
          <button
            onClick={() => { setSession("out"); nav({ to: "/login" }); }}
            className="h-12 w-full rounded-2xl border border-border bg-surface text-sm font-semibold transition active:scale-[0.98]"
          >
            Terminar sessão
          </button>
        </section>

        <DeleteAccount />
      </div>
    </div>
  );
}

/**
 * Eliminar conta pede o email por escrito. Um clique só não chega para uma ação
 * que não tem volta — a fricção aqui é intencional, ao contrário do resto da app.
 */
function DeleteAccount() {
  const nav = useNavigate();
  const email = useStore((s) => s.profile.email);
  const [armed, setArmed] = useState(false);
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toLowerCase() === (email || "").toLowerCase() && !!email;

  return (
    <section>
      <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Zona perigosa</div>
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-danger">Eliminar conta</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Apaga o perfil, anúncios, conversas e histórico. Não há forma de recuperar.
            </p>
          </div>
        </div>

        {!armed ? (
          <button
            onClick={() => setArmed(true)}
            className="mt-3 h-11 w-full rounded-xl border border-danger/40 text-sm font-semibold text-danger transition active:scale-[0.98]"
          >
            Quero eliminar a conta
          </button>
        ) : (
          <div className="mt-3">
            <label className="text-xs font-semibold text-muted-foreground">
              Escreve <b className="text-foreground">{email || "o teu email"}</b> para confirmar
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="mt-1.5 h-12 w-full rounded-lg border border-border bg-surface px-4 text-sm outline-none focus:border-danger"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => { setArmed(false); setTyped(""); }}
                className="h-11 flex-1 rounded-xl border border-border bg-surface text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                disabled={!matches}
                // TODO(backend): DELETE /api/me — apaga do servidor antes de sair.
                onClick={() => { api.reset(); setSession("out"); nav({ to: "/login" }); }}
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-danger text-sm font-bold text-white disabled:opacity-40"
              >
                <Trash2 className="size-4" /> Eliminar
              </button>
            </div>
            {!matches && typed.length > 0 && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">O email não coincide.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function RowButton({ icon, label, value, verified, onClick, open, last }: {
  icon: React.ReactNode; label: string; value: string;
  verified?: boolean; onClick: () => void; open: boolean; last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn("flex w-full items-center gap-3 p-4 text-left transition active:bg-muted", !last && !open && "border-b border-border")}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 flex items-center gap-1.5">
          <span className="truncate text-xs text-muted-foreground">{value}</span>
          {verified === true && <span className="shrink-0 rounded-pill bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">verificado</span>}
          {verified === false && <span className="shrink-0 rounded-pill bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">por verificar</span>}
        </span>
      </span>
      <span className="shrink-0 text-xs font-semibold text-primary">{open ? "Fechar" : "Alterar"}</span>
    </button>
  );
}

function EditPanel({ label, type, initial, cta, note, validate, onSave }: {
  label: string; type: string; initial: string; cta: string; note?: string;
  validate?: (v: string) => string | null;
  onSave: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const error = validate?.(value) ?? null;
  const empty = value.trim().length === 0;

  return (
    <div className="border-b border-border bg-muted/30 p-4">
      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1.5 h-12 w-full rounded-lg border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
      />
      {note && <p className="mt-1.5 text-[11px] text-muted-foreground">{note}</p>}
      {/* Contrapositiva: se não dá para guardar, o motivo aparece por baixo. */}
      {!empty && error && <p className="mt-1.5 text-[11px] font-semibold text-danger">{error}</p>}
      <button
        disabled={empty || !!error}
        onClick={() => onSave(value.trim())}
        className="mt-3 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"
      >
        {cta}
      </button>
    </div>
  );
}
