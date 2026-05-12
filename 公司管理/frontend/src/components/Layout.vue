<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="aside">
      <el-menu :default-active="activeMenu" class="menu" mode="vertical">
        <template v-if="authStore.isSuperAdmin">
          <el-menu-item index="/company">
            <el-icon><Building /></el-icon>
            <span>公司管理</span>
          </el-menu-item>
        </template>
        <el-menu-item index="/department">
          <el-icon><Users /></el-icon>
          <span>部门管理</span>
        </el-menu-item>
        <el-menu-item index="/position">
          <el-icon><Briefcase /></el-icon>
          <span>岗位管理</span>
        </el-menu-item>
        <el-menu-item index="/employee">
          <el-icon><User /></el-icon>
          <span>员工管理</span>
        </el-menu-item>
        <el-menu-item index="/attendance">
          <el-icon><Clock /></el-icon>
          <span>考勤管理</span>
        </el-menu-item>
        <el-menu-item index="/salary">
          <el-icon><Wallet /></el-icon>
          <span>薪资管理</span>
        </el-menu-item>
        <el-menu-item index="/role">
          <el-icon><Team /></el-icon>
          <span>角色管理</span>
        </el-menu-item>
        <template v-if="authStore.isSuperAdmin">
          <el-menu-item index="/permission">
            <el-icon><Lock /></el-icon>
            <span>权限管理</span>
          </el-menu-item>
          <el-menu-item index="/log">
            <el-icon><FileText /></el-icon>
            <span>日志管理</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    
    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <template v-if="authStore.isSuperAdmin">
            <el-select 
              v-model="companyStore.currentCompanyId" 
              placeholder="选择公司"
              class="company-select"
              @change="handleCompanyChange"
            >
              <el-option 
                v-for="item in companyStore.companies" 
                :key="item.id" 
                :label="item.name" 
                :value="item.id" 
              />
            </el-select>
          </template>
          <span v-else class="company-name">{{ authStore.userInfo?.companyName }}</span>
        </div>
        <div class="header-right">
          <span>{{ authStore.userInfo?.realName }}</span>
          <el-button type="text" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Building, Users, Briefcase, User, Team, Lock, Clock, Wallet, FileText } from '@element-plus/icons-vue'
import { useAuthStore, useCompanyStore } from '@/store'

const authStore = useAuthStore()
const companyStore = useCompanyStore()
const route = useRoute()
const router = useRouter()

const activeMenu = ref('/company')

watch(() => route.path, (val) => {
  activeMenu.value = val
})

onMounted(async () => {
  await authStore.getUserInfo()
  if (authStore.isSuperAdmin) {
    await companyStore.fetchCompanies()
    if (!companyStore.currentCompanyId && companyStore.companies.length > 0) {
      companyStore.setCurrentCompany(companyStore.companies[0].id, companyStore.companies[0].name)
    }
  } else {
    companyStore.setCurrentCompany(authStore.userInfo?.companyId, authStore.userInfo?.companyName)
  }
})

function handleCompanyChange(val) {
  const company = companyStore.companies.find(c => c.id === val)
  if (company) {
    companyStore.setCurrentCompany(company.id, company.name)
    ElMessage.success(`已切换到 ${company.name}`)
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background: #2a2a3a;
}

.menu {
  height: 100%;
  border-right: none;
}

.menu :deep(.el-menu-item) {
  color: #b4b4c4;
}

.menu :deep(.el-menu-item.is-active) {
  background: #1a1a2e;
  color: #fff;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.company-select {
  width: 200px;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.main {
  padding: 20px;
  overflow-y: auto;
}
</style>