<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getNotifications } from '@/services/NotificationService';
import type { NotificationMessage } from '@/models/NotificationMessage.ts';

const { t } = useI18n();
const notifications = ref<NotificationMessage[]>([]);

onMounted(async () => {
  try {
    const page = await getNotifications();
    notifications.value = page.content;
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
});
</script>

<template>
  <div class="notification-page w-full max-w-3xl mx-auto p-6">
    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <span>{{ t('navigation.home')}}</span> &gt; <span class="current">{{ t('notifications.notifications')}}</span>
    </div>

    <!-- Page Title -->
    <h1 class="text-2xl font-bold mb-4">{{ t('notifications.notifications') }}</h1>

    <!-- Notifications Timeline -->
    <div v-if="notifications.length > 0">
      <ul class="timeline">
        <li
          v-for="notification in notifications"
          :key="notification.id"
        >
          <div class="dot"></div>
          <div class="timeline-content">
            <strong>{{ notification.createdAt }}</strong> – {{ notification.description }}
          </div>
        </li>
      </ul>
    </div>
    <div v-else>
      <p class="text-sm text-gray-700">{{ $t('notifications.no-notifications') }}</p>
    </div>
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
  padding-left: 1.5rem;
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
