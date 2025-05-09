<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { News } from '@/models/News';
import { fetchGeneralNews } from '@/services/api/NewsService';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { formatDateFull } from '@/utils/dateUtils';
import { fetchCrisisEventById } from '@/services/CrisisEventService';
import type { CrisisEventDto } from '@/models/CrisisEvent';

const { t } = useI18n();
const news = ref<News[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(0);
const pageSize = 5;
const crisisEventCache = ref<Record<number, CrisisEventDto | null>>({});

const loadCrisisDetails = async (eventId: number) => {
  if (eventId in crisisEventCache.value) return;

  try {
    const data = await fetchCrisisEventById(eventId);
    crisisEventCache.value[eventId] = data;
  } catch (error) {
    console.error('Failed to load crisis event details:', error);
    crisisEventCache.value[eventId] = null;
  }
};

const loadMoreNews = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const response = await fetchGeneralNews(page.value, pageSize);

    if (response.content && response.content.length > 0) {
      for (const item of response.content) {
        await loadCrisisDetails(item.crisisEventId); // Fetch related crisis info
      }
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
  <div class="news-scroll-container">
    <ul class="timeline">
      <li v-for="item in news" :key="item.id">
        <div class="dot"></div>
        <div class="timeline-content">
          <div class="flex justify-between items-baseline">
            <strong class="text-sm text-muted-foreground">{{ formatDateFull(item.publishedAt) }}</strong>
            <a
              class="text-xs text-blue-600 hover:underline"
              :href="`http://localhost:5173/crisis-event?id=${item.crisisEventId}`"
              target="_blank"
            >
              {{ item.crisisEventName }}
            </a>
          </div>

          <h3 class="font-medium mt-1">{{ item.title }}</h3>
          <p class="text-sm mt-1">{{ item.content }}</p>

          <div class="text-xs text-muted-foreground mt-2">
            {{ t('news.posted_by', 'Posted by') }} {{ item.createdByName }}
          </div>

          <!-- Additional Crisis Info -->
          <div
            v-if="crisisEventCache[item.crisisEventId]"
            class="text-xs text-muted-foreground mt-2"
          >
            <p>
              <strong>Severity:</strong>
              <span
                :class="{
                  'text-green-600': crisisEventCache[item.crisisEventId]?.severity === 'green',
                  'text-yellow-600': crisisEventCache[item.crisisEventId]?.severity === 'yellow',
                  'text-red-600': crisisEventCache[item.crisisEventId]?.severity === 'red'
                }"
              >
                {{ crisisEventCache[item.crisisEventId]?.severity }}
              </span>
            </p>
            <p>
              <strong>Start:</strong> {{ formatDateFull(crisisEventCache[item.crisisEventId]?.startTime) }}
            </p>
            <p>
              <strong>Scenario:</strong>
              <a
                :href="`http://localhost:5173/info/scenario/${crisisEventCache[item.crisisEventId]?.scenarioThemeId}`"
                class="text-blue-600 hover:underline"
                target="_blank"
              >
                View Scenario
              </a>
            </p>
          </div>
        </div>
      </li>
    </ul>
    <InfiniteScroll @load-more="loadMoreNews" :loading="loading" :has-more="hasMore" />
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
  max-height: 70vh; /* Limit the height to 70% of viewport height */
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
  overflow-y: auto;
  max-height: 60vh; /* Limit the height of the scrollable area */
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
