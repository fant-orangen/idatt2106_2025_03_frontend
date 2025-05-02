<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { NotificationMessage } from '@/models/NotificationMessage'

defineProps<{
  notifications: NotificationMessage[];
}>();
</script>

<template>
  <div class="w-64">
    <h2 class="text-lg font-bold mb-2">{{ $t ('notifications.notifications')}}</h2>
    <div v-if="notifications.length > 0">
      <ul class="timeline">
        <li
          v-for="notification in notifications"
          :key="notification.id"
        >
          <div class="dot"></div>
          <div class="timeline-content">
            <strong>{{ new Date(notification.notifyAt).toLocaleTimeString() }}</strong> – {{ notification.description || 'No description' }}
          </div>
        </li>
      </ul>
    </div>
    <div v-else>
      <p class="text-sm text-gray-700">{{ $t('notifications.no-new-notifications')}}</p>
    </div>
    <RouterLink
      to="/notifications"
      class="text-primary hover:underline text-sm font-medium mt-4 block"
    >
      {{ $t('notifications.all-notifications') }}
    </RouterLink>
  </div>
</template>

<style scoped>
/* Centered container styling */
.notification-page {
  max-width: 768px; /* Same as NewsView */
  margin: 0 auto; /* Center horizontally */
  padding: 1.5rem;
  background-color: var(--background-color, #f9f9f9);
  color: var(--text-color, #333);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Breadcrumb styling */
.breadcrumb {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  margin-bottom: 1rem;
}

.breadcrumb .current {
  color: var(--color-foreground);
  font-weight: 500;
}

/* Timeline styling */
.timeline {
  position: relative;
  margin: 1.5rem 0;
  padding-left: 2rem;
  list-style: none;
  border-left: 2px solid var(--color-foreground);
}

.timeline li {
  position: relative;
  margin-bottom: 1.5rem;
}

.dot {
  position: absolute;
  left: -2.4rem;
  top: 0.45rem;
  width: 0.75rem;
  height: 0.75rem;
  background-color: var(--color-foreground);
  border-radius: 50%;
  z-index: 1;
}

.timeline-content {
  position: relative;
  z-index: 2;
  color: var(--text-color);
}
</style>
