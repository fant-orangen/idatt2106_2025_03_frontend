<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import Footer from './components/Footer.vue'
import InvitationPopup from './components/invitation/InvitationPopup.vue'
import { RouterView } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket';
import { useUserStore } from '@/stores/UserStore';
import { onMounted } from 'vue';

const userStore = useUserStore();
const { isConnected } = useWebSocket();

// Validate token on app initialization
onMounted(async () => {
  console.log('App.vue mounted - Validating token');
  await userStore.validateToken();
  // Log state after validation
  console.log('App.vue - State after token validation:', {
    loggedIn: userStore.loggedIn,
    userId: userStore.userId,
    profile: userStore.profile
  });
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderNavbar />
    <div class="flex-grow">
      <RouterView />
    </div>
    <Footer />
    <InvitationPopup />
    <div v-if="!isConnected" class="connection-status">
      Disconnected from notifications
    </div>
  </div>
</template>
