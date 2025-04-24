import BeforeCrisis from '@/components/pages/BeforeCrisis.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/før-en-krise', component: BeforeCrisis},
    
  ],
})

export default router
