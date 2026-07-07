import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getRole, getSession } from "@/lib/user-state";

export const Route = createFileRoute("/splash")({
  head: () => ({ meta: [{ title: "HomeMatch" }] }),
  component: SplashPage,
});

function SplashPage() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => {
      const session = getSession();
      if (session !== "in") {
        nav({ to: "/login" });
        return;
      }
      const role = getRole();
      nav({ to: role === "landlord" ? "/dashboard" : "/explore" });
    }, 700);
    return () => clearTimeout(t);
  }, [nav]);
  return (
    <div className="grid min-h-svh place-items-center bg-primary text-primary-foreground">
      <div className="flex flex-col items-center gap-3">
        <div className="grid size-20 place-items-center rounded-3xl bg-white/15 backdrop-blur">
          <span className="font-display text-4xl font-extrabold">H</span>
        </div>
        <div className="font-display text-2xl font-extrabold tracking-tight">HomeMatch</div>
        <div className="text-xs opacity-80">A carregar…</div>
      </div>
    </div>
  );
}
