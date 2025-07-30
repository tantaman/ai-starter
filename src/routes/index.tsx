// src/routes/index.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (context.user) {
      throw redirect({
        to: "/app",
      });
    }
  },
  component: Home,
});

import { Link } from "@tanstack/react-router";

function Home() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex h-screen">
    </div>
  );
}
