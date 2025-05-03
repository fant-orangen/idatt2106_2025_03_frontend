<template>
  <div class="crisis-status cursor-pointer" @click="navigateToCrisisPage()">
    <Card :class="`crisis-status-card w-[100%] md:w-120 ${containerClass}`">
      <CardHeader class="items-center">
        <CardTitle class="flex flex-col items-center justify-center text-center gap-3 text-2xl">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" size="2xl" />
          <div>{{ t('crisis.crisis-status') }}</div>
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col items-center w-full px-4">
        <!-- Loading State -->
        <div v-if="loading" class="main-crisis mb-4 w-full text-center">
          <div class="text-base font-semibold flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            {{ t('crisis.loading', 'Loading crisis events...') }}
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="main-crisis mb-4 w-full text-center">
          <div class="text-base font-semibold text-destructive">{{ error }}</div>
        </div>

        <!-- Main Crisis (Highest Severity) -->
        <div v-else-if="mainCrisis" class="main-crisis mb-4 w-full text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md shadow-sm transition-colors cursor-pointer dark:text-white"
            :style="{
              backgroundColor: `${getSeverityColor(mainCrisis.severity)}20`,
              borderLeft: `4px solid ${getSeverityColor(mainCrisis.severity)}`
            }"
            @click.stop="selectCrisis(mainCrisis)"
          >
            <span class="text-base font-semibold">{{ mainCrisis.name }}</span>
            <span
              class="w-4 h-4 rounded-full flex-shrink-0"
              :style="{ backgroundColor: getSeverityColor(mainCrisis.severity) }"
            ></span>
          </div>
        </div>

        <div v-else class="main-crisis mb-4 w-full text-center">
          <div class="text-base font-semibold">{{ t('crisis.no-crisis') }}</div>
        </div>

        <!-- Other Crisis Events as Links -->
        <div v-if="!loading && !error && otherEvents.length > 0" class="other-events w-full mt-3">
          <div class="text-sm font-medium mb-2 text-center">{{ t('crisis.other_events', 'Other active events') }}</div>
          <div class="flex flex-wrap justify-center gap-3">
            <a
              v-for="event in otherEvents"
              :key="event.id"
              href="#"
              class="text-sm text-primary hover:underline flex items-center gap-1 px-2"
              @click.prevent.stop="selectCrisis(event)"
            >
              <span class="truncate max-w-[120px]">{{ event.name }}</span>
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{ backgroundColor: getSeverityColor(event.severity) }"
              ></span>
            </a>
          </div>

          <div v-if="hasMoreEvents" class="text-xs text-center italic mt-2">
            {{ t('crisis.more_events', { count: crisisEvents.length - maxDisplay }) }}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { CrisisEventPreviewDto } from '@/models/CrisisEvent';
import { fetchAllPreviewCrisisEvents } from '@/services/CrisisEventService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSeverityClass, getSeverityColor } from '@/utils/severityUtils';

/**
 * CrisisLevelOverview component
 *
 * This component displays a summary of active crisis events with their severity levels.
 * It shows up to 4 crisis events and indicates if there are more.
 * The component's background color is determined by the highest severity level.
 *
 * @component
 */

const { t } = useI18n();
const router = useRouter();
const crisisEvents = ref<CrisisEventPreviewDto[]>([]);
const maxDisplay = 4;
const loading = ref(false);
const error = ref<string | null>(null);

/**
 * Fetches all active crisis events
 */
const fetchCrisisEvents = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetchAllPreviewCrisisEvents(0, 4);
    crisisEvents.value = response.content;
  } catch (err) {
    console.error('Failed to fetch crisis events:', err);
    error.value = t('crisis.error_loading_events', 'Failed to load crisis events');
  } finally {
    loading.value = false;
  }
};

/**
 * Returns the other crisis events (excluding the main one)
 */
const otherEvents = computed(() => {
  if (crisisEvents.value.length <= 1) return [];

  const sorted = [...crisisEvents.value].sort((a, b) => {
    const severityRank = { red: 3, yellow: 2, green: 1 };
    return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
  });

  return sorted.slice(1, maxDisplay);
});

/**
 * Returns the crisis with the highest severity level
 */
const mainCrisis = computed(() => {
  const sorted = [...crisisEvents.value].sort((a, b) => {
    const severityRank = { red: 3, yellow: 2, green: 1 };
    return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
  });
  return sorted[0];
});

/**
 * Returns the events to display (limited by maxDisplay)
 */
const displayedEvents = computed(() => crisisEvents.value.slice(0, maxDisplay));

/**
 * Checks if there are more events than we're displaying
 */
const hasMoreEvents = computed(() => crisisEvents.value.length > maxDisplay);

/**
 * Returns the CSS class for the container based on highest severity
 */
const containerClass = computed(() => {
  if (crisisEvents.value.length === 0) return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';

  if (mainCrisis.value) {
    const severity = mainCrisis.value.severity;

    switch (severity) {
      case 'red':
        return 'bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700';
      case 'yellow':
        return 'bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700';
      case 'green':
        return 'bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700';
      default:
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    }
  }

  return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
});

/**
 * Navigates to the crisis event page
 */
const navigateToCrisisPage = () => {
  router.push('/crisis-event');
};

/**
 * Selects a specific crisis and navigates to its page
 */
const selectCrisis = (event: CrisisEventPreviewDto) => {
  router.push({
    path: '/crisis-event',
    query: { id: event.id.toString() }
  });
};

onMounted(fetchCrisisEvents);
</script>

<style scoped>
.crisis-status-card {
  border-radius: 1rem;
  padding: 1rem;
  transition: all 0.2s ease-in-out;
}

.crisis-status {
  transition: transform 0.2s ease;
}

.crisis-status:hover {
  transform: translateY(-2px);
}

.main-crisis > div {
  transition: all 0.2s ease;
}

.main-crisis > div:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.other-events {
  max-width: 100%;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .other-events {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.other-events a {
  position: relative;
}

.other-events a:hover {
  text-decoration: underline;
}

.dark .other-events a {
  color: rgba(255, 255, 255, 0.9);
}
</style>
