import { queriesWithContext } from "@rocicorp/zero";
import { builder, Session } from "./schema";

export const queries = queriesWithContext({
  currentUser(sess: Session | null) {
    return builder.user.where("id", "IS", sess?.user.id ?? null).one();
  },

  // Battleship queries
  battleshipRoom(sess: Session | null, roomId: string) {
    if (!sess) return builder.battleshipRoom.where(({ or }) => or());
    return builder.battleshipRoom
      .where("id", "=", roomId)
      .related("creator")
      .related("winner")
      .related("players", (q) => q.related("user"))
      .related("guesses", (q) =>
        q
          .related("attacker", (aq) => aq.related("user"))
          .related("target", (tq) => tq.related("user"))
          .related("hitShip")
          .orderBy("createdAt", "asc")
      )
      .one();
  },

  battleshipPlayer(sess: Session | null, roomId: string) {
    if (!sess) return builder.battleshipPlayer.where(({ or }) => or());
    return builder.battleshipPlayer
      .where("roomId", "=", roomId)
      .where("userId", "=", sess.user.id)
      .related("user")
      .related("ships")
      .one();
  },

  battleshipOpponent(sess: Session | null, roomId: string) {
    if (!sess) return builder.battleshipPlayer.where(({ or }) => or());
    return builder.battleshipPlayer
      .where("roomId", "=", roomId)
      .where("userId", "!=", sess.user.id)
      .related("user")
      .one();
  },

  battleshipPlayerShips(sess: Session | null, playerId: string) {
    if (!sess) return builder.battleshipShip.where(({ or }) => or());
    return builder.battleshipShip
      .where("playerId", "=", playerId)
      .related("player", (q) => q.related("user"));
  },

  battleshipMyGuesses(sess: Session | null, roomId: string) {
    if (!sess) return builder.battleshipGuess.where(({ or }) => or());
    return builder.battleshipGuess
      .where("roomId", "=", roomId)
      .whereExists("attacker", (q) => q.where("userId", "=", sess.user.id))
      .related("attacker")
      .related("target")
      .related("hitShip")
      .orderBy("createdAt", "asc");
  },

  battleshipOpponentGuesses(sess: Session | null, roomId: string) {
    if (!sess) return builder.battleshipGuess.where(({ or }) => or());
    return builder.battleshipGuess
      .where("roomId", "=", roomId)
      .whereExists("target", (q) => q.where("userId", "=", sess.user.id))
      .related("attacker")
      .related("target")
      .related("hitShip")
      .orderBy("createdAt", "asc");
  },

  battleshipRoomsForUser(sess: Session | null) {
    if (!sess) return builder.battleshipRoom.where(({ or }) => or());
    return builder.battleshipRoom
      .whereExists("players", (q) => q.where("userId", "=", sess.user.id))
      .related("creator")
      .related("players", (q) => q.related("user"))
      .orderBy("createdAt", "desc");
  },
});
