import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '../services/api-client'

export interface User {
  openId: string
  displayName: string
  avatarUrl: string
  accessToken: string
  tokenScope: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  const checkAuth = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.get('/auth/user')
      if (response.data.success) {
        user.value = response.data.data?.user || null
      }
    } catch (err) {
      user.value = null
      error.value = err instanceof Error ? err.message : 'Failed to check authentication'
    } finally {
      isLoading.value = false
    }
  }

  const getAuthUrl = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.get('/auth/url')
      return response.data.data?.authUrl
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get auth URL'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      isLoading.value = true
      error.value = null

      await apiClient.post('/auth/logout')
      user.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to logout'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    checkAuth,
    getAuthUrl,
    logout,
  }
})
