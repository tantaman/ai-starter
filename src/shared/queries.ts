import { queriesWithContext } from "@rocicorp/zero";
import { builder, Session } from "./schema";

export const queries = queriesWithContext({
  currentUser(sess: Session | null) {
    return builder.user.where("id", "IS", sess?.user.id ?? null).one();
  },

  // Issue queries
  allIssues() {
    return builder.issue
      .related("reporter")
      .related("assignee")
      .orderBy("createdAt", "desc");
  },

  openIssues() {
    return builder.issue
      .where("status", "=", "open")
      .related("reporter")
      .related("assignee")
      .orderBy("createdAt", "desc");
  },

  myIssues(sess: Session | null) {
    return builder.issue
      .where("reporterId", "IS", sess?.user.id ?? null)
      .related("reporter")
      .related("assignee")
      .orderBy("createdAt", "desc");
  },

  assignedToMe(sess: Session | null) {
    return builder.issue
      .where("assigneeId", "IS", sess?.user.id ?? null)
      .related("reporter")
      .related("assignee")
      .orderBy("createdAt", "desc");
  },

  issueById(sess: Session | null, id: string) {
    console.log("Fetching issue by ID:", id);
    return builder.issue
      .where("id", "=", id)
      .related("reporter")
      .related("assignee")
      .related("comments", (q) =>
        q.related("author").orderBy("createdAt", "asc")
      )
      .one();
  },

  // Comment queries
  commentsForIssue(sess: Session | null, issueId: string) {
    return builder.comment
      .where("issueId", "=", issueId)
      .related("author")
      .orderBy("createdAt", "asc");
  },

  // User queries
  allUsers() {
    return builder.user.orderBy("name", "asc");
  },
});
