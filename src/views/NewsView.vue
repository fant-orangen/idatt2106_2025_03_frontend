<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { News } from '@/models/News';
import { fetchGeneralNews } from '@/services/api/NewsService';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { formatDateFull } from '@/utils/dateUtils';

const { t } = useI18n();
const news = ref<News[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(0);
const pageSize = 5; // Reduced page size for more controlled loading

/**
 * NewsView component
 *
 * This component displays a paginated list of news articles from the user's news digest.
 * It uses infinite scrolling to load more articles as the user scrolls down.
 *
 * Features:
 * - Displays news articles in a timeline format
 * - Supports infinite scrolling pagination
 * - Shows loading states and error messages
 * - Formats dates using the formatDateFull utility
 *
 * State Management:
 * - news: Array of news articles
 * - loading: Boolean indicating if more news is being loaded
 * - hasMore: Boolean indicating if there are more articles to load
 * - page: Current page number for pagination
 * - pageSize: Number of articles to load per page
 * - error: Error message if news loading fails
 * - initialLoading: Boolean indicating if initial news load is in progress
 *
 * @component
 */
const loadMoreNews = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    console.log('Loading more news, current page:', page.value);
    const response = await fetchGeneralNews(page.value, pageSize);
    console.log('Received response:', response);

    if (response.content && response.content.length > 0) {
      news.value.push(...response.content);
      page.value++;
      hasMore.value = page.value < response.totalPages;
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.error('Failed to load news:', error);
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

onMounted(loadMoreNews);
</script>

<template>
  <div class="news-page">
    <!-- Fixed header section -->
    <div class="header-section">
      <div class="content-wrapper w-full max-w-3xl mx-auto p-6">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <span>{{ t('navigation.home')}}</span> &gt; <span class="current">{{ t('info.news')}}</span>
        </div>

        <!-- Page Title -->
        <h1 class="text-2xl font-bold mb-4">{{ t('info.news')}}</h1>
      </div>
    </div>

    <!-- Scrollable content section -->
    <div class="content-section">
      <div class="content-wrapper w-full max-w-3xl mx-auto px-6">
        <div v-if="news.length === 0 && !loading" class="text-center">
          <p>{{ t('errors.no-news-available')}}</p>
        </div>

        <InfiniteScroll
          :is-loading="loading"
          :has-more="hasMore"
          :loading-text="t('news.loading_more', 'Loading more news...')"
          :end-message="t('news.no_more_news', 'No more news to load')"
          :threshold="100"
          @load-more="loadMoreNews"
        >
          <ul class="timeline">
            <li v-for="item in news" :key="item.id">
              <div class="dot"></div>
              <div class="timeline-content">
                <div class="flex justify-between items-baseline">
                  <strong class="text-sm text-muted-foreground">{{ formatDateFull(item.publishedAt) }}</strong>
                  <span class="text-xs text-muted-foreground">{{ item.crisisEventName }}</span>
                </div>
                <h3 class="font-medium mt-1">{{ item.title }}</h3>
                <p class="text-sm mt-1">{{ item.content }}</p>
                <div class="text-xs text-muted-foreground mt-2">
                  {{ t('news.posted_by', 'Posted by') }} {{ item.createdByName }}
                </div>
              </div>
            </li>
          </ul>
        </InfiniteScroll>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-section {
  flex: none;
}

.content-section {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.content-wrapper {
  width: 100%;
  max-width: 48rem;
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

/* Container for news content */
.news-scroll-container {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 120px);
  width: 100%;
  position: relative;
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

/* Responsive adjustments */
@media (max-width: 640px) {
  .timeline {
    padding-left: 1rem;
  }

  .timeline li {
    margin-bottom: 1rem;
    padding-left: 1rem;
  }

  .dot {
    left: -1.5rem;
    width: 0.6rem;
    height: 0.6rem;
  }

  .timeline-content {
    font-size: 0.875rem;
  }
}
</style>
