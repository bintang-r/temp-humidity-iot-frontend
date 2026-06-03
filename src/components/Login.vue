<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { LockClosedIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['login-success'])

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMsg.value = 'Mohon isi username dan password'
    return
  }
  
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      username: username.value,
      password: password.value
    })
    
    // Simpan token ke localStorage
    localStorage.setItem('auth_token', res.data.token)
    
    // Set axios default header untuk request selanjutnya
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    
    emit('login-success')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal terhubung ke server'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f0f4f2] relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-brand-light/10 blur-3xl mix-blend-multiply pointer-events-none"></div>
    <div class="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#dcfce7]/40 blur-3xl mix-blend-multiply pointer-events-none"></div>

    <div class="w-full max-w-md p-6 relative z-10">
      <!-- Logo Container -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-brand/10 mb-4 overflow-hidden">
          <img src="/logo.png" alt="Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Selamat Datang</h1>
        <p class="text-gray-500 mt-2 text-sm">Masuk ke dasbor DHT11 Realtime Monitor</p>
      </div>

      <!-- Card Form -->
      <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-brand/5">
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <div v-if="errorMsg" class="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errorMsg }}
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input 
                v-model="username" 
                type="text" 
                class="block w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all"
                placeholder="Masukkan username"
                required
              >
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockClosedIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input 
                v-model="password" 
                type="password" 
                class="block w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all"
                placeholder="Masukkan password"
                required
              >
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-brand hover:bg-brand/90 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <ArrowRightOnRectangleIcon v-else class="w-5 h-5" />
            <span>{{ isLoading ? 'Memproses...' : 'Masuk ke Dasbor' }}</span>
          </button>
        </form>
      </div>
      
      <p class="text-center text-xs text-gray-400 mt-8">
        &copy; {{ new Date().getFullYear() }} IoT Realtime Monitor System
      </p>
    </div>
  </div>
</template>
