import * as schema from '~~/server/db/schema'

export type User = typeof schema.users.$inferSelect
export type UserInsert = typeof schema.users.$inferInsert
export type Profile = typeof schema.profiles.$inferSelect
export type ProfileInsert = typeof schema.profiles.$inferInsert
export type Session = typeof schema.sessions.$inferSelect
export type Post = typeof schema.posts.$inferSelect
export type PostInsert = typeof schema.posts.$inferInsert