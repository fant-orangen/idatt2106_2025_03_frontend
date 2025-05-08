<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNotificationStore } from '@/stores/NotificationStore';
// Remove NotificationMessage import if not used directly here anymore
// import type { NotificationMessage } from '@/models/NotificationMessage.ts';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'; // 1. Import InfiniteScroll
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
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
      await notificationStore.markAllAsRead(); // Mark all notifications as read when the page is loaded
    } catch (error) {
      console.error('Failed to load initial notifications:', error);
    }
  }
});
</script>

<template>
  <div class="m-5">
      <!-- Breadcrumb -->
      <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            {{ $t('navigation.home') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            {{ $t('notifications.notifications') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="w-full max-w-3xl mx-auto p-6 rounded-lg">
    <!-- Page Title -->
    <h1 class="text-2xl font-bold mb-4 ">{{ t('notifications.notifications') }}</h1>

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
        <ul class="relative border-l-2 border-gray-800 dark:border-gray-100 ml-6">
          <li
            v-for="notification in notificationStore.notifications"
            :key="notification.id"
            class="relative pl-8 mb-6 flex items-start"
          >
            <div class="absolute left-[-0.55rem] top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-800 dark:bg-gray-100 rounded-full"></div>
            <div class="text-sm text-gray-700 dark:text-gray-200">
              <strong>{{ new Date(notification.createdAt).toLocaleString() }}</strong>
              <br />{{ notification.description }}
            </div>
          </li>
        </ul>
      </div>
      <div v-else-if="!notificationStore.isLoading"> <!-- Show 'no notifications' only if not loading and list is empty -->
        <p class="text-sm text-gray-500 dark:text-gray-300 text-center py-4">{{ $t('notifications.no-notifications') }}</p>
      </div>
    </InfiniteScroll>

  </div>
</template>

