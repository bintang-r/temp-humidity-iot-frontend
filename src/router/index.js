import { createRouter, createWebHistory } from 'vue-router'

import DashboardLayout from '../components/DashboardLayout.vue'
import Dashboard from '../components/Dashboard.vue'
import DeviceManagement from '../components/DeviceManagement.vue'
import AccountManagement from '../components/AccountManagement.vue'
import SettingsManagement from '../components/SettingsManagement.vue'

const routes = [
  {
    path: '/',
    component: DashboardLayout,
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

export default router
