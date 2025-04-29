import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentHousehold } from '@/services/HouseholdService'
import { useUserStore } from '@/stores/UserStore';
import { type AxiosError } from 'axios';

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
    name: 'Notifications',
    component: () => import('@/views/NotificationView.vue') },

  {
    path: '/news',
    name: 'News',
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
  routes: routes,
})
/**
 * Global Vue Router navigation guard.
 *
 * This guard runs before each navigation attempt and performs several checks:
 * 1. Skips checks for predefined public routes.
 * 2. Ensures the user store is initialized and the user is authenticated. Redirects to Login if not.
 * 3. Allows ADMIN and SUPERADMIN users to bypass the household check.
 * 4. For regular users, checks if they belong to a household.
 * 5. Redirects regular users without a household to the 'CreateHousehold' page.
 * 6. Handles potential errors during checks, specifically redirecting to Login on 401 errors.
 *
 * @param {RouteLocationNormalized} to - The target Route object being navigated to.
 * @param {RouteLocationNormalized} from - The current Route object being navigated away from.
 * @param {NavigationGuardNext} next - Function to resolve the navigation hook. Must be called to continue navigation.
 */
router.beforeEach(async (to, from, next) => {
  // Instantiate the Pinia user store to access authentication state and user info
  const userStore = useUserStore();

  // Define routes accessible without authentication or household checks
  const publicRoutes = ['Login', 'Register', 'Home', 'CreateHousehold', 'Information','NotFound', 'News','Notifications'];

  // Allow immediate navigation if the target route is public
  if (publicRoutes.includes(to.name as string)) { //
    return next(); // Proceed to the public route
  }

  // Check if the user store indicates authentication.
  // If not, attempt to initialize the store from localStorage (e.g., refresh scenario).
  if (!userStore.isAuthenticated) { //
    console.log('Store not authenticated, attempting initialization...');
    await userStore.initializeFromStorage(); // Attempt to load user session
    // After attempting initialization, re-check authentication status.
    // If still not authenticated and the route is not public, redirect to Login.
    if (!userStore.isAuthenticated && !publicRoutes.includes(to.name as string)) {
      console.log('Initialization failed or user not authenticated, redirecting to Login.');
      userStore.logout(); // Ensure any partial/invalid state is cleared
      return next({ name: 'Login' }); // Redirect to the login page
    }
    console.log('Store initialized, role:', userStore.role);
  }

  // Check if the authenticated user has an administrative role.
  // Admins bypass the household check required for regular users.
  if (userStore.role === 'ADMIN' || userStore.role === 'SUPERADMIN') {
    console.log('Admin user detected, bypassing household check.');
    return next(); // Proceed to the requested route for admin users
  }

  // For authenticated, non-admin users, check for household association.
  try {
    // Attempt to fetch the user's current household information from the backend.
    const household = await getCurrentHousehold(); // Calls the service which uses Axios

    // If the user has no household (API returns null or 404), redirect them.
    if (household === null) { //
      // Prevent an infinite redirect loop if already on the CreateHousehold page.
      if (to.name === 'CreateHousehold') { //
        return next(false); // Block navigation
      }
      console.log('User has no household, redirecting to CreateHousehold.');
      // Redirect user to create or join a household.
      return next({ name: 'CreateHousehold' });
    }

    // User is authenticated, not an admin, and has a household. Allow navigation.
    return next(); // Proceed to the requested route
  } catch (error) { // Catch errors during the household check (e.g., network, API errors)
    console.error('Error checking household:', error); // Log the error for debugging

    // Check if the error is an Axios error with a 401 (Unauthorized) status.
    // This indicates the user's token might be invalid or expired.
    const axiosError = error as AxiosError; // Assert error type
    if (axiosError.response?.status === 401) {
      console.log('Unauthorized check for household, redirecting to login.');
      userStore.logout(); // Log out the user and clear auth state
      return next({ name: 'Login' }); // Redirect to login
    }

    // For other errors during the household check, allow navigation to prevent
    // completely blocking the user. Consider redirecting to a specific error page
    // in a production environment for a better user experience.
    return next(); // Proceed, potentially to a route that might show an error state
  }
});
export default router
