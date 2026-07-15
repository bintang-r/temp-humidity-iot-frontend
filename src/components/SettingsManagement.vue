<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

import { API_BASE } from '../config'

const maxTemp = ref(35)
const minTemp = ref(20)
const maxHum = ref(80)
const minHum = ref(40)

const isSaving = ref(false)
const message = ref({ text: '', type: '' })

const fetchSettings = async () => {
  try {
    const res = await axios.get(`${API_BASE}/settings`)
    if (res.data) {
      maxTemp.value = res.data.max_temp
      minTemp.value = res.data.min_temp
      maxHum.value = res.data.max_hum
      minHum.value = res.data.min_hum
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
}

const saveSettings = async () => {
  isSaving.value = true
  message.value = { text: '', type: '' }
  try {
    await axios.put(`${API_BASE}/settings`, {
      max_temp: maxTemp.value,
      min_temp: minTemp.value,
      max_hum: maxHum.value,
      min_hum: minHum.value
    })
    message.value = { text: 'Pengaturan berhasil disimpan!', type: 'success' }
  } catch (error) {
    console.error('Error saving settings:', error)
    message.value = { text: 'Gagal menyimpan pengaturan.', type: 'error' }
  } finally {
    isSaving.value = false
    setTimeout(() => {
      message.value = { text: '', type: '' }
    }, 3000)
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
      <div class="flex items-center space-x-3 mb-6">
        <div class="w-12 h-12 bg-brand-light/10 text-brand-light rounded-2xl flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Pengaturan Batas Sensor</h2>
          <p class="text-sm text-gray-500">Tentukan batas suhu dan kelembapan untuk sistem peringatan.</p>
        </div>
      </div>

      <!-- Alert Message -->
      <div v-if="message.text" :class="message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'" class="p-4 mb-6 rounded-xl border flex items-center space-x-3 text-sm">
        <svg v-if="message.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ message.text }}</span>
      </div>

      <form @submit.prevent="saveSettings" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Max Temp -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700">Batas Suhu Maksimum (°C)</label>
            <input 
              v-model.number="maxTemp" 
              type="number" step="0.1" required
              class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition"
            />
          </div>

          <!-- Min Temp -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700">Batas Suhu Minimum (°C)</label>
            <input 
              v-model.number="minTemp" 
              type="number" step="0.1" required
              class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition"
            />
          </div>

          <!-- Max Humidity -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700">Batas Kelembapan Maksimum (%)</label>
            <input 
              v-model.number="maxHum" 
              type="number" step="0.1" required
              class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition"
            />
          </div>

          <!-- Min Humidity -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700">Batas Kelembapan Minimum (%)</label>
            <input 
              v-model.number="minHum" 
              type="number" step="0.1" required
              class="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition"
            />
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button 
            type="submit" 
            :disabled="isSaving"
            class="bg-brand-light text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#138246] transition flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>Simpan Pengaturan</span>
            <span v-if="isSaving">Menyimpan...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
