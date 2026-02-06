import { z } from 'zod';
import { useServerDb } from '~~/server/utils/core/useServerDb'
import { users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import { useServerAuth } from '~~/server/utils/auth/useServerAuth'
import { sanitizeEmail } from '~~/server/utils/security/useServerSanitization'

const loginSchema = z.object({
    email: z.email(),
    password: z.string()
})

export default defineEventHandler(async (event) => {
    const $db = useServerDb()
    const { createSession } = useServerAuth()
    const body = await readValidatedBody(event, loginSchema.parse)

    // Sanitize email input
    const normalizedEmail = sanitizeEmail(body.email)

    // 1. Find User
    const userResults = await $db.select().from(users)
        .where(eq(users.email, normalizedEmail))
    
    const user = userResults[0]

    // 2. Verify Password (using nuxt-auth-utils helper)
    if (!user || !(await verifyPassword(user.password, body.password))) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid Email or Password',
        })
    }

    // 3. Clear any existing session to prevent session fixation
    await clearUserSession(event)

    // 4. Create new Session
    await createSession(event, user.id)

    return { success: true }
})