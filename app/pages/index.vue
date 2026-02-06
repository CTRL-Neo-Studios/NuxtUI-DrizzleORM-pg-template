<script setup lang="ts">
const { isLoggedIn } = useAuth()
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col justify-center items-center">
        <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
                Nuxt v4 + Nuxt UI v4 + Drizzle ORM + PostgreSQL
            </h1>
            <p class="text-xl text-gray-600 mb-8">
                Secure Authentication Template with CSRF Protection
            </p>
            
            <div class="space-x-4">
                <template v-if="!isLoggedIn">
                    <NuxtLink
                        to="/signin"
                        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Sign In
                    </NuxtLink>
                    <NuxtLink
                        to="/signup"
                        class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Sign Up
                    </NuxtLink>
                </template>
                <template v-else>
                    <NuxtLink
                        to="/dashboard"
                        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Go to Dashboard
                    </NuxtLink>
                </template>
            </div>
        </div>
        
        <div class="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">CSRF Protection</h3>
                <p class="text-gray-600">Double-submit cookie pattern for secure state-changing requests</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Session Security</h3>
                <p class="text-gray-600">Token rotation and fixation prevention</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Security Headers</h3>
                <p class="text-gray-600">CSP, HSTS, X-Frame-Options, and more</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Input Sanitization</h3>
                <p class="text-gray-600">Email normalization and username sanitization</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Authorization</h3>
                <p class="text-gray-600">Role-based access control with strict equality</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Encrypted Sessions</h3>
                <p class="text-gray-600">Sealed cookie sessions with nuxt-auth-utils</p>
            </div>
        </div>
    </div>
</template>
