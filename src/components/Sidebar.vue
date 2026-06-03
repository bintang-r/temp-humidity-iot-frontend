<script setup>
import { 
  HomeIcon, 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon 
} from '@heroicons/vue/24/outline'
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
      <span class="text-xl font-bold tracking-wide">AeuxGlobal</span>
    </div>

    <!-- Workspace Selector -->
    <div class="px-6 pb-6">
      <div class="bg-white/10 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <span class="text-white font-bold">E</span>
          </div>
          <div>
            <p class="text-xs text-gray-400">Team Workspace</p>
            <p class="text-sm font-semibold">EcoPlastic</p>
          </div>
        </div>
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Search -->
    <div class="px-6 mb-6">
      <div class="relative">
        <input type="text" placeholder="Search for..." class="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition text-white placeholder-gray-500" />
        <svg class="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Navigation -->
    <div class="px-4 flex-1">
      <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Navigation</p>
      <nav class="space-y-1">
        <a href="#" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-white/10 text-white group">
          <HomeIcon class="w-5 h-5 text-brand-light" />
          <span class="font-medium text-sm">Dashboard</span>
        </a>
        <a href="#" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition group">
          <ChartBarIcon class="w-5 h-5 group-hover:text-white transition" />
          <span class="font-medium text-sm">Analytics</span>
        </a>
        <a href="#" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition group">
          <UsersIcon class="w-5 h-5 group-hover:text-white transition" />
          <span class="font-medium text-sm">Team Structure</span>
        </a>
        <a href="#" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition group">
          <div class="flex items-center space-x-3">
            <DocumentTextIcon class="w-5 h-5 group-hover:text-white transition" />
            <span class="font-medium text-sm">Reports</span>
          </div>
          <span class="bg-brand-light text-white text-[10px] font-bold px-2 py-0.5 rounded-full">1</span>
        </a>
      </nav>
    </div>

    <!-- User Profile & Settings -->
    <div class="p-4 mt-auto">
      <a href="#" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition group mb-4">
        <Cog6ToothIcon class="w-5 h-5 group-hover:text-white transition" />
        <span class="font-medium text-sm">Settings</span>
      </a>
      
      <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">User Account</p>
      <div class="flex items-center justify-between px-2 py-2">
        <div class="flex items-center space-x-3">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=18A058&color=fff" alt="User Avatar" class="w-10 h-10 rounded-full border-2 border-white/10" />
          <div>
            <p class="text-sm font-semibold text-white">Admin User</p>
            <p class="text-xs text-gray-400">#admin-001</p>
          </div>
        </div>
        <button class="text-gray-400 hover:text-white transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>
