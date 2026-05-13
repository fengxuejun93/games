import { ref, computed } from 'vue'

const user = ref(null)

const isLoggedIn = computed(() => !!user.value)
const isAdmin = computed(() => user.value?.role === 'admin')

const setUser = (userData) => {
  user.value = userData
  localStorage.setItem('user', JSON.stringify(userData))
}

const getUser = () => {
  if (!user.value) {
    const stored = localStorage.getItem('user')
    if (stored) {
      user.value = JSON.parse(stored)
    }
  }
  return user.value
}

const logout = () => {
  user.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export { user, isLoggedIn, isAdmin, setUser, getUser, logout }