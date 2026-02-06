<script setup lang="ts">
import {useAuth} from "~/composables/useAuth";

definePageMeta({
    middleware: ['valid-session']
})

const { currentUser, logout, isLoading, fetchCurrentUser } = useAuth()
const router = useRouter()

// Fetch fresh user data on mount
const userData = ref<any>(null)
onMounted(async () => {
    userData.value = await fetchCurrentUser()
})

async function handleLogout() {
    const success = await logout()
    if (success) {
        await navigateTo('/signin')
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <nav class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <button
                            @click="handleLogout"
                            :disabled="isLoading"
                            class="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            Welcome!
                        </h3>
                        <div class="mt-2 max-w-xl text-sm text-gray-500">
                            <p>You are successfully authenticated and protected by CSRF tokens.</p>
                        </div>
                        
                        <div class="mt-5">
                            <h4 class="text-sm font-medium text-gray-900">Session Information</h4>
                            <div class="mt-2 bg-gray-50 rounded-md p-4">
                                <pre v-if="userData" class="text-xs text-gray-600 overflow-x-auto">{{ JSON.stringify(userData, null, 2) }}</pre>
                                <p v-else class="text-sm text-gray-500">Loading user data...</p>
                            </div>
                        </div>

                        <div class="mt-5">
                            <h4 class="text-sm font-medium text-gray-900">Security Features Active</h4>
                            <ul class="mt-2 list-disc list-inside text-sm text-gray-600">
                                <li>CSRF Protection</li>
                                <li>Session Token Rotation</li>
                                <li>Security Headers (CSP, HSTS, etc.)</li>
                                <li>Input Sanitization</li>
                                <li>Session Fixation Prevention</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>
