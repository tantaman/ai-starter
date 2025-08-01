import { useState } from "react";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { useZero } from "@/ui/use-zero";
import { queries } from "@/shared/queries";
import { BattleshipBoard, Ship, Guess } from "./battleship-board";

interface BattleshipGameProps {
  roomId: string;
}

const SHIP_TYPES: Array<{ type: string; length: number; name: string }> = [
  { type: "carrier", length: 5, name: "Carrier" },
  { type: "battleship", length: 4, name: "Battleship" },
  { type: "cruiser", length: 3, name: "Cruiser" },
  { type: "submarine", length: 3, name: "Submarine" },
  { type: "destroyer", length: 2, name: "Destroyer" },
];

export function BattleshipGame({ roomId }: BattleshipGameProps) {
  const { data: session } = useSession();
  const zero = useZero();
  
  const [room] = useQuery(queries.battleshipRoom(session, roomId));
  const [player] = useQuery(queries.battleshipPlayer(session, roomId));
  const [opponent] = useQuery(queries.battleshipOpponent(session, roomId));
  const [myGuesses] = useQuery(queries.battleshipMyGuesses(session, roomId));
  const [opponentGuesses] = useQuery(queries.battleshipOpponentGuesses(session, roomId));

  const [placingShipIndex, setPlacingShipIndex] = useState<number>(0);
  const [shipOrientation, setShipOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [placedShips, setPlacedShips] = useState<Array<{
    id: string;
    shipType: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }>>([]);

  if (!session || !room || !player) {
    return <div className="p-4">Loading...</div>;
  }

  const isMyTurn: boolean = room.currentTurn === player.id;
  const gamePhase: string = room.status;

  const handleShipPlace = (startX: number, startY: number, endX: number, endY: number) => {
    if (placingShipIndex >= SHIP_TYPES.length) return;

    const shipType: string = SHIP_TYPES[placingShipIndex].type;
    const newShip = {
      id: `${player.id}-${shipType}-${Date.now()}`,
      shipType,
      startX,
      startY,
      endX,
      endY,
    };

    const updatedShips: Array<typeof newShip> = [...placedShips, newShip];
    setPlacedShips(updatedShips);

    if (placingShipIndex === SHIP_TYPES.length - 1) {
      zero.mutate.placeBattleshipShips({
        playerId: player.id,
        ships: updatedShips,
        updatedAt: Date.now(),
      });
      setPlacingShipIndex(SHIP_TYPES.length);
    } else {
      setPlacingShipIndex(prev => prev + 1);
    }
  };

  const handleGuess = (x: number, y: number) => {
    if (!isMyTurn || !opponent || gamePhase !== "active") return;

    zero.mutate.makeBattleshipGuess({
      guessId: `guess-${Date.now()}-${Math.random()}`,
      roomId,
      attackerId: player.id,
      targetId: opponent.id,
      x,
      y,
      createdAt: Date.now(),
    });
  };

  const myShips: Ship[] = (player.ships || []).map(ship => ({
    id: ship.id,
    shipType: ship.shipType,
    startX: ship.startX,
    startY: ship.startY,
    endX: ship.endX,
    endY: ship.endY,
    sunk: ship.sunk,
  }));

  const myGuessesFormatted: Guess[] = (myGuesses || []).map(guess => ({
    id: guess.id,
    x: guess.x,
    y: guess.y,
    result: guess.result as "hit" | "miss" | "sunk",
    hitShipId: guess.hitShipId || undefined,
  }));

  const opponentGuessesFormatted: Guess[] = (opponentGuesses || []).map(guess => ({
    id: guess.id,
    x: guess.x,
    y: guess.y,
    result: guess.result as "hit" | "miss" | "sunk",
    hitShipId: guess.hitShipId || undefined,
  }));

  const getGameStatus = () => {
    if (gamePhase === "waiting") {
      return "Waiting for opponent to join...";
    }
    if (gamePhase === "placing_ships") {
      if (!player.shipsPlaced) {
        if (placingShipIndex < SHIP_TYPES.length) {
          return `Place your ${SHIP_TYPES[placingShipIndex].name} (${SHIP_TYPES[placingShipIndex].length} cells)`;
        }
        return "Placing ships...";
      }
      return "Waiting for opponent to place ships...";
    }
    if (gamePhase === "active") {
      return isMyTurn ? "Your turn - click on opponent's board to attack!" : "Opponent's turn";
    }
    if (gamePhase === "finished") {
      return room.winnerId === session.user.id ? "You won! 🎉" : "You lost 😢";
    }
    return "";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Battleship</h1>
        <div className="flex items-center justify-between">
          <p className="text-lg">{getGameStatus()}</p>
          {gamePhase === "placing_ships" && !player.shipsPlaced && placingShipIndex < SHIP_TYPES.length && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Orientation:</span>
              <button
                onClick={() => setShipOrientation("horizontal")}
                className={`btn btn-sm ${shipOrientation === "horizontal" ? "btn-primary" : "btn-default"}`}
              >
                Horizontal
              </button>
              <button
                onClick={() => setShipOrientation("vertical")}
                className={`btn btn-sm ${shipOrientation === "vertical" ? "btn-primary" : "btn-default"}`}
              >
                Vertical
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Board</h2>
          <BattleshipBoard
            ships={myShips}
            guesses={opponentGuessesFormatted}
            placingShip={
              gamePhase === "placing_ships" && 
              !player.shipsPlaced && 
              placingShipIndex < SHIP_TYPES.length
                ? {
                    type: SHIP_TYPES[placingShipIndex].type,
                    length: SHIP_TYPES[placingShipIndex].length,
                    orientation: shipOrientation,
                  }
                : undefined
            }
            onShipPlace={handleShipPlace}
            disabled={gamePhase !== "placing_ships" || player.shipsPlaced}
          />
        </div>

        {opponent && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Opponent's Board ({opponent.user?.name || "Unknown"})
            </h2>
            <BattleshipBoard
              isOpponentBoard
              guesses={myGuessesFormatted}
              onCellClick={handleGuess}
              isMyTurn={isMyTurn}
              disabled={gamePhase !== "active" || !isMyTurn}
            />
          </div>
        )}
      </div>

      {gamePhase === "placing_ships" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Ships to Place:</h3>
          <div className="flex flex-wrap gap-2">
            {SHIP_TYPES.map((ship, index) => (
              <div
                key={ship.type}
                className={`px-3 py-1 rounded text-sm ${
                  index < placingShipIndex
                    ? "bg-green-200 text-green-800"
                    : index === placingShipIndex
                    ? "bg-blue-200 text-blue-800"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {ship.name} ({ship.length})
                {index < placingShipIndex && " ✓"}
                {index === placingShipIndex && " ← Current"}
              </div>
            ))}
          </div>
        </div>
      )}

      {gamePhase === "active" && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Your Attacks</h3>
            <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
              {myGuessesFormatted.map(guess => (
                <div key={guess.id} className="flex justify-between">
                  <span>{String.fromCharCode(65 + guess.y)}{guess.x + 1}</span>
                  <span className={
                    guess.result === "hit" ? "text-red-600" :
                    guess.result === "sunk" ? "text-red-800 font-bold" :
                    "text-blue-600"
                  }>
                    {guess.result.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Opponent's Attacks</h3>
            <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
              {opponentGuessesFormatted.map(guess => (
                <div key={guess.id} className="flex justify-between">
                  <span>{String.fromCharCode(65 + guess.y)}{guess.x + 1}</span>
                  <span className={
                    guess.result === "hit" ? "text-red-600" :
                    guess.result === "sunk" ? "text-red-800 font-bold" :
                    "text-blue-600"
                  }>
                    {guess.result.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}