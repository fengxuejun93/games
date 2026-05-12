import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, companyApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isSuperAdmin = computed(() => userInfo.value?.roles?.includes('super_admin'))

  async function login(username, password) {
    const res = await authApi.login({ username, password })
    if (res.code === 200) {
      token.value = res.data.token
      userInfo.value = res.data.userInfo
      localStorage.setItem('token', token.value)
    }
    return res
  }

  async function getUserInfo() {
    const res = await authApi.getUserInfo()
    if (res.code === 200) {
      userInfo.value = res.data
    }
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isSuperAdmin,
    login,
    getUserInfo,
    logout
  }
})

export const useCompanyStore = defineStore('company', () => {
  const currentCompanyId = ref(null)
  const currentCompanyName = ref('')
  const companies = ref([])

  async function fetchCompanies() {
    const res = await companyApi.list(1, 100)
    if (res.code === 200) {
      companies.value = res.data.records
    }
    return res
  }

  function setCurrentCompany(id, name) {
    currentCompanyId.value = id
    currentCompanyName.value = name
    localStorage.setItem('currentCompanyId', id)
    localStorage.setItem('currentCompanyName', name)
  }

  function initCurrentCompany() {
    currentCompanyId.value = localStorage.getItem('currentCompanyId')
    currentCompanyName.value = localStorage.getItem('currentCompanyName')
  }

  return {
    currentCompanyId,
    currentCompanyName,
    companies,
    fetchCompanies,
    setCurrentCompany,
    initCurrentCompany
  }
})

export default defineStore