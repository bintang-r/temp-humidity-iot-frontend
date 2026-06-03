<script setup>
import { 
  HomeIcon, 
  CpuChipIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

const emit = defineEmits(['navigate'])

</script>

<template>
  <aside class="w-64 bg-brand text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-10 transition-transform md:translate-x-0" :class="{ '-translate-x-full': false }">
    <!-- Logo -->
    <div class="p-6 flex items-center space-x-3">
      <div class="w-8 h-8 bg-brand-light rounded-lg flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span class="text-xl font-bold tracking-wide">DHT11 Monitor</span>
    </div>

    <!-- Workspace Selector -->
    <div class="px-6 pb-6">
      <div class="bg-white/10 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <span class="text-white font-bold">W</span>
          </div>
          <div>
            <p class="text-xs text-gray-400">Workspace</p>
            <p class="text-sm font-semibold">Realtime Trafik</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="px-4 flex-1">
      <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Navigation</p>
      <nav class="space-y-1">
        <button 
          @click="emit('navigate', 'dashboard')"
          :class="[
            'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition group',
            currentView === 'dashboard' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
          ]"
        >
          <HomeIcon class="w-5 h-5" :class="currentView === 'dashboard' ? 'text-brand-light' : 'group-hover:text-white'" />
          <span class="font-medium text-sm">Dashboard</span>
        </button>
        
        <button 
          @click="emit('navigate', 'devices')"
          :class="[
            'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition group mt-1',
            currentView === 'devices' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
          ]"
        >
          <CpuChipIcon class="w-5 h-5" :class="currentView === 'devices' ? 'text-brand-light' : 'group-hover:text-white'" />
          <span class="font-medium text-sm">Device & Token</span>
        </button>
      </nav>
    </div>

    <!-- User Profile -->
    <div class="p-4 mt-auto">
      <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">User Account</p>
      <div class="flex items-center justify-between px-2 py-2">
        <div class="flex items-center space-x-3">
          <img src="https://ui-avatars.com/api/?name=Admin&background=18A058&color=fff" alt="User Avatar" class="w-10 h-10 rounded-full border-2 border-white/10" />
          <div>
            <p class="text-sm font-semibold text-white">Admin</p>
            <p class="text-xs text-gray-400">System Manager</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
