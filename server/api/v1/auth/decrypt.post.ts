import {z} from 'zod';
import { useServerEncryption } from '~~/server/utils/utility/useServerEncryption'
import { useServerAuth } from '~~/server/utils/auth/useServerAuth'

const bodySchema = z.object({
    content: z.string()
})

export default defineEventHandler(async (event) => {
    // Require authentication to prevent unauthorized use
    const { requireUser } = useServerAuth()
    await requireUser(event)
    
    const {content} = await readValidatedBody(event, bodySchema.parse)
    const $rc = useRuntimeConfig()
    const {decrypt} = useServerEncryption()
    return decrypt(content, $rc.session.password)
})