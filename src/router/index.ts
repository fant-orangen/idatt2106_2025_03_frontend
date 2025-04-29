import { useUserStore } from '@/stores/UserStore'
import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentHousehold } from '@/services/HouseholdService'

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
    path: '/notifications',
    component: () => import('@/views/NotificationView.vue') },

  {
    path: '/news',
    component: () => import('@/views/NewsView.vue') },
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
    path: '/household/create',
    name: 'CreateHousehold',
    component: () => import('@/components/household/CreateNewHousehold.vue'),
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
    meta: { requiresAdmin: true }, 
  },
  {
    path: '/add-new-event',
    name: 'AddNewEvent',
    component: () => import('@/views/AdminAddNewEvent.vue'),
    meta: { requiresAdmin: true }, 
  },
  {
    path: '/add-new-POI',
    name: 'AddNewPOI',
    component: () => import('@/views/AdminAddNewPOI.vue'),
    meta: { requiresAdmin: true }, 
  },
  {
    path: '/edit-event',
    name: 'EditEvent',
    component: () => import('@/views/AdminEditEvent.vue'),
    meta: { requiresAdmin: true }, 
  },
  {
    path: '/handle-admins',
    name: 'HandleAdmins',
    component: () => import('@/views/SuperAdminAdministrate.vue'),
    meta: { requiresSuperAdmin: true }, //TODO: endre denne når superadmin siden er ferdig 
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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

// Navigation guard to check household existence
router.beforeEach(async (to, from, next) => {
  // Skip check for these routes
  if (to.path === '/login' || to.path === '/register' || to.path === '/') {
    return next();
  }

  try {
    const household = await getCurrentHousehold();
    if (household === null && to.path !== '/household/create') {
      // If no household exists and not already going to create page, redirect to create
      return next('/household/create');
    }
    next();
  } catch (error) {
    console.error('Error checking household:', error);
    next();
  }
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresSuperAdmin) {
    if (userStore.isSuperAdminUser) {
      next(); //super admin ok
    } else {
      next( {name: 'NotFound' }); //Not superadmin
    }
  } else if (to.meta.requiresAdmin) {
    if (userStore.isAdminUser) {
      next(); //validated that the user is an admin/superadmin - next link is ok
    } else {
      next({name: 'NotFound'}); // Redirect 
    }
  } else {
    next(); // no need of special authentication
  }
});

export default router
