<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { PlusIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/outline'

const devices = ref([])
const newDeviceName = ref('')
const isLoading = ref(false)

const fetchDevices = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/devices')
    devices.value = response.data
  } catch (error) {
    console.error('Failed to fetch devices', error)
  }
}

const addDevice = async () => {
  if (!newDeviceName.value) return
  isLoading.value = true
  try {
    await axios.post('http://localhost:5000/api/devices', {
      device_name: newDeviceName.value
    })
    newDeviceName.value = ''
    fetchDevices()
  } catch (error) {
    console.error('Failed to add device', error)
  } finally {
    isLoading.value = false
  }
}

const deleteDevice = async (id) => {
  if(!confirm('Are you sure you want to delete this device?')) return
  try {
    await axios.delete(`http://localhost:5000/api/devices/${id}`)
    fetchDevices()
  } catch (error) {
    console.error('Failed to delete device', error)
  }
}

const copyToken = (token) => {
  navigator.clipboard.writeText(token)
  alert('Token copied to clipboard!')
}

onMounted(() => {
  fetchDevices()
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Device & API Token Management</h2>
      <p class="text-gray-500 text-sm mb-6">Create new sensor nodes here to get their unique API Tokens. The token is required for the hardware (ESP32/ESP8266) to send data to the backend.</p>

      <form @submit.prevent="addDevice" class="flex gap-4 mb-8">
        <input 
          v-model="newDeviceName" 
          type="text" 
          placeholder="Enter device name (e.g. Node Greenhouse)" 
          class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-light"
          required
        />
        <button 
          type="submit" 
          :disabled="isLoading"
          class="bg-brand text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand/90 transition flex items-center gap-2 disabled:opacity-50"
        >
          <PlusIcon class="w-5 h-5" />
          <span>{{ isLoading ? 'Generating...' : 'Generate Token' }}</span>
        </button>
      </form>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th class="pb-3 font-medium">ID</th>
              <th class="pb-3 font-medium">Device Name</th>
              <th class="pb-3 font-medium">API Token</th>
              <th class="pb-3 font-medium">Created At</th>
              <th class="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-if="devices.length === 0">
              <td colspan="5" class="py-8 text-center text-gray-500">No devices found. Add one above.</td>
            </tr>
            <tr v-for="device in devices" :key="device.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition">
              <td class="py-4 text-gray-500">#{{ device.id }}</td>
              <td class="py-4 font-medium text-gray-900">{{ device.device_name }}</td>
              <td class="py-4">
                <div class="flex items-center gap-2">
                  <code class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">{{ device.api_token }}</code>
                  <button @click="copyToken(device.api_token)" class="text-gray-400 hover:text-brand-light" title="Copy Token">
                    <DocumentDuplicateIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
              <td class="py-4 text-gray-500">{{ new Date(device.created_at).toLocaleString() }}</td>
              <td class="py-4 text-right">
                <button @click="deleteDevice(device.id)" class="text-red-400 hover:text-red-600 p-2">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
