<template>
  <div class="content flex justify-center items-center w-full pt-5 flex-col gap-0 md:pt-20 md:gap-15">
    <div class="crisis-status w-full px-2 md:w-auto">
      <CrisisLevelOverview
        :max-display="3"
        @select-crisis="handleCrisisSelect"
      />
    </div>
    <div class="container flex flex-col gap-10 w-full max-w-7xl md:flex-row md:gap-40 pb-20">
      <!-- Dynamic Buttons -->
      <div class="crisis-components flex flex-col px-4 md:gap-20 md:px-0">
        <component :is="crisisComponents[currentStatus]" />
      </div>
      <div class="map flex-grow px-4 md:px-0 max-h-[800px] min-h-[200px] md:min-h-[300px] rounded-lg overflow-hidden">
        <MapOverviewComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MapOverviewComponent from '@/components/map/MapOverviewComponent.vue'
import CrisisLevelOverview from '@/components/crisis/CrisisLevelOverview.vue'
import { fetchAllPreviewCrisisEvents } from '@/services/CrisisEventService'

const router = useRouter()
const { t } = useI18n()

// State for ongoing crises and dynamic components
const hasOngoingCrises = ref(false)
const currentStatus = ref('crisis.no-crisis') // Default to no crisis
const crisisComponents = ref<Record<string, any>>({})

/**
 * Checks for ongoing crises by fetching crisis events.
 * Updates the `currentStatus` based on whether there are ongoing crises.
 *
 * @async
 * @function checkForOngoingCrises
 * @returns {Promise<void>} Resolves when the check is complete.
 */
const checkForOngoingCrises = async () => {
  try {
    const response = await fetchAllPreviewCrisisEvents(0, 10)
    hasOngoingCrises.value = response.content.length > 0
    currentStatus.value = hasOngoingCrises.value ? 'crisis.during' : 'crisis.no-crisis'
  } catch (error) {
    console.error('Failed to fetch crisis events:', error)
    currentStatus.value = 'crisis.no-crisis' // Fallback to no crisis
  }
}

/**
 * Dynamically loads the components for different crisis states.
 * Maps `crisis.no-crisis` and `crisis.during` to their respective components.
 *
 * @async
 * @function loadCrisisComponents
 * @returns {Promise<void>} Resolves when the components are loaded.
 */
const loadCrisisComponents = async () => {
  crisisComponents.value = {
    'crisis.no-crisis': (await import('@/components/homeview/NoCrisisButtons.vue')).default,
    'crisis.during': (await import('@/components/homeview/DuringCrisisButtons.vue')).default,
  }
}

/**
 * Handles the selection of a crisis from the `CrisisLevelOverview` component.
 * Navigates to the crisis event page with the selected crisis ID as a query parameter.
 *
 * @function handleCrisisSelect
 * @param {number} crisisId - The ID of the selected crisis.
 */
const handleCrisisSelect = (crisisId: number) => {
  console.log('Selected crisis:', crisisId)
  router.push({
    path: '/crisis-event',
    query: { id: crisisId.toString() }
  })
}

/**
 * Lifecycle hook that runs when the component is mounted.
 * Loads the dynamic components and checks for ongoing crises.
 *
 * @async
 * @function onMounted
 * @returns {Promise<void>} Resolves when the setup is complete.
 */
onMounted(async () => {
  await loadCrisisComponents()
  await checkForOngoingCrises()
})
</script>
