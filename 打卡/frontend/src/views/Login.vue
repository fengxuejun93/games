<template>
  <div class="login-page">
    <div class="login-bg"></div>
    
    <div class="login-container">
      <div class="login-card animate-fadeIn">
        <div class="login-header">
          <div class="logo-section">
            <span class="logo-icon">📋</span>
            <h1 class="logo-title">考勤打卡系统</h1>
            <p class="logo-subtitle">高效管理，轻松考勤</p>
          </div>
        </div>
        
        <div class="login-form">
          <el-form :model="form" ref="formRef" label-width="0">
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <div class="input-wrapper">
                <span class="input-icon">📧</span>
                <el-input 
                  v-model="form.email" 
                  type="email" 
                  placeholder="请输入邮箱地址"
                  class="custom-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <el-input 
                  v-model="form.password" 
                  type="password" 
                  placeholder="请输入密码"
                  class="custom-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <el-button type="primary" class="login-btn" @click="login">
                登 录
              </el-button>
            </div>
          </el-form>
        </div>
        
        <div class="login-footer">
          <p class="hint-text">测试账户: <span class="highlight">admin@company.com</span> / <span class="highlight">password</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api'
import { setUser } from '../store'

const router = useRouter()
const form = ref({
  email: '',
  password: ''
})
const formRef = ref(null)

const login = async () => {
  try {
    const response = await authAPI.login(form.value)
    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
    router.push('/dashboard')
  } catch (error) {
    alert(error.response?.data?.error || '登录失败，请检查邮箱或密码')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%);
  opacity: 0.9;
}

.login-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.login-bg::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -30%;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-lg);
}

.login-card {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  font-size: 56px;
  margin-bottom: var(--spacing-md);
}

.logo-title {
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--dark);
  margin-bottom: var(--spacing-xs);
}

.logo-subtitle {
  font-size: var(--font-sm);
  color: var(--gray);
}

.login-form {
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--dark);
  margin-bottom: var(--spacing-sm);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-gray);
  border-radius: var(--radius-md);
  padding: 0 var(--spacing-md);
  transition: all var(--transition-fast);
  
  &:focus-within {
    background: var(--border-gray);
    box-shadow: inset 0 0 0 2px var(--primary-light);
  }
}

.input-icon {
  font-size: var(--font-lg);
  margin-right: var(--spacing-sm);
}

.custom-input {
  border: none;
  background: transparent;
  padding: var(--spacing-sm) 0;
  
  :deep(.el-input__wrapper) {
    background: transparent;
    box-shadow: none;
    border: none;
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: var(--font-base);
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.login-footer {
  text-align: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-gray);
}

.hint-text {
  font-size: var(--font-xs);
  color: var(--gray);
}

.highlight {
  color: var(--primary-color);
  font-weight: 500;
}
</style>