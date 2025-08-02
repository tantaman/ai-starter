import { CustomMutatorDefs } from "@rocicorp/zero";
import { schema, Session } from "./schema.js";

export function createMutators(sess: Session | null) {
  return {
    // Team mutators
    async createTeam(tx, { id, name, identifier, description, image }: { 
      id: string; 
      name: string; 
      identifier: string; 
      description?: string; 
      image?: string; 
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      await tx.mutate.team.insert({
        id,
        name,
        identifier,
        description,
        image,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      await tx.mutate.teamMember.insert({
        id: `${id}-${sess.user.id}`,
        teamId: id,
        userId: sess.user.id,
        role: "admin" as const,
        joinedAt: Date.now(),
      });
    },

    async updateTeam(tx, { id, name, description, image }: { 
      id: string; 
      name?: string; 
      description?: string; 
      image?: string; 
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const team = await tx.query.team
        .where("id", "=", id)
        .whereExists("members", (q) => 
          q.where("userId", "=", sess.user.id).where("role", "=", "admin")
        );
      
      if (!team) throw new Error("Team not found or insufficient permissions");
      
      await tx.mutate.team.update({
        id,
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        updatedAt: Date.now(),
      });
    },

    async addTeamMember(tx, { teamId, userId, role }: { 
      teamId: string; 
      userId: string; 
      role: "admin" | "member"; 
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const isAdmin = await tx.query.teamMember
        .where("teamId", "=", teamId)
        .where("userId", "=", sess.user.id)
        .where("role", "=", "admin");
      
      if (!isAdmin) throw new Error("Admin permission required");
      
      await tx.mutate.teamMember.insert({
        id: `${teamId}-${userId}`,
        teamId,
        userId,
        role,
        joinedAt: Date.now(),
      });
    },

    async removeTeamMember(tx, { teamId, userId }: { teamId: string; userId: string }) {
      if (!sess) throw new Error("Not authenticated");
      
      const isAdmin = await tx.query.teamMember
        .where("teamId", "=", teamId)
        .where("userId", "=", sess.user.id)
        .where("role", "=", "admin");
      
      if (!isAdmin && sess.user.id !== userId) {
        throw new Error("Admin permission required");
      }
      
      await tx.mutate.teamMember.delete({
        id: `${teamId}-${userId}`,
      });
    },

    // Project mutators
    async createProject(tx, { id, name, identifier, description, teamId, leadId, startDate, targetDate }: {
      id: string;
      name: string;
      identifier: string;
      description?: string;
      teamId: string;
      leadId?: string;
      startDate?: number;
      targetDate?: number;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const isTeamMember = await tx.query.teamMember
        .where("teamId", "=", teamId)
        .where("userId", "=", sess.user.id);
      
      if (!isTeamMember) throw new Error("Must be a team member to create projects");
      
      await tx.mutate.project.insert({
        id,
        name,
        identifier,
        description,
        teamId,
        leadId,
        startDate: startDate || null,
        targetDate: targetDate || null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },

    async updateProject(tx, { id, name, description, leadId, startDate, targetDate }: {
      id: string;
      name?: string;
      description?: string;
      leadId?: string;
      startDate?: number;
      targetDate?: number;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const project = await tx.query.project
        .where("id", "=", id);
      
      if (!project) throw new Error("Project not found or access denied");
      
      await tx.mutate.project.update({
        id,
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(leadId !== undefined && { leadId }),
        ...(startDate !== undefined && { startDate: startDate || null }),
        ...(targetDate !== undefined && { targetDate: targetDate || null }),
        updatedAt: Date.now(),
      });
    },

    async deleteProject(tx, { id }: { id: string }) {
      if (!sess) throw new Error("Not authenticated");
      
      const project = await tx.query.project
        .where("id", "=", id);
      
      if (!project) throw new Error("Project not found or admin permission required");
      
      await tx.mutate.project.delete({ id });
    },

    // Issue mutators
    async createIssue(tx, { id, title, description, statusId, priorityId, projectId, teamId, assigneeId, estimate, startDate, dueDate }: {
      id: string;
      title: string;
      description?: string;
      statusId: string;
      priorityId?: string;
      projectId?: string;
      teamId: string;
      assigneeId?: string;
      estimate?: number;
      startDate?: number;
      dueDate?: number;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const isTeamMember = await tx.query.teamMember
        .where("teamId", "=", teamId)
        .where("userId", "=", sess.user.id);
      
      if (!isTeamMember) throw new Error("Must be a team member to create issues");
      
      const lastIssue = await tx.query.issue
        .where("teamId", "=", teamId)
        .orderBy("number", "desc")
        .limit(1);
      
      const nextNumber: number = lastIssue?.[0]?.number ? lastIssue[0].number + 1 : 1;
      
      await tx.mutate.issue.insert({
        id,
        number: nextNumber,
        title,
        description,
        statusId,
        priorityId,
        projectId,
        teamId,
        creatorId: sess.user.id,
        assigneeId,
        estimate,
        startDate: startDate || null,
        dueDate: dueDate || null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        completedAt: null,
        canceledAt: null,
      });
    },

    async updateIssue(tx, { id, title, description, statusId, priorityId, projectId, assigneeId, estimate, startDate, dueDate }: {
      id: string;
      title?: string;
      description?: string;
      statusId?: string;
      priorityId?: string;
      projectId?: string;
      assigneeId?: string;
      estimate?: number;
      startDate?: number;
      dueDate?: number;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const issue = await tx.query.issue
        .where("id", "=", id)
;
      
      if (!issue) throw new Error("Issue not found or access denied");
      
      let completedAt: number | null = null;
      let canceledAt: number | null = null;
      
      if (statusId) {
        const status = await tx.query.issueStatus.where("id", "=", statusId);
        if (status?.[0]) {
          if (status[0].type === "completed") {
            completedAt = Date.now();
          } else if (status[0].type === "canceled") {
            canceledAt = Date.now();
          }
        }
      }
      
      await tx.mutate.issue.update({
        id,
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(statusId !== undefined && { statusId }),
        ...(priorityId !== undefined && { priorityId }),
        ...(projectId !== undefined && { projectId }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(estimate !== undefined && { estimate }),
        ...(startDate !== undefined && { startDate: startDate || null }),
        ...(dueDate !== undefined && { dueDate: dueDate || null }),
        ...(completedAt && { completedAt }),
        ...(canceledAt && { canceledAt }),
        updatedAt: Date.now(),
      });
    },

    async deleteIssue(tx, { id }: { id: string }) {
      if (!sess) throw new Error("Not authenticated");
      
      const issue = await tx.query.issue
        .where("id", "=", id)
;
      
      if (!issue?.[0]) throw new Error("Issue not found or access denied");
      
      if (issue[0].creatorId !== sess.user.id) {
        const isAdmin = await tx.query.teamMember
          .where("teamId", "=", issue[0].teamId)
          .where("userId", "=", sess.user.id)
          .where("role", "=", "admin");
        
        if (!isAdmin) throw new Error("Only creator or admin can delete issues");
      }
      
      await tx.mutate.issue.delete({ id });
    },

    // Issue comment mutators
    async createIssueComment(tx, { id, issueId, body }: {
      id: string;
      issueId: string;
      body: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const issue = await tx.query.issue
        .where("id", "=", issueId)
;
      
      if (!issue) throw new Error("Issue not found or access denied");
      
      await tx.mutate.issueComment.insert({
        id,
        body,
        issueId,
        authorId: sess.user.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },

    async updateIssueComment(tx, { id, body }: {
      id: string;
      body: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const comment = await tx.query.issueComment
        .where("id", "=", id)
        .where("authorId", "=", sess.user.id);
      
      if (!comment) throw new Error("Comment not found or not authorized");
      
      await tx.mutate.issueComment.update({
        id,
        body,
        updatedAt: Date.now(),
      });
    },

    async deleteIssueComment(tx, { id }: { id: string }) {
      if (!sess) throw new Error("Not authenticated");
      
      const comment = await tx.query.issueComment
        .where("id", "=", id)
        .where("authorId", "=", sess.user.id);
      
      if (!comment) throw new Error("Comment not found or not authorized");
      
      await tx.mutate.issueComment.delete({ id });
    },

    // Issue label mutators
    async createIssueLabel(tx, { id, name, color, teamId }: {
      id: string;
      name: string;
      color: string;
      teamId: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const isTeamMember = await tx.query.teamMember
        .where("teamId", "=", teamId)
        .where("userId", "=", sess.user.id);
      
      if (!isTeamMember) throw new Error("Must be a team member to create labels");
      
      await tx.mutate.issueLabel.insert({
        id,
        name,
        color,
        teamId,
        createdAt: Date.now(),
      });
    },

    async assignLabelToIssue(tx, { id, issueId, labelId }: {
      id: string;
      issueId: string;
      labelId: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const issue = await tx.query.issue
        .where("id", "=", issueId)
;
      
      if (!issue) throw new Error("Issue not found or access denied");
      
      await tx.mutate.issueLabelAssignment.insert({
        id,
        issueId,
        labelId,
      });
    },

    async removeLabelFromIssue(tx, { issueId, labelId }: {
      issueId: string;
      labelId: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const issue = await tx.query.issue
        .where("id", "=", issueId)
;
      
      if (!issue) throw new Error("Issue not found or access denied");
      
      const assignment = await tx.query.issueLabelAssignment
        .where("issueId", "=", issueId)
        .where("labelId", "=", labelId);
      
      if (assignment?.[0]) {
        await tx.mutate.issueLabelAssignment.delete({ id: assignment[0].id });
      }
    },

    // Issue status mutators
    async createIssueStatus(tx, { id, name, type, position, teamId }: {
      id: string;
      name: string;
      type: "backlog" | "unstarted" | "started" | "completed" | "canceled";
      position: number;
      teamId: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const isAdmin = await tx.query.teamMember
        .where("teamId", "=", teamId)
        .where("userId", "=", sess.user.id)
        .where("role", "=", "admin");
      
      if (!isAdmin) throw new Error("Admin permission required");
      
      await tx.mutate.issueStatus.insert({
        id,
        name,
        type,
        position,
        teamId,
        createdAt: Date.now(),
      });
    },

    // Issue priority mutators
    async createIssuePriority(tx, { id, name, value, teamId }: {
      id: string;
      name: string;
      value: number;
      teamId: string;
    }) {
      if (!sess) throw new Error("Not authenticated");
      
      const isAdmin = await tx.query.teamMember
        .where("teamId", "=", teamId)
        .where("userId", "=", sess.user.id)
        .where("role", "=", "admin");
      
      if (!isAdmin) throw new Error("Admin permission required");
      
      await tx.mutate.issuePriority.insert({
        id,
        name,
        value,
        teamId,
      });
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
