<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle>{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>

      <div v-else-if="!crisisId" class="text-center py-4 text-muted-foreground">
        {{ t('crisis.select_event_for_news', 'Select a crisis event to view related news') }}
      </div>

      <div v-else-if="news.length === 0 && !loading && !initialLoading" class="text-center py-4 text-muted-foreground">
        {{ emptyMessage }}
      </div>

      <div v-else-if="initialLoading" class="flex justify-center items-center py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <ScrollArea v-else className="h-[300px]">
        <InfiniteScroll
          :isLoading="loading"
          :hasMore="hasMore"
          :loadingText="t('news.loading_more', 'Loading more news...')"
          :endMessage="t('news.no_more_news', 'No more news to load')"
          @load-more="loadMore"
        >
          <ul class="timeline">
            <li v-for="item in news" :key="item.id">
              <div class="dot"></div>
              <div class="timeline-content">
                <div class="flex justify-between items-baseline">
                  <strong class="text-sm text-muted-foreground">{{ formatDateFull(item.publishedAt) }}</strong>
                </div>
                <h3 class="font-medium mt-1">{{ item.title }}</h3>
                <p class="text-sm mt-1">{{ item.content }}</p>
              </div>
            </li>
          </ul>
        </InfiniteScroll>
      </ScrollArea>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { News } from '@/models/News';
import type { Page } from '@/types/Page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateFull } from '@/utils/dateUtils.ts';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { fetchNewsByCrisisEvent } from '@/services/api/NewsService';
import { paginatedCrisisNews } from '@/services/api/PaginatedNewsService';

const props = defineProps<{
  crisisId: number | null;
  fetchNewsFn?: (id: number) => Promise<News[]>;
  paginatedFetchFn?: (page: number, size: number, ...args: any[]) => Promise<Page<News>>;
  pageSize?: number;
  title?: string;
  emptyMessage?: string;
  errorMessage?: string;
}>();

const { t } = useI18n();

const news = ref<News[]>([]);
const loading = ref(false);
const initialLoading = ref(false);
const error = ref<string | null>(null);
const page = ref(0);
const size = props.pageSize || 3; // Number of news items per page (default: 3)
const hasMore = ref(true);

const title = props.title ?? t('crisis.related_news', 'Related News');
const emptyMessage = props.emptyMessage ?? t('crisis.no_related_news', 'No related news found for this event');
const errorMessage = props.errorMessage ?? t('crisis.error_loading_news', 'Failed to load related news');

// Function to load more news
const loadMore = () => {
  if (props.crisisId) {
    fetchPaginatedNews(props.crisisId);
  }
};

// Fetch paginated news
const fetchPaginatedNews = async (crisisId: number) => {
  if (loading.value || !hasMore.value) return;

  // Set appropriate loading state
  if (page.value === 0) {
    initialLoading.value = true;
  }
  loading.value = true;

  try {
    // Determine which paginated fetch function to use
    const fetchFn = props.paginatedFetchFn || paginatedCrisisNews;

    // Use the paginated news service
    const response = await fetchFn(page.value, size, crisisId);

    // Add new items to the list
    news.value.push(...response.content);

    // Update pagination
    page.value++;
    hasMore.value = page.value < response.totalPages;
  } catch (err) {
    console.error('Failed to load more news:', err);
    error.value = errorMessage;
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

// Legacy fetch method for backward compatibility
const fetchNews = async (crisisId: number) => {
  if (!crisisId) return;
  loading.value = true;
  error.value = null;
  try {
    if (props.fetchNewsFn) {
      news.value = await props.fetchNewsFn(crisisId);
    } else {
      // Use paginated fetch but reset first
      news.value = [];
      page.value = 0;
      hasMore.value = true;
      await fetchPaginatedNews(crisisId);
    }
  } catch (error) {
    error.value = errorMessage;
  } finally {
    loading.value = false;
  }
};

watch(() => props.crisisId, (newId) => {
  // Reset state when crisis changes
  news.value = [];
  page.value = 0;
  hasMore.value = true;
  error.value = null;

  if (newId) {
    // Use paginated fetch by default
    fetchPaginatedNews(newId);
  }
}, { immediate: true });
</script>

<style scoped>
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
