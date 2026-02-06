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
        const sessionResults = await $db.insert(sessions).values({
            userId: userId,
            expiresAt: expiresAt
        }).returning()
        
        const session = sessionResults[0]
        
        if (!session) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to create session'
            })
        }

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
     * Rotate session token for enhanced security
     * Creates new session, copies data, deletes old session
     */
    async function rotateSession(event: H3Event, sessionToken: string, userId: string) {
        // 1. Delete old session
        await $db.delete(sessions).where(eq(sessions.id, sessionToken))
        
        // 2. Create new session with fresh expiration
        const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        const newSessionResults = await $db.insert(sessions).values({
            userId: userId,
            expiresAt: newExpiresAt
        }).returning()
        
        const newSession = newSessionResults[0]
        
        if (!newSession) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to rotate session'
            })
        }

        // 3. Update cookie with new token
        await setUserSession(event, {
            user: {
                sessionToken: newSession.id,
                id: userId,
            },
            loggedInAt: new Date()
        })
        
        return newSession
    }

    /**
     * Gets current user. Checks DB validity.
     */
    async function getUser(event: H3Event, shouldRotate: boolean = false) {
        const sessionData = await requireUserSession(event)
        
        if (!sessionData?.user?.sessionToken) {
            await clearUserSession(event)
            return null
        }

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

        const userData = result[0]
        
        // Ensure we have valid user data
        if (!userData || !userData.user) {
            await clearUserSession(event)
            return null
        }
        
        // Rotate session token periodically for security
        if (shouldRotate) {
            await rotateSession(event, sessionData.user.sessionToken, userData.user.id)
        }

        return userData
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

    async function requireUser(event: H3Event, shouldRotate: boolean = false) {
        const user = await getUser(event, shouldRotate)

        if(!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized'
            })
        }

        return user
    }

    async function requireAdminOrModerator(event: H3Event) {
        const userData = await requireUser(event)

        if (!userData || !userData.user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized'
            })
        }

        // Use strict equality (===) instead of loose equality (==)
        if (userData.user.moderator === true || userData.user.admin === true) {
            return userData
        } else {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden - Admin or Moderator access required'
            })
        }
    }

    async function requireAdmin(event: H3Event) {
        const userData = await requireUser(event)

        if (!userData || !userData.user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized'
            })
        }

        // Use strict equality (===) instead of loose equality (==)
        if (userData.user.admin === true) {
            return userData
        } else {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden - Admin access required'
            })
        }
    }

    return {
        createSession,
        rotateSession,
        getUser,
        requireUser,
        requireAdmin,
        requireAdminOrModerator,
        logout
    }
}