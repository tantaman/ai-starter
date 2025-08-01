import { useState } from "react";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { useZero } from "@/ui/use-zero";
import { queries } from "@/shared/queries";
import { Link } from "@tanstack/react-router";

export function BattleshipLobby() {
  const { data: session } = useSession();
  const zero = useZero();
  const [rooms] = useQuery(queries.battleshipRoomsForUser(session));
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const handleCreateRoom = async () => {
    if (!session) return;
    
    setIsCreating(true);
    try {
      const roomId: string = `room-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      await zero.mutate.createBattleshipRoom({
        id: roomId,
        createdAt: Date.now(),
      });
      
      window.location.href = `/battleship/${roomId}`;
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!session || !joinRoomId.trim()) return;
    
    setIsJoining(true);
    try {
      const playerId: string = `${joinRoomId}-player-${Date.now()}`;
      await zero.mutate.joinBattleshipRoom({
        roomId: joinRoomId.trim(),
        playerId,
        createdAt: Date.now(),
      });
      
      window.location.href = `/battleship/${joinRoomId.trim()}`;
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("Failed to join room. Please check the room ID and try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">Waiting for players</span>;
      case "placing_ships":
        return <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Placing ships</span>;
      case "active":
        return <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Active game</span>;
      case "finished":
        return <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">Finished</span>;
      default:
        return <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">{status}</span>;
    }
  };

  const copyRoomLink = (roomId: string) => {
    const url: string = `${window.location.origin}/battleship/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Room link copied to clipboard!");
    });
  };

  if (!session) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Battleship!</h2>
          <p className="mb-4">Please log in to create or join a game.</p>
          <button className="btn btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Battleship Lobby</h1>
        <p className="text-gray-600">Create a new game or join an existing one!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Create New Game</h2>
          <p className="text-sm text-gray-600 mb-4">
            Start a new battleship game and share the link with your opponent.
          </p>
          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="btn btn-primary w-full"
          >
            {isCreating ? "Creating..." : "Create Game"}
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Join Game</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter a room ID or use a shared link to join a game.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="input flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
            />
            <button
              onClick={handleJoinRoom}
              disabled={isJoining || !joinRoomId.trim()}
              className="btn btn-primary"
            >
              {isJoining ? "Joining..." : "Join"}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your Games</h2>
        {rooms && rooms.length > 0 ? (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div key={room.id} className="border border-gray-200 rounded p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {room.id}
                    </span>
                    {getStatusBadge(room.status)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>Players: </span>
                    {room.players?.map((player, index) => (
                      <span key={player.id}>
                        {player.user?.name || "Unknown"}
                        {index < (room.players?.length || 0) - 1 && ", "}
                      </span>
                    )) || "None"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Created: {new Date(room.createdAt).toLocaleDateString()} at {new Date(room.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {room.status === "waiting" && (
                    <button
                      onClick={() => copyRoomLink(room.id)}
                      className="btn btn-default btn-sm"
                    >
                      Copy Link
                    </button>
                  )}
                  <Link
                    to="/battleship/$roomId"
                    params={{ roomId: room.id }}
                    className="btn btn-primary btn-sm"
                  >
                    {room.status === "finished" ? "View" : "Play"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No games found. Create your first game above!</p>
          </div>
        )}
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold mb-4">How to Play</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>1. Create or Join:</strong> Create a new game or join using a room ID.</p>
          <p><strong>2. Place Ships:</strong> Position your 5 ships on your board (Carrier-5, Battleship-4, Cruiser-3, Submarine-3, Destroyer-2).</p>
          <p><strong>3. Take Turns:</strong> Click on your opponent's board to attack. Hit all enemy ships to win!</p>
          <p><strong>4. Share Link:</strong> Share the room link with friends to play together.</p>
        </div>
      </div>
    </div>
  );
}