import {pgTable, timestamp, text, uuid, boolean, bigserial, json} from 'drizzle-orm/pg-core'
import {relations} from "drizzle-orm";

// Tables

export const users = pgTable('users', {
    id: uuid().primaryKey().defaultRandom(),
    email: text().unique().notNull(),
    password: text().notNull(),
    admin: boolean().default(false),
    apiKey: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdateFn(() => new Date()),
})

export const profiles = pgTable('profiles', {
    id: uuid().primaryKey().defaultRandom(),
    username: text().notNull(),
    bio: text(),
    userId: uuid().notNull().references(() => users.id, {onDelete: 'cascade'}),
    metadata: json('metadata'),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdateFn(() => new Date()),
})

export const sessions = pgTable('sessions', {
    id: uuid().primaryKey().defaultRandom(),
    refreshToken: uuid().defaultRandom(),
    userId: uuid().notNull().references(() => users.id, {onDelete: 'cascade'}),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull()
})

export const posts = pgTable('post', {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    slug: text().notNull(),
    content: text(),
    authorId: uuid().references(() => users.id, {onDelete: 'set null'}),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
})

// Relations

export const usersRelations = relations(users, ({ many, one }) => ({
    profile: one(profiles),
    sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    })
}))

export const profilesRelations = relations(profiles, ({ one, many }) => ({
    user: one(users, {
        fields: [profiles.userId],
        references: [users.id],
    })
}))

export const postsRelations = relations(posts, ({ one }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
}));
