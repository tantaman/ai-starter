import { CustomMutatorDefs } from "@rocicorp/zero";
import { schema, Session } from "./schema.js";

// Helper function to check for winner
function checkWinner(board: (string | null)[]): string | null {
  const lines: number[][] = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function createMutators(sess: Session | null) {
  return {
    // Create a new game
    async createGame(tx, { id, inviteCode }: { id: string; inviteCode?: string }) {
      if (!sess) throw new Error("Not authenticated");
      
      await tx.mutate.game.insert({
        id,
        player1Id: sess.user.id,
        player2Id: null,
        board: JSON.stringify(Array(9).fill(null)),
        currentPlayer: "X",
        status: "waiting",
        winner: null,
        inviteCode: inviteCode || null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },

    // Join a game as player 2
    async joinGame(tx, { gameId }: { gameId: string }) {
      if (!sess) throw new Error("Not authenticated");

      const game = await tx.query.game.where("id", "=", gameId).one();
      if (!game) throw new Error("Game not found");
      if (game.status !== "waiting") throw new Error("Game is not available");
      if (game.player1Id === sess.user.id) throw new Error("Cannot join your own game");
      if (game.player2Id) throw new Error("Game is full");

      await tx.mutate.game.update({
        id: gameId,
        player2Id: sess.user.id,
        status: "active",
        updatedAt: Date.now(),
      });
    },

    // Make a move in the game
    async makeMove(tx, { gameId, position }: { gameId: string; position: number }) {
      if (!sess) throw new Error("Not authenticated");
      if (position < 0 || position > 8) throw new Error("Invalid position");

      const game = await tx.query.game.where("id", "=", gameId).one();
      if (!game) throw new Error("Game not found");
      if (game.status !== "active") throw new Error("Game is not active");
      
      const isPlayer1: boolean = game.player1Id === sess.user.id;
      const isPlayer2: boolean = game.player2Id === sess.user.id;
      
      if (!isPlayer1 && !isPlayer2) throw new Error("Not a player in this game");

      const currentSymbol: string = isPlayer1 ? "X" : "O";
      if (game.currentPlayer !== currentSymbol) throw new Error("Not your turn");

      const board: (string | null)[] = JSON.parse(game.board);
      if (board[position] !== null) throw new Error("Position already taken");

      board[position] = currentSymbol;
      
      // Check for winner
      const winner: string | null = checkWinner(board);
      const isDraw: boolean = !winner && board.every(cell => cell !== null);
      
      let newStatus: string = game.status;
      if (winner || isDraw) {
        newStatus = "finished";
      }

      await tx.mutate.game.update({
        id: gameId,
        board: JSON.stringify(board),
        currentPlayer: currentSymbol === "X" ? "O" : "X",
        status: newStatus,
        winner: winner || (isDraw ? "draw" : null),
        updatedAt: Date.now(),
      });
    },

    // Reset/restart a finished game
    async resetGame(tx, { gameId }: { gameId: string }) {
      if (!sess) throw new Error("Not authenticated");

      const game = await tx.query.game.where("id", "=", gameId).one();
      if (!game) throw new Error("Game not found");
      if (game.status !== "finished") throw new Error("Can only reset finished games");
      
      const isPlayer: boolean = game.player1Id === sess.user.id || game.player2Id === sess.user.id;
      if (!isPlayer) throw new Error("Not a player in this game");

      await tx.mutate.game.update({
        id: gameId,
        board: JSON.stringify(Array(9).fill(null)),
        currentPlayer: "X",
        status: "active",
        winner: null,
        updatedAt: Date.now(),
      });
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
