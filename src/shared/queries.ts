import { queriesWithContext } from "@rocicorp/zero";
import { builder, Session } from "./schema";

const alwaysFalse = ({ or }) => or();

export const queries = queriesWithContext({
  // User queries
  currentUser(sess: Session | null) {
    return builder.user.where("id", "IS", sess?.user.id ?? null).one();
  },

  userAccounts(sess: Session | null) {
    let q = builder.user
      .where("id", "IS", sess?.user.id ?? null)
      .related("accounts");

    return sess ? q : q.where(alwaysFalse);
  },

  // Team queries
  userTeams(sess: Session | null) {
    let q = builder.team.related("members", (q) => q.related("user"));

    if (sess) {
      q = q.whereExists("members", (q) => q.where("userId", "=", sess.user.id));
    }

    return sess ? q : q.where(alwaysFalse);
  },

  teamById(sess: Session | null, teamId: string) {
    let q = builder.team
      .where("id", "=", teamId)
      .related("members", (q) => q.related("user"));

    if (sess) {
      q = q.whereExists("members", (q) => q.where("userId", "=", sess.user.id));
    }

    return sess ? q.one() : q.where(alwaysFalse).one();
  },

  // Project queries
  teamProjects(sess: Session | null, teamId: string) {
    let q = builder.project
      .where("teamId", "=", teamId)
      .related("lead")
      .related("team");

    if (sess) {
      q = q.whereExists("team", (q) =>
        q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
      );
    }

    return sess ? q : q.where(alwaysFalse);
  },

  projectById(sess: Session | null, projectId: string) {
    let q = builder.project
      .where("id", "=", projectId)
      .related("lead")
      .related("team");

    if (sess) {
      q = q.whereExists("team", (q) =>
        q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
      );
    }

    return sess ? q.one() : q.where(alwaysFalse).one();
  },

  // Issue status and priority queries
  teamIssueStatuses(sess: Session | null, teamId: string) {
    let q = builder.issueStatus
      .where("teamId", "=", teamId)
      .orderBy("position", "asc");

    if (sess) {
      q = q.whereExists("team", (q) =>
        q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
      );
    }

    return sess ? q : q.where(alwaysFalse);
  },

  teamIssuePriorities(sess: Session | null, teamId: string) {
    let q = builder.issuePriority
      .where("teamId", "=", teamId)
      .orderBy("value", "desc");

    if (sess) {
      q = q.whereExists("team", (q) =>
        q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
      );
    }

    return sess ? q : q.where(alwaysFalse);
  },

  // Issue queries
  teamIssues(
    sess: Session | null,
    teamId: string,
    statusType:
      | "backlog"
      | "unstarted"
      | "started"
      | "completed"
      | "canceled"
      | null,
    assigneeId: string | null,
    projectId: string | null
  ) {
    let q = builder.issue
      .where("teamId", "=", teamId)
      .related("status")
      .related("priority")
      .related("project")
      .related("creator")
      .related("assignee")
      .related("labelAssignments", (q) => q.related("label"));

    if (statusType) {
      q = q.whereExists("status", (q) => q.where("type", "=", statusType));
    }

    if (assigneeId) {
      q = q.where("assigneeId", "=", assigneeId);
    }

    if (projectId) {
      q = q.where("projectId", "=", projectId);
    }

    q = q.orderBy("updatedAt", "desc");

    if (sess) {
      q = q.whereExists("team", (q) =>
        q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
      );
    }

    return sess ? q : q.where(alwaysFalse);
  },

  issueById(sess: Session | null, issueId: string) {
    let q = builder.issue
      .where("id", "=", issueId)
      .related("status")
      .related("priority")
      .related("project")
      .related("team")
      .related("creator")
      .related("assignee")
      .related("labelAssignments", (q) => q.related("label"))
      .related("comments", (q) =>
        q.related("author").orderBy("createdAt", "asc")
      );

    if (sess) {
      q = q.whereExists("team", (q) =>
        q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
      );
    }

    return sess ? q.one() : q.where(alwaysFalse).one();
  },

  userAssignedIssues(sess: Session | null, teamId: string | null) {
    let q = builder.issue
      .related("status")
      .related("priority")
      .related("project")
      .related("team")
      .related("creator");

    if (teamId) {
      q = q.where("teamId", "=", teamId);
    }

    q = q.orderBy("updatedAt", "desc");

    if (sess) {
      q = q
        .where("assigneeId", "=", sess.user.id)
        .whereExists("team", (q) =>
          q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
        );
    }

    return sess ? q : q.where(alwaysFalse);
  },

  userCreatedIssues(sess: Session | null, teamId: string | null) {
    let q = builder.issue
      .related("status")
      .related("priority")
      .related("project")
      .related("team")
      .related("assignee");

    if (teamId) {
      q = q.where("teamId", "=", teamId);
    }

    q = q.orderBy("updatedAt", "desc");

    if (sess) {
      q = q
        .where("creatorId", "=", sess.user.id)
        .whereExists("team", (q) =>
          q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
        );
    }

    return sess ? q : q.where(alwaysFalse);
  },

  // Label queries
  teamLabels(sess: Session | null, teamId: string) {
    let q = builder.issueLabel
      .where("teamId", "=", teamId)
      .orderBy("name", "asc");

    if (sess) {
      q = q.whereExists("team", (q) =>
        q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
      );
    }

    return sess ? q : q.where(alwaysFalse);
  },

  // Search queries
  searchIssues(sess: Session | null, teamId: string, searchTerm: string) {
    let q = builder.issue
      .where("teamId", "=", teamId)
      .related("status")
      .related("priority")
      .related("project")
      .related("creator")
      .related("assignee")
      .related("labelAssignments", (q) => q.related("label"))
      .orderBy("updatedAt", "desc");

    if (sess && searchTerm.trim()) {
      const term: string = `%${searchTerm.toLowerCase()}%`;
      q = q
        .where(({ or, cmp }) =>
          or(cmp("title", "ILIKE", term), cmp("description", "ILIKE", term))
        )
        .whereExists("team", (q) =>
          q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
        );
    }

    return sess && searchTerm.trim() ? q : q.where(alwaysFalse);
  },

  // Team member queries
  teamMembers(sess: Session | null, teamId: string) {
    let q = builder.teamMember
      .where("teamId", "=", teamId)
      .related("user")
      .orderBy("joinedAt", "asc");

    if (sess) {
      q = q.whereExists("team", (q) =>
        q.whereExists("members", (q) => q.where("userId", "=", sess.user.id))
      );
    }

    return sess ? q : q.where(alwaysFalse);
  },
});
