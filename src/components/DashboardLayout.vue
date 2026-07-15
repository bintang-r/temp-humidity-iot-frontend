<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Sidebar from './Sidebar.vue'
import axios from 'axios'
import { io } from 'socket.io-client'
import { HomeIcon, CpuChipIcon, UserIcon, CogIcon } from '@heroicons/vue/24/outline'
import { useRoute, useRouter } from 'vue-router'

import { API_BASE } from '../config'
const SOCKET_URL = API_BASE.replace('/api', '')

const route = useRoute()
const router = useRouter()

let socket
const now = ref(Date.now())
let nowInterval

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  delete axios.defaults.headers.common['Authorization']
  router.push('/login')
}

// ────────────────────────────────────
// Sensor Limits & Alert Logic
// ────────────────────────────────────
const sensorLimits = ref(null)
const isAlerting = ref(false)
const alertType = ref('')
const alertMessage = ref('')
const lastAlertTime = ref(0)
let alertTimeout = null

const fetchSensorLimits = async () => {
  try {
    const res = await axios.get(`${API_BASE}/settings`)
    if (res.data) {
      sensorLimits.value = res.data
    }
  } catch (e) { console.error('fetchSensorLimits error', e) }
}

const speakAlert = (text) => {
  const synth = window.speechSynthesis
  if (!synth) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'id-ID' // Bahasa Indonesia
  synth.speak(utterance)
}

const playAlertSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    
    if (type === 'max_temp') {
      // Nada tinggi dan nyaring
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.2)
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.4)
    } else if (type === 'min_temp') {
      // Nada rendah berulang lambat
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.5)
    } else if (type === 'max_hum') {
      // Nada menengah bergelombang
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.1)
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2)
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.3)
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.4)
    } else if (type === 'min_hum') {
      // Nada stabil
      osc.frequency.setValueAtTime(450, ctx.currentTime)
    }
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start()
    setTimeout(() => {
      osc.stop()
      ctx.close()
    }, type.includes('min') ? 1000 : 500)
  } catch (e) {
    console.error('Audio alert error:', e)
  }
}

const triggerAlert = (type, message) => {
  alertType.value = type
  alertMessage.value = message
  isAlerting.value = true
  
  const nowTime = Date.now()
  // Beri jeda 5 detik antar suara agar tidak saling tumpang tindih
  if (nowTime - lastAlertTime.value > 5000) {
    lastAlertTime.value = nowTime
    
    // Bicara dulu
    speakAlert(message.replace('Peringatan: ', ''))
    
    // Tunggu sedikit sebelum bunyi buzzer web
    setTimeout(() => playAlertSound(type), 1500)
  }

  if (alertTimeout) clearTimeout(alertTimeout)
  alertTimeout = setTimeout(() => {
    isAlerting.value = false
  }, 5000)
}

const checkLimits = (temp, hum) => {
  if (!sensorLimits.value) return
  
  const limits = sensorLimits.value
  
  if (temp > limits.max_temp) {
    triggerAlert('max_temp', `Peringatan: Suhu maksimum tercapai! Saat ini: ${temp.toFixed(1)}°C (Max: ${limits.max_temp}°C)`)
  } else if (temp < limits.min_temp) {
    triggerAlert('min_temp', `Peringatan: Suhu minimum tercapai! Saat ini: ${temp.toFixed(1)}°C (Min: ${limits.min_temp}°C)`)
  } else if (hum > limits.max_hum) {
    triggerAlert('max_hum', `Peringatan: Kelembaban maksimum tercapai! Saat ini: ${hum.toFixed(1)}% (Max: ${limits.max_hum}%)`)
  } else if (hum < limits.min_hum) {
    triggerAlert('min_hum', `Peringatan: Kelembaban minimum tercapai! Saat ini: ${hum.toFixed(1)}% (Min: ${limits.min_hum}%)`)
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
    <Sidebar @logout="handleLogout" />

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
        <div v-if="isAlerting" :class="[
          'px-4 py-3 rounded-2xl flex items-center shadow-sm animate-pulse mb-5 max-w-7xl mx-auto border',
          alertType.includes('min') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700'
        ]">
          <svg :class="['w-6 h-6 mr-3 shrink-0', alertType.includes('min') ? 'text-blue-500' : 'text-red-500']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-medium">{{ alertMessage }}</span>
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
