import { useState } from "react";
import { useZero } from "./use-zero";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { useSession } from "@/client/auth";

export function GameLobby() {
  const zero = useZero();
  const { data: session } = useSession();
  const [myGames] = useQuery(queries.myGames(session));
  const [availableGames] = useQuery(queries.availableGames(session));
  const [inviteCode, setInviteCode] = useState<string>("");
  const [showJoinForm, setShowJoinForm] = useState<boolean>(false);

  async function createNewGame(withInvite: boolean = false): Promise<void> {
    const gameId: string = crypto.randomUUID();
    const invite: string | undefined = withInvite
      ? crypto.randomUUID().slice(0, 8)
      : undefined;

    try {
      await zero.mutate.createGame({ id: gameId, inviteCode: invite });
    } catch (error) {
      console.error("Error creating game:", error);
    }
  }

  async function joinGame(gameId: string): Promise<void> {
    try {
      await zero.mutate.joinGame({ gameId });
    } catch (error) {
      console.error("Error joining game:", error);
    }
  }

  async function joinByInviteCode(): Promise<void> {
    if (!inviteCode.trim()) return;

    try {
      // First try to find the game by invite code using Zero's sync
      // In a real app, you might want to add a separate query for this
      // For now, redirect to the invite page which handles the logic
      window.location.href = `/invite/${inviteCode.trim()}`;
    } catch (error) {
      console.error("Error joining by invite:", error);
    }
  }

  function formatTimeAgo(date: number): string {
    const now: number = Date.now();
    const gameTime: number = date;
    const diffInMinutes: number = Math.floor((now - gameTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  function getGameStatusText(game: any): string {
    if (game.status === "waiting") return "Waiting for opponent";
    if (game.status === "active") return "In progress";
    if (game.status === "finished") {
      if (game.winner === "draw") return "Draw";
      return `Winner: ${game.winner}`;
    }
    return "";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Start New Game</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => createNewGame(false)}
            className="btn btn-primary"
          >
            Quick Match
          </button>
          <button
            onClick={() => createNewGame(true)}
            className="btn btn-default"
          >
            Create with Invite Link
          </button>
          <button
            onClick={() => setShowJoinForm(!showJoinForm)}
            className="btn btn-default"
          >
            Join by Invite Code
          </button>
        </div>

        {showJoinForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="input flex-1"
              />
              <button
                onClick={joinByInviteCode}
                disabled={!inviteCode.trim()}
                className="btn btn-primary"
              >
                Join
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">My Games</h3>
          {myGames.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No games yet. Start a new game!
            </p>
          ) : (
            <div className="space-y-3">
              {myGames.map((game) => (
                <div
                  key={game.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm">
                      <div className="font-medium">
                        vs{" "}
                        {game.player1Id === session?.user.id
                          ? game.player2?.name || "Waiting..."
                          : game.player1?.name || "Unknown"}
                      </div>
                      <div className="text-gray-500">
                        {getGameStatusText(game)} •{" "}
                        {formatTimeAgo(game.updatedAt)}
                      </div>
                    </div>
                    <a
                      href={`/game/${game.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {game.status === "active" ? "Play" : "View"}
                    </a>
                  </div>
                  {game.inviteCode && game.status === "waiting" && (
                    <div className="text-xs text-gray-500">
                      Invite code:{" "}
                      <span className="font-mono bg-gray-100 px-1 rounded">
                        {game.inviteCode}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Available Games</h3>
          {availableGames.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No games available. Create one!
            </p>
          ) : (
            <div className="space-y-3">
              {availableGames.map((game) => (
                <div
                  key={game.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <div className="font-medium">
                        {game.player1?.name || "Anonymous"}
                      </div>
                      <div className="text-gray-500">
                        {formatTimeAgo(game.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => joinGame(game.id)}
                      className="btn btn-primary text-sm"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
