import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/assets',
      name: 'assets',
      component: () => import('../views/AssetsView.vue')
    },
    {
      path: '/assets/:id',
      name: 'asset-detail',
      component: () => import('../views/AssetDetailView.vue')
    },
    {
      path: '/loans',
      name: 'loans',
      component: () => import('../views/LoansView.vue')
    },
    {
      path: '/logbook',
      name: 'logbook',
      component: () => import('../views/LogbookView.vue')
    },
    {
      path: '/issues',
      name: 'issues',
      component: () => import('../views/IssuesView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    }
  ]
})

// Authentication temporarily disabled - all routes accessible
export default router
