<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNotificationStore } from '@/stores/NotificationStore';
// Remove NotificationMessage import if not used directly here anymore
// import type { NotificationMessage } from '@/models/NotificationMessage.ts';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'; // 1. Import InfiniteScroll

const { t } = useI18n();
const notificationStore = useNotificationStore();

// Method to load the next page of notifications
async function loadMoreNotifications() {
  console.log("NotificationView: load-more triggered");
  // Call the store action to fetch the next page
  await notificationStore.fetchNextPage();
}

onMounted(async () => {
  // Fetch the initial page (page 0) only if it hasn't been fetched yet
  if (!notificationStore.hasFetchedInitial) {
    try {
      // Pass 0 to explicitly fetch the first page
      await notificationStore.fetchNotifications(0);
    } catch (error) {
      console.error('Failed to load initial notifications:', error);
    }
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

    <!-- Notifications Timeline - Wrap list in InfiniteScroll -->
    <InfiniteScroll
      :is-loading="notificationStore.isLoading"
      :has-more="notificationStore.hasMoreNotifications"
      @load-more="loadMoreNotifications"
      loading-text="Loading more notifications..."
      end-message="No more notifications"
      :threshold="300"
    >
      <!-- Default slot contains the list -->
      <div v-if="notificationStore.notifications.length > 0">
        <ul class="timeline">
          <li
            v-for="notification in notificationStore.notifications"
            :key="notification.id"
          >
            <div class="dot"></div>
            <div class="timeline-content">
              <strong>{{ new Date(notification.createdAt).toLocaleString() }}</strong> – {{ notification.description }}
            </div>
          </li>
        </ul>
      </div>
      <div v-else-if="!notificationStore.isLoading"> <!-- Show 'no notifications' only if not loading and list is empty -->
        <p class="text-sm text-gray-700 text-center py-4">{{ $t('notifications.no-notifications') }}</p>
      </div>

      <!-- Loading/End message slots are handled by InfiniteScroll component -->
      <!-- You can customize them if needed: -->
      <!--
      <template #loading>
        <p>Custom Loading...</p>
      </template>
      <template #end-message>
        <p>Custom End Message!</p>
      </template>
      -->
    </InfiniteScroll>

  </div>
</template>

<style scoped>
/* Styles remain the same */
.notification-page {
  max-width: 768px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: var(--background-color, #f9f9f9);
  color: var(--text-color, #333);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* Ensure the page itself isn't preventing scroll if content is short */
  min-height: calc(100vh - 100px); /* Example: Adjust based on navbar/footer height */
}

.breadcrumb {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  margin-bottom: 1rem;
}

.breadcrumb .current {
  color: var(--color-foreground);
  font-weight: 500;
}

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
  left: -2.4rem; /* Adjusted slightly relative to padding-left of li */
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
