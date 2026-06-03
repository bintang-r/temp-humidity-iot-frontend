<script setup>
import { ref, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: {
          family: "'Inter', sans-serif",
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: '#0C2B1C',
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 13 },
      bodyFont: { size: 13 }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: '#f1f5f9',
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        font: { size: 11 }
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        font: { size: 11 }
      }
    }
  }
})
</script>

<template>
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-gray-900 font-medium text-lg">Realtime Traffic Index</h3>
      <select class="bg-gray-100 text-gray-700 text-sm rounded-full px-4 py-1.5 outline-none focus:ring-2 focus:ring-brand-light">
        <option>Last 1 hour</option>
        <option>Last 24 hours</option>
        <option>All time</option>
      </select>
    </div>
    
    <div class="flex-1 relative min-h-[300px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
