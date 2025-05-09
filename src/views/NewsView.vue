<template>
  <div class="h-full w-full flex flex-col">
    <div class="p-6 bg-[var(--default-blue2)]/5 w-full">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold flex items-center">
          <font-awesome-icon :icon="['fas', 'newspaper']" class="mr-3 text-[var(--default-blue2)]" />
          {{ t('news.title', 'News') }}
        </h1>
      </div>
    </div>

    <div class="flex-grow overflow-y-auto p-6 max-h-[80vh] w-full">
      <div class="max-w-6xl mx-auto">
        <ul class="relative my-8 pl-10 list-none border-l-2 border-[var(--default-blue2)]/30">
          <li v-for="item in news" :key="item.id" class="relative mb-10 pl-6">
            <div class="absolute left-[-2.75rem] top-[0.45rem] w-5 h-5 bg-[var(--default-blue2)] rounded-full z-10"></div>
            <div class="ml-6">
              <div class="flex justify-between items-baseline">
                <strong class="text-base text-muted-foreground">{{ formatDateFull(item.publishedAt) }}</strong>
              </div>
              <h3 class="text-xl font-medium mt-2">{{ item.title }}</h3>
              <p class="text-base mt-2">{{ item.content }}</p>

              <!-- Crisis Event Button -->
              <Button
                variant="default"
                size="default"
                class="mt-3 bg-[var(--default-blue2)] hover:bg-[var(--default-blue2)]/90"
                @click="navigateToCrisis(item.crisisEventId)"
              >
                {{ t('news.view_crisis', 'View Crisis') }}: {{ item.crisisEventName }} <ChevronRight class="h-4 w-4 ml-1" />
              </Button>

              <!-- Additional Crisis Info (Contextual) -->
              <div
                v-if="crisisEventCache[item.crisisEventId]"
                class="text-sm text-muted-foreground mt-4 space-y-2 rounded-md bg-[var(--default-blue2)]/5 p-4 border border-[var(--default-blue2)]/20"
              >
                <p class="font-semibold mb-2 text-base">{{ t('news.crisis_context', 'Crisis Context') }}</p>

                <p class="flex items-center gap-3">
                  <strong class="inline-block w-28">{{ t('crisis.severity', 'Severity') }}:</strong>
                  <span
                    :class="{
                      'text-[var(--crisis-level-green)] font-medium': crisisEventCache[item.crisisEventId]?.severity === 'green',
                      'text-[var(--crisis-level-yellow)] font-medium': crisisEventCache[item.crisisEventId]?.severity === 'yellow',
                      'text-[var(--crisis-level-red)] font-medium': crisisEventCache[item.crisisEventId]?.severity === 'red'
                    }"
                  >
                    {{ crisisEventCache[item.crisisEventId]?.severity }}
                  </span>
                </p>
                <p class="flex items-center gap-3">
                  <strong class="inline-block w-28">{{ t('crisis.start_time', 'Start') }}:</strong>
                  <span>{{ formatDateFull(crisisEventCache[item.crisisEventId]?.startTime) }}</span>
                </p>
                <p class="flex items-center gap-3">
                  <strong class="inline-block w-28">{{ t('crisis.scenario', 'Scenario') }}:</strong>
                  <a
                    v-if="crisisEventCache[item.crisisEventId]?.scenarioThemeId &&
                          scenarioThemeCache[crisisEventCache[item.crisisEventId]?.scenarioThemeId]"
                    :href="`http://localhost:5173/info/scenario/${crisisEventCache[item.crisisEventId]?.scenarioThemeId}`"
                    class="text-[var(--default-blue2)] hover:underline"
                    target="_blank"
                  >
                    {{
                      scenarioThemeCache[crisisEventCache[item.crisisEventId]?.scenarioThemeId]?.name ||
                      t('crisis.view_scenario', 'View Scenario')
                    }}
                  </a>
                  <a
                    v-else
                    :href="`http://localhost:5173/info/scenario/${crisisEventCache[item.crisisEventId]?.scenarioThemeId}`"
                    class="text-[var(--default-blue2)] hover:underline"
                    target="_blank"
                  >
                    {{ t('crisis.view_scenario', 'View Scenario') }}
                  </a>
                </p>
              </div>
            </div>
          </li>
        </ul>
        <InfiniteScroll @load-more="loadMoreNews" :loading="loading" :has-more="hasMore" class="py-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { News } from '@/models/News';
import { fetchGeneralNews } from '@/services/api/NewsService';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { formatDateFull } from '@/utils/dateUtils';
import { fetchCrisisEventById } from '@/services/CrisisEventService';
import { fetchScenarioThemeName } from '@/services/api/ScenarioThemeService';
import type { CrisisEventDto } from '@/models/CrisisEvent';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-vue-next';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';

// Register FontAwesome icons
library.add(faNewspaper);

const { t } = useI18n();
const router = useRouter();
const news = ref<News[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(0);
const pageSize = 5;
const crisisEventCache = ref<Record<number, CrisisEventDto | null>>({});
const scenarioThemeCache = ref<Record<number, {id: number, name: string} | null>>({});

const navigateToCrisis = (crisisEventId: number) => {
  router.push(`/crisis-event?id=${crisisEventId}`);
};

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
