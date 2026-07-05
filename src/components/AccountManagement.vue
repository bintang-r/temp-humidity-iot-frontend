<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { CheckIcon, KeyIcon, UserIcon, TrashIcon, UserPlusIcon } from '@heroicons/vue/24/outline'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Tabs
const activeTab = ref('profile') // 'profile' or 'users'

// Profile State
const currentPassword = ref('')
const newUsername = ref('')
const newPassword = ref('')
const isProfileLoading = ref(false)

// Users State
const usersList = ref([])
const isUsersLoading = ref(false)

// Add User State
const isAddUserModalOpen = ref(false)
const addUsername = ref('')
const addPassword = ref('')
const isAddingUser = ref(false)

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (msg, type = 'success') => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ────────────────────────────────────
// Profile Management
// ────────────────────────────────────
const handleUpdateAccount = async () => {
  if (!currentPassword.value) {
    showToast('Password saat ini harus diisi', 'error')
    return
  }
  if (!newUsername.value && !newPassword.value) {
    showToast('Isi username atau password baru untuk mengubah', 'error')
    return
  }
  
  isProfileLoading.value = true
  try {
    const payload = { current_password: currentPassword.value }
    if (newUsername.value) payload.new_username = newUsername.value
    if (newPassword.value) payload.new_password = newPassword.value
    
    await axios.put(`${API_BASE}/auth/account`, payload)
    
    showToast('Profil berhasil diperbarui. Silakan login kembali dengan data baru jika diperlukan.')
    currentPassword.value = ''
    newUsername.value = ''
    newPassword.value = ''
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal memperbarui profil', 'error')
  } finally {
    isProfileLoading.value = false
  }
}

// ────────────────────────────────────
// User Management
// ────────────────────────────────────
const fetchUsers = async () => {
  isUsersLoading.value = true
  try {
    const res = await axios.get(`${API_BASE}/users`)
    usersList.value = res.data
  } catch (err) {
    console.error('Error fetching users:', err)
    showToast('Gagal memuat daftar pengguna', 'error')
  } finally {
    isUsersLoading.value = false
  }
}

const handleAddUser = async () => {
  if (!addUsername.value || !addPassword.value) {
    showToast('Username dan password harus diisi', 'error')
    return
  }

  isAddingUser.value = true
  try {
    await axios.post(`${API_BASE}/users`, {
      username: addUsername.value,
      password: addPassword.value
    })
    
    showToast('Pengguna berhasil ditambahkan')
    isAddUserModalOpen.value = false
    addUsername.value = ''
    addPassword.value = ''
    fetchUsers()
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal menambahkan pengguna', 'error')
  } finally {
    isAddingUser.value = false
  }
}

const deleteUser = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return
  
  try {
    await axios.delete(`${API_BASE}/users/${id}`)
    showToast('Pengguna berhasil dihapus')
    fetchUsers()
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal menghapus pengguna', 'error')
  }
}

// Fetch users only when switching to users tab or on mount if it's default
onMounted(() => {
  if (activeTab.value === 'users') {
    fetchUsers()
  }
})

const setTab = (tab) => {
  activeTab.value = tab
  if (tab === 'users') {
    fetchUsers()
  }
}
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

    <!-- Header & Tabs -->
    <div class="bg-brand rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg md:text-xl font-bold mb-1">Pengaturan Akun</h2>
        <p class="text-brand-accent/80 text-xs md:text-sm leading-relaxed">
          Kelola profil Anda atau tambahkan pengguna baru ke sistem.
        </p>
      </div>
      
      <!-- Tab Navigation -->
      <div class="flex bg-white/10 p-1 rounded-xl">
        <button 
          @click="setTab('profile')"
          :class="['px-4 py-2 rounded-lg text-sm font-semibold transition', activeTab === 'profile' ? 'bg-white text-brand' : 'text-white hover:bg-white/20']"
        >
          Profil Saya
        </button>
        <button 
          @click="setTab('users')"
          :class="['px-4 py-2 rounded-lg text-sm font-semibold transition', activeTab === 'users' ? 'bg-white text-brand' : 'text-white hover:bg-white/20']"
        >
          Manajemen Pengguna
        </button>
      </div>
    </div>

    <!-- ────────────────────────────────────────── -->
    <!-- TAB: Profil Saya -->
    <!-- ────────────────────────────────────────── -->
    <div v-if="activeTab === 'profile'" class="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
      <form @submit.prevent="handleUpdateAccount" class="space-y-6">
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Password Saat Ini <span class="text-red-500">*</span></label>
          <p class="text-xs text-gray-400 mb-3">Diperlukan untuk memverifikasi perubahan akun Anda.</p>
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input 
              v-model="currentPassword" 
              type="password" 
              class="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition"
              placeholder="Masukkan password lama"
              required
            >
          </div>
        </div>
        
        <hr class="border-gray-100" />

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Ganti Username (Opsional)</label>
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <UserIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input 
              v-model="newUsername" 
              type="text" 
              class="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition"
              placeholder="Username baru"
            >
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Ganti Password (Opsional)</label>
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input 
              v-model="newPassword" 
              type="password" 
              class="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition"
              placeholder="Password baru"
            >
          </div>
        </div>

        <div class="pt-4 flex justify-start">
          <button type="submit" :disabled="isProfileLoading || (!newUsername && !newPassword)"
            class="bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand/90 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2 min-w-[150px] shadow-md shadow-brand/20 transition">
            <svg v-if="isProfileLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <CheckIcon v-else class="w-4 h-4" />
            <span>{{ isProfileLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
        </div>

      </form>
    </div>

    <!-- ────────────────────────────────────────── -->
    <!-- TAB: Manajemen Pengguna -->
    <!-- ────────────────────────────────────────── -->
    <div v-else-if="activeTab === 'users'" class="space-y-4">
      
      <!-- Top Actions -->
      <div class="flex justify-between items-center bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div>
          <h3 class="text-gray-900 font-bold">Daftar Pengguna</h3>
          <p class="text-xs text-gray-500">Menampilkan semua pengguna yang memiliki akses ke sistem.</p>
        </div>
        <button 
          @click="isAddUserModalOpen = true"
          class="bg-brand-light text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center space-x-2 hover:bg-[#138246] transition"
        >
          <UserPlusIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Tambah Pengguna</span>
        </button>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="isUsersLoading" class="p-8 text-center text-gray-500">
          <svg class="w-8 h-8 animate-spin mx-auto text-brand-light mb-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p>Memuat daftar pengguna...</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full whitespace-nowrap text-left">
            <thead class="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">ID</th>
                <th class="px-6 py-4">Username</th>
                <th class="px-6 py-4">Dibuat Pada</th>
                <th class="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="user in usersList" :key="user.id" class="hover:bg-gray-50/50 transition">
                <td class="px-6 py-4 text-sm text-gray-500">#{{ user.id }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-brand-light/10 text-brand-light flex items-center justify-center font-bold text-xs">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    <span class="text-sm font-semibold text-gray-900">{{ user.username }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ new Date(user.created_at).toLocaleString() }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button 
                    @click="deleteUser(user.id)"
                    class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition inline-flex items-center"
                    title="Hapus Pengguna"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="usersList.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500">Belum ada pengguna.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Modal Tambah Pengguna -->
    <div v-if="isAddUserModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
        <h3 class="text-xl font-bold text-gray-900 mb-1">Tambah Pengguna Baru</h3>
        <p class="text-sm text-gray-500 mb-6">Buat akun baru untuk memberikan akses ke dasbor.</p>
        
        <form @submit.prevent="handleAddUser" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input 
                v-model="addUsername" 
                type="text" 
                class="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition"
                placeholder="Masukkan username"
                required
              >
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input 
                v-model="addPassword" 
                type="password" 
                class="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition"
                placeholder="Masukkan password"
                required
              >
            </div>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4">
            <button 
              type="button" 
              @click="isAddUserModalOpen = false"
              class="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="isAddingUser"
              class="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand/90 transition flex items-center disabled:opacity-50"
            >
              <svg v-if="isAddingUser" class="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ isAddingUser ? 'Menyimpan...' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-10px) scale(0.95); }
</style>
