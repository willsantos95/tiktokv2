<template>
  <div>
    <h2 class="text-3xl font-bold mb-8">Dashboard</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Display Name</p>
            <p class="text-2xl font-bold">{{ authStore.user?.displayName }}</p>
          </div>
          <img
            v-if="authStore.user?.avatarUrl"
            :src="authStore.user.avatarUrl"
            :alt="authStore.user.displayName"
            class="w-16 h-16 rounded-full"
          />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600 text-sm">Account Status</p>
        <p class="text-2xl font-bold text-green-600">✓ Connected</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600 text-sm">Quick Action</p>
        <router-link
          to="/upload"
          class="inline-block bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
        >
          Upload Video
        </router-link>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-2xl font-bold mb-4">Recent Videos</h3>
      <p class="text-gray-600">Video history feature coming soon...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>
