<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import Footer from './components/Footer.vue'
import InvitationPopup from './components/invitation/InvitationPopup.vue'
import { RouterView } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket';
import { useUserStore } from '@/stores/UserStore';
import { onMounted, watch } from 'vue';

const userStore = useUserStore();
const { isConnected, tryConnect, tryDisconnect } = useWebSocket();

// Validate token on app initialization
onMounted(async () => {
  console.log('App.vue mounted - Validating token');
  await userStore.validateToken();
});

// Debug logging for initial state
console.log('App.vue initialized - User store state:', {
  loggedIn: userStore.loggedIn,
  userId: userStore.userId,
  profile: userStore.profile
});

// Watch for changes in user state
watch(
  () => userStore.loggedIn,
  (newLoggedIn) => {
    console.log('App.vue - Login state changed:', newLoggedIn);
    if (newLoggedIn) {
      tryConnect();
    } else {
      tryDisconnect();
    }
  }
);

watch(
  () => userStore.userId,
  (newUserId) => {
    console.log('App.vue - User ID changed:', newUserId);
    if (newUserId && userStore.loggedIn) {
      tryConnect();
    }
  }
);
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
