export default defineNuxtRouteMiddleware((to, from) => {
    const { loggedIn, user } = useUserSession()
    if (!(unref(loggedIn) && unref(user))) {
        return navigateTo('/signin')
    }
})