import { z } from 'zod';
import { useServerDb } from '~~/server/utils/core/useServerDb'
import { users, profiles } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import { useServerAuth } from '~~/server/utils/auth/useServerAuth'
import { sanitizeEmail, sanitizeUsername } from '~~/server/utils/security/useServerSanitization'

const signupSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    username: z.string().min(3)
})

export default defineEventHandler(async (event) => {
    const $db = useServerDb()
    const { createSession } = useServerAuth()
    const body = await readValidatedBody(event, signupSchema.parse)

    // Sanitize inputs
    const normalizedEmail = sanitizeEmail(body.email)
    const sanitizedUsername = sanitizeUsername(body.username)

    // 1. Check uniqueness
    const existingUser = await $db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existingUser.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'User already exists'
        })
    }

    // 2. Hash
    const hashedPassword = await hashPassword(body.password)

    // 3. Transaction: Create User AND Profile
    const newUser = await $db.transaction(async (tx) => {
        // A. Insert User
        const [user] = await tx.insert(users).values({
            email: normalizedEmail,
            password: hashedPassword
        }).returning();

        if (!user) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to create user'
            })
        }

        // B. Insert Profile
        await tx.insert(profiles).values({
            userId: user.id,
            username: sanitizedUsername
        });

        return user;
    });

    if (!newUser) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create user'
        })
    }

    // 4. Clear any existing session to prevent session fixation
    await clearUserSession(event)

    // 5. Create new session
    await createSession(event, newUser.id)

    return { success: true }
})