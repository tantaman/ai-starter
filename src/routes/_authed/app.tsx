import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/app")({
  component: App,
});

function App() {
  return (
    <div className="flex flex-col min-h-screen">
    </div>
  );
}
