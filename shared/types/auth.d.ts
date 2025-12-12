declare module '#auth-utils' {
    interface User {
        sessionToken: string,
        id: string
    }

    interface UserSession {
        user: User
        loggedInAt: Date
    }
}

export {}