import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'

import DashboardLayout from '../components/DashboardLayout.vue'
import Dashboard from '../components/Dashboard.vue'
import DeviceManagement from '../components/DeviceManagement.vue'
import AccountManagement from '../components/AccountManagement.vue'
import SettingsManagement from '../components/SettingsManagement.vue'
import Login from '../components/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Login' }
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Dasbor' }
      },
      {
        path: 'devices',
        name: 'Devices',
        component: DeviceManagement,
        meta: { title: 'Perangkat & Token' }
      },
      {
        path: 'account',
        name: 'Account',
        component: AccountManagement,
        meta: { title: 'Pengaturan Akun' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsManagement,
        meta: { title: 'Pengaturan Batas' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
