<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import Footer from './components/Footer.vue'
import { Toaster } from './components/ui/sonner'
import { RouterView } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket'
import { useUserStore } from '@/stores/UserStore'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import { onMounted, ref, watch } from 'vue'

const userStore = useUserStore()
const householdStore = useHouseholdStore()
const { isConnected } = useWebSocket()
const isInitialized = ref(false)

// Initialize the store and validate token
onMounted(async () => {
  console.log('App.vue mounted - Initializing store')
  await userStore.initializeFromStorage()

  // If user is authenticated, initialize household store
  if (userStore.isAuthenticated) {
    console.log('User is authenticated, initializing household store')
    await householdStore.fetchCurrentHousehold()
  }

  console.log('App.vue - State after initialization:', {
    loggedIn: userStore.loggedIn,
    userId: userStore.userId,
    profile: userStore.profile,
    isAuthenticated: userStore.isAuthenticated,
    hasHousehold: !!householdStore.currentHousehold
  })
  isInitialized.value = true
})

// Watch for changes in authentication state
watch(
  () => userStore.isAuthenticated,
  async (newAuthState) => {
    console.log('Authentication state changed:', newAuthState)
    if (newAuthState) {
      await householdStore.fetchCurrentHousehold()
    }
  },
)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderNavbar class="z-100" />
    <Toaster class="" />
    <div class="flex-grow">
      <RouterView />
    </div>
    <Footer class="z-99" />
  </div>
</template>
