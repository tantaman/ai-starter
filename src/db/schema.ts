import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

// Bug Tracker Tables
export const team = pgTable("team", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  identifier: text("identifier").notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  identifierIdx: index("team_identifier_idx").on(table.identifier),
}));

export const teamMember = pgTable("team_member", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().$type<"admin" | "member">(),
  joinedAt: timestamp("joined_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  teamUserIdx: index("team_member_team_user_idx").on(table.teamId, table.userId),
  userIdx: index("team_member_user_idx").on(table.userId),
}));

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  identifier: text("identifier").notNull(),
  description: text("description"),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  leadId: text("lead_id")
    .references(() => user.id, { onDelete: "set null" }),
  startDate: timestamp("start_date"),
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  teamIdentifierIdx: index("project_team_identifier_idx").on(table.teamId, table.identifier),
  teamIdx: index("project_team_idx").on(table.teamId),
  leadIdx: index("project_lead_idx").on(table.leadId),
}));

export const issueStatus = pgTable("issue_status", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().$type<"backlog" | "unstarted" | "started" | "completed" | "canceled">(),
  position: integer("position").notNull(),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  teamIdx: index("issue_status_team_idx").on(table.teamId),
  positionIdx: index("issue_status_position_idx").on(table.teamId, table.position),
}));

export const issuePriority = pgTable("issue_priority", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  value: integer("value").notNull(),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
}, (table) => ({
  teamIdx: index("issue_priority_team_idx").on(table.teamId),
  valueIdx: index("issue_priority_value_idx").on(table.teamId, table.value),
}));

export const issue = pgTable("issue", {
  id: text("id").primaryKey(),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  statusId: text("status_id")
    .notNull()
    .references(() => issueStatus.id),
  priorityId: text("priority_id")
    .references(() => issuePriority.id, { onDelete: "set null" }),
  projectId: text("project_id")
    .references(() => project.id, { onDelete: "set null" }),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id),
  assigneeId: text("assignee_id")
    .references(() => user.id, { onDelete: "set null" }),
  estimate: integer("estimate"),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  completedAt: timestamp("completed_at"),
  canceledAt: timestamp("canceled_at"),
}, (table) => ({
  teamNumberIdx: index("issue_team_number_idx").on(table.teamId, table.number),
  statusIdx: index("issue_status_idx").on(table.statusId),
  priorityIdx: index("issue_priority_idx").on(table.priorityId),
  projectIdx: index("issue_project_idx").on(table.projectId),
  teamIdx: index("issue_team_idx").on(table.teamId),
  creatorIdx: index("issue_creator_idx").on(table.creatorId),
  assigneeIdx: index("issue_assignee_idx").on(table.assigneeId),
  createdAtIdx: index("issue_created_at_idx").on(table.createdAt),
  updatedAtIdx: index("issue_updated_at_idx").on(table.updatedAt),
}));

export const issueLabel = pgTable("issue_label", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  teamIdx: index("issue_label_team_idx").on(table.teamId),
  nameIdx: index("issue_label_name_idx").on(table.teamId, table.name),
}));

export const issueLabelAssignment = pgTable("issue_label_assignment", {
  id: text("id").primaryKey(),
  issueId: text("issue_id")
    .notNull()
    .references(() => issue.id, { onDelete: "cascade" }),
  labelId: text("label_id")
    .notNull()
    .references(() => issueLabel.id, { onDelete: "cascade" }),
}, (table) => ({
  issueIdx: index("issue_label_assignment_issue_idx").on(table.issueId),
  labelIdx: index("issue_label_assignment_label_idx").on(table.labelId),
  issueLabelIdx: index("issue_label_assignment_issue_label_idx").on(table.issueId, table.labelId),
}));

export const issueComment = pgTable("issue_comment", {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  issueId: text("issue_id")
    .notNull()
    .references(() => issue.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  issueIdx: index("issue_comment_issue_idx").on(table.issueId),
  authorIdx: index("issue_comment_author_idx").on(table.authorId),
  createdAtIdx: index("issue_comment_created_at_idx").on(table.createdAt),
}));

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  teamMemberships: many(teamMember),
  createdIssues: many(issue, { relationName: "createdIssues" }),
  assignedIssues: many(issue, { relationName: "assignedIssues" }),
  ledProjects: many(project),
  issueComments: many(issueComment),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const teamRelations = relations(team, ({ many }) => ({
  members: many(teamMember),
  projects: many(project),
  issues: many(issue),
  issueStatuses: many(issueStatus),
  issuePriorities: many(issuePriority),
  issueLabels: many(issueLabel),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id],
  }),
  user: one(user, {
    fields: [teamMember.userId],
    references: [user.id],
  }),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  team: one(team, {
    fields: [project.teamId],
    references: [team.id],
  }),
  lead: one(user, {
    fields: [project.leadId],
    references: [user.id],
  }),
  issues: many(issue),
}));

export const issueStatusRelations = relations(issueStatus, ({ one, many }) => ({
  team: one(team, {
    fields: [issueStatus.teamId],
    references: [team.id],
  }),
  issues: many(issue),
}));

export const issuePriorityRelations = relations(issuePriority, ({ one, many }) => ({
  team: one(team, {
    fields: [issuePriority.teamId],
    references: [team.id],
  }),
  issues: many(issue),
}));

export const issueRelations = relations(issue, ({ one, many }) => ({
  status: one(issueStatus, {
    fields: [issue.statusId],
    references: [issueStatus.id],
  }),
  priority: one(issuePriority, {
    fields: [issue.priorityId],
    references: [issuePriority.id],
  }),
  project: one(project, {
    fields: [issue.projectId],
    references: [project.id],
  }),
  team: one(team, {
    fields: [issue.teamId],
    references: [team.id],
  }),
  creator: one(user, {
    fields: [issue.creatorId],
    references: [user.id],
    relationName: "createdIssues",
  }),
  assignee: one(user, {
    fields: [issue.assigneeId],
    references: [user.id],
    relationName: "assignedIssues",
  }),
  comments: many(issueComment),
  labelAssignments: many(issueLabelAssignment),
}));

export const issueLabelRelations = relations(issueLabel, ({ one, many }) => ({
  team: one(team, {
    fields: [issueLabel.teamId],
    references: [team.id],
  }),
  assignments: many(issueLabelAssignment),
}));

export const issueLabelAssignmentRelations = relations(issueLabelAssignment, ({ one }) => ({
  issue: one(issue, {
    fields: [issueLabelAssignment.issueId],
    references: [issue.id],
  }),
  label: one(issueLabel, {
    fields: [issueLabelAssignment.labelId],
    references: [issueLabel.id],
  }),
}));

export const issueCommentRelations = relations(issueComment, ({ one }) => ({
  issue: one(issue, {
    fields: [issueComment.issueId],
    references: [issue.id],
  }),
  author: one(user, {
    fields: [issueComment.authorId],
    references: [user.id],
  }),
}));
