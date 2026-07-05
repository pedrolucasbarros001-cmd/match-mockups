import { createFileRoute, redirect } from "@tanstack/react-router";

// Um anúncio = um espaço. "Gerir quartos" viola o princípio.
export const Route = createFileRoute("/rooms")({
  beforeLoad: () => {
    throw redirect({ to: "/my-listings" });
  },
});
