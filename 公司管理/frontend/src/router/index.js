import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/Layout.vue'),
    redirect: '/company',
    children: [
      {
        path: '/company',
        name: 'Company',
        component: () => import('@/views/Company.vue')
      },
      {
        path: '/department',
        name: 'Department',
        component: () => import('@/views/Department.vue')
      },
      {
        path: '/position',
        name: 'Position',
        component: () => import('@/views/Position.vue')
      },
      {
        path: '/employee',
        name: 'Employee',
        component: () => import('@/views/Employee.vue')
      },
      {
        path: '/role',
        name: 'Role',
        component: () => import('@/views/Role.vue')
      },
      {
        path: '/permission',
        name: 'Permission',
        component: () => import('@/views/Permission.vue')
      },
      {
        path: '/attendance',
        name: 'Attendance',
        component: () => import('@/views/Attendance.vue')
      },
      {
        path: '/salary',
        name: 'Salary',
        component: () => import('@/views/Salary.vue')
      },
      {
        path: '/log',
        name: 'Log',
        component: () => import('@/views/Log.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.path === '/login') {
    next()
  } else {
    if (authStore.token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router