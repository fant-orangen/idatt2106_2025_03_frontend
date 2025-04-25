<script setup lang="ts">
import { ref } from 'vue'

// Sample notifications (just dummy data for demonstration)
const notifications = ref([
  { id: 1, message: 'New message from John Doe', read: false },
  { id: 2, message: 'Your order has been shipped', read: true },
  { id: 3, message: 'New comment on your post', read: false },
    { id: 4, message: 'System maintenance scheduled for tonight', read: false },
    { id: 5, message: 'New feature update available', read: true },
    { id: 6, message: 'Password change successful', read: false },
    { id: 7, message: 'New friend request from Jane Doe', read: true },
    { id: 8, message: 'Your profile has been updated', read: false },
    { id: 9, message: 'New event invitation received', read: true },
    { id: 10, message: 'System alert: High CPU usage detected', read: false }
])
</script>

<template>
  <div class="notification-page w-full max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">{{ $t('notifications.notifications') }}</h1>    <div v-if="notifications.length > 0">
      <ul class="notification-list">
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item text-sm py-4"
        >
          {{ notification.message }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p class="text-sm text-gray-700">No new notifications.</p>
    </div>
  </div>
</template>

<style scoped>
/* Notification page container */
.notification-page {
  background-color: var(--background-color, #f9f9f9);
  color: var(--text-color, #333);
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

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
  display: flex;
  align-items: center; /* Align text and dot vertically */
}

.notification-item::before {
  content: '';
  position: absolute;
  left: 0.5rem; /* Position the dot */
  top: 50%; /* Center the dot vertically */
  transform: translateY(-50%); /* Adjust for perfect centering */
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--primary-color, #007bff); /* Dot color */
  border-radius: 50%; /* Make it circular */
}

.notification-item::after {
  content: '';
  position: absolute;
  left: 0.75rem; /* Align with the center of the dot */
  top: 2.5rem; /* Start at the top of the notification item */
  bottom: -1.8rem; /* Extend to the bottom of the notification item */
  width: 2px; /* Thickness of the line */
  background-color: var(--primary-color, #007bff); /* Line color */
}

.notification-item:last-child::after {
  display: none; /* Remove the line for the last item */
}
</style>