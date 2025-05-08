import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentHousehold } from '@/services/HouseholdService'
import { useUserStore } from '@/stores/UserStore'
import { type AxiosError } from 'axios'

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
    path: '/info/scenario/:id',
    name: 'ScenarioTheme',
    component: () => import('@/views/information/EnhancedInformationView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordView.vue'),
    props: true,
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/crisis-event',
    name: 'CrisisEvent',
    component: () => import('@/views/CrisisEventView.vue'),
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('@/views/NewsView.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
  },
  {
    path: '/household',
    name: 'Household',
    component: () => import('@/views/HouseholdView.vue'),
    meta: { requiresAuth: true },
  },
  // Removed CreateHousehold route as it's now handled in the Household view
  {
    path: '/food-and-drinks',
    name: 'FoodAndDrinks',
    component: () => import('@/views/FoodAndDrinksView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/medicine-inventory',
    name: 'MedicineInventory',
    component: () => import('@/views/MedicineInventory.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/admin-panel',
    name: 'AdminPanel',
    component: () => import('@/views/AdminPanel.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/add-new-event',
    name: 'AddNewEvent',
    component: () => import('@/views/AdminAddNewEvent.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/add-new-scenario-theme',
    name: 'AddNewScenarioTheme',
    component: () => import('@/views/AdminAddNewScenarioTheme.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/add-new-POI',
    name: 'AddNewPOI',
    component: () => import('@/views/AdminAddNewPOI.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/edit-event',
    name: 'EditEvent',
    component: () => import('@/views/AdminEditEvent.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/edit-scenario-theme',
    name: 'EditScenarioTheme',
    component: () => import('@/views/AdminEditScenarioTheme.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/handle-admins',
    name: 'HandleAdmins',
    component: () => import('@/views/SuperAdminAdministrate.vue'),
    meta: { requiresSuperAdmin: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/edit-POI',
    name: 'AdminEditPOI',
    component: () => import('@/views/AdminEditPOI.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/inventory/water',
    name: 'WaterInventory',
    component: () => import('@/views/FoodAndDrinksView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/inventory/food',
    name: 'FoodInventory',
    component: () => import('@/views/FoodAndDrinksView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/inventory/medicine',
    name: 'MedicineInventory',
    component: () => import('@/views/FoodAndDrinksView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/group',
    name: 'GroupPage',
    component: () => import('@/views/GroupPage.vue'),
    meta: { requiresAuth: true },
  },
  // Gamification routes
  {
    path: '/quizzes',
    name: 'QuizOverview',
    component: () => import('@/views/gamification/QuizOverviewView.vue'),
  },
  {
    path: '/quizzes/history/id=:quizId',
    name: 'QuizHistory',
    component: () => import('@/views/gamification/QuizHistoryView.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/quizzes/id=:quizId',
    name: 'Quiz',
    component: () => import('@/views/gamification/QuizView.vue'),
    props: true,
  },
  {
    path: '/quizzes/admin/new-quiz',
    name: 'DefineQuiz',
    component: () => import('@/views/gamification/admin/DefineQuizView.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/quizzes/admin/edit-quiz/id=:quizId',
    name: 'EditQuiz',
    component: () => import('@/views/gamification/admin/EditQuizView.vue'),
    meta: { requiresAdmin: true },
    props: true,
  },
  {
    path: '/reflections',
    name: 'Reflections',
    component: () => import('@/views/ReflectionsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/meeting-point',
    name: 'MeetingPointPage',
    component: () => import('@/views/AdminEditMeetingPoint.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('@/views/PrivacyPolicyView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404NotFoundView.vue'),
  },
]

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
  const userStore = useUserStore()

  // Define routes accessible without authentication or household checks
  const publicRoutes = [
    'Login',
    'Register',
    'Home',
    'Household',
    'Information',
    'ScenarioTheme',
    'NotFound',
    'News',
    'Notifications',
    'ResetPassword',
    'PrivacyPolicy',
    'QuizOverview',
    'Quiz',
  ]

  // Allow immediate navigation if the target route is public
  if (publicRoutes.includes(to.name as string)) {
    //
    return next() // Proceed to the public route
  }

  // Check if the user store indicates authentication.
  // If not, attempt to initialize the store from localStorage (e.g., refresh scenario).
  if (!userStore.isAuthenticated) {
    //
    console.log('Store not authenticated, attempting initialization...')
    await userStore.initializeFromStorage() // Attempt to load user session

    // After attempting initialization, re-check authentication status.
    // If still not authenticated and the route is not public, redirect to Login.
    if (!userStore.isAuthenticated && !publicRoutes.includes(to.name as string)) {
      console.log('Initialization failed or user not authenticated, redirecting to Login.')
      userStore.logout() // Ensure any partial/invalid state is cleared
      return next({ name: 'Login' }) // Redirect to the login page
    }
    console.log('Store initialized, role:', userStore.role)
  }

  // requires super admin - not allowed
  if (to.meta.requiresSuperAdmin && !userStore.isSuperAdminUser) {
    return next({ name: 'NotFound' })
  }
  // requires admin - not allowed
  if (to.meta.requiresAdmin && !userStore.isAdminUser) {
    return next({ name: 'NotFound' })
  }
  // requires authentication - not allowed
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return next({ name: 'Login' })
  }

  // For authenticated, non-admin users, check for household association.
  if (!userStore.isAdminUser && !userStore.isSuperAdminUser) {
    try {
      // Attempt to fetch the user's current household information from the backend.
      const household = await getCurrentHousehold()

      // If the user has no household (API returns null or 404), redirect them.
      if (!household) {
        // Prevent an infinite redirect loop if already on the Household page.
        if (to.name === 'Household') {
          return next() // Allow navigation to Household page
        }
        console.log('User has no household, redirecting to Household page.')
        // Redirect user to the Household page where they can see invitations and create options
        return next({ name: 'Household' })
      }
    } catch (error) {
      // Catch errors during the household check (e.g., network, API errors)
      console.error('Error checking household:', error) // Log the error for debugging

      // Check if the error is an Axios error with a 401 (Unauthorized) status.
      // This indicates the user's token might be invalid or expired.
      const axiosError = error as AxiosError // Assert error type
      if (axiosError.response?.status === 401) {
        console.log('Unauthorized check for household, redirecting to login.')
        userStore.logout() // Log out the user and clear auth state
        return next({ name: 'Login' }) // Redirect to login
      }

      // For other errors during the household check, allow navigation to prevent
      return next() // Proceed, potentially to a route that might show an error state
    }
  }
  // User is authenticated, not an admin, and has a household. Allow navigation.
  return next() // Proceed to the requested route
})

export default router
