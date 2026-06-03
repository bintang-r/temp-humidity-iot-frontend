<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MainDashboard from './components/MainDashboard.vue'
import Login from './components/Login.vue'

const isAuthenticated = ref(false)
const isReady = ref(false)

onMounted(() => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    isAuthenticated.value = true
  }
  
  // Interceptor untuk menangani token kadaluarsa (401)
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('auth_token')
        delete axios.defaults.headers.common['Authorization']
        isAuthenticated.value = false
      }
      return Promise.reject(error)
    }
  )
  isReady.value = true
})

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  delete axios.defaults.headers.common['Authorization']
  isAuthenticated.value = false
}
</script>

<template>
  <div v-if="isReady">
    <MainDashboard v-if="isAuthenticated" @logout="handleLogout" />
    <Login v-else @login-success="isAuthenticated = true" />
  </div>
</template>
