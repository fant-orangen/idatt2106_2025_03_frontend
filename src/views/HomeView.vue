<template>

  <!-- Authenticated User with Household and Crisis View -->
  <div
    v-if="userStore.isAuthenticated && hasHousehold && hasOngoingCrises"
    class="content w-full max-w-7xl mx-auto pt-0"
  >
    <AuthenticatedWithHouseholdCrisisHome />
  </div>

  <!-- Authenticated User with Household View (No Crisis) -->
  <div
    v-else-if="userStore.isAuthenticated && hasHousehold"
    class="content w-full max-w-7xl mx-auto pt-0"
  >
    <AuthenticatedWithHouseholdHome />
  </div>

  <!-- Authenticated User without Household View -->
  <div
    v-else-if="userStore.isAuthenticated && !hasHousehold"
    class="content w-full max-w-7xl mx-auto pt-0"
  >
    <AuthenticatedNoHouseholdHome />
  </div>

  <!-- Unauthenticated User View -->
  <div v-else class="content w-full max-w-7xl mx-auto pt-0">
    <UnauthenticatedHome />
  </div>
</template>

<script setup lang="ts">

/**
 * @component HomeView
 * @description Displays the Home page.
 */

import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import UnauthenticatedHome from '@/components/homeview/UnauthenticatedHome.vue'
import AuthenticatedNoHouseholdHome from '@/components/homeview/AuthenticatedNoHouseholdHome.vue'
import AuthenticatedWithHouseholdHome from '@/components/homeview/AuthenticatedWithHouseholdHome.vue'
import AuthenticatedWithHouseholdCrisisHome from '@/components/homeview/AuthenticatedWithHouseholdCrisisHome.vue'
import { getCurrentHousehold } from '@/services/HouseholdService'
import { fetchAllPreviewCrisisEvents } from '@/services/CrisisEventService'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

/**
 * State for household and crisis status
 */

const hasHousehold = ref(false)
const hasOngoingCrises = ref(false)

/**
 * Checks if the current user has a household
 *
 * @async
 * @function checkHouseholdStatus
 * @returns {Promise<void>} Resolves when the check is complete.
 */
const checkHouseholdStatus = async () => {
  if (userStore.isAuthenticated) {
    try {
      const household = await getCurrentHousehold()
      hasHousehold.value = !!household
    } catch (error) {
      console.error('Failed to check household status:', error)
      hasHousehold.value = false
    }
  } else {
    hasHousehold.value = false
  }
}

/**
 * Checks for ongoing crises by fetching crisis events
 *
 * @async
 * @function checkForOngoingCrises
 * @returns {Promise<void>} Resolves when the check is complete.
 */
const checkForOngoingCrises = async () => {
  try {
    const response = await fetchAllPreviewCrisisEvents(0, 10)
    hasOngoingCrises.value = response.content.length > 0
  } catch (error) {
    console.error('Failed to fetch crisis events:', error)
    hasOngoingCrises.value = false
  }
}

/**
 * Lifecycle hook that runs when the component is mounted.
 * Checks if the user has a household and if there are ongoing crises.
 *
 * @async
 * @function onMounted
 * @returns {Promise<void>} Resolves when the setup is complete.
 */
onMounted(async () => {
  await Promise.all([checkHouseholdStatus(), checkForOngoingCrises()])
})
</script>
