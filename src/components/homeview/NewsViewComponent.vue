<template>
  <div class="border border-[var(--default-blue)]/30 rounded-lg overflow-hidden h-full min-h-[600px] flex flex-col">
    <div class="p-4 bg-[var(--default-blue)]/5">
      <h2 class="text-2xl font-bold flex items-center">
        <font-awesome-icon :icon="['fas', 'newspaper']" class="mr-2 text-[var(--default-blue)]" />
        {{ t('info.news') }}
      </h2>
    </div>

    <div class="news-content p-4 flex-grow flex flex-col">
      <!-- Loading state -->
      <div v-if="initialLoading" class="flex justify-center items-center py-6 flex-grow">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-4 text-red-500 flex-grow flex items-center justify-center">
        {{ error }}
      </div>

      <!-- Empty state -->
      <div v-else-if="news.length === 0 && !loading" class="text-center py-4 text-muted-foreground flex-grow flex items-center justify-center">
        {{ t('news.no_general_news', 'No news available') }}
      </div>

      <!-- News content with scrolling - using flex-grow to fill available space -->
      <div v-else class="flex-grow overflow-y-auto pr-2">
        <InfiniteScroll
          :is-loading="loading"
          :has-more="hasMore"
          :loading-text="t('news.loading_more', 'Loading more news...')"
          :end-message="t('news.no_more_news', 'No more news to load')"
          @load-more="loadMoreNews"
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
      </div>
    </div>

    <div class="p-3 text-center border-t border-[var(--default-blue)]/20 bg-[var(--default-blue)]/5">
      <Button
        variant="outline"
        class="text-[var(--default-blue)] border-[var(--default-blue)]/30 hover:bg-[var(--default-blue)]/10 w-full"
        @click="navigateTo('/news')"
      >
        {{ t('home.view_all_news') }} <ChevronRight class="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-vue-next';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { fetchGeneralNews } from '@/services/api/NewsService.ts';
import type { News } from '@/models/News.ts';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { formatDateFull } from '@/utils/dateUtils.ts';

// Register FontAwesome icons
library.add(faNewspaper);

// State variables
const news = ref<News[]>([]);
const loading = ref(false);
const initialLoading = ref(true);
const error = ref<string | null>(null);
const page = ref(0);
const pageSize = 3;
const hasMore = ref(true);

const router = useRouter();
const { t } = useI18n();

/**
 * Loads more news articles when scrolling
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
  } catch (err) {
    console.error('Failed to load news:', err);
    error.value = t('news.error_loading', 'Failed to load news');
    hasMore.value = false;
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

/**
 * Navigates to the specified route
 *
 * @param {string} route - The route to navigate to
 */
const navigateTo = (route: string) => {
  router.push(route);
};

// Load initial news data when component mounts
onMounted(loadMoreNews);
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

/* Custom scrollbar styling */
.news-content .overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: var(--color-muted, #9ca3af) transparent;
  height: 450px; /* Fixed height for news content */
}

.news-content .overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.news-content .overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.news-content .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--color-muted, #9ca3af);
  border-radius: 6px;
}
</style>
