<script setup lang="ts">
import { ref, onMounted, defineProps, withDefaults } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NotificationMessage } from '@/models/NotificationMessage.ts';

const props = withDefaults(defineProps<{
  title?: string;
  showBreadcrumbs?: boolean;
  maxItems?: number;
  loading?: boolean;
  news?: NotificationMessage[];
  useTimeline?: boolean;
}>(), {
  title: '',
  showBreadcrumbs: false,
  maxItems: 0, // 0 means no limit
  loading: false,
  news: () => [],
  useTimeline: true
});

const { t } = useI18n();
const localNews = ref<NotificationMessage[]>([]);

// If news aren't passed as props, we'll need to fetch them
onMounted(async () => {
  // Only fetch news if none were provided
  if (props.news.length === 0 && !props.loading) {
    try {
      // Import dynamically to avoid circular dependencies
      const { getNotifications } = await import('@/services/NotificationService');
      localNews.value = await getNotifications();
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }
});

// Combine props news and local news, with props taking precedence
const displayNews = computed(() => {
  const newsToDisplay = props.news.length > 0 ? props.news : localNews.value;
  if (props.maxItems > 0) {
    return newsToDisplay.slice(0, props.maxItems);
  }
  return newsToDisplay;
});
</script>

<template>
  <div class="news-overview w-full">
    <!-- Optional Breadcrumb -->
    <div v-if="showBreadcrumbs" class="breadcrumb">
      <span>{{ t('navigation.home') }}</span> &gt; <span class="current">{{ title || t('info.news') }}</span>
    </div>

    <!-- Page Title - only show if title is provided -->
    <h2 v-if="title" class="text-2xl font-bold mb-4">{{ title }}</h2>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="displayNews.length === 0" class="text-center py-4 text-muted-foreground">
      <p>{{ t('errors.no-news-available') }}</p>
    </div>

    <!-- Timeline Display -->
    <ul v-else-if="useTimeline" class="timeline">
      <li v-for="item in displayNews" :key="item.id">
        <div class="dot"></div>
        <div class="timeline-content">
          <div class="flex justify-between items-baseline">
            <strong class="text-sm text-muted-foreground">{{ item.createdAt }}</strong>
            <span v-if="item.category" class="text-xs px-2 py-0.5 rounded-full bg-muted">
              {{ item.category }}
            </span>
          </div>
          <h3 class="font-medium mt-1">{{ item.title || t('notifications.untitled') }}</h3>
          <p class="text-sm mt-1">{{ item.description }}</p>
        </div>
      </li>
    </ul>

    <!-- List Display (alternative to timeline) -->
    <div v-else class="space-y-4">
      <div
        v-for="item in displayNews"
        :key="item.id"
        class="p-4 border border-border rounded-md"
      >
        <div class="flex justify-between items-baseline">
          <strong class="text-sm text-muted-foreground">{{ item.createdAt }}</strong>
          <span v-if="item.category" class="text-xs px-2 py-0.5 rounded-full bg-muted">
            {{ item.category }}
          </span>
        </div>
        <h3 class="font-medium mt-1">{{ item.title || t('notifications.untitled') }}</h3>
        <p class="text-sm mt-1">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  border-left: 2px solid var(--color-border, #e2e8f0);
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
  background-color: var(--color-primary, #3b82f6);
  border-radius: 50%;
  z-index: 1;
}

.timeline-content {
  position: relative;
  z-index: 2;
}
</style>
