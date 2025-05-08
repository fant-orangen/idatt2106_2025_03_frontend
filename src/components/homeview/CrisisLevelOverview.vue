<template>
  <!-- Compact Banner for No Crisis -->
  <div v-if="!loading && !error && !hasOngoingCrises" class="crisis-status-banner full-width-banner bg-green-50 dark:bg-green-900/20 border-y border-green-200 dark:border-green-800 py-3 mb-4 transition-all duration-200 ease-in-out">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500 dark:text-green-400" />
        <span class="font-medium text-green-700 dark:text-green-300">{{ t('crisis.no-crisis') }}</span>
        <span class="text-sm text-green-600/70 dark:text-green-400/70 hidden sm:inline">{{ t('crisis.all_clear', 'All clear. No active crisis events at this time.') }}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        class="text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800/30"
        @click="navigateToCrisisPage"
      >
        {{ t('crisis.view_all_events', 'View All Events') }}
        <ChevronRight class="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>

  <!-- Full Card for Crisis or Loading States -->
  <div v-else class="crisis-status" :class="{'cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-y-0.5': hasOngoingCrises, 'cursor-default': !hasOngoingCrises}" @click="hasOngoingCrises && navigateToCrisisPage()">
    <Card :class="`w-full max-w-20xl rounded-2xl p-4 transition-all duration-200 ease-in-out ${containerClass}`">
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
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md shadow-sm transition-all duration-200 ease-in-out cursor-pointer dark:text-white hover:scale-[1.03] hover:shadow-md"
            :class="'bg-(--crisis-level-${mainCrisis.severity}) bg-opacity-20'"
            :style="{ borderLeft: `4px solid ${getSeverityColor(mainCrisis.severity)}`}"
            @click.stop="selectCrisis(mainCrisis)"
          >
            <span class="text-base font-semibold">{{ mainCrisis.name }}</span>
            <span
              class="w-4 h-4 rounded-full flex-shrink-0"
              :style="{ backgroundColor: getSeverityColor(mainCrisis.severity) }"
            ></span>
          </div>
        </div>

        <!-- Other Crisis Events as Links -->
        <div v-if="!loading && !error && otherEvents.length > 0" class="other-events w-full mt-3 max-w-full py-2 border-t border-black/10 dark:border-white/10">
          <div class="text-sm font-medium mb-2 text-center">{{ t('crisis.other_events', 'Other active events') }}</div>
          <div class="flex flex-wrap justify-center gap-3">
            <a
              v-for="event in otherEvents"
              :key="event.id"
              href="#"
              class="relative text-sm text-primary hover:underline flex items-center gap-1 px-2 dark:text-white/90"
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
import type { CrisisEventPreviewDto } from '@/models/CrisisEvent.ts';
import {
  fetchAllPreviewCrisisEvents,
  fetchCrisisEventsInRadius
} from '@/services/CrisisEventService.ts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-vue-next';
import { getSeverityClass, getSeverityColor } from '@/utils/severityUtils.ts';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTriangleExclamation, faCheckCircle, faCheck } from '@fortawesome/free-solid-svg-icons';

// Register FontAwesome icons
library.add(faTriangleExclamation, faCheckCircle, faCheck);

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

// Add translation for view all events button
t('crisis.view_all_events', 'View All Events');

/**
 * Fetches all active crisis events
 */
const fetchCrisisEvents = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetchCrisisEventsInRadius(0, 4);
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
 * Checks if there are any ongoing crises
 */
const hasOngoingCrises = computed(() => crisisEvents.value.length > 0)

/**
 * Returns the CSS class for the container based on highest severity
 */
 const containerClass = computed(() => {
  if (crisisEvents.value.length === 0) return 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm';

  if (mainCrisis.value) {
    const severity = mainCrisis.value.severity;

    switch (severity) {
      case 'red':
        return 'bg-white dark:bg-gray-800 border border-[var(--crisis-level-red)]';
      case 'yellow':
        return 'bg-white dark:bg-gray-800 border border-[var(--crisis-level-yellow)]';
      case 'green':
        return 'bg-white dark:bg-gray-800 border border-[var(--crisis-level-green)]';
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
.crisis-status {
  width: 100%;
}

.full-width-banner {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
}
</style>
