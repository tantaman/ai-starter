import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/client/auth";
import { GameLobby } from "@/ui/game-lobby";
import { LoginForm } from "@/ui/login-form";

export const Route = createFileRoute("/tic-tac-toe")({
  component: TicTacToePage,
});

function TicTacToePage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen">
        <aside className="w-56 bg-[var(--color-base)] border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
          <div className="text-xl font-extrabold tracking-tight mb-3">
            AI Starter
          </div>
          <nav className="flex flex-col divide-y divide-neutral-200">
            <a href="/" className="nav-btn">Home</a>
            <a href="/tic-tac-toe" className="nav-btn bg-blue-50">Tic Tac Toe</a>
          </nav>
          <div className="mt-auto text-xs text-subtle">© 2025 AI Starter</div>
        </aside>

        <main className="flex-1 p-5 overflow-auto">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-5 tracking-tight text-center">
              Tic Tac Toe
            </h1>
            <div className="card">
              <p className="text-center text-gray-600 mb-4">
                Sign in to start playing tic-tac-toe with friends!
              </p>
              <LoginForm />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-[var(--color-base)] border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
        <div className="text-xl font-extrabold tracking-tight mb-3">
          AI Starter
        </div>
        <nav className="flex flex-col divide-y divide-neutral-200">
          <a href="/" className="nav-btn">Home</a>
          <a href="/tic-tac-toe" className="nav-btn bg-blue-50">Tic Tac Toe</a>
        </nav>
        <div className="mt-auto">
          <div className="text-xs text-subtle mb-2">
            Signed in as: {session.user.name}
          </div>
          <div className="text-xs text-subtle">© 2025 AI Starter</div>
        </div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-5 tracking-tight">
            Tic Tac Toe
          </h1>
          <GameLobby />
        </div>
      </main>
    </div>
  );
}