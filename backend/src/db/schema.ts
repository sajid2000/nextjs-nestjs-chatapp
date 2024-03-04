import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, primaryKey, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

const timestampFields = {
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
};

export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: integer("phone").notNull().unique(),
  avatar: varchar("avatar", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  isOnline: boolean("isOnline").notNull(),
  lastSeen: timestamp("lastSeen", { withTimezone: true }).notNull().defaultNow(),
  ...timestampFields,
});

export const userRelations = relations(user, ({ many }) => ({
  contacts: many(userContact, { relationName: "contact" }),
  userConversation: many(userConversation),
}));

export const userContact = pgTable(
  "userContact",
  {
    userId: integer("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contactId: integer("contactId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.contactId] }),
  })
);

export const userContactRelations = relations(userContact, ({ one }) => ({
  user: one(user, {
    fields: [userContact.userId],
    references: [user.id],
    relationName: "user",
  }),
  contact: one(user, {
    fields: [userContact.contactId],
    references: [user.id],
    relationName: "contact",
  }),
}));

export const conversation = pgTable("conversation", {
  id: serial("id").primaryKey(),
  isGroup: boolean("isGroup").default(false),
  ...timestampFields,
});

export const conversationRelations = relations(conversation, ({ many }) => ({
  messages: many(message),
}));

export const userConversation = pgTable(
  "userConversation",
  {
    userId: integer("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    conversationId: integer("conversationId")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    isDeleted: boolean("isDeleted").notNull().default(false),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.conversationId] }),
  })
);

export const userConversationRelations = relations(userConversation, ({ one }) => ({
  conversation: one(conversation, {
    fields: [userConversation.conversationId],
    references: [conversation.id],
  }),
  user: one(user, {
    fields: [userConversation.userId],
    references: [user.id],
  }),
}));

export const message = pgTable("message", {
  id: serial("id").primaryKey(),
  messageContent: text("messageContent").notNull(),
  senderId: integer("senderId")
    .notNull()
    .references(() => user.id),
  conversationId: integer("conversationId")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  replyId: integer("replyId"),
  messageType: varchar("messageType", { length: 20 }).notNull(),
  messageStatus: varchar("messageStatus", { length: 20 }).notNull(),
  sentDate: timestamp("sentDate", { withTimezone: true }).notNull().defaultNow(),
  deleteAt: timestamp("deleteAt", { withTimezone: true }),
});

export const messageRelations = relations(message, ({ one }) => ({
  replyMessage: one(message, {
    fields: [message.replyId],
    references: [message.id],
  }),
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
}));

export const group = pgTable("group", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  name: varchar("groupName", { length: 100 }).notNull(),
  image: varchar("groupImage", { length: 100 }),
  creator: integer("creator").references(() => user.id, { onDelete: "set null" }),
  ...timestampFields,
});

export const groupRelations = relations(group, ({ one }) => ({
  conversation: one(conversation, {
    fields: [group.conversationId],
    references: [conversation.id],
  }),
}));

export const groupMember = pgTable(
  "groupMember",
  {
    userId: integer("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    groupId: integer("groupId")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.userId] }),
  })
);

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
  group: one(group, {
    fields: [groupMember.groupId],
    references: [group.id],
  }),
}));

export const groupToConversation = pgTable(
  "groupToConversation",
  {
    conversationId: integer("conversationId")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    groupId: integer("groupId")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.conversationId] }),
  })
);

export const groupToConversationRelations = relations(groupToConversation, ({ one }) => ({
  group: one(group, {
    fields: [groupToConversation.groupId],
    references: [group.id],
  }),
  conversation: one(conversation, {
    fields: [groupToConversation.conversationId],
    references: [conversation.id],
  }),
}));
