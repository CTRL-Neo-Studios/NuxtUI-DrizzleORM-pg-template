import {pgTable, timestamp, text, uuid, boolean, bigserial, jsonb} from 'drizzle-orm/pg-core'
import {relations} from "drizzle-orm";

export const user = pgTable('user', {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull(),
    password: text().notNull(),
    admin: boolean().default(false),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
})

export const userRelations = relations(user, ({ many, one }) => ({
    profile: one(profile),
    sessions: many(session)
}));

export const profile = pgTable('profile', {
    id: uuid().primaryKey().defaultRandom(),
    username: text().notNull(),
    bio: text(),
    userId: uuid().notNull().references(() => user.id, {onDelete: 'cascade'}),
    metadata: jsonb('metadata'),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
})

export const profileRelations = relations(profile, ({ one, many }) => ({
    user: one(user, {
        fields: [profile.userId],
        references: [user.id],
    }),
    posts: many(post)
}))

export const session = pgTable('session', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    accessToken: uuid().defaultRandom(),
    refreshToken: uuid().defaultRandom(),
    userId: uuid().notNull().references(() => user.id, {onDelete: 'cascade'}),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
})

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    })
}))

export const post = pgTable('post', {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    slug: text().notNull(),
    content: text(),
    authorId: uuid().notNull().references(() => profile.id, {onDelete: 'cascade'}),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
})

export const postRelations = relations(post, ({ one }) => ({
    author: one(profile, {
        fields: [post.authorId],
        references: [profile.id],
    }),
}));
