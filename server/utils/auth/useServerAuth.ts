import { useServerDb } from '~~/server/utils/core/useServerDb'
import { H3Event } from 'h3'
import { sessions, users, profiles } from '~~/server/db/schema'
import { eq, and, gt } from 'drizzle-orm'

export function useServerAuth() {
    const $db = useServerDb()

    /**
     * Creates a DB session + Encrypted Cookie
     */
    async function createSession(event: H3Event, userId: string) {
        // 1. Expiration (e.g. 1 month)
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

        // 2. Create session in DB
        const session = (await $db.insert(sessions).values({
            userId: userId,
            expiresAt: expiresAt
        }).returning())[0]

        // 3. Set Cookie (Only storing the ID)
        await setUserSession(event, {
            user: {
                sessionToken: session.id,
                id: userId,
            },
            loggedInAt: new Date()
        })
    }

    /**
     * Gets current user. Checks DB validity.
     */
    async function getUser(event: H3Event) {
        const sessionData = await requireUserSession(event)

        // 2. Lookup in DB (Session -> User -> Profile)
        // We use leftJoin on profiles so we get user data even if profile is missing (though it shouldn't be)
        const result = await $db.select({
            user: users,
            profile: profiles
        })
            .from(sessions)
            .innerJoin(users, eq(sessions.userId, users.id))
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(and(
                eq(sessions.id, sessionData.user.sessionToken), // Match Token
                gt(sessions.expiresAt, new Date()) // Match Expiry
            ))
            .limit(1);

        if (!result.length) {
            // Cookie was valid, but DB session is gone/expired
            await clearUserSession(event)
            return null
        }

        return {
            user: result[0].user,
            profile: result[0].profile
        }
    }

    /**
     * Destroy session
     */
    async function logout(event: H3Event) {
        const sessionData = await getUserSession(event)

        if (sessionData?.user?.sessionToken) {
            await $db.delete(sessions)
                .where(eq(sessions.id, sessionData.user.sessionToken))
        }

        await clearUserSession(event)
    }

    async function requireUser(event: H3Event) {
        const user = await getUser(event)

        if(!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized'
            })
        }

        return user
    }

    return {
        createSession,
        getUser,
        requireUser,
        logout
    }
}