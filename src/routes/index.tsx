// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-[var(--color-base)] border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
        <div className="text-xl font-extrabold tracking-tight mb-3">
          AI Starter
        </div>
        <nav className="flex flex-col divide-y divide-neutral-200">
          <Link to="/battleship" className="nav-btn">
            Battleship
          </Link>
        </nav>
        <div className="mt-auto text-xs text-subtle">© 2025 AI Starter</div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-5 tracking-tight">
            Welcome to AI Starter
          </h1>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-2">Battleship Game</h2>
            <p className="text-body text-sm mb-4">
              Play the classic battleship game with friends! Create a room, share the link, and take turns attacking each other's ships.
            </p>
            <Link to="/battleship" className="btn btn-primary">
              Play Battleship
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
