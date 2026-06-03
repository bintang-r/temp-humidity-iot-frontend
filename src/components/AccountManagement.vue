<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { CheckIcon, KeyIcon, UserIcon } from '@heroicons/vue/24/outline'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const currentPassword = ref('')
const newUsername = ref('')
const newPassword = ref('')
const isLoading = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (msg, type = 'success') => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const handleUpdateAccount = async () => {
  if (!currentPassword.value) {
    showToast('Password saat ini harus diisi', 'error')
    return
  }
  if (!newUsername.value && !newPassword.value) {
    showToast('Isi username atau password baru untuk mengubah', 'error')
    return
  }
  
  isLoading.value = true
  try {
    const payload = { current_password: currentPassword.value }
    if (newUsername.value) payload.new_username = newUsername.value
    if (newPassword.value) payload.new_password = newPassword.value
    
    await axios.put(`${API_BASE}/auth/account`, payload)
    
    showToast('Akun berhasil diperbarui. Silakan login kembali dengan data baru jika diperlukan.')
    currentPassword.value = ''
    newUsername.value = ''
    newPassword.value = ''
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal memperbarui akun', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-4 md:space-y-6">
    
    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" 
        :class="['fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium', 
          toast.type === 'success' ? 'bg-brand text-white' : 'bg-red-600 text-white']">
        <CheckIcon v-if="toast.type === 'success'" class="w-4 h-4 shrink-0" />
        <svg v-else class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- Header -->
    <div class="bg-brand rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-sm">
      <h2 class="text-lg md:text-xl font-bold mb-1">Pengaturan Akun</h2>
      <p class="text-brand-accent/80 text-xs md:text-sm leading-relaxed">
        Ubah username atau password Anda untuk mengamankan dasbor.
      </p>
    </div>

    <!-- Formulir -->
    <div class="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
      <form @submit.prevent="handleUpdateAccount" class="space-y-6">
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Password Saat Ini <span class="text-red-500">*</span></label>
          <p class="text-xs text-gray-400 mb-3">Diperlukan untuk memverifikasi perubahan akun Anda.</p>
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input 
              v-model="currentPassword" 
              type="password" 
              class="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition"
              placeholder="Masukkan password lama"
              required
            >
          </div>
        </div>
        
        <hr class="border-gray-100" />

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Ganti Username (Opsional)</label>
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <UserIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input 
              v-model="newUsername" 
              type="text" 
              class="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition"
              placeholder="Username baru"
            >
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Ganti Password (Opsional)</label>
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input 
              v-model="newPassword" 
              type="password" 
              class="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition"
              placeholder="Password baru"
            >
          </div>
        </div>

        <div class="pt-4 flex justify-start">
          <button type="submit" :disabled="isLoading || (!newUsername && !newPassword)"
            class="bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand/90 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2 min-w-[150px] shadow-md shadow-brand/20 transition">
            <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <CheckIcon v-else class="w-4 h-4" />
            <span>{{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-10px) scale(0.95); }
</style>
