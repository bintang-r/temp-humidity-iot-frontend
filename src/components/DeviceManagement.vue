<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { PlusIcon, TrashIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/vue/24/outline'

const API_BASE = 'http://localhost:5000/api'

const devices = ref([])
const newDeviceName = ref('')
const isLoading = ref(false)
const copiedId = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchDevices = async () => {
  try {
    const res = await axios.get(`${API_BASE}/devices`)
    devices.value = res.data
  } catch {
    showToast('Failed to fetch devices', 'error')
  }
}

const addDevice = async () => {
  if (!newDeviceName.value.trim()) return
  isLoading.value = true
  try {
    await axios.post(`${API_BASE}/devices`, { device_name: newDeviceName.value.trim() })
    newDeviceName.value = ''
    await fetchDevices()
    showToast('Device created successfully! Copy the token below.')
  } catch {
    showToast('Failed to create device', 'error')
  } finally {
    isLoading.value = false
  }
}

const deleteDevice = async (id, name) => {
  if (!confirm(`Delete device "${name}"? All its sensor logs will also be deleted.`)) return
  try {
    await axios.delete(`${API_BASE}/devices/${id}`)
    await fetchDevices()
    showToast(`"${name}" deleted.`, 'success')
  } catch {
    showToast('Failed to delete device', 'error')
  }
}

const copyToken = async (token, id) => {
  try {
    await navigator.clipboard.writeText(token)
    copiedId.value = id
    showToast('API Token copied to clipboard!')
    setTimeout(() => { copiedId.value = null }, 2000)
  } catch {
    showToast('Copy failed — please copy manually', 'error')
  }
}

onMounted(fetchDevices)
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">

    <!-- Toast notification -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        :class="[
          'fixed top-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium',
          toast.type === 'success' ? 'bg-brand text-white' : 'bg-red-600 text-white'
        ]"
      >
        <CheckIcon v-if="toast.type === 'success'" class="w-4 h-4 shrink-0" />
        <svg v-else class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- Header -->
    <div class="bg-brand rounded-3xl p-6 text-white">
      <h2 class="text-xl font-bold mb-1">Device & API Token Management</h2>
      <p class="text-brand-accent/80 text-sm leading-relaxed">
        Register each DHT11 sensor node here to get a unique API Token.
        The ESP32/ESP8266 must include this token in every POST request to authenticate itself.
      </p>
    </div>

    <!-- Add device form -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-gray-900 font-semibold mb-4">Register New Device</h3>
      <form @submit.prevent="addDevice" class="flex flex-col sm:flex-row gap-3">
        <input
          v-model="newDeviceName"
          type="text"
          placeholder="e.g. ESP32 Greenhouse A"
          maxlength="60"
          class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
          required
        />
        <button
          type="submit"
          :disabled="isLoading || !newDeviceName.trim()"
          class="bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] shadow-md shadow-brand/20"
        >
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <PlusIcon v-else class="w-4 h-4" />
          <span>{{ isLoading ? 'Generating...' : 'Generate Token' }}</span>
        </button>
      </form>
    </div>

    <!-- Device list -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-gray-900 font-semibold">Registered Devices</h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
          {{ devices.length }} device{{ devices.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Empty state -->
      <div v-if="devices.length === 0" class="py-16 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
        <p class="text-gray-500 font-medium">No devices yet</p>
        <p class="text-gray-400 text-sm mt-1">Use the form above to register your first DHT11 sensor</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th class="pb-3 font-medium pr-4">#</th>
              <th class="pb-3 font-medium pr-4">Device Name</th>
              <th class="pb-3 font-medium pr-4">API Token</th>
              <th class="pb-3 font-medium pr-4">Created</th>
              <th class="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="device in devices" :key="device.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-4 pr-4">
                <span class="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center">
                  {{ device.id }}
                </span>
              </td>

              <td class="py-4 pr-4">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-brand-light rounded-full"></div>
                  <span class="font-semibold text-gray-900">{{ device.device_name }}</span>
                </div>
              </td>

              <td class="py-4 pr-4 max-w-xs">
                <div class="flex items-center gap-2">
                  <code class="bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-mono truncate max-w-[220px] block">
                    {{ device.api_token }}
                  </code>
                  <button
                    @click="copyToken(device.api_token, device.id)"
                    class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border transition"
                    :class="copiedId === device.id
                      ? 'bg-brand-light border-brand-light text-white'
                      : 'border-gray-200 text-gray-400 hover:border-brand-light hover:text-brand-light bg-white'"
                    title="Copy token"
                  >
                    <CheckIcon v-if="copiedId === device.id" class="w-4 h-4" />
                    <DocumentDuplicateIcon v-else class="w-4 h-4" />
                  </button>
                </div>
              </td>

              <td class="py-4 pr-4 text-gray-500 text-xs whitespace-nowrap">
                {{ new Date(device.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }}
              </td>

              <td class="py-4 text-right">
                <button
                  @click="deleteDevice(device.id, device.device_name)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 ml-auto transition"
                  title="Delete device"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Usage guide -->
    <div class="bg-[#f0fdf4] border border-[#bbf7d0] rounded-3xl p-6">
      <h3 class="text-gray-900 font-semibold mb-3 flex items-center gap-2">
        <svg class="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        How to send data from your device
      </h3>
      <p class="text-gray-600 text-sm mb-3">Send a POST request to the backend endpoint:</p>
      <div class="bg-gray-900 text-green-400 font-mono text-xs rounded-xl p-4 overflow-x-auto">
        <pre>POST http://&lt;server-ip&gt;:5000/api/sensor/data
Content-Type: application/json

{
  "api_token": "&lt;your-device-token&gt;",
  "temperature": 32.5,
  "humidity": 65.0
}</pre>
      </div>
    </div>

  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-10px) scale(0.95); }
</style>
