<template>
    <div class="content flex justify-center items-center pt-20 flex-col gap-10">
      <div class="container flex flex-col gap-6 w-full max-w-7xl">
        <!-- Buttons Section -->
        <div class="during-crisis-buttons flex flex-col gap-4">
        </div>
          <!-- Days of Water and Food Left Section -->
          <div class="mb-4">
            <div class="p-2 rounded-md flex items-center bg-blue-100 text-blue-700">
              <AlertTriangle class="mr-2 flex-shrink-0 text-blue-700" />
              <p class="text-sm">
                {{ t('household.water-days-left', { days: waterDaysLeft }) }}
              </p>
            </div>
            <div class="p-2 rounded-md flex items-center bg-green-100 text-green-700 mt-2">
              <AlertTriangle class="mr-2 flex-shrink-0 text-green-700" />
              <p class="text-sm">
                {{ t('household.food-days-left', { days: foodDaysLeft }) }}
              </p>
            </div>
          </div>
  
          <!-- Info Button -->
            <Button
              class="flex items-center justify-between gap-2 w-72 px-6 py-3 text-left border rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              @click="navigateToScenarioTheme(currentEventId)"
            >
              <font-awesome-icon :icon="['fas', 'info-circle']" class="text-xl" />
              <span class="flex-1 text-sm leading-tight break-words whitespace-normal">
                {{ t('info.read-info-preparations') }}
              </span>
              <ArrowRight class="text-lg" />
            </Button>

          <!-- Household Button -->
          <Button
            class="flex items-center justify-between gap-2 w-72 px-6 py-3 text-left border rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            @click="navigateTo('household')"
          >
            <font-awesome-icon :icon="['fas', 'home']" class="text-xl" />
            <span class="flex-1 text-sm leading-tight break-words whitespace-normal">
              {{ t('household.my-household') }}
            </span>
            <ArrowRight class="text-lg" />
          </Button>
  
        <!-- Notifications Section -->
        <h2 class="flex items-center justify-left gap-2 text-2xl font-bold text-center">
          {{ t('info.notifications') }}
          <ArrowRight class="text-lg" />
        </h2>

        <!-- News Section -->
         <h2 class="flex items-center justify-left gap-2 text-2xl font-bold text-center">
          {{ t('info.news') }}
          <ArrowRight class="text-lg" />
        </h2>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { Button } from '@/components/ui/button'
  import { AlertTriangle, ArrowRight } from 'lucide-vue-next'
  import { fetchTheCrisisEventById } from '@/services/CrisisEventService'

  // Router and i18n
  const router = useRouter()
  const { t } = useI18n()

  const waterDaysLeft = ref(5) // Replace with actual logic later
  const foodDaysLeft = ref(3) // Replace with actual logic later

  // Mock current event ID (replace with actual logic to fetch the current event)
const currentEventId = ref(1) // Replace with dynamic logic to get the current event ID

// Navigation function
const navigateToEventInfo = async () => {
  if (!currentEventId.value) {
    console.error('No current event ID available')
    return
  }

  try {
    // Fetch the current event details (optional, for validation or additional data)
    const event = await fetchTheCrisisEventById(currentEventId.value)
    if (event) {
      // Navigate to the event's information page
      router.push(`/info/scenario/${currentEventId.value}`)
    } else {
      console.error('Failed to fetch the current event details')
    }
  } catch (error) {
    console.error('Error navigating to event info:', error)
  }
}

// Navigation function for Scenario Theme
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
  
  // Navigation function
  const navigateTo = (route) => {
    router.push(route)
  }
</script>