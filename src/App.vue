<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import Footer from './components/Footer.vue'
import InvitationPopup from './components/invitation/InvitationPopup.vue'
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted } from 'vue';
import { connectNotificationSocket, disconnectNotificationSocket } from '@/services/api/WebSocketService';
import { useUserStore } from '@/stores/UserStore';

const userStore = useUserStore();

onMounted(() => {
  // Only connect if user is logged in and has a profile
  if (userStore.loggedIn && userStore.profile?.id) {
    try {
      connectNotificationSocket((notification) => {
        console.log('Received notification:', notification);
      });
    } catch (error) {
      console.error('Failed to connect to notification socket:', error);
    }
  }
});

onUnmounted(() => {
  try {
    disconnectNotificationSocket();
  } catch (error) {
    console.error('Error disconnecting from notification socket:', error);
  }
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
  </div>
</template>
