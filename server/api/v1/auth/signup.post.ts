import { z } from 'zod';
import { useServerDb } from '~~/server/utils/core/useServerDb'
import { users, profiles } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import { useServerAuth } from '~~/server/utils/auth/useServerAuth'

const signupSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    username: z.string().min(3)
})

export default defineEventHandler(async (event) => {
    const $db = useServerDb()
    const { createSession } = useServerAuth()
    const body = await readValidatedBody(event, signupSchema.parse)

    // 1. Check uniqueness
    const existingUser = await $db.select().from(users).where(eq(users.email, body.email));
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
            email: body.email,
            password: hashedPassword
        }).returning();

        // B. Insert Profile
        await tx.insert(profiles).values({
            userId: user.id,
            username: body.username
        });

        return user;
    });

    // 4. Login immediately
    await createSession(event, newUser.id)

    return { success: true }
})