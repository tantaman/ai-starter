import { CustomMutatorDefs } from "@rocicorp/zero";
import { schema, Session } from "./schema.js";
import { nanoid } from "nanoid";

export function createMutators(sess: Session | null) {
  return {
    // Issue mutators
    createIssue(
      tx,
      {
        id,
        title,
        description,
        priority = "medium",
      }: {
        id: string;
        title: string;
        description?: string;
        priority?: "low" | "medium" | "high" | "critical";
      }
    ) {
      if (!sess) throw new Error("Not authenticated");

      return tx.mutate.issue.insert({
        id,
        title,
        description: description || null,
        status: "open",
        priority,
        reporterId: sess.user.id,
        assigneeId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },

    updateIssue(
      tx,
      {
        id,
        title,
        description,
        status,
        priority,
        assigneeId,
      }: {
        id: string;
        title?: string;
        description?: string;
        status?: "open" | "closed" | "in_progress";
        priority?: "low" | "medium" | "high" | "critical";
        assigneeId?: string | null;
      }
    ) {
      if (!sess) throw new Error("Not authenticated");

      const updates: any = { updatedAt: Date.now() };
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (status !== undefined) updates.status = status;
      if (priority !== undefined) updates.priority = priority;
      if (assigneeId !== undefined) updates.assigneeId = assigneeId;

      return tx.mutate.issue.update({
        id,
        ...updates,
      });
    },

    deleteIssue(tx, { id }: { id: string }) {
      if (!sess) throw new Error("Not authenticated");

      return tx.mutate.issue.delete({ id });
    },

    // Comment mutators
    createComment(
      tx,
      {
        id,
        issueId,
        content,
      }: {
        id: string;
        issueId: string;
        content: string;
      }
    ) {
      if (!sess) throw new Error("Not authenticated");

      return tx.mutate.comment.insert({
        id,
        content,
        issueId,
        authorId: sess.user.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },

    updateComment(
      tx,
      {
        id,
        content,
      }: {
        id: string;
        content: string;
      }
    ) {
      if (!sess) throw new Error("Not authenticated");

      return tx.mutate.comment.update({
        id,
        content,
        updatedAt: Date.now(),
      });
    },

    deleteComment(tx, { id }: { id: string }) {
      if (!sess) throw new Error("Not authenticated");

      return tx.mutate.comment.delete({ id });
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
