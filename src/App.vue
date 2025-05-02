<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import Footer from './components/Footer.vue'
import { Toaster } from './components/ui/sonner'
import InvitationPopup from './components/invitation/InvitationPopup.vue'
import { RouterView } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket'
import { useUserStore } from '@/stores/UserStore'
import { onMounted, ref, watch } from 'vue'

const userStore = useUserStore()
const { isConnected } = useWebSocket()
const isInitialized = ref(false)

// Initialize the store and validate token
onMounted(async () => {
  console.log('App.vue mounted - Initializing store')
  await userStore.initializeFromStorage()
  console.log('App.vue - State after initialization:', {
    loggedIn: userStore.loggedIn,
    userId: userStore.userId,
    profile: userStore.profile,
    isAuthenticated: userStore.isAuthenticated,
  })
  isInitialized.value = true
})

// Watch for changes in authentication state
watch(
  () => userStore.isAuthenticated,
  (newAuthState) => {
    console.log('Authentication state changed:', newAuthState)
  },
)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderNavbar class="z-9"/>
    <Toaster class="" />
    <div class="flex-grow">
      <RouterView />
    </div>
    <Footer class="z-9" />
    <InvitationPopup />
    <div v-if="isInitialized && !isConnected" class="connection-status">
      Disconnected from notifications
    </div>
  </div>
</template>
