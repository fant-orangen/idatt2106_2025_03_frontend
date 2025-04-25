import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  {
    path: '/info',
    name: 'Information',
    component: () => import('@/views/information/EnhancedInformationView.vue')
  },
  { path: '/login', component: () => import('@/views/LoginView.vue') },
  { path : '/register', component: () => import('@/views/RegisterView.vue') },
  { path: '/before-crisis', component: () => import('@/views/BeforeCrisisView.vue') },
  { path: '/during-crisis', component: () => import('@/views/DuringCrisisView.vue') },
  { path: '/household', component: () => import('@/views/HouseholdManager.vue')}

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
