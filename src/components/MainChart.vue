<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: { family: "'Inter', sans-serif", size: 12 }
      }
    },
    tooltip: {
      backgroundColor: '#0C2B1C',
      padding: 12,
      cornerRadius: 10,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 13 },
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: { color: '#94a3b8', font: { size: 11 } }
    },
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: '#94a3b8', font: { size: 11 }, maxTicksLimit: 8 }
    }
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-gray-900 font-semibold text-lg">Realtime Traffic Index</h3>
        <p class="text-xs text-gray-400 mt-0.5">Temperature & Humidity over time</p>
      </div>
    </div>

    <div v-if="chartData.labels.length === 0 || (chartData.labels.length === 1 && chartData.labels[0] === '--')" class="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-[280px]">
      <svg class="w-12 h-12 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p class="text-sm font-medium">Waiting for sensor data...</p>
      <p class="text-xs text-gray-400 mt-1">Send data from your DHT11 device to see the chart</p>
    </div>

    <div v-else class="flex-1 relative min-h-[280px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
