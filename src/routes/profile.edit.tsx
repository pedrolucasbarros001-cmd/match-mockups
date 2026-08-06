import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Camera, ImagePlus, User, X } from "lucide-react";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({ meta: [{ title: "Editar perfil — HomeMatch" }] }),
  component: EditProfile,
});

const SITUATIONS = ["Estudante", "Trabalhador", "Freelancer", "Reformado", "Outro"];
const BIO_MAX = 240;

function EditProfile() {
  const nav = useNavigate();
  const profile = useStore((s) => s.profile);

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [occupation, setOccupation] = useState(profile.occupation ?? "");
  const [avatar, setAvatar] = useState(profile.avatar);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Contrapositiva: o botão só grava se houver nome — e diz porquê quando não há.
  const blocked = name.trim().length < 2 ? "Escreve o teu nome para guardar." : null;

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    // TODO(storage): substituir pelo URL devolvido por api.uploadPhoto.
    if (avatar.startsWith("blob:")) URL.revokeObjectURL(avatar);
    setAvatar(URL.createObjectURL(file));
  };

  const save = async () => {
    if (blocked) return;
    await api.updateProfile({ name: name.trim(), bio: bio.trim(), occupation: occupation.trim(), avatar });
    nav({ to: "/profile" });
  };

  return (
    <div className="mx-auto min-h-svh w-full max-w-[440px] bg-background pb-28 lg:max-w-[560px]">
      <PageHeader title="Editar perfil" back="/profile" />

      <div className="space-y-6 px-5 pt-6">
        {/* Foto: anexar ou tirar na hora, tal como nas fotos do anúncio. */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt="" className="size-24 rounded-pill bg-muted object-cover" />
            ) : (
              <div className="grid size-24 place-items-center rounded-pill bg-muted text-muted-foreground">
                <User className="size-10" />
              </div>
            )}
            {avatar && (
              <button
                onClick={() => { if (avatar.startsWith("blob:")) URL.revokeObjectURL(avatar); setAvatar(""); }}
                aria-label="Remover foto"
                className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-pill border border-border bg-surface text-muted-foreground shadow-card"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="inline-flex h-10 items-center gap-1.5 rounded-pill border border-border px-3 text-xs font-semibold transition active:scale-95"
            >
              <Camera className="size-4" /> Tirar foto
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="inline-flex h-10 items-center gap-1.5 rounded-pill border border-border px-3 text-xs font-semibold transition active:scale-95"
            >
              <ImagePlus className="size-4" /> Anexar
            </button>
          </div>
          <input ref={galleryRef} type="file" accept="image/*" onChange={pickAvatar} className="hidden" />
          <input ref={cameraRef} type="file" accept="image/*" capture="user" onChange={pickAvatar} className="hidden" />
        </div>

        <Field label="Nome">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como queres aparecer"
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 outline-none focus:border-primary"
          />
        </Field>

        <Field label="Situação">
          <div className="flex flex-wrap gap-2">
            {SITUATIONS.map((s) => (
              <button
                key={s}
                onClick={() => setOccupation(occupation === s ? "" : s)}
                className={cn(
                  "h-9 rounded-pill border px-3 text-xs font-semibold transition",
                  occupation === s ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Sobre ti">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            rows={5}
            placeholder="Uma ou duas frases sobre quem és e o que procuras."
            className="w-full resize-none rounded-lg border border-border bg-surface p-4 outline-none focus:border-primary"
          />
          <div className={cn("mt-1 text-right text-[11px]", bio.length >= BIO_MAX ? "text-warning" : "text-muted-foreground")}>
            {bio.length}/{BIO_MAX}
          </div>
        </Field>

        <p className="text-xs text-muted-foreground">
          Email e telemóvel alteram-se em Definições → Conta, porque exigem confirmação.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border glass-light pb-safe">
        <div className="mx-auto max-w-[440px] p-3 lg:max-w-[560px]">
          {blocked && <p className="mb-2 text-center text-xs text-muted-foreground">{blocked}</p>}
          <button
            onClick={save}
            disabled={!!blocked}
            className="h-12 w-full rounded-xl bg-primary font-display font-semibold text-primary-foreground shadow-lift transition active:scale-[0.98] disabled:opacity-40"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
