<template>
  <div class="content flex justify-center items-center pt-20 flex-col gap-10">
    <div class="container flex flex-col gap-4 w-full max-w-7xl">
      <!-- Buttons Section -->
      <div class="during-crisis-buttons flex flex-col gap-2">
      </div>

      <!-- Days of Water and Food Left Section -->
      <div class="mb-4">
        <!-- Water Days Left -->
        <div class="p-2 rounded-md flex w-72 items-center bg-blue-100 text-blue-700">
          <AlertTriangle class="mr-2 flex-shrink-0 text-blue-700" />
          <p class="text-sm">
            {{ t('household.water-days-left', { days: waterDaysLeft }) }}
          </p>
        </div>
        <!-- Food Days Left -->
        <div class="p-2 rounded-md flex w-72 items-center bg-green-100 text-green-700 mt-2">
          <AlertTriangle class="mr-2 flex-shrink-0 text-green-700" />
          <p class="text-sm">
            {{ t('household.food-days-left', { days: foodDaysLeft }) }}
          </p>
        </div>
      </div>

      <!-- Info Button -->
    <div class="flex flex-col gap-2">
      <Button
        class="flex items-center justify-between w-72 mt-2 px-6 py-3 text-left border rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
        @click="navigateToScenarioTheme(currentEventId)"
      >
        Les mer om krisesenarioet
        <ArrowRight class="ml-1 h-3 w-3" />
      </Button>

      <!-- Household Button -->
      <Button
        class="flex items-center justify-between w-72 px-6 py-3 text-left border rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
        @click="navigateTo('household')"
      >
        <font-awesome-icon :icon="['fas', 'home']" class="text-xl" />
        <span class="flex-1 text-sm leading-tight break-words whitespace-normal">
          {{ t('household.my-household') }}
        </span>
        <ArrowRight class="text-lg" />
      </Button>
    </div>

      <!-- Notifications Section -->
      <RouterLink
        to="/notifications"
        class="flex items-center justify-left gap-2 text-2xl font-bold text-center hover:underline"
      >
        {{ t('info.notifications') }}
        <ArrowRight class="text-lg" />
      </RouterLink>

      <!-- News Section -->
      <RouterLink
        to="/news"
        class="flex items-center justify-left gap-2 text-2xl font-bold text-center hover:underline"
      >
        {{ t('info.news') }}
        <ArrowRight class="text-lg" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
/**
 * Imports
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight } from 'lucide-vue-next'

/**
 * Router and i18n setup
 */
const router = useRouter()
const { t } = useI18n()

/**
 * Reactive state for water and food days left
 * These values should be replaced with actual logic to fetch data dynamically.
 */
const waterDaysLeft = ref(5) // Number of days of water left
const foodDaysLeft = ref(3) // Number of days of food left

/**
 * Mock current event ID
 * Replace this with dynamic logic to fetch the current event ID.
 */
const currentEventId = ref(1)

/**
 * Navigates to the scenario theme page for the given theme ID.
 * @param {number} themeId - The ID of the scenario theme to navigate to.
 */
function navigateToScenarioTheme(themeId) {
  if (!themeId) {
    console.error('No theme ID provided')
    return
  }

  router.push({
    name: 'ScenarioTheme',
    params: { id: themeId.toString() }
  })
}

/**
 * Generic navigation function to navigate to a specific route.
 * @param {string} route - The route to navigate to.
 */
const navigateTo = (route) => {
  router.push(route)
}
</script>
