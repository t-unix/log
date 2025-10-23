<template>
  <div id="app">
    <Navigation v-if="authStore.isAuthenticated" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navigation from './components/Navigation.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuth()
})
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 1rem;
  padding-bottom: 5rem; /* Space for mobile nav */
}

@media (min-width: 768px) {
  .main-content {
    padding: 2rem;
    padding-bottom: 2rem;
  }
}
</style>
