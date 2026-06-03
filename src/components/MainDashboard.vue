<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import TopCards from './TopCards.vue'
import MainChart from './MainChart.vue'
import DataTable from './DataTable.vue'
import DeviceManagement from './DeviceManagement.vue'
import axios from 'axios'
import { io } from 'socket.io-client'
import { onMounted, onUnmounted, computed } from 'vue'

const currentView = ref('dashboard');
const currentTemp = ref('--');
const currentHum = ref('--');
const activeDevices = ref(0);

const devicesList = ref([]);
const selectedDevice = ref('');

const latestReadings = ref([]);
const tableData = ref([]);

let socket;

const fetchDevices = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/devices')
    devicesList.value = res.data;
    if (res.data.length > 0) {
      selectedDevice.value = res.data[0].id; // default select first device
    }
  } catch (error) {
    console.error('Error fetching devices', error);
  }
}

const filteredTableData = computed(() => {
  if (!selectedDevice.value) return tableData.value;
  // Note: tableData currently uses device_name as 'node'. We need device_id.
  // Wait, tableData doesn't store device_id. We need to store it.
  return tableData.value.filter(item => item.device_id === selectedDevice.value);
});

const chartData = computed(() => {
  // Take last 8 items from filteredTableData and reverse them for chronological order
  const dataSlice = [...filteredTableData.value].slice(0, 8).reverse();
  
  return {
    labels: dataSlice.map(item => item.time) || ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    datasets: [
      {
        label: 'Temperature (°C)',
        borderColor: '#0C2B1C',
        backgroundColor: 'rgba(12, 43, 28, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#0C2B1C',
        pointRadius: 3,
        fill: true,
        data: dataSlice.map(item => item.temp) || []
      },
      {
        label: 'Humidity (%)',
        borderColor: '#18A058',
        backgroundColor: 'rgba(24, 160, 88, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#18A058',
        pointRadius: 3,
        fill: true,
        data: dataSlice.map(item => item.hum) || []
      }
    ]
  }
});

const fetchDashboardData = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/sensor/dashboard')
    const { latest_readings, total_devices } = res.data;
    activeDevices.value = total_devices;
    // Don't auto-set currentTemp and currentHum, wait for specific device or leave as '--'
  } catch (error) {
    console.error('Error fetching dashboard stats', error);
  }
}

const fetchHistory = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/sensor/history?limit=10')
    tableData.value = res.data.map(item => ({
      id: item.id,
      device_id: item.device_id, // Added device_id
      node: item.device_name,
      location: 'Default Location',
      temp: item.temperature,
      hum: item.humidity,
      status: 'Active',
      time: new Date(item.created_at).toLocaleTimeString()
    }))
  } catch (error) {
    console.error('Error fetching history', error);
  }
}

onMounted(() => {
  fetchDevices();
  fetchDashboardData();
  fetchHistory();

  socket = io('http://localhost:5000');
  
  socket.on('new_sensor_data', (data) => {
    // Only update cards if data belongs to the selected device
    if (selectedDevice.value === '' || data.device_id === selectedDevice.value) {
      currentTemp.value = parseFloat(data.temperature);
      currentHum.value = parseFloat(data.humidity);
    }
    
    // Unshift to table data
    tableData.value.unshift({
      id: data.id,
      device_id: data.device_id, // Added device_id
      node: data.device_name,
      location: 'Default Location',
      temp: data.temperature,
      hum: data.humidity,
      status: 'Active',
      time: new Date(data.created_at).toLocaleTimeString()
    });

    if (tableData.value.length > 50) {
      tableData.value.pop();
    }
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f0f4f2]">
    <Sidebar :currentView="currentView" @navigate="(view) => currentView = view" />
    
    <div class="flex-1 md:ml-64 relative flex flex-col h-screen overflow-hidden">
      
      <!-- Top header -->
      <header class="h-20 flex items-center justify-between px-8 bg-[#f0f4f2] z-10 shrink-0">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        
        <div class="flex items-center space-x-4">
          <button class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow transition">
            <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button class="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-900/20">
            Add Custom Widget
          </button>
        </div>
      </header>

      <!-- Main content scrollable area -->
      <main class="flex-1 overflow-y-auto p-8 pt-0">
        <!-- DEVICE MANAGEMENT VIEW -->
        <DeviceManagement v-if="currentView === 'devices'" />

        <!-- DASHBOARD VIEW -->
        <div v-else class="max-w-7xl mx-auto space-y-6">

          <!-- Device Selector -->
          <div class="flex items-center space-x-3 mb-2">
            <label class="text-sm font-medium text-gray-500 uppercase tracking-wide">Monitor Device:</label>
            <select v-model="selectedDevice" class="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-light shadow-sm">
              <option value="">All Devices (Latest Data)</option>
              <option v-for="dev in devicesList" :key="dev.id" :value="dev.id">
                {{ dev.device_name }}
              </option>
            </select>
          </div>
          
          <!-- Top Cards Row -->
          <TopCards 
            :temperature="currentTemp" 
            :humidity="currentHum" 
            :devices="activeDevices" 
          />

          <!-- Middle Row: Chart & Stats -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <MainChart :chartData="chartData" />
            </div>
            <div class="bg-[#dcfce7] rounded-3xl p-6 shadow-sm border border-[#bbf7d0] flex flex-col justify-between">
               <div>
                 <h3 class="text-gray-600 font-medium mb-2">Total Data Processed</h3>
                 <div class="flex items-end space-x-2">
                   <span class="text-5xl font-light text-gray-900">99,681</span>
                   <span class="text-lg font-medium text-gray-500 mb-1">ROWS</span>
                 </div>
                 <div class="mt-4 flex items-center space-x-2 text-brand-light text-sm font-semibold">
                   <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                   </svg>
                   <span>20% increased activity</span>
                 </div>
               </div>
               
               <div class="space-y-4 mt-8">
                 <div class="flex items-center space-x-3 bg-white/50 p-3 rounded-2xl">
                   <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-light">
                     <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                   </div>
                   <div>
                     <p class="text-sm font-semibold text-gray-900">High Frequency</p>
                     <p class="text-xs text-gray-500">1,697 req/min</p>
                   </div>
                 </div>
                 <div class="flex items-center space-x-3 bg-white/50 p-3 rounded-2xl">
                   <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-light">
                     <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <div>
                     <p class="text-sm font-semibold text-gray-900">Data Integrity</p>
                     <p class="text-xs text-gray-500">99.9% uptime</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <!-- Bottom Row: Data Table & Global Map -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <DataTable :tableData="filteredTableData" />
            </div>
            <div class="bg-[#0f172a] rounded-3xl p-6 shadow-sm flex flex-col text-white relative overflow-hidden">
               <h3 class="font-medium text-gray-300 z-10">Sensor Connectivity</h3>
               <div class="mt-4 flex-1 flex items-center justify-center z-10">
                 <!-- Abstract map or nodes visualization -->
                 <div class="relative w-full h-48 border border-white/10 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center">
                    <div class="absolute w-2 h-2 bg-brand-light rounded-full animate-ping"></div>
                    <div class="absolute w-4 h-4 bg-brand-light/50 rounded-full"></div>
                    <div class="absolute top-1/4 left-1/4 w-1 h-1 bg-white/50 rounded-full"></div>
                    <div class="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-brand-accent rounded-full"></div>
                    <div class="absolute top-1/2 right-1/3 w-2 h-2 bg-red-400 rounded-full"></div>
                    
                    <!-- Tooltip mockup -->
                    <div class="absolute top-1/2 right-1/3 transform translate-x-4 -translate-y-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-xs">
                      <p class="font-semibold">Node 2</p>
                      <p class="text-white/70">89% Signal</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>
