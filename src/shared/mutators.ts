import { CustomMutatorDefs } from "@rocicorp/zero";
import { schema, Session } from "./schema.js";

export function createMutators(sess: Session | null) {
  return {
    // Battleship mutators
    async createBattleshipRoom(tx, { id, createdAt }: { id: string; createdAt: number }) {
      if (!sess) throw new Error("Not authenticated");
      
      await tx.mutate.battleshipRoom.insert({
        id,
        status: "waiting",
        createdAt,
        updatedAt: createdAt,
        createdById: sess.user.id,
        currentTurn: null,
        winnerId: null,
      });

      await tx.mutate.battleshipPlayer.insert({
        id: `${id}-player-1`,
        roomId: id,
        userId: sess.user.id,
        playerNumber: 1,
        ready: false,
        shipsPlaced: false,
        createdAt,
      });
    },

    async joinBattleshipRoom(tx, { roomId, playerId, createdAt }: { roomId: string; playerId: string; createdAt: number }) {
      if (!sess) throw new Error("Not authenticated");

      const room = await tx.query.battleshipRoom.where("id", "=", roomId).one();
      if (!room) throw new Error("Room not found");
      if (room.status !== "waiting") throw new Error("Room is not accepting players");

      const existingPlayers = await tx.query.battleshipPlayer.where("roomId", "=", roomId);
      if (existingPlayers.length >= 2) throw new Error("Room is full");

      const playerExists = existingPlayers.some(p => p.userId === sess.user.id);
      if (playerExists) throw new Error("Already in this room");

      await tx.mutate.battleshipPlayer.insert({
        id: playerId,
        roomId,
        userId: sess.user.id,
        playerNumber: 2,
        ready: false,
        shipsPlaced: false,
        createdAt,
      });

      await tx.mutate.battleshipRoom.update({
        id: roomId,
        status: "placing_ships",
        updatedAt: createdAt,
      });
    },

    async placeBattleshipShips(tx, { 
      playerId, 
      ships, 
      updatedAt 
    }: { 
      playerId: string; 
      ships: Array<{
        id: string;
        shipType: string;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
      }>; 
      updatedAt: number 
    }) {
      if (!sess) throw new Error("Not authenticated");

      const player = await tx.query.battleshipPlayer.where("id", "=", playerId).one();
      if (!player || player.userId !== sess.user.id) throw new Error("Unauthorized");

      for (const ship of ships) {
        await tx.mutate.battleshipShip.insert({
          id: ship.id,
          playerId,
          shipType: ship.shipType,
          startX: ship.startX,
          startY: ship.startY,
          endX: ship.endX,
          endY: ship.endY,
          sunk: false,
          createdAt: updatedAt,
        });
      }

      await tx.mutate.battleshipPlayer.update({
        id: playerId,
        shipsPlaced: true,
      });

      const room = await tx.query.battleshipRoom.where("id", "=", player.roomId).one();
      if (room) {
        const allPlayers = await tx.query.battleshipPlayer.where("roomId", "=", room.id);
        const allShipsPlaced = allPlayers.every(p => p.shipsPlaced);
        
        if (allShipsPlaced && allPlayers.length === 2) {
          await tx.mutate.battleshipRoom.update({
            id: room.id,
            status: "active",
            currentTurn: allPlayers[0].id,
            updatedAt,
          });
        }
      }
    },

    async makeBattleshipGuess(tx, {
      guessId,
      roomId,
      attackerId,
      targetId,
      x,
      y,
      createdAt
    }: {
      guessId: string;
      roomId: string;
      attackerId: string;
      targetId: string;
      x: number;
      y: number;
      createdAt: number;
    }) {
      if (!sess) throw new Error("Not authenticated");

      const room = await tx.query.battleshipRoom.where("id", "=", roomId).one();
      if (!room) throw new Error("Room not found");
      if (room.status !== "active") throw new Error("Game is not active");
      if (room.currentTurn !== attackerId) throw new Error("Not your turn");

      const attacker = await tx.query.battleshipPlayer.where("id", "=", attackerId).one();
      if (!attacker || attacker.userId !== sess.user.id) throw new Error("Unauthorized");

      const existingGuess = await tx.query.battleshipGuess
        .where("roomId", "=", roomId)
        .where("attackerId", "=", attackerId)
        .where("x", "=", x)
        .where("y", "=", y);
      if (existingGuess.length > 0) throw new Error("Already guessed this position");

      const targetShips = await tx.query.battleshipShip.where("playerId", "=", targetId);
      let result: string = "miss";
      let hitShipId: string | null = null;
      let sunkShip: boolean = false;

      for (const ship of targetShips) {
        if (isHit(x, y, ship.startX, ship.startY, ship.endX, ship.endY)) {
          result = "hit";
          hitShipId = ship.id;

          const shipGuesses = await tx.query.battleshipGuess
            .where("hitShipId", "=", ship.id);
          
          const shipLength = Math.max(
            Math.abs(ship.endX - ship.startX) + 1,
            Math.abs(ship.endY - ship.startY) + 1
          );

          if (shipGuesses.length + 1 === shipLength) {
            result = "sunk";
            sunkShip = true;
            await tx.mutate.battleshipShip.update({
              id: ship.id,
              sunk: true,
            });
          }
          break;
        }
      }

      await tx.mutate.battleshipGuess.insert({
        id: guessId,
        roomId,
        attackerId,
        targetId,
        x,
        y,
        result,
        hitShipId,
        createdAt,
      });

      if (sunkShip) {
        const allTargetShips = await tx.query.battleshipShip.where("playerId", "=", targetId);
        const allSunk = allTargetShips.every(ship => ship.sunk || ship.id === hitShipId);
        
        if (allSunk) {
          await tx.mutate.battleshipRoom.update({
            id: roomId,
            status: "finished",
            winnerId: attacker.userId,
            updatedAt: createdAt,
          });
          return;
        }
      }

      if (result === "miss") {
        const target = await tx.query.battleshipPlayer.where("id", "=", targetId).one();
        await tx.mutate.battleshipRoom.update({
          id: roomId,
          currentTurn: targetId,
          updatedAt: createdAt,
        });
      }
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

function isHit(x: number, y: number, startX: number, startY: number, endX: number, endY: number): boolean {
  const minX: number = Math.min(startX, endX);
  const maxX: number = Math.max(startX, endX);
  const minY: number = Math.min(startY, endY);
  const maxY: number = Math.max(startY, endY);
  
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

export type Mutators = ReturnType<typeof createMutators>;
