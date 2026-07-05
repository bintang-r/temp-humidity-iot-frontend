<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { PlusIcon, TrashIcon, DocumentDuplicateIcon, CheckIcon, ChevronDownIcon, CodeBracketIcon, NoSymbolIcon, PlayIcon } from '@heroicons/vue/24/outline'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const devices = ref([])
const newDeviceName = ref('')
const isLoading = ref(false)
const copiedId = ref(null)
const expandedArduino = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (msg, type = 'success') => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchDevices = async () => {
  try {
    const res = await axios.get(`${API_BASE}/devices`)
    devices.value = res.data
  } catch { showToast('Gagal mengambil data perangkat', 'error') }
}

const addDevice = async () => {
  if (!newDeviceName.value.trim()) return
  isLoading.value = true
  try {
    await axios.post(`${API_BASE}/devices`, { device_name: newDeviceName.value.trim() })
    newDeviceName.value = ''
    await fetchDevices()
    showToast('Perangkat berhasil dibuat! Salin token di bawah.')
  } catch { showToast('Gagal membuat perangkat', 'error') }
  finally { isLoading.value = false }
}

const deleteDevice = async (id, name) => {
  if (!confirm(`Hapus perangkat "${name}"? Semua log sensor-nya juga akan dihapus.`)) return
  try {
    await axios.delete(`${API_BASE}/devices/${id}`)
    await fetchDevices()
    showToast(`"${name}" berhasil dihapus.`)
  } catch { showToast('Gagal menghapus perangkat', 'error') }
}

const toggleDevice = async (device) => {
  try {
    const newStatus = !device.is_active;
    await axios.put(`${API_BASE}/devices/${device.id}/toggle`, { is_active: newStatus });
    await fetchDevices();
    showToast(`Perangkat berhasil ${newStatus ? 'diaktifkan' : 'diblokir'}.`);
  } catch { showToast('Gagal mengubah status perangkat', 'error') }
}

const copyToken = async (token, id) => {
  try {
    await navigator.clipboard.writeText(token)
    copiedId.value = id
    showToast('Token API berhasil disalin!')
    setTimeout(() => { copiedId.value = null }, 2000)
  } catch { showToast('Gagal menyalin — salin secara manual', 'error') }
}

const toggleArduino = (id) => {
  expandedArduino.value = expandedArduino.value === id ? null : id
}

const getArduinoCode = (device) => {
  // Generate Server URL dynamically based on frontend URL
  const serverUrl = new URL('/api/sensor/data', window.location.origin);
  if (window.location.port !== '5000' && window.location.hostname === 'localhost') {
    serverUrl.port = '5000'; // Default dev backend port
  }

  return `// ============================================================
// DHT11 Realtime Monitor - ESP32
// Perangkat : ${device.device_name}
// ============================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ============================================================
// WIFI
// ============================================================

const char* WIFI_SSID     = "BINTANG";
const char* WIFI_PASSWORD = "bintanG321123";

// ============================================================
// SERVER
// ============================================================

const char* SERVER_URL = "${serverUrl.href}";

// ============================================================
// API TOKEN
// ============================================================

const char* API_TOKEN = "${device.api_token}";

// ============================================================
// DHT11
// ============================================================

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

// ============================================================
// BUZZER (PWM / TONE)
// ============================================================

#define BUZZER_PIN 5

// ESP32 LEDC
#define BUZZER_CHANNEL 0

void buzzerTone(int freq, int duration)
{
    ledcWriteTone(BUZZER_PIN, freq); // 🔊 atur FREKUENSI
    delay(duration);
    ledcWriteTone(BUZZER_PIN, 0);    // mati
    delay(100);
}

// ============================================================
// WIFI CONNECT
// ============================================================

void connectWiFi()
{
    Serial.println("\\nMenghubungkan WiFi...");

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int timeout = 20;

    while (WiFi.status() != WL_CONNECTED && timeout > 0)
    {
        Serial.print(".");
        delay(1000);
        timeout--;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("\\nWiFi Connected");
        Serial.println(WiFi.localIP());
    }
    else
    {
        Serial.println("\\nGagal koneksi WiFi");
    }
}

// ============================================================
// SETUP
// ============================================================

void setup()
{
    Serial.begin(115200);

    dht.begin();

    // 🔊 SETUP BUZZER PWM
    ledcAttach(BUZZER_PIN, 3000, 8); // default frekuensi awal

    connectWiFi();
}

// ============================================================
// LOOP
// ============================================================

unsigned long lastSend = 0;

void loop()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        WiFi.reconnect();
        delay(2000);
        return;
    }

    if (millis() - lastSend < 5000)
        return;

    lastSend = millis();

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity))
    {
        Serial.println("Sensor error");
        return;
    }

    Serial.println("\\n--------------------");
    Serial.print("Suhu: "); Serial.println(temperature);
    Serial.print("Hum : "); Serial.println(humidity);

    HTTPClient http;
    WiFiClient client;

    http.begin(client, SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> req;
    req["api_token"] = API_TOKEN;
    req["temperature"] = temperature;
    req["humidity"] = humidity;

    String payload;
    serializeJson(req, payload);

    int code = http.POST(payload);

    if (code <= 0)
    {
        Serial.println(http.errorToString(code));
        http.end();
        return;
    }

    String response = http.getString();
    Serial.println(response);

    StaticJsonDocument<512> doc;
    deserializeJson(doc, response);

    JsonObject s = doc["settings"];

    float maxT = s["max_temp"];
    float minT = s["min_temp"];
    float maxH = s["max_hum"];
    float minH = s["min_hum"];

    bool alarm = false;

    // ========================================================
    // 🔥 ALARM SUHU (FREKUENSI KERAS)
    // ========================================================

    if (temperature > maxT)
    {
        Serial.println("SUHU TINGGI!");

        for (int i = 0; i < 5; i++)
        {
            buzzerTone(4000, 300);  // 🔊 tinggi = nyaring
            buzzerTone(5000, 300);  // 🔊 lebih tinggi lagi
        }

        alarm = true;
    }
    else if (temperature < minT)
    {
        Serial.println("SUHU RENDAH!");

        for (int i = 0; i < 3; i++)
        {
            buzzerTone(2000, 500);  // 🔊 rendah tapi panjang
        }

        alarm = true;
    }

    // ========================================================
    // 💧 ALARM KELEMBABAN
    // ========================================================

    if (!alarm)
    {
        if (humidity > maxH)
        {
            Serial.println("HUMIDITY TINGGI!");

            for (int i = 0; i < 3; i++)
            {
                buzzerTone(4500, 200);
                buzzerTone(6000, 200);
            }
        }
        else if (humidity < minH)
        {
            Serial.println("HUMIDITY RENDAH!");
            buzzerTone(1500, 1000);
        }
        else
        {
            Serial.println("NORMAL");
        }
    }

    http.end();
}`
}

const copyArduinoCode = async (device) => {
  try {
    await navigator.clipboard.writeText(getArduinoCode(device))
    showToast('Kode Arduino berhasil disalin!')
  } catch { showToast('Gagal menyalin kode', 'error') }
}

onMounted(fetchDevices)
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-4 md:space-y-6">

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
    <div class="bg-brand rounded-2xl md:rounded-3xl p-4 md:p-6 text-white">
      <h2 class="text-lg md:text-xl font-bold mb-1">Kelola Perangkat & Token API</h2>
      <p class="text-brand-accent/80 text-xs md:text-sm leading-relaxed">
        Daftarkan setiap node sensor DHT11 di sini untuk mendapatkan Token API unik.
        ESP32/ESP8266 harus menyertakan token ini di setiap pengiriman data.
      </p>
    </div>

    <!-- Formulir Tambah -->
    <div class="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
      <h3 class="text-gray-900 font-semibold text-sm md:text-base mb-3 md:mb-4">Daftarkan Perangkat Baru</h3>
      <form @submit.prevent="addDevice" class="flex flex-col sm:flex-row gap-3">
        <input v-model="newDeviceName" type="text"
          placeholder="cth. ESP32 Greenhouse A" maxlength="60"
          class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
          required />
        <button type="submit" :disabled="isLoading || !newDeviceName.trim()"
          class="bg-brand text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-brand/90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[150px] shadow-md shadow-brand/20">
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <PlusIcon v-else class="w-4 h-4" />
          <span>{{ isLoading ? 'Membuat...' : 'Buat Token' }}</span>
        </button>
      </form>
    </div>

    <!-- Daftar Perangkat -->
    <div class="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4 md:mb-5">
        <h3 class="text-gray-900 font-semibold text-sm md:text-base">Perangkat Terdaftar</h3>
        <span class="text-[10px] md:text-xs text-gray-500 bg-gray-100 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full font-medium">
          {{ devices.length }} perangkat
        </span>
      </div>

      <!-- Kosong -->
      <div v-if="devices.length === 0" class="py-12 md:py-16 text-center">
        <div class="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 md:w-8 md:h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
        <p class="text-gray-500 font-medium text-sm">Belum ada perangkat</p>
        <p class="text-gray-400 text-xs mt-1">Gunakan formulir di atas untuk mendaftarkan sensor DHT11 pertama Anda</p>
      </div>

      <!-- Daftar kartu perangkat (mobile-friendly) -->
      <div v-else class="space-y-3">
        <div v-for="device in devices" :key="device.id" class="border border-gray-100 rounded-2xl overflow-hidden">
          <!-- Baris utama -->
          <div class="p-4 flex items-center justify-between gap-3">
            <div class="flex items-center space-x-3 min-w-0 flex-1">
              <span class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center shrink-0">
                {{ device.id }}
              </span>
              <div class="min-w-0">
                <div class="flex items-center space-x-1.5">
                  <div :class="['w-2 h-2 rounded-full shrink-0', device.is_active ? 'bg-brand-light' : 'bg-red-500']" :title="device.is_active ? 'Aktif' : 'Diblokir'"></div>
                  <span class="font-semibold text-sm truncate" :class="device.is_active ? 'text-gray-900' : 'text-gray-400 line-through'">{{ device.device_name }}</span>
                </div>
                <p class="text-[10px] text-gray-400 mt-0.5">
                  {{ new Date(device.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button @click="toggleArduino(device.id)" title="Kode Arduino"
                :class="['w-8 h-8 flex items-center justify-center rounded-lg border transition',
                  expandedArduino === device.id ? 'bg-brand-light border-brand-light text-white' : 'border-gray-200 text-gray-400 hover:text-brand-light bg-white']">
                <CodeBracketIcon class="w-4 h-4" />
              </button>
              <button @click="toggleDevice(device)" :title="device.is_active ? 'Blokir Perangkat' : 'Aktifkan Perangkat'"
                :class="['w-8 h-8 flex items-center justify-center rounded-lg border transition',
                  !device.is_active ? 'bg-orange-100 border-orange-200 text-orange-600' : 'border-gray-200 text-gray-400 hover:text-orange-500 bg-white']">
                <NoSymbolIcon v-if="device.is_active" class="w-4 h-4" />
                <PlayIcon v-else class="w-4 h-4" />
              </button>
              <button @click="copyToken(device.api_token, device.id)" title="Salin Token"
                :class="['w-8 h-8 flex items-center justify-center rounded-lg border transition',
                  copiedId === device.id ? 'bg-brand-light border-brand-light text-white' : 'border-gray-200 text-gray-400 hover:text-brand-light bg-white']">
                <CheckIcon v-if="copiedId === device.id" class="w-4 h-4" />
                <DocumentDuplicateIcon v-else class="w-4 h-4" />
              </button>
              <button @click="deleteDevice(device.id, device.device_name)" title="Hapus"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Token display -->
          <div class="px-4 pb-3 -mt-1">
            <code class="bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg text-[10px] md:text-xs font-mono block truncate">
              {{ device.api_token }}
            </code>
          </div>

          <!-- Dropdown: Kode Arduino -->
          <Transition name="slide">
            <div v-if="expandedArduino === device.id" class="border-t border-gray-100 bg-gray-900 text-green-400 p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <CodeBracketIcon class="w-4 h-4 text-green-500" />
                  <span class="text-xs font-semibold text-green-400">Kode Arduino — {{ device.device_name }}</span>
                </div>
                <button @click="copyArduinoCode(device)"
                  class="text-[10px] font-semibold bg-green-400/20 hover:bg-green-400/30 text-green-400 px-3 py-1 rounded-lg transition flex items-center gap-1.5">
                  <DocumentDuplicateIcon class="w-3 h-3" />
                  Salin Kode
                </button>
              </div>
              <pre class="text-[10px] md:text-xs font-mono leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre"><code>{{ getArduinoCode(device) }}</code></pre>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Panduan -->
    <div class="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl md:rounded-3xl p-4 md:p-6">
      <h3 class="text-gray-900 font-semibold text-sm md:text-base mb-2 md:mb-3 flex items-center gap-2">
        <svg class="w-4 h-4 md:w-5 md:h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Cara Mengirim Data dari Perangkat
      </h3>
      <p class="text-gray-600 text-xs md:text-sm mb-3">Kirim permintaan POST ke endpoint backend:</p>
      <div class="bg-gray-900 text-green-400 font-mono text-[10px] md:text-xs rounded-xl p-3 md:p-4 overflow-x-auto">
        <pre>POST {{ API_BASE }}/sensor/data
Content-Type: application/json

{
  "api_token": "&lt;token-perangkat-anda&gt;",
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
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; overflow: hidden; }
.slide-enter-to, .slide-leave-from { max-height: 1000px; opacity: 1; }
</style>
