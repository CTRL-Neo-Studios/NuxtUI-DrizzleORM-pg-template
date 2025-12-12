import { useServerAuth } from '~~/server/utils/auth/useServerAuth'

export default defineEventHandler(async (event) => {
    const { logout } = useServerAuth()

    await logout(event)

    return { success: true }
})
