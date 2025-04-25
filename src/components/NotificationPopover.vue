<script setup lang="ts">
import { RouterLink } from 'vue-router'

// Props for notifications
interface Notification {
  id: string | number; // Adjust the type based on your data
  message: string;
}

defineProps<{
  notifications: Notification[];
}>();
</script>

<template>
  <div class="w-64">
    <h2 class="text-lg font-bold mb-2">Notifications</h2>
    <div v-if="notifications.length > 0">
      <ul class="notification-list">
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item text-sm py-2"
        >
          {{ notification.message }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p class="text-sm text-gray-700">No new notifications.</p>
    </div>
    <RouterLink
    to="/notifications"
    class="text-primary hover:underline text-sm font-medium mt-4 block">
    {{ $t('notifications.all-notifications') }}
    </RouterLink>
  </div>
</template>

<style scoped>
/* Notification list styling */
.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-item {
  position: relative;
  padding-left: 1.5rem; /* Space for the dot */
  margin-bottom: 1rem; /* Space between items */
}

.notification-item::before {
  content: '';
  position: absolute;
  left: 0.5rem; /* Position the dot */
  top: 0.8rem; /* Center the dot vertically */
  bottom: 0.8rem; /* Align with the top */
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--primary-color, #007bff); /* Dot color */
  border-radius: 50%; /* Make it circular */
}

.notification-item::after {
  content: '';
  position: absolute;
  left: 0.6rem; /* Align with the dot */
  top: 1.6rem; /* Start below the dot */
  width: 2px;
  height: calc(100% - 0.7rem); /* Adjust height dynamically */
  background-color: var(--primary-color, #007bff); /* Line color */
}

.notification-item:last-child::after {
  display: none; /* Remove the line for the last item */
}
</style>