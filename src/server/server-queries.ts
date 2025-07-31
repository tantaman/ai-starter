import { queries as sharedQueries } from "@/shared/queries.js";
import { db } from "../db";
import { eq } from "drizzle-orm";

export const queries = {
  ...sharedQueries,
  /**
   * If you need to run different code on the server to fulfill a query you can do that here.
   * This is useful for queries that are access controlled.
   * 
   * Example:
   * 
  async issues(sess: Session | null, open: boolean) {
    if (sess?.user.id) {
      const u = await db.select({
        role: user.role,
      }).from(user).where(eq(user.id, sess.user.id)).limit(1);
      isAdmin = u[0]?.role === "admin";
    }

    const q = sharedQueries.issues(sess, open);
    if (!isAdmin) {
      q = q.where('visibility', 'IS NOT', 'private');
    }
    return q;
  }
  */
};
