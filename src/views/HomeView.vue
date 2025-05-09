<template>
  <!-- Loading state -->
  <div v-if="isLoading && userStore.isAuthenticated" class="content w-full max-w-7xl mx-auto pt-0 flex justify-center items-center min-h-[50vh]">
    <div class="text-center">
      <div class="inline-block w-8 h-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
      <p>{{ t('common.loading', 'Loading...') }}</p>
    </div>
  </div>

  <!-- Authenticated User with Household and Crisis View -->
  <div v-else-if="userStore.isAuthenticated && hasHousehold && hasOngoingCrises"
       class="content w-full max-w-7xl mx-auto pt-0">
    <AuthenticatedWithHouseholdCrisisHome />
  </div>

  <!-- Authenticated User with Household View (No Crisis) -->
  <div v-else-if="userStore.isAuthenticated && hasHousehold"
       class="content w-full max-w-7xl mx-auto pt-0">
    <AuthenticatedWithHouseholdHome />
  </div>

  <!-- Authenticated User without Household View -->
  <div v-else-if="userStore.isAuthenticated && !hasHousehold"
       class="content w-full max-w-7xl mx-auto pt-0">
    <AuthenticatedNoHouseholdHome />
  </div>

  <!-- Unauthenticated User View -->
  <div v-else class="content w-full max-w-7xl mx-auto pt-0">
    <UnauthenticatedHome />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import UnauthenticatedHome from '@/components/homeview/UnauthenticatedHome.vue'
import AuthenticatedNoHouseholdHome from '@/components/homeview/AuthenticatedNoHouseholdHome.vue'
import AuthenticatedWithHouseholdHome from '@/components/homeview/AuthenticatedWithHouseholdHome.vue'
import AuthenticatedWithHouseholdCrisisHome from '@/components/homeview/AuthenticatedWithHouseholdCrisisHome.vue'
import { fetchAllPreviewCrisisEvents } from '@/services/CrisisEventService'

const { t } = useI18n()
const userStore = useUserStore()
const householdStore = useHouseholdStore()

// State for household and crisis status
const hasHousehold = computed(() => !!householdStore.currentHousehold)
const hasOngoingCrises = ref(false)
const isLoading = ref(true)

/**
 * Checks if the current user has a household using the HouseholdStore
 */
const checkHouseholdStatus = async () => {
  if (userStore.isAuthenticated) {
    try {
      await householdStore.fetchCurrentHousehold()
    } catch (err) {
      console.error('Error fetching household:', err)
    }
  }
}

/**
 * Checks for ongoing crises by fetching crisis events
 */
const checkForOngoingCrises = async () => {
  try {
    const response = await fetchAllPreviewCrisisEvents(0, 10)
    hasOngoingCrises.value = response.content.length > 0
  } catch (err) {
    console.error('Failed to fetch crisis events:', err)
    hasOngoingCrises.value = false
  }
}

/**
 * Refreshes all data needed for the home view
 */
const refreshHomeData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      checkHouseholdStatus(),
      checkForOngoingCrises()
    ])
  } catch (err) {
    console.error('Error refreshing home data:', err)
  } finally {
    isLoading.value = false
  }
}

watch(() => userStore.isAuthenticated, async (isAuthenticated) => {
  console.log('Authentication state changed in HomeView:', isAuthenticated)
  if (isAuthenticated) {
    await refreshHomeData()
  }
})

onMounted(async () => {
  await refreshHomeData()
})
</script>
