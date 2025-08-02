import { queriesWithContext } from "@rocicorp/zero";
import { builder, Session } from "./schema";

const alwaysFalse = ({ or }) => or();

export const queries = queriesWithContext({
  // Add your query definitions here
  // Example:
  // getUser: (sess: Session | null, id: string) => builder.user.where("id", "=", id),
  //
  // If you need to perform complex permission checks server side for a query,
  // 1. add the unpermissioned query here
  // 2. add the permissioned query in src/server/server-queries.ts
  // The query on the server can be async and call whatever you like.
  currentUser(sess: Session | null) {
    return builder.user.where("id", "IS", sess?.user.id ?? null).one();
  },

  // you can also put permission checks in the share queries
  // as this file will be used in the client and server.
  // If you do that, it is VERY IMPORTANT that your
  // permission check does not change the shape of the data returned.
  // The functions defined here must also be synchronous.
  // Example:
  userAccounts(sess: Session | null) {
    let q = builder.user
      .where("id", "IS", sess?.user.id ?? null)
      .related("accounts");

    return sess ? q : q.where(alwaysFalse);
  },

  // Get all games for the current user (either as player1 or player2)
  myGames(sess: Session | null) {
    let q = builder.game
      .where(({ or, cmp }) =>
        or(
          cmp("player1Id", "IS", sess?.user.id ?? null),
          cmp("player2Id", "IS", sess?.user.id ?? null)
        )
      )
      .related("player1")
      .related("player2")
      .orderBy("updatedAt", "desc");

    return sess ? q : q.where(alwaysFalse);
  },

  // Get a specific game by ID (only if user is a player)
  getGame(sess: Session | null, gameId: string) {
    if (!sess) {
      return builder.game.where(alwaysFalse).one();
    }

    return builder.game
      .where("id", "=", gameId)
      .where(({ or, cmp }) =>
        or(
          cmp("player1Id", "=", sess.user.id),
          cmp("player2Id", "=", sess.user.id)
        )
      )
      .related("player1")
      .related("player2")
      .one();
  },

  // Get games waiting for opponents (public invite games)
  availableGames(sess: Session | null) {
    return builder.game
      .where("status", "=", "waiting")
      .where("player2Id", "IS", null)
      .where("inviteCode", "IS NOT", null)
      .related("player1")
      .orderBy("createdAt", "desc")
      .limit(20);
  },

  // Get game by invite code
  getGameByInvite(sess: Session | null, inviteCode: string) {
    return builder.game
      .where("inviteCode", "=", inviteCode)
      .where("status", "=", "waiting")
      .related("player1")
      .related("player2")
      .one();
  },
});
