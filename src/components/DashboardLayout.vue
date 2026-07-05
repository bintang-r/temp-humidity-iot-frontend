<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Sidebar from './Sidebar.vue'
import axios from 'axios'
import { io } from 'socket.io-client'
import { HomeIcon, CpuChipIcon, UserIcon, CogIcon } from '@heroicons/vue/24/outline'
import { useRoute, useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const SOCKET_URL = API_BASE.replace('/api', '')

const route = useRoute()
const router = useRouter()

const emit = defineEmits(['logout'])

let socket
const now = ref(Date.now())
let nowInterval

// ────────────────────────────────────
// Sensor Limits & Alert Logic
// ────────────────────────────────────
const sensorLimits = ref(null)
const isAlerting = ref(false)
const lastAlertTime = ref(0)

const fetchSensorLimits = async () => {
  try {
    const res = await axios.get(`${API_BASE}/settings`)
    if (res.data) {
      sensorLimits.value = res.data
    }
  } catch (e) { console.error('fetchSensorLimits error', e) }
}

const playAlertSound = () => {
  const nowTime = Date.now()
  if (nowTime - lastAlertTime.value < 3000) return
  lastAlertTime.value = nowTime
  
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    
    // Siren-like effect
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2)
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.4)
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start()
    setTimeout(() => {
      osc.stop()
      ctx.close()
    }, 500)
  } catch (e) {
    console.error('Audio alert error:', e)
  }
}

const checkLimits = (temp, hum) => {
  if (!sensorLimits.value) return
  
  const limits = sensorLimits.value
  const isTempExceeded = temp > limits.max_temp || temp < limits.min_temp
  const isHumExceeded = hum > limits.max_hum || hum < limits.min_hum
  
  if (isTempExceeded || isHumExceeded) {
    isAlerting.value = true
    playAlertSound()
    setTimeout(() => { isAlerting.value = false }, 3000)
  }
}

onMounted(async () => {
  await fetchSensorLimits()

  nowInterval = setInterval(() => { now.value = Date.now() }, 5000)

  socket = io(SOCKET_URL)

  socket.on('new_sensor_data', (data) => {
    checkLimits(Number(data.temperature), Number(data.humidity))
  })
})

onUnmounted(() => {
  if (nowInterval) clearInterval(nowInterval)
  if (socket) socket.disconnect()
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f0f4f2]">
    <!-- Sidebar (desktop only) -->
    <Sidebar @logout="emit('logout')" />

    <div class="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">

      <!-- ── Top header ── -->
      <header class="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-[#f0f4f2] z-10 shrink-0">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {{ route.meta.title || 'Dasbor' }}
          </h1>
          <p v-if="route.path === '/dashboard'" class="text-xs text-gray-400 mt-0.5">Monitor Sensor DHT11 Realtime</p>
        </div>
      </header>

      <!-- ── Main content ── -->
      <main class="flex-1 overflow-y-auto px-4 md:px-8 pb-20 md:pb-8">
        
        <!-- Alert Banner (Global) -->
        <div v-if="isAlerting" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl flex items-center shadow-sm animate-pulse mb-5 max-w-7xl mx-auto">
          <svg class="w-6 h-6 mr-3 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-medium">Peringatan: Batas sensor telah terlampaui!</span>
        </div>

        <router-view></router-view>
      </main>

      <!-- ── Mobile Bottom Navigation ── -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-20 shadow-lg pb-safe">
        <router-link
          to="/dashboard"
          :class="['flex-1 flex flex-col items-center py-3 transition', route.path === '/dashboard' ? 'text-brand-light' : 'text-gray-400']"
        >
          <HomeIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1 font-medium">Dasbor</span>
        </router-link>
        <router-link
          to="/devices"
          :class="['flex-1 flex flex-col items-center py-3 transition', route.path === '/devices' ? 'text-brand-light' : 'text-gray-400']"
        >
          <CpuChipIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1 font-medium">Perangkat</span>
        </router-link>
        <router-link
          to="/account"
          :class="['flex-1 flex flex-col items-center py-3 transition', route.path === '/account' ? 'text-brand-light' : 'text-gray-400']"
        >
          <UserIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1 font-medium">Akun</span>
        </router-link>
        <router-link
          to="/settings"
          :class="['flex-1 flex flex-col items-center py-3 transition', route.path === '/settings' ? 'text-brand-light' : 'text-gray-400']"
        >
          <CogIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1 font-medium">Pengaturan</span>
        </router-link>
      </nav>

    </div>
  </div>
</template>
