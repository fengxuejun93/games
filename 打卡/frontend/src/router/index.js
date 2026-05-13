import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import CheckIn from '../views/CheckIn.vue'
import AttendanceList from '../views/AttendanceList.vue'
import Statistics from '../views/Statistics.vue'
import Adjustment from '../views/Adjustment.vue'
import Leave from '../views/Leave.vue'
import Admin from '../views/Admin.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/checkin', component: CheckIn },
  { path: '/attendance', component: AttendanceList },
  { path: '/statistics', component: Statistics },
  { path: '/adjustment', component: Adjustment },
  { path: '/leave', component: Leave },
  { path: '/admin', component: Admin },
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router