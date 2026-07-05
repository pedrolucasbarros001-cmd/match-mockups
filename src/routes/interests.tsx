import { createFileRoute, redirect } from "@tanstack/react-router";

// Interesses agora fazem parte dos Matches (lifecycle: interested).
export const Route = createFileRoute("/interests")({
  beforeLoad: () => {
    throw redirect({ to: "/matches" });
  },
});
