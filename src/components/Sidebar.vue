<script setup>
import { 
  HomeIcon, 
  CpuChipIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

import { useRoute } from 'vue-router'

const route = useRoute()
const emit = defineEmits(['logout'])
</script>

<template>
  <aside class="hidden md:flex w-64 bg-brand text-white flex-col h-screen fixed left-0 top-0 overflow-y-auto z-30">
    <!-- Logo -->
    <div class="p-6 flex items-center space-x-3">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
        <img src="/logo.png" alt="Logo" class="w-full h-full object-cover" />
      </div>
      <span class="text-xl font-bold tracking-wide">DHT11 Monitor</span>
    </div>

    <!-- Workspace -->
    <div class="px-6 pb-6">
      <div class="bg-white/10 rounded-xl p-3 flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <span class="text-white font-bold">R</span>
        </div>
        <div>
          <p class="text-xs text-gray-400">Ruang Kerja</p>
          <p class="text-sm font-semibold">Trafik Realtime</p>
        </div>
      </div>
    </div>

    <!-- Navigasi -->
    <div class="px-4 flex-1">
      <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Navigasi</p>
      <nav class="space-y-1">
        <router-link 
          to="/dashboard"
          :class="[
            'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition group',
            route.path === '/dashboard' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
          ]"
        >
          <HomeIcon class="w-5 h-5" :class="route.path === '/dashboard' ? 'text-brand-light' : 'group-hover:text-white'" />
          <span class="font-medium text-sm">Dasbor</span>
        </router-link>
        
        <router-link 
          to="/devices"
          :class="[
            'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition group mt-1',
            route.path === '/devices' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
          ]"
        >
          <CpuChipIcon class="w-5 h-5" :class="route.path === '/devices' ? 'text-brand-light' : 'group-hover:text-white'" />
          <span class="font-medium text-sm">Perangkat & Token</span>
        </router-link>

        <router-link 
          to="/account"
          :class="[
            'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition group mt-1',
            route.path === '/account' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
          ]"
        >
          <UserIcon class="w-5 h-5" :class="route.path === '/account' ? 'text-brand-light' : 'group-hover:text-white'" />
          <span class="font-medium text-sm">Akun Saya</span>
        </router-link>

        <router-link 
          to="/settings"
          :class="[
            'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition group mt-1',
            route.path === '/settings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
          ]"
        >
          <CogIcon class="w-5 h-5" :class="route.path === '/settings' ? 'text-brand-light' : 'group-hover:text-white'" />
          <span class="font-medium text-sm">Pengaturan Batas</span>
        </router-link>
      </nav>
    </div>

    <!-- Profil -->
    <div class="p-4 mt-auto">
      <div class="bg-white/5 rounded-xl p-3 flex flex-col space-y-3">
        <div class="flex items-center space-x-3">
          <img src="https://ui-avatars.com/api/?name=Admin&background=18A058&color=fff" alt="Avatar" class="w-10 h-10 rounded-full border-2 border-white/10" />
          <div>
            <p class="text-sm font-semibold text-white">Admin</p>
            <p class="text-[10px] text-gray-400">Pengelola Sistem</p>
          </div>
        </div>
        <hr class="border-white/10" />
        <button @click="emit('logout')" class="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-lg transition">
          <ArrowRightOnRectangleIcon class="w-4 h-4" />
          <span class="font-medium text-xs">Keluar</span>
        </button>
      </div>
    </div>
  </aside>
</template>
