import { queriesWithContext } from "@rocicorp/zero";
import { builder, Session } from "./schema";

export const queries = queriesWithContext({
  // Add your query definitions here
  // Example:
  // getUser: (sess: Session | null, id: string) => builder.user.where("id", "=", id),
  currentUser(sess: Session | null) {
    return builder.user.where("id", "IS", sess?.user.id ?? null).one();
  },
});
