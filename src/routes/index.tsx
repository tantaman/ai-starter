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
          <Link to="/" className="nav-btn bg-blue-50">Home</Link>
          <Link to="/tic-tac-toe" className="nav-btn">Tic Tac Toe</Link>
        </nav>
        <div className="mt-auto text-xs text-subtle">© 2025 AI Starter</div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-5 tracking-tight">
            AI Starter
          </h1>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-2">Welcome!</h2>
            <p className="text-body text-sm mb-4">
              This is an AI starter app with authentication, database, and real-time sync capabilities.
            </p>
            <div className="mt-4 flex gap-3">
              <Link to="/tic-tac-toe" className="btn btn-primary">
                Play Tic Tac Toe
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-2">Features</h2>
            <ul className="text-sm space-y-2">
              <li>• Real-time multiplayer tic-tac-toe game</li>
              <li>• Invite friends with invite codes</li>
              <li>• Authentication with GitHub or email</li>
              <li>• Real-time sync powered by Zero</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
