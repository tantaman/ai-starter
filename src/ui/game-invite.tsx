import { useState } from "react";
import { useZero } from "./use-zero";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { useSession } from "@/client/auth";

interface GameInviteProps {
  inviteCode: string;
}

export function GameInvite({ inviteCode }: GameInviteProps) {
  const zero = useZero();
  const { data: session } = useSession();
  const [game] = useQuery(queries.getGameByInvite(session, inviteCode));
  const [joining, setJoining] = useState<boolean>(false);

  async function handleJoinGame(): Promise<void> {
    if (!game || joining) return;
    
    setJoining(true);
    try {
      await zero.mutate.joinGame({ gameId: game.id });
      // Redirect will be handled by the parent component
    } catch (error) {
      console.error("Error joining game:", error);
    } finally {
      setJoining(false);
    }
  }

  if (!game) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">Game Invite</h2>
        <p className="text-gray-500 mb-4">
          Invalid or expired invite code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{inviteCode}</span>
        </p>
        <a href="/tic-tac-toe" className="btn btn-default">
          Go to Lobby
        </a>
      </div>
    );
  }

  if (game.player1Id === session?.user.id) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">Your Game</h2>
        <p className="text-gray-500 mb-4">
          This is your own game. Share this invite code with a friend:
        </p>
        <div className="bg-gray-100 p-3 rounded-lg mb-4">
          <span className="font-mono text-lg">{inviteCode}</span>
        </div>
        <a href={`/game/${game.id}`} className="btn btn-primary">
          Go to Game
        </a>
      </div>
    );
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Game Invite</h2>
      <p className="text-gray-600 mb-2">
        You've been invited to play tic-tac-toe!
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Hosted by: <span className="font-medium">{game.player1?.name || "Anonymous"}</span>
      </p>
      
      <div className="space-y-3">
        <button 
          onClick={handleJoinGame}
          disabled={joining}
          className="btn btn-primary w-full"
        >
          {joining ? "Joining..." : "Join Game"}
        </button>
        <a href="/tic-tac-toe" className="btn btn-default w-full">
          Go to Lobby
        </a>
      </div>
    </div>
  );
}

interface ShareInviteProps {
  inviteCode: string;
}

export function ShareInvite({ inviteCode }: ShareInviteProps) {
  const [copied, setCopied] = useState<boolean>(false);
  
  const inviteUrl: string = `${window.location.origin}/invite/${inviteCode}`;

  async function copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="font-medium text-blue-900 mb-2">Share this game</h3>
      <div className="flex gap-2">
        <input 
          type="text"
          value={inviteUrl}
          readOnly
          className="input flex-1 text-sm"
        />
        <button 
          onClick={copyToClipboard}
          className="btn btn-primary text-sm"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-blue-700 mt-2">
        Invite code: <span className="font-mono">{inviteCode}</span>
      </p>
    </div>
  );
}