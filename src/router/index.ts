import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/info',
    name: 'Information',
    component: () => import('@/views/information/EnhancedInformationView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
  },
  {
    path: '/before-crisis',
    name: 'BeforeCrisis',
    component: () => import('@/views/BeforeCrisisView.vue'),
  },
  {
    path: '/during-crisis',
    name: 'DuringCrisis',
    component: () => import('@/views/DuringCrisisView.vue'),
  },
  {
    path: '/household',
    name: 'Household',
    component: () => import('@/views/HouseholdView.vue'),
  },
  {
    path: '/food-and-drinks',
    name: 'FoodAndDrinks',
    component: () => import('@/views/FoodAndDrinksView.vue'),
  },
  {
    path: '/shelter-frontpage',
    name: 'shelter-frontpage',
    component: () => import('@/components/shelter/CategoryPage.vue')
  },
  {
    path: '/admin-panel',
    name: 'AdminPanel',
    component: () => import('@/views/AdminPanel.vue'),
  },
  {
    path: '/add-new-event',
    name: 'AddNewEvent',
    component: () => import('@/views/AdminAddNewEvent.vue'),
  },
  {
    path: '/add-new-POI',
    name: 'AddNewPOI',
    component: () => import('@/views/AdminAddNewPOI.vue'),
  },
  {
    path: '/edit-event',
    name: 'EditEvent',
    component: () => import('@/views/AdminEditEvent.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404NotFoundView.vue'),
  },
  {
    path: '/medicine-inventory',
    name: 'MedicineInventory',
    component: () => import('@/views/MedicineInventory.vue'),
  },
  {
    path: '/edit-POI',
    name: 'AdminEditPOI',
    component: () => import('@/views/AdminEditPOI.vue'),
  },
];



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
