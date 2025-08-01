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

// Battleship game tables
export const battleshipRoom = pgTable("battleship_room", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  status: text("status").notNull(), // 'waiting', 'placing_ships', 'active', 'finished'
  currentTurn: text("current_turn"), // player id whose turn it is
  winnerId: text("winner_id").references(() => user.id),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const battleshipPlayer = pgTable("battleship_player", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .notNull()
    .references(() => battleshipRoom.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  playerNumber: integer("player_number").notNull(), // 1 or 2
  ready: boolean("ready").$defaultFn(() => false).notNull(),
  shipsPlaced: boolean("ships_placed").$defaultFn(() => false).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  index("battleship_player_room_idx").on(table.roomId),
  index("battleship_player_user_idx").on(table.userId),
]);

export const battleshipShip = pgTable("battleship_ship", {
  id: text("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => battleshipPlayer.id, { onDelete: "cascade" }),
  shipType: text("ship_type").notNull(), // 'carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'
  startX: integer("start_x").notNull(),
  startY: integer("start_y").notNull(),
  endX: integer("end_x").notNull(),
  endY: integer("end_y").notNull(),
  sunk: boolean("sunk").$defaultFn(() => false).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  index("battleship_ship_player_idx").on(table.playerId),
]);

export const battleshipGuess = pgTable("battleship_guess", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .notNull()
    .references(() => battleshipRoom.id, { onDelete: "cascade" }),
  attackerId: text("attacker_id")
    .notNull()
    .references(() => battleshipPlayer.id, { onDelete: "cascade" }),
  targetId: text("target_id")
    .notNull()
    .references(() => battleshipPlayer.id, { onDelete: "cascade" }),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  result: text("result").notNull(), // 'hit', 'miss', 'sunk'
  hitShipId: text("hit_ship_id").references(() => battleshipShip.id),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  index("battleship_guess_room_idx").on(table.roomId),
  index("battleship_guess_attacker_idx").on(table.attackerId),
  index("battleship_guess_target_idx").on(table.targetId),
]);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  verifications: many(verification),
  createdRooms: many(battleshipRoom, { relationName: "roomCreator" }),
  wonRooms: many(battleshipRoom, { relationName: "roomWinner" }),
  playerEntries: many(battleshipPlayer),
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

export const verificationRelations = relations(verification, ({ one }) => ({
  user: one(user, {
    fields: [verification.identifier],
    references: [user.email],
  }),
}));

export const battleshipRoomRelations = relations(battleshipRoom, ({ one, many }) => ({
  creator: one(user, {
    fields: [battleshipRoom.createdById],
    references: [user.id],
    relationName: "roomCreator",
  }),
  winner: one(user, {
    fields: [battleshipRoom.winnerId],
    references: [user.id],
    relationName: "roomWinner",
  }),
  players: many(battleshipPlayer),
  guesses: many(battleshipGuess),
}));

export const battleshipPlayerRelations = relations(battleshipPlayer, ({ one, many }) => ({
  room: one(battleshipRoom, {
    fields: [battleshipPlayer.roomId],
    references: [battleshipRoom.id],
  }),
  user: one(user, {
    fields: [battleshipPlayer.userId],
    references: [user.id],
  }),
  ships: many(battleshipShip),
  attacksMade: many(battleshipGuess, { relationName: "attacker" }),
  attacksReceived: many(battleshipGuess, { relationName: "target" }),
}));

export const battleshipShipRelations = relations(battleshipShip, ({ one, many }) => ({
  player: one(battleshipPlayer, {
    fields: [battleshipShip.playerId],
    references: [battleshipPlayer.id],
  }),
  hits: many(battleshipGuess),
}));

export const battleshipGuessRelations = relations(battleshipGuess, ({ one }) => ({
  room: one(battleshipRoom, {
    fields: [battleshipGuess.roomId],
    references: [battleshipRoom.id],
  }),
  attacker: one(battleshipPlayer, {
    fields: [battleshipGuess.attackerId],
    references: [battleshipPlayer.id],
    relationName: "attacker",
  }),
  target: one(battleshipPlayer, {
    fields: [battleshipGuess.targetId],
    references: [battleshipPlayer.id],
    relationName: "target",
  }),
  hitShip: one(battleshipShip, {
    fields: [battleshipGuess.hitShipId],
    references: [battleshipShip.id],
  }),
}));
