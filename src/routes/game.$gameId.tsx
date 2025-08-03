import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { GameBoard } from "@/ui/game-board";
import { ShareInvite } from "@/ui/game-invite";
import { LoginForm } from "@/ui/login-form";

export const Route = createFileRoute("/game/$gameId")({
  component: GamePage,
});

function GamePage() {
  const { gameId } = Route.useParams();
  const { data: session } = useSession();
  const [game] = useQuery(queries.getGame(session, gameId));

  if (!session) {
    return (
      <div className="flex h-screen">
        <aside className="w-56 bg-[var(--color-base)] border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
          <div className="text-xl font-extrabold tracking-tight mb-3">
            AI Starter
          </div>
          <nav className="flex flex-col divide-y divide-neutral-200">
            <a href="/" className="nav-btn">
              Home
            </a>
            <a href="/tic-tac-toe" className="nav-btn">
              Tic Tac Toe
            </a>
          </nav>
          <div className="mt-auto text-xs text-subtle">© 2025 AI Starter</div>
        </aside>

        <main className="flex-1 p-5 overflow-auto">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-5 tracking-tight text-center">
              Join Game
            </h1>
            <div className="card">
              <p className="text-center text-gray-600 mb-4">
                Sign in to join this tic-tac-toe game!
              </p>
              <LoginForm />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex h-screen">
        <aside className="w-56 bg-[var(--color-base)] border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
          <div className="text-xl font-extrabold tracking-tight mb-3">
            AI Starter
          </div>
          <nav className="flex flex-col divide-y divide-neutral-200">
            <a href="/" className="nav-btn">
              Home
            </a>
            <a href="/tic-tac-toe" className="nav-btn">
              Tic Tac Toe
            </a>
          </nav>
          <div className="mt-auto text-xs text-subtle">© 2025 AI Starter</div>
        </aside>

        <main className="flex-1 p-5 overflow-auto">
          <div className="max-w-md mx-auto">
            <div className="card text-center">
              <h2 className="text-xl font-bold mb-4">Game Not Found</h2>
              <p className="text-gray-600 mb-4">
                This game doesn't exist or you don't have permission to view it.
              </p>
              <a href="/tic-tac-toe" className="btn btn-primary">
                Go to Lobby
              </a>
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
          <a href="/" className="nav-btn">
            Home
          </a>
          <a href="/tic-tac-toe" className="nav-btn">
            Tic Tac Toe
          </a>
        </nav>
        <div className="mt-auto">
          <div className="text-xs text-subtle mb-2">
            Signed in as: {session.user.name}
          </div>
          <div className="text-xs text-subtle">© 2025 AI Starter</div>
        </div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <a
              href="/tic-tac-toe"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Lobby
            </a>
          </div>

          {game.inviteCode &&
            game.status === "waiting" &&
            game.player1Id === session.user.id && (
              <ShareInvite inviteCode={game.inviteCode} />
            )}

          <GameBoard game={game} currentUserId={session.user.id} />
        </div>
      </main>
    </div>
  );
}
