import { queriesWithContext } from "@rocicorp/zero";
import { builder, Session } from "./schema";

export const queries = queriesWithContext({
  currentUser(sess: Session | null) {
    return builder.user.where("id", "IS", sess?.user.id ?? null).one();
  },

  // Get all channels the current user is a member of
  channels(sess: Session | null) {
    return builder.channel
      .whereExists("members", (q) =>
        q.where("userId", "IS", sess?.user.id ?? null)
      )
      .related("creator")
      .orderBy("name", "asc");
  },

  // Get channel by ID with creator info
  channel(sess: Session | null, channelId: string) {
    return builder.channel
      .where("id", "=", channelId)
      .whereExists("members", (q) =>
        q.where("userId", "IS", sess?.user.id ?? null)
      )
      .related("creator")
      .one();
  },

  // Get messages for a specific channel
  messages(sess: Session | null, channelId: string) {
    return builder.message
      .where("channelId", "=", channelId)
      .whereExists("channel", (q) =>
        q.whereExists("members", (memberQ) =>
          memberQ.where("userId", "IS", sess?.user.id ?? null)
        )
      )
      .related("author")
      .orderBy("createdAt", "asc");
  },

  // Get all users for creating channels and mentions
  users(sess: Session | null) {
    if (!sess) return builder.user.where("id", "IS", null);
    return builder.user.orderBy("name", "asc");
  },
});
