<template>
  <div class="crisis-status cursor-pointer" @click="navigateToCrisisPage()">
    <Card :class="`crisis-status-card w-120 ${containerClass}`">
      <CardHeader class="items-center">
        <CardTitle class="flex flex-col items-center justify-center text-center gap-3 text-2xl">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" size="2xl" />
          <div>{{ t('crisis.crisis-status') }}</div>
          <div class="text-base font-semibold">
            {{ mainCrisis?.name || t('crisis.no-crisis') }}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent class="flex justify-between items-center w-full px-4">
        <div class="flex flex-wrap gap-4 w-full justify-center">
          <div
            v-for="event in displayedEvents"
            :key="event.id"
            class="flex items-center gap-2 px-3 py-1 rounded-full bg-opacity-10 hover:bg-opacity-20 transition-colors"
            :class="getSeverityBgClass(event.severity)"
            @click.stop="selectCrisis(event)"
          >
            <span class="text-sm font-medium">{{ event.name }}</span>
            <span
              class="w-3 h-3 rounded-full flex-shrink-0"
              :class="getSeverityClass(event.severity)"
            ></span>
          </div>
          <span v-if="hasMoreEvents" class="text-sm text-gray-500 self-center">
            {{ t('crisis.more_events', '+ {count} more', { count: crisisEvents.length - maxDisplay }) }}
          </span>
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
import { fetchAllCrisisEvents } from '@/services/api/CrisisEventService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

/**
 * Fetches all active crisis events
 */
const fetchCrisisEvents = async () => {
  try {
    const events = await fetchAllCrisisEvents();
    crisisEvents.value = events.filter(event => event.active !== false);
  } catch (err) {
    console.error('Failed to fetch crisis events:', err);
  }
};

/**
 * Returns the CSS class for a severity level dot
 */
const getSeverityClass = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'green': return 'bg-green-500';
    case 'yellow': return 'bg-yellow-500';
    case 'red': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

/**
 * Returns the CSS background class for a severity level button
 */
const getSeverityBgClass = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'green': return 'bg-green-500 bg-opacity-10 hover:bg-green-500 hover:bg-opacity-20';
    case 'yellow': return 'bg-yellow-500 bg-opacity-10 hover:bg-yellow-500 hover:bg-opacity-20';
    case 'red': return 'bg-red-500 bg-opacity-10 hover:bg-red-500 hover:bg-opacity-20';
    default: return 'bg-gray-500 bg-opacity-10 hover:bg-gray-500 hover:bg-opacity-20';
  }
};

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
  if (crisisEvents.value.length === 0) return 'bg-gray-100 dark:bg-gray-800';

  const hasRed = crisisEvents.value.some(e => e.severity === 'red');
  const hasYellow = crisisEvents.value.some(e => e.severity === 'yellow');

  if (hasRed) return 'bg-red-100 dark:bg-red-900 dark:bg-opacity-20 border border-red-300 dark:border-red-700';
  if (hasYellow) return 'bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-20 border border-yellow-300 dark:border-yellow-700';
  return 'bg-green-100 dark:bg-green-900 dark:bg-opacity-20 border border-green-300 dark:border-green-700';
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

// Fetch crisis events when component is mounted
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
</style>
