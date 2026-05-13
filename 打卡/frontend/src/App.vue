<template>
  <div class="app-container">
    <router-view v-if="isLoggedIn"></router-view>
    <router-view v-else></router-view>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    isLoggedIn.value = true
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.path === '/login') {
    next()
    return
  }
  
  if (!token) {
    next('/login')
    return
  }
  
  next()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
  min-height: 100vh;
}
</style>