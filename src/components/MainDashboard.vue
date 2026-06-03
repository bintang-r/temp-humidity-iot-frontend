<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Sidebar from './Sidebar.vue'
import TopCards from './TopCards.vue'
import MainChart from './MainChart.vue'
import DataTable from './DataTable.vue'
import DeviceManagement from './DeviceManagement.vue'
import AccountManagement from './AccountManagement.vue'
import axios from 'axios'
import { io } from 'socket.io-client'
import { HomeIcon, CpuChipIcon, UserIcon } from '@heroicons/vue/24/outline'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const SOCKET_URL = API_BASE.replace('/api', '')

const emit = defineEmits(['logout'])

const currentView = ref('dashboard')
const currentTemp = ref('--')
const currentHum = ref('--')
const activeDevices = ref(0)
const lastUpdateTime = ref('--')

const deviceLastSeen = ref({})
const now = ref(Date.now())
let nowInterval

const devicesList = ref([])
const selectedDevice = ref('') // '' = All devices

const tableData = ref([])
let socket

// ────────────────────────────────────
// Computed: filter table & chart data by selected device
// ────────────────────────────────────
const filteredTableData = computed(() => {
  if (!selectedDevice.value) return tableData.value
  return tableData.value.filter(item => item.device_id === Number(selectedDevice.value))
})

const chartData = computed(() => {
  const dataSlice = [...filteredTableData.value].slice(-20)
  const isEmpty = dataSlice.length === 0

  return {
    labels: isEmpty ? ['--'] : dataSlice.map(item => item.time),
    datasets: [
      {
        label: 'Temperature (°C)',
        borderColor: '#0C2B1C',
        backgroundColor: 'rgba(12, 43, 28, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#0C2B1C',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        data: isEmpty ? [] : dataSlice.map(item => Number(item.temp))
      },
      {
        label: 'Humidity (%)',
        borderColor: '#18A058',
        backgroundColor: 'rgba(24, 160, 88, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#18A058',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        data: isEmpty ? [] : dataSlice.map(item => Number(item.hum))
      }
    ]
  }
})

// ────────────────────────────────────
// Stats: total logs & last update
// ────────────────────────────────────
const totalLogs = ref(0)

// ────────────────────────────────────
// Fetch functions
// ────────────────────────────────────
const fetchDevices = async () => {
  try {
    const res = await axios.get(`${API_BASE}/devices`)
    devicesList.value = res.data
    activeDevices.value = res.data.length
    if (res.data?.latest_readings) {
      res.data.latest_readings.forEach(d => {
        const time = new Date(d.created_at).getTime()
        deviceLastSeen.value[d.device_id] = time
      })
    }
  } catch (e) { console.error('fetchDevices error', e) }
}

const fetchHistory = async () => {
  try {
    const params = { limit: 100 }
    if (selectedDevice.value) params.device_id = selectedDevice.value

    const res = await axios.get(`${API_BASE}/sensor/history`, { params })
    tableData.value = res.data.map(item => ({
      id: item.id,
      device_id: Number(item.device_id),
      node: item.device_name,
      temp: Number(item.temperature),
      hum: Number(item.humidity),
      status: 'Active',
      time: new Date(item.created_at).toLocaleTimeString()
    }))
    totalLogs.value = tableData.value.length
    updateLatestCards()
  } catch (e) { console.error('fetchHistory error', e) }
}

const updateLatestCards = () => {
  const latest = filteredTableData.value.at(-1)
  if (latest) {
    currentTemp.value = Number(latest.temp)
    currentHum.value = Number(latest.hum)
    lastUpdateTime.value = latest.time
  } else {
    currentTemp.value = '--'
    currentHum.value = '--'
    lastUpdateTime.value = '--'
  }
}

// ────────────────────────────────────
// Watch: refetch when device selection changes
// ────────────────────────────────────
watch(selectedDevice, async (newDeviceId) => {
  currentTemp.value = '--'
  currentHum.value = '--'
  lastUpdateTime.value = '--'

  await fetchHistory()

  // Immediately load latest reading for that device from the server
  if (newDeviceId) {
    try {
      const res = await axios.get(`${API_BASE}/sensor/latest/${newDeviceId}`)
      if (res.data) {
        currentTemp.value = Number(res.data.temperature)
        currentHum.value = Number(res.data.humidity)
        lastUpdateTime.value = new Date(res.data.created_at).toLocaleTimeString()
      }
    } catch (e) { /* no data yet for device */ }
  } else {
    // All devices: pick the most recent row from all tableData
    updateLatestCards()
  }
})

const getDeviceStatus = (dev) => {
  if (dev.is_active === 0) return 'DIBLOKIR'
  const last = deviceLastSeen.value[dev.id]
  if (!last) return 'MENUNGGU'
  // 30 seconds threshold
  return (now.value - last < 30000) ? 'ONLINE' : 'OFFLINE'
}

const getStatusColor = (status) => {
  if (status === 'ONLINE') return 'bg-brand-light text-brand-light'
  if (status === 'OFFLINE') return 'bg-gray-400 text-gray-400'
  if (status === 'DIBLOKIR') return 'bg-red-500 text-red-500'
  return 'bg-orange-400 text-orange-400'
}

// ────────────────────────────────────
// Socket.io
// ────────────────────────────────────
onMounted(async () => {
  await fetchDevices()
  await fetchHistory()

  nowInterval = setInterval(() => { now.value = Date.now() }, 5000)

  socket = io(SOCKET_URL)

  socket.on('new_sensor_data', (data) => {
    deviceLastSeen.value[data.device_id] = Date.now()

    const newRow = {
      id: data.id,
      device_id: Number(data.device_id),
      node: data.device_name,
      temp: Number(data.temperature),
      hum: Number(data.humidity),
      status: 'Active',
      time: new Date(data.created_at).toLocaleTimeString()
    }

    // Always push to master list
    tableData.value.push(newRow)
    if (tableData.value.length > 200) tableData.value.shift()

    totalLogs.value = tableData.value.length

    // Update cards only if matching selected device (or all)
    const matchesFilter =
      !selectedDevice.value ||
      Number(data.device_id) === Number(selectedDevice.value)

    if (matchesFilter) {
      currentTemp.value = Number(data.temperature)
      currentHum.value = Number(data.humidity)
      lastUpdateTime.value = new Date(data.created_at).toLocaleTimeString()
    }
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
    <Sidebar :currentView="currentView" @navigate="(view) => currentView = view" @logout="emit('logout')" />

    <div class="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">

      <!-- ── Top header ── -->
      <header class="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-[#f0f4f2] z-10 shrink-0">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {{ currentView === 'devices' ? 'Perangkat & Token' : currentView === 'account' ? 'Pengaturan Akun' : 'Dasbor' }}
          </h1>
          <p v-if="currentView === 'dashboard'" class="text-xs text-gray-400 mt-0.5">Monitor Sensor DHT11 Realtime</p>
        </div>
        <div class="flex items-center space-x-2 md:space-x-4">
          <!-- Live indicator -->
          <div v-if="currentView === 'dashboard'" class="hidden md:flex items-center space-x-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm">
            <span class="w-2 h-2 bg-brand-light rounded-full animate-pulse"></span>
            <span class="text-xs font-medium text-gray-600">Langsung • Diperbarui {{ lastUpdateTime }}</span>
          </div>
        </div>
      </header>

      <!-- ── Main content ── -->
      <main class="flex-1 overflow-y-auto px-4 md:px-8 pb-20 md:pb-8">

        <!-- DEVICE MANAGEMENT VIEW -->
        <DeviceManagement v-if="currentView === 'devices'" />

        <!-- ACCOUNT MANAGEMENT VIEW -->
        <AccountManagement v-else-if="currentView === 'account'" />

        <!-- DASHBOARD VIEW -->
        <div v-else class="max-w-7xl mx-auto space-y-5">

          <!-- ── Device Selector Bar ── -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
            <div class="flex items-center space-x-3">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pilih Perangkat</span>
              <select
                v-model="selectedDevice"
                class="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-brand-light transition"
              >
                <option value="">Semua Perangkat</option>
                <option v-for="dev in devicesList" :key="dev.id" :value="dev.id">
                  {{ dev.device_name }}
                </option>
              </select>
            </div>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>{{ activeDevices }} perangkat terdaftar</span>
              <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{{ filteredTableData.length }} entri log</span>
            </div>
          </div>

          <!-- ── Top Cards ── -->
          <TopCards
            :temperature="currentTemp"
            :humidity="currentHum"
            :devices="activeDevices"
          />

          <!-- ── Middle Row: Chart + Stats ── -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div class="lg:col-span-2">
              <MainChart :chartData="chartData" />
            </div>

            <!-- Side stats card -->
            <div class="bg-[#dcfce7] rounded-3xl p-6 shadow-sm border border-[#bbf7d0] flex flex-col justify-between">
              <div>
                <h3 class="text-gray-600 font-medium mb-2">Total Log Tersimpan</h3>
                <div class="flex items-end space-x-2">
                  <span class="text-5xl font-light text-gray-900">{{ totalLogs.toLocaleString() }}</span>
                  <span class="text-lg font-medium text-gray-500 mb-1">BARIS</span>
                </div>
                <div class="mt-3 flex items-center space-x-2 text-brand-light text-sm font-semibold">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Merekam realtime</span>
                </div>
              </div>

              <div class="space-y-3 mt-6">
                <div class="flex items-center space-x-3 bg-white/60 p-3 rounded-2xl">
                  <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-light shadow-sm">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">Suhu Terakhir</p>
                    <p class="text-xs text-gray-500">
                      {{ typeof currentTemp === 'number' ? currentTemp.toFixed(2) + ' °C' : '--' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-3 bg-white/60 p-3 rounded-2xl">
                  <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-light shadow-sm">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">Kelembaban Terakhir</p>
                    <p class="text-xs text-gray-500">
                      {{ typeof currentHum === 'number' ? currentHum.toFixed(2) + ' %' : '--' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Bottom Row: Data Table + Node Status ── -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div class="lg:col-span-2">
              <DataTable :tableData="filteredTableData" />
            </div>

            <!-- Node status card -->
            <div class="bg-[#0f172a] rounded-3xl p-6 shadow-sm flex flex-col text-white">
              <h3 class="font-semibold text-gray-300 mb-4">Status Sensor Node</h3>

              <div class="space-y-3 flex-1">
                <div v-if="devicesList.length === 0" class="text-center text-gray-500 py-8 text-sm">
                  Belum ada perangkat terdaftar.<br/>Buka menu "Perangkat & Token" untuk menambahkannya.
                </div>
                <div
                  v-for="dev in devicesList"
                  :key="dev.id"
                  class="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-4 py-3 transition cursor-pointer"
                  :class="{ 'ring-1 ring-brand-light': Number(selectedDevice) === dev.id }"
                  @click="selectedDevice = dev.id"
                >
                  <div class="flex items-center space-x-3">
                    <div class="relative">
                      <div class="w-3 h-3 rounded-full" :class="getStatusColor(getDeviceStatus(dev)).split(' ')[0]"></div>
                      <div v-if="getDeviceStatus(dev) === 'ONLINE'" class="absolute inset-0 w-3 h-3 bg-brand-light rounded-full animate-ping opacity-50"></div>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-white" :class="{'line-through text-gray-500': dev.is_active === 0}">{{ dev.device_name }}</p>
                      <p class="text-xs text-gray-400">ID #{{ dev.id }}</p>
                    </div>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-1 rounded-full"
                        :class="[getStatusColor(getDeviceStatus(dev)).split(' ')[0] + '/20', getStatusColor(getDeviceStatus(dev)).split(' ')[1]]">
                    {{ getDeviceStatus(dev) }}
                  </span>
                </div>
              </div>

              <!-- Blinking dot animation at bottom -->
              <div class="mt-4 flex items-center space-x-2 text-xs text-gray-500">
                <span class="w-1.5 h-1.5 bg-brand-light rounded-full animate-pulse"></span>
                <span>Klik node untuk memfilter</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <!-- ── Mobile Bottom Navigation ── -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-20 shadow-lg pb-safe">
        <button
          @click="currentView = 'dashboard'"
          :class="['flex-1 flex flex-col items-center py-3 transition', currentView === 'dashboard' ? 'text-brand-light' : 'text-gray-400']"
        >
          <HomeIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1 font-medium">Dasbor</span>
        </button>
        <button
          @click="currentView = 'devices'"
          :class="['flex-1 flex flex-col items-center py-3 transition', currentView === 'devices' ? 'text-brand-light' : 'text-gray-400']"
        >
          <CpuChipIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1 font-medium">Perangkat</span>
        </button>
        <button
          @click="currentView = 'account'"
          :class="['flex-1 flex flex-col items-center py-3 transition', currentView === 'account' ? 'text-brand-light' : 'text-gray-400']"
        >
          <UserIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1 font-medium">Akun</span>
        </button>
      </nav>

    </div>
  </div>
</template>
