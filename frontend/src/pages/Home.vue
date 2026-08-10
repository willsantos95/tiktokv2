<template>
  <div class="text-center py-12">
    <h2 class="text-4xl font-bold mb-4">Welcome to TikTok Upload Platform</h2>
    <p class="text-xl text-gray-600 mb-8">Upload and manage your TikTok videos easily</p>

    <div v-if="!authStore.isAuthenticated" class="space-y-4">
      <p class="text-lg mb-6">Get started by logging in with your TikTok account</p>
      <router-link
        to="/login"
        class="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 text-lg"
      >
        Login with TikTok
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <p class="text-lg mb-6">Welcome, {{ authStore.user?.displayName }}!</p>
      <div class="flex justify-center gap-4">
        <router-link
          to="/dashboard"
          class="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800"
        >
          View Dashboard
        </router-link>
        <router-link
          to="/upload"
          class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
        >
          Upload Video
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>
