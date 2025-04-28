<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import Footer from './components/Footer.vue'
import InvitationPopup from './components/invitation/InvitationPopup.vue'
import { RouterView } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket';
import type { NotificationMessage } from '@/models/Notification';

const handleNotification = (notification: NotificationMessage) => {
  console.log('Received notification:', notification);
  // Here you can add additional notification handling logic
  // For example, showing a toast, updating UI state, etc.
};

useWebSocket(handleNotification);
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
