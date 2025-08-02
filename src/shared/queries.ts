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
});
