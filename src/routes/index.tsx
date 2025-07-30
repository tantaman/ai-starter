// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <div className="flex h-screen">Placeholder content. Remove me.</div>;
}
