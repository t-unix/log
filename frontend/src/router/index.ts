import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/auth/verify',
      name: 'auth-verify',
      component: () => import('../views/AuthVerifyView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/assets',
      name: 'assets',
      component: () => import('../views/AssetsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/assets/:id',
      name: 'asset-detail',
      component: () => import('../views/AssetDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/loans',
      name: 'loans',
      component: () => import('../views/LoansView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/logbook',
      name: 'logbook',
      component: () => import('../views/LogbookView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/issues',
      name: 'issues',
      component: () => import('../views/IssuesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Re-enable authentication guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
