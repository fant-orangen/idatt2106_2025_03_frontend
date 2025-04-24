import { createRouter, createWebHistory } from 'vue-router'

const routes = [{ path: '/', component: () => import('@/views/HomeView.vue') }]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
