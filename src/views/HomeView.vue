<template>
  <!-- Authenticated User with Household View -->
  <div v-if="userStore.isAuthenticated && hasHousehold" class="content w-full max-w-7xl mx-auto pt-0">
    <AuthenticatedWithHouseholdHome />
  </div>

  <!-- Authenticated User without Household View -->
  <div v-else-if="userStore.isAuthenticated && !hasHousehold" class="content w-full max-w-7xl mx-auto pt-0">
    <AuthenticatedNoHouseholdHome />
  </div>

  <!-- Unauthenticated User View -->
  <div v-else class="content w-full max-w-7xl mx-auto pt-0">
    <UnauthenticatedHome />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import UnauthenticatedHome from '@/components/homeview/UnauthenticatedHome.vue'
import AuthenticatedNoHouseholdHome from '@/components/homeview/AuthenticatedNoHouseholdHome.vue'
import AuthenticatedWithHouseholdHome from '@/components/homeview/AuthenticatedWithHouseholdHome.vue'
import { getCurrentHousehold } from '@/services/HouseholdService'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

// State for household status
const hasHousehold = ref(false)



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
 * Lifecycle hook that runs when the component is mounted.
 * Checks if the user has a household.
 *
 * @async
 * @function onMounted
 * @returns {Promise<void>} Resolves when the setup is complete.
 */
onMounted(async () => {
  await checkHouseholdStatus()
})
</script>

