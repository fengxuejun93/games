<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <span class="brand-icon">📋</span>
      <span class="brand-text">考勤打卡系统</span>
    </div>
    
    <div class="navbar-menu">
      <ul class="menu-list">
        <li v-for="item in menuItems" :key="item.path" class="menu-item">
          <a 
            :href="item.path" 
            :class="{ active: currentPath === item.path }"
            @click.prevent="navigate(item.path)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.label }}</span>
          </a>
        </li>
        
        <li class="menu-item logout-item">
          <a href="#" @click.prevent="handleLogout">
            <span class="menu-icon">🚪</span>
            <span class="menu-text">退出登录</span>
          </a>
        </li>
      </ul>
    </div>
    
    <div class="navbar-user">
      <span class="user-name">{{ user?.name }}</span>
      <span class="user-role" :class="user?.role">{{ user?.role === 'admin' ? '管理员' : '员工' }}</span>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUser, logout } from '../store'

const router = useRouter()
const route = useRoute()
const user = getUser()
const currentPath = ref('/dashboard')

const menuItems = computed(() => {
  const items = [
    { path: '/dashboard', label: '首页', icon: '🏠' },
    { path: '/checkin', label: '打卡', icon: '📝' },
    { path: '/attendance', label: '考勤明细', icon: '📊' },
    { path: '/statistics', label: '统计报表', icon: '📈' },
    { path: '/adjustment', label: '补卡申请', icon: '🔄' },
    { path: '/leave', label: '请假申请', icon: '🏥' }
  ]
  
  if (user?.role === 'admin') {
    items.push({ path: '/admin', label: '管理中心', icon: '⚙️' })
  }
  
  return items
})

const navigate = (path) => {
  currentPath.value = path
  router.push(path)
}

const handleLogout = () => {
  logout()
  router.push('/login')
}

onMounted(() => {
  currentPath.value = route.path
})
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 0 var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  box-shadow: var(--shadow-lg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.brand-icon {
  font-size: 24px;
}

.brand-text {
  font-size: var(--font-lg);
  font-weight: 600;
  color: white;
}

.navbar-menu {
  flex: 1;
  margin-left: var(--spacing-xl);
}

.menu-list {
  display: flex;
  list-style: none;
  gap: var(--spacing-xs);
}

.menu-item {
  position: relative;
}

.menu-item a {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 3px;
      background: white;
      border-radius: 2px;
    }
  }
}

.menu-icon {
  font-size: var(--font-base);
}

.menu-text {
  font-size: var(--font-sm);
  font-weight: 500;
}

.logout-item a {
  color: rgba(255, 255, 255, 0.7);
  
  &:hover {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.1);
  }
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
}

.user-name {
  color: white;
  font-size: var(--font-sm);
  font-weight: 500;
}

.user-role {
  font-size: var(--font-xs);
  padding: 2px 8px;
  border-radius: 10px;
  
  &.admin {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }
  
  &.employee {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }
}
</style>