import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/splash")({
  head: () => ({ meta: [{ title: "HomeMatch" }] }),
  component: SplashPage,
});

function SplashPage() {
  const nav = useNavigate();
  useEffect(() => {
    // Mock: check "session" via localStorage; sempre segue para /explore (mockado como logado).
    const t = setTimeout(() => {
      const hasSession = typeof window !== "undefined" && window.localStorage.getItem("hm.session") === "in";
      nav({ to: hasSession ? "/explore" : "/login" });
    }, 900);
    return () => clearTimeout(t);
  }, [nav]);
  return (
    <div className="grid min-h-svh place-items-center bg-primary text-primary-foreground">
      <div className="flex flex-col items-center gap-3">
        <div className="grid size-20 place-items-center rounded-3xl bg-white/15 backdrop-blur">
          <span className="font-display text-4xl font-extrabold">H</span>
        </div>
        <div className="font-display text-2xl font-extrabold tracking-tight">HomeMatch</div>
        <div className="text-xs opacity-80">A encontrar o teu espaço…</div>
      </div>
    </div>
  );
}
