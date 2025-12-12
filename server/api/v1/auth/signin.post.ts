import { z } from 'zod';
import { useServerDb } from '~~/server/utils/core/useServerDb'
import { users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import { useServerAuth } from '~~/server/utils/auth/useServerAuth'

const loginSchema = z.object({
    email: z.email(),
    password: z.string()
})

export default defineEventHandler(async (event) => {
    const $db = useServerDb()
    const { createSession } = useServerAuth()
    const body = await readValidatedBody(event, loginSchema.parse)

    // 1. Find User
    const user = (await $db.select().from(users)
        .where(eq(users.email, body.email)))[0];

    // 2. Verify Password (using nuxt-auth-utils helper)
    if (!user || !(await verifyPassword(body.password, user.password))) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid Email or Password',
        })
    }

    // 3. Create Session
    await createSession(event, user.id)

    return { success: true }
})