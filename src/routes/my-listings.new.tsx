import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/my-listings/new")({
  beforeLoad: () => {
    throw redirect({ to: "/publish" });
  },
});
