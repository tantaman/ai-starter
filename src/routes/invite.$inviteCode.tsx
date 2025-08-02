import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { GameInvite } from "@/ui/game-invite";
import { LoginForm } from "@/ui/login-form";
import { useEffect } from "react";

export const Route = createFileRoute("/invite/$inviteCode")({
  component: InvitePage,
});

function InvitePage() {
  const { inviteCode } = Route.useParams();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [game] = useQuery(session ? queries.getGameByInvite(session, inviteCode) : queries.getGameByInvite(null, inviteCode));

  // Redirect to game if user has already joined
  useEffect(() => {
    if (game && session && game.player2Id === session.user.id) {
      navigate({ to: "/game/$gameId", params: { gameId: game.id } });
    }
  }, [game, session, navigate]);

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
            <a href="/tic-tac-toe" className="nav-btn">Tic Tac Toe</a>
          </nav>
          <div className="mt-auto text-xs text-subtle">© 2025 AI Starter</div>
        </aside>

        <main className="flex-1 p-5 overflow-auto">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-5 tracking-tight text-center">
              Game Invite
            </h1>
            <div className="card">
              <p className="text-center text-gray-600 mb-4">
                Sign in to accept this tic-tac-toe game invite!
              </p>
              <div className="bg-gray-100 p-3 rounded-lg mb-4 text-center">
                <span className="font-mono text-lg">{inviteCode}</span>
              </div>
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
          <a href="/tic-tac-toe" className="nav-btn">Tic Tac Toe</a>
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
          <GameInvite inviteCode={inviteCode} />
        </div>
      </main>
    </div>
  );
}