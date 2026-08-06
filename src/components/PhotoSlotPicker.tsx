import { useRef, useState } from "react";
import { Camera, ImagePlus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhotoSlot } from "@/lib/listing-rules";

/**
 * Recolha de fotos por slot: anexar da galeria ou tirar na hora.
 *
 * `capture="environment"` faz o telemóvel abrir a câmara traseira diretamente;
 * o mesmo input sem `capture` abre a galeria. Em desktop ambos abrem o
 * seletor de ficheiros — o utilizador nunca vê uma opção que não funcione.
 *
 * A imagem fica em memória como object URL. Quando houver storage, é aqui que
 * entra o upload (ver `api.uploadPhoto`) — o resto do wizard não muda.
 */
export type SlotPhoto = { key: string; url: string; file: File };

export function PhotoSlotPicker({
  slots,
  photos,
  onAdd,
  onRemove,
}: {
  slots: PhotoSlot[];
  photos: SlotPhoto[];
  onAdd: (key: string, file: File) => void;
  onRemove: (key: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {slots.map((slot) => (
        <SlotRow
          key={slot.key}
          slot={slot}
          photo={photos.find((p) => p.key === slot.key)}
          onAdd={(f) => onAdd(slot.key, f)}
          onRemove={() => onRemove(slot.key)}
        />
      ))}
    </div>
  );
}

function SlotRow({
  slot, photo, onAdd, onRemove,
}: {
  slot: PhotoSlot;
  photo?: SlotPhoto;
  onAdd: (file: File) => void;
  onRemove: () => void;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reescolher o mesmo ficheiro
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Só imagens (JPG, PNG, HEIC).");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Imagem demasiado grande (máx. 12 MB).");
      return;
    }
    setError(null);
    onAdd(file);
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-3 transition",
        photo ? "border-success bg-success/5" : "border-dashed border-border bg-surface",
      )}
    >
      <div className="flex items-center gap-3">
        {photo ? (
          <img src={photo.url} alt={slot.label} className="size-14 shrink-0 rounded-lg object-cover" />
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
            <Camera className="size-5" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">{slot.label}</span>
            {slot.essential && !photo && (
              <span className="rounded-pill bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">essencial</span>
            )}
            {photo && <Check className="size-3.5 text-success" strokeWidth={3} />}
          </div>
          {slot.hint && !photo && (
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{slot.hint}</p>
          )}
          {photo && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{photo.file.name}</p>}
        </div>

        {photo ? (
          <button
            onClick={onRemove}
            aria-label={`Remover foto de ${slot.label}`}
            className="grid size-9 shrink-0 place-items-center rounded-pill border border-border text-muted-foreground transition active:scale-90"
          >
            <X className="size-4" />
          </button>
        ) : (
          <div className="flex shrink-0 gap-1.5">
            {/* Tirar agora — em telemóvel abre a câmara. */}
            <button
              onClick={() => cameraRef.current?.click()}
              aria-label={`Tirar foto de ${slot.label}`}
              className="grid size-9 place-items-center rounded-pill border border-border transition active:scale-90"
            >
              <Camera className="size-4" />
            </button>
            {/* Escolher do dispositivo. */}
            <button
              onClick={() => galleryRef.current?.click()}
              aria-label={`Anexar foto de ${slot.label}`}
              className="grid size-9 place-items-center rounded-pill border border-border transition active:scale-90"
            >
              <ImagePlus className="size-4" />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-[11px] font-semibold text-danger">{error}</p>}

      <input ref={galleryRef} type="file" accept="image/*" onChange={handle} className="hidden" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handle} className="hidden" />
    </div>
  );
}
