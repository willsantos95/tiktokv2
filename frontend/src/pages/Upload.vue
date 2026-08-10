<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-3xl font-bold mb-8">Upload Video</h2>

    <div class="bg-white rounded-lg shadow p-8">
      <!-- Error Message -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {{ successMessage }}
      </div>

      <!-- File Upload -->
      <div class="mb-6">
        <label class="block text-sm font-semibold mb-2">Select Video File</label>
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500"
          @click="fileInput?.click()"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="{ 'border-blue-500 bg-blue-50': isDragging }"
        >
          <div v-if="!file" class="text-gray-600">
            <p class="text-lg mb-2">📁 Drag and drop your video here</p>
            <p class="text-sm">or click to select a file</p>
            <p class="text-xs text-gray-500 mt-2">Max 2GB • MP4, MOV</p>
          </div>
          <div v-else class="text-green-600">
            <p class="text-lg mb-2">✓ {{ file.name }}</p>
            <p class="text-sm">{{ (file.size / 1024 / 1024).toFixed(2) }}MB</p>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="video/mp4,video/quicktime"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- Video Details Form -->
      <form @submit.prevent="submitUpload" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Caption</label>
          <textarea
            v-model="formData.title"
            placeholder="Add a caption for your video..."
            maxlength="2200"
            rows="4"
            class="w-full border border-gray-300 rounded px-3 py-2"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ formData.title.length }}/2200</p>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2">Hashtags</label>
          <input
            v-model="formData.hashtags"
            type="text"
            placeholder="#trending #video #foryou"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2">Privacy Level</label>
          <select v-model="formData.privacyLevel" class="w-full border border-gray-300 rounded px-3 py-2">
            <option value="PUBLIC">🌍 Public</option>
            <option value="FRIENDS">👥 Friends Only</option>
            <option value="SELF_ONLY">🔒 Private (Only Me)</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="formData.disableComment"
              type="checkbox"
              class="mr-2"
            />
            <span class="text-sm">Disable Comments</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="formData.disableDuet"
              type="checkbox"
              class="mr-2"
            />
            <span class="text-sm">Disable Duets</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="formData.disableStitch"
              type="checkbox"
              class="mr-2"
            />
            <span class="text-sm">Disable Stitches</span>
          </label>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mb-4">
          <div class="flex justify-between mb-2">
            <span class="text-sm font-semibold">Uploading...</span>
            <span class="text-sm">{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded h-2">
            <div
              class="bg-blue-600 h-2 rounded transition-all"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-4">
          <button
            type="submit"
            name="publish"
            :disabled="!file || isLoading"
            class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            <span v-if="isLoading">{{ uploadProgress > 0 ? 'Publishing...' : 'Processing...' }}</span>
            <span v-else>🚀 Publish Now</span>
          </button>

          <button
            type="submit"
            name="draft"
            :disabled="!file || isLoading"
            class="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 font-semibold"
          >
            <span v-if="isLoading">Saving...</span>
            <span v-else>💾 Save as Draft</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { apiClient } from '../services/api-client'

const router = useRouter()
const authStore = useAuthStore()

const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const uploadProgress = ref(0)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const formData = ref({
  title: '',
  hashtags: '',
  privacyLevel: 'SELF_ONLY',
  disableComment: false,
  disableDuet: false,
  disableStitch: false,
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    file.value = files[0]
    error.value = null
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files) {
    file.value = files[0]
    error.value = null
  }
}

const submitUpload = async (event: SubmitEvent) => {
  if (!file.value) {
    error.value = 'Please select a video file'
    return
  }

  try {
    isLoading.value = true
    uploadProgress.value = 0
    error.value = null
    successMessage.value = null

    const formDataObj = new FormData()
    formDataObj.append('video', file.value)
    formDataObj.append('title', formData.value.title)
    formDataObj.append('hashtags', formData.value.hashtags)
    formDataObj.append('privacyLevel', formData.value.privacyLevel)
    formDataObj.append('disableComment', String(formData.value.disableComment))
    formDataObj.append('disableDuet', String(formData.value.disableDuet))
    formDataObj.append('disableStitch', String(formData.value.disableStitch))

    const submitButton = (event.target as HTMLFormElement).querySelector('button[type="submit"]:focus') as HTMLButtonElement
    const isDraft = submitButton?.name === 'draft'
    const endpoint = isDraft ? '/video/upload-draft' : '/video/publish'

    const response = await apiClient.post(endpoint, formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        }
      },
    })

    if (response.data.success) {
      successMessage.value = response.data.message || 'Upload successful!'
      file.value = null
      formData.value = {
        title: '',
        hashtags: '',
        privacyLevel: 'SELF_ONLY',
        disableComment: false,
        disableDuet: false,
        disableStitch: false,
      }

      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    isLoading.value = false
    uploadProgress.value = 0
  }
}
</script>
