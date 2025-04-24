import BeforeCrisis from "/src/components/pages/BeforeCrisis.vue"
import { createRouter, createWebHistory } from 'vue-router'
import UnderCrisis from '/src/components/pages/UnderCrisis.vue';

const routes = [{ path: '/', component: () => import('@/views/HomeView.vue') }]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/før-en-krise', component: BeforeCrisis},
    {path: '/under-en-krise', component: UnderCrisis},

  ],
});

export default router
