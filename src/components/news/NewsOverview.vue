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

      <div
        v-else-if="news.length === 0 && !loading && !initialLoading"
        class="text-center py-4 text-muted-foreground"
      >
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
                  <strong class="text-sm text-muted-foreground">{{
                    formatDateFull(item.publishedAt)
                  }}</strong>
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
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { News } from '@/models/News'
import type { Page } from '@/types/Page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDateFull } from '@/utils/dateUtils.ts'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import { fetchNewsByCrisisEvent, fetchPaginatedNewsByCrisisEvent } from '@/services/api/NewsService'

/**
 * NewsOverview component
 *
 * This component displays a list of news items related to a crisis event.
 * It supports infinite scrolling to load more news items as the user scrolls down.
 *
 * Features:
 * - Displays news in a timeline format with publication dates
 * - Supports pagination with infinite scrolling
 * - Can be customized with different fetch functions
 * - Configurable page size and messages
 *
 * @component
 */

/**
 * Component props
 */
const props = defineProps<{
  /** The ID of the crisis event to show news for. Can be null if no crisis is selected. */
  crisisId: number | null
  /** Optional custom function to fetch news (non-paginated version) */
  fetchNewsFn?: (id: number) => Promise<News[]>
  /** Optional custom function to fetch paginated news */
  paginatedFetchFn?: (page: number, size: number, ...args: any[]) => Promise<Page<News>>
  /** Number of news items to load per page (default: 3) */
  pageSize?: number
  /** Custom title for the news section */
  title?: string
  /** Custom message to display when no news is found */
  emptyMessage?: string
  /** Custom error message */
  errorMessage?: string
}>()

const { t } = useI18n()

// State variables
const news = ref<News[]>([])
const loading = ref(false)
const initialLoading = ref(false)
const error = ref<string | null>(null)
const page = ref(0)
const size = props.pageSize || 3 // Number of news items per page (default: 3)
const hasMore = ref(true)

// Text content with fallbacks to translation keys
const title = props.title ?? t('news.related_news', 'Related News')
const emptyMessage = props.emptyMessage ?? t('news.no_news_found', 'No news found')
const errorMessage =
  props.errorMessage ?? t('crisis.error_loading_news', 'Failed to load related news')

/**
 * Function to load more news when scrolling
 * Called by the InfiniteScroll component
 */
const loadMore = () => {
  if (props.crisisId) {
    fetchPaginatedNews(props.crisisId)
  }
}

/**
 * Fetches a page of news items from the API
 * Handles loading states and pagination
 *
 * @param crisisId - The ID of the crisis event to fetch news for
 */
const fetchPaginatedNews = async (crisisId: number) => {
  if (loading.value || !hasMore.value) return

  if (page.value === 0) {
    initialLoading.value = true
  }
  loading.value = true

  try {
    // Use custom paginated function if provided, otherwise use the default one
    const fetchFn =
      props.paginatedFetchFn || ((id, pg, sz) => fetchPaginatedNewsByCrisisEvent(id, pg, sz))

    // Pass the parameters in the correct order (crisisId, page, size)
    console.log(`Fetching news with crisisId=${crisisId}, page=${page.value}, size=${size}`)
    const response = await fetchFn(crisisId, page.value, size)
    news.value.push(...response.content)
    page.value++
    hasMore.value = page.value < response.totalPages
  } catch (err) {
    console.error('Failed to load more news:', err)
    error.value = errorMessage
  } finally {
    loading.value = false
    initialLoading.value = false
  }
}

/**
 * Watch for changes to the crisis ID and reload data when it changes
 */
watch(
  () => props.crisisId,
  (newId) => {
    // Reset state when crisis changes
    news.value = []
    page.value = 0
    hasMore.value = true
    error.value = null

    if (newId) {
      // Use paginated fetch by default
      fetchPaginatedNews(newId)
    }
  },
  { immediate: true },
)
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
/* Responsive adjustments for smaller screens */
@media (max-width: 640px) {
  .timeline {
    padding-left: 1rem; /* Reduce padding on smaller screens */
  }

  .timeline li {
    margin-bottom: 1rem; /* Reduce gap between timeline items */
    padding-left: 1rem; /* Reduce padding for text alignment */
  }

  .dot {
    left: -1.5rem; /* Move the dot closer to the text */
    width: 0.6rem; /* Reduce dot size */
    height: 0.6rem; /* Reduce dot size */
  }

  .timeline-content {
    font-size: 0.875rem; /* Reduce font size for better fit */
  }
}
</style>
