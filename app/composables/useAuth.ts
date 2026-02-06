/**
 * Authentication composable for managing user authentication state
 * Integrates with nuxt-auth-utils and provides CSRF protection
 */

interface LoginCredentials {
    email: string
    password: string
}

interface SignupCredentials {
    email: string
    password: string
    username: string
}

interface AuthResponse {
    success: boolean
}

interface UserData {
    user: {
        id: string
        email: string
    }
    profile: {
        id: string
        username: string
        bio: string | null
        userId: string
        metadata: any
        createdAt: string
        updatedAt: string
    } | null
}

export function useAuth() {
    const { loggedIn, user, session, clear } = useUserSession()

    const isLoading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Login user with email and password
     */
    async function login(credentials: LoginCredentials): Promise<boolean> {
        isLoading.value = true
        error.value = null

        try {
            const response = await $fetch<AuthResponse>('/api/v1/auth/signin', {
                method: 'POST',
                body: credentials
            })

            if (response.success) {
                // Refresh session data after login
                await refreshUserSession()
                return true
            }
            return false
        } catch (err: any) {
            error.value = err?.data?.statusMessage || err?.message || 'Login failed'
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Register new user
     */
    async function signup(credentials: SignupCredentials): Promise<boolean> {
        isLoading.value = true
        error.value = null

        try {
            const response = await $fetch<AuthResponse>('/api/v1/auth/signup', {
                method: 'POST',
                body: credentials
            })

            if (response.success) {
                // Refresh session data after signup
                await refreshUserSession()
                return true
            }
            return false
        } catch (err: any) {
            error.value = err?.data?.statusMessage || err?.message || 'Signup failed'
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Logout current user
     */
    async function logout(): Promise<boolean> {
        isLoading.value = true
        error.value = null

        try {
            await $fetch<AuthResponse>('/api/v1/auth/signout', {
                method: 'POST'
            })
            
            // Clear session on client
            await clear()
            return true
        } catch (err: any) {
            error.value = err?.data?.statusMessage || err?.message || 'Logout failed'
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Fetch current user data
     */
    async function fetchCurrentUser(): Promise<UserData | null> {
        try {
            return await $fetch<UserData>('/api/v1/auth/me')
        } catch (err) {
            return null
        }
    }

    /**
     * Refresh user session from server
     */
    async function refreshUserSession(): Promise<void> {
        try {
            // Force refresh of user session
            const currentUser = await fetchCurrentUser()
            if (currentUser) {
                // Update session with fresh data
                await useRequestFetch()('/api/v1/auth/me')
            }
        } catch (err) {
            console.error('Failed to refresh session:', err)
        }
    }

    return {
        // State
        isLoggedIn: loggedIn,
        currentUser: user,
        sessionData: session,
        isLoading: readonly(isLoading),
        error: readonly(error),
        
        // Actions
        login,
        signup,
        logout,
        fetchCurrentUser,
        refreshUserSession,
        clearError: () => { error.value = null }
    }
}
