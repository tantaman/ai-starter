import { useZero } from "./use-zero";

interface GameBoardProps {
  game: {
    id: string;
    board: string;
    currentPlayer: string;
    status: string;
    winner: string | null;
    player1?: { id: string; name: string } | null;
    player2?: { id: string; name: string } | null;
    player1Id: string;
    player2Id: string | null;
  };
  currentUserId: string;
}

export function GameBoard({ game, currentUserId }: GameBoardProps) {
  const zero = useZero();
  const board: (string | null)[] = JSON.parse(game.board);
  
  const isPlayer1: boolean = game.player1Id === currentUserId;
  const isPlayer2: boolean = game.player2Id === currentUserId;
  const isMyTurn: boolean = 
    game.status === "active" && 
    ((isPlayer1 && game.currentPlayer === "X") || 
     (isPlayer2 && game.currentPlayer === "O"));

  const currentUserSymbol: string = isPlayer1 ? "X" : "O";

  async function handleCellClick(position: number): Promise<void> {
    if (game.status !== "active" || !isMyTurn || board[position] !== null) {
      return;
    }

    try {
      await zero.mutate.makeMove({ gameId: game.id, position });
    } catch (error) {
      console.error("Error making move:", error);
    }
  }

  async function handleReset(): Promise<void> {
    try {
      await zero.mutate.resetGame({ gameId: game.id });
    } catch (error) {
      console.error("Error resetting game:", error);
    }
  }

  function getGameStatus(): string {
    if (game.status === "waiting") {
      return "Waiting for opponent...";
    }
    
    if (game.status === "finished") {
      if (game.winner === "draw") {
        return "Game ended in a draw!";
      }
      if (game.winner) {
        const winnerName: string = 
          (game.winner === "X" ? game.player1?.name : game.player2?.name) || "Unknown";
        return `${winnerName} wins!`;
      }
    }
    
    if (game.status === "active") {
      if (isMyTurn) {
        return "Your turn";
      } else {
        const otherPlayerName: string = 
          (isPlayer1 ? game.player2?.name : game.player1?.name) || "Opponent";
        return `${otherPlayerName}'s turn`;
      }
    }
    
    return "";
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Tic Tac Toe</h2>
        
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="flex items-center gap-2">
            <span className="font-medium">X:</span>
            <span>{game.player1?.name || "Player 1"}</span>
            {isPlayer1 && <span className="text-blue-600">(You)</span>}
          </span>
          <span className="flex items-center gap-2">
            <span className="font-medium">O:</span>
            <span>{game.player2?.name || "Waiting..."}</span>
            {isPlayer2 && <span className="text-blue-600">(You)</span>}
          </span>
        </div>
        
        <div className="text-center text-sm font-medium text-heading">
          {getGameStatus()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={game.status !== "active" || !isMyTurn || cell !== null}
            className={`
              w-16 h-16 border-2 border-gray-300 text-2xl font-bold
              transition-colors duration-200
              ${cell !== null 
                ? "bg-gray-100 cursor-not-allowed" 
                : isMyTurn && game.status === "active"
                  ? "hover:bg-blue-50 cursor-pointer border-blue-300"
                  : "cursor-not-allowed"
              }
              ${cell === "X" ? "text-blue-600" : "text-red-600"}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {game.status === "finished" && (isPlayer1 || isPlayer2) && (
        <div className="text-center">
          <button 
            onClick={handleReset}
            className="btn btn-primary"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}