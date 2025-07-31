import { CustomMutatorDefs } from "@rocicorp/zero";
import { schema, Session } from "./schema.js";

export function createMutators(sess: Session | null) {
  return {
    async createChannel(tx, { id, name, description, isPrivate = false }: {
      id: string;
      name: string;
      description?: string;
      isPrivate?: boolean;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      await tx.mutate.channel.insert({
        id,
        name,
        description: description || null,
        isPrivate,
        createdBy: sess.user.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Add the creator as a member of the channel
      await tx.mutate.channelMember.insert({
        id: `${id}_${sess.user.id}`,
        channelId: id,
        userId: sess.user.id,
        joinedAt: Date.now(),
      });
    },

    async sendMessage(tx, { id, content, channelId }: {
      id: string;
      content: string;
      channelId: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      await tx.mutate.message.insert({
        id,
        content,
        channelId,
        authorId: sess.user.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },

    async joinChannel(tx, { channelId }: {
      channelId: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      await tx.mutate.channelMember.insert({
        id: `${channelId}_${sess.user.id}`,
        channelId,
        userId: sess.user.id,
        joinedAt: Date.now(),
      });
    },

    async leaveChannel(tx, { channelId }: {
      channelId: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      await tx.mutate.channelMember.delete({
        id: `${channelId}_${sess.user.id}`,
      });
    },

    async addMemberToChannel(tx, { channelId, userId }: {
      channelId: string;
      userId: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      await tx.mutate.channelMember.insert({
        id: `${channelId}_${userId}`,
        channelId,
        userId,
        joinedAt: Date.now(),
      });
    },

    async deleteMessage(tx, { id }: {
      id: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      await tx.mutate.message.delete({
        id,
      });
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
