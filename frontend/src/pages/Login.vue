<template>
  <div class="max-w-md mx-auto py-12">
    <div class="bg-white rounded-lg shadow p-8">
      <h2 class="text-3xl font-bold mb-6 text-center">Login</h2>

      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <button
        @click="loginWithTikTok"
        :disabled="isLoading"
        class="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 font-semibold"
      >
        <span v-if="isLoading">Loading...</span>
        <span v-else>🎵 Login with TikTok</span>
      </button>

      <p class="text-center text-gray-600 mt-4">
        This will redirect you to TikTok for authentication
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref<string | null>(null)

const loginWithTikTok = async () => {
  try {
    isLoading.value = true
    error.value = null

    const authUrl = await authStore.getAuthUrl()
    if (authUrl) {
      window.location.href = authUrl
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to get login URL'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Check if there's an error in the URL
  const urlError = route.query.error
  if (urlError) {
    error.value = String(urlError)
    // Clear URL
    router.replace('/login')
  }

  // If already authenticated, redirect to dashboard
  await authStore.checkAuth()
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>
