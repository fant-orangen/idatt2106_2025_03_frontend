<template>
  <div class="h-full w-full flex flex-col items-center">
    <h1 class="text-2xl font-bold mt-4 mb-6">{{ t('news.title', 'News') }}</h1>
    <div class="overflow-y-auto max-h-[72vh] max-w-3xl mx-auto px-4 sm:px-6 w-full">
      <ul class="relative my-6 border-l-2 border-border pl-4">
        <li v-for="item in news" :key="item.id" class="relative mb-6 pl-4">
          <div class="absolute left-0 top-2 h-4 w-4 rounded-full bg-primary transform -translate-x-6.25"></div>
          <div class="relative z-10">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
              <strong class="text-sm text-muted-foreground">{{ formatDateFull(item.publishedAt) }}</strong>
              <a
                class="text-xs inline-flex items-center gap-1 text-primary hover:underline"
                :href="`http://localhost:5173/crisis-event?id=${item.crisisEventId}`"
                target="_blank"
              >
                <span class="text-muted-foreground">{{ t('news.related_crisis') }}:</span> {{ item.crisisEventName }}
              </a>
            </div>

            <h3 class="font-medium mt-2">{{ item.title }}</h3>
            <p class="text-sm mt-1 text-foreground/80">{{ item.content }}</p>

            <!-- Additional Crisis Info (Contextual) -->
            <div
              v-if="crisisEventCache[item.crisisEventId]"
              class="text-xs text-muted-foreground mt-3 space-y-1 rounded-md bg-muted/50 p-3 border border-border/30"
            >
              <p class="font-semibold mb-1">{{ t('news.crisis_context') }}</p>

              <p class="flex items-center gap-2">
                <strong class="inline-block w-24">{{ t('crisis.severity') }}:</strong>
                <span
                  :class="{
                    'text-[var(--crisis-level-green)] font-medium': crisisEventCache[item.crisisEventId]?.severity === 'green',
                    'text-[var(--crisis-level-yellow)]': crisisEventCache[item.crisisEventId]?.severity === 'yellow',
                    'text-[var(--crisis-level-red)]': crisisEventCache[item.crisisEventId]?.severity === 'red'
                  }"
                >
                  {{ crisisEventCache[item.crisisEventId]?.severity }}
                </span>
              </p>
              <p class="flex items-center gap-2">
                <strong class="inline-block w-24">{{ t('crisis.start_time') }}:</strong>
                <span>{{ formatDateFull(crisisEventCache[item.crisisEventId]?.startTime) }}</span>
              </p>
              <p class="flex items-center gap-2">
                <strong class="inline-block w-24">{{ t('crisis.scenario', 'Scenario') }}:</strong>
                <a
                  v-if="crisisEventCache[item.crisisEventId]?.scenarioThemeId &&
                        scenarioThemeCache[crisisEventCache[item.crisisEventId]?.scenarioThemeId]"
                  :href="`http://localhost:5173/info/scenario/${crisisEventCache[item.crisisEventId]?.scenarioThemeId}`"
                  class="text-primary hover:underline"
                  target="_blank"
                >
                  {{
                    scenarioThemeCache[crisisEventCache[item.crisisEventId]?.scenarioThemeId]?.name ||
                    t('crisis.view_scenario')
                  }}
                </a>
                <a
                  v-else
                  :href="`http://localhost:5173/info/scenario/${crisisEventCache[item.crisisEventId]?.scenarioThemeId}`"
                  class="text-primary hover:underline"
                  target="_blank"
                >
                  {{ t('crisis.view_scenario') }}
                </a>
              </p>
            </div>
          </div>
        </li>
      </ul>
      <InfiniteScroll @load-more="loadMoreNews" :loading="loading" :has-more="hasMore" class="py-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { News } from '@/models/News';
import { fetchGeneralNews } from '@/services/api/NewsService';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { formatDateFull } from '@/utils/dateUtils';
import { fetchCrisisEventById } from '@/services/CrisisEventService';
import { fetchScenarioThemeName } from '@/services/api/ScenarioThemeService';
import type { CrisisEventDto } from '@/models/CrisisEvent';

const { t } = useI18n();
const news = ref<News[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(0);
const pageSize = 5;
const crisisEventCache = ref<Record<number, CrisisEventDto | null>>({});
const scenarioThemeCache = ref<Record<number, {id: number, name: string} | null>>({});

// Helper functions to safely handle potentially undefined values
const getSeverity = (eventId: number): string => {
  return crisisEventCache.value[eventId]?.severity || '';
};

const getStartTime = (eventId: number): string => {
  const startTime = crisisEventCache.value[eventId]?.startTime;
  return startTime ? formatDateFull(startTime) : '';
};

const getScenarioThemeId = (eventId: number): number | undefined => {
  return crisisEventCache.value[eventId]?.scenarioThemeId;
};

const hasScenarioTheme = (eventId: number): boolean => {
  const themeId = crisisEventCache.value[eventId]?.scenarioThemeId;
  return !!themeId && !!scenarioThemeCache.value[themeId];
};

const getScenarioThemeName = (eventId: number): string => {
  const themeId = crisisEventCache.value[eventId]?.scenarioThemeId;
  if (!themeId) return t('crisis.view_scenario', 'View Scenario');
  return scenarioThemeCache.value[themeId]?.name || t('crisis.view_scenario', 'View Scenario');
};

const loadScenarioThemeName = async (themeId: number) => {
  if (themeId in scenarioThemeCache.value) return;

  try {
    const data = await fetchScenarioThemeName(themeId);
    scenarioThemeCache.value[themeId] = data;
  } catch (error) {
    console.error('Failed to load scenario theme name:', error);
    scenarioThemeCache.value[themeId] = null;
  }
};

const loadCrisisDetails = async (eventId: number) => {
  if (eventId in crisisEventCache.value) return;

  try {
    const data = await fetchCrisisEventById(eventId);
    crisisEventCache.value[eventId] = data;

    // After loading crisis details, load the scenario theme name if available
    if (data?.scenarioThemeId) {
      await loadScenarioThemeName(data.scenarioThemeId);
    }
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

<style scoped>
/* Any custom styles that can't be handled with Tailwind classes */
@media (max-width: 640px) {
  /* Mobile-specific adjustments */
}
</style>
