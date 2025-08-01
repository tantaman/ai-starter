import { createFileRoute } from "@tanstack/react-router";
import { BattleshipGame } from "@/ui/battleship-game";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/battleship/$roomId")({
  component: BattleshipGamePage,
});

function BattleshipGamePage() {
  const { roomId } = Route.useParams();

  return (
    <div>
      <div className="p-4 border-b bg-gray-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/battleship" className="btn btn-default btn-sm">
              ← Back to Lobby
            </Link>
            <div>
              <span className="text-sm text-gray-600">Room ID: </span>
              <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                {roomId}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const url: string = window.location.href;
              navigator.clipboard.writeText(url).then(() => {
                alert("Room link copied to clipboard!");
              });
            }}
            className="btn btn-default btn-sm"
          >
            Share Link
          </button>
        </div>
      </div>
      <BattleshipGame roomId={roomId} />
    </div>
  );
}