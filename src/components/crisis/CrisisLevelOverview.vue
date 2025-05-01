<template>
  <div class="crisis-status">
    <Card :class="`crisis-status-card w-120 ${containerClass}`">
      <CardHeader class="items-center">
        <CardTitle class="flex flex-col items-center justify-center text-center gap-3 text-2xl">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" size="2xl" />
          <div>{{ t('crisis.crisis-status') }}</div>
          <div class="text-base font-semibold">
            {{ t(mainCrisis?.name || 'crisis.no_active_crisis') }}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent class="flex justify-between items-center w-full px-4">
        <template v-for="(event, index) in displayedEvents" :key="event.id">
          <a href="#" @click.prevent="selectCrisis(event)" class="text-sm text-primary hover:underline truncate max-w-[30%]">
            {{ t(event.name) }}
          </a>
        </template>
        <span v-if="hasMoreEvents" class="text-sm text-gray-500 ml-2">...</span>
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

const { t } = useI18n();
const router = useRouter();
const crisisEvents = ref<CrisisEventPreviewDto[]>([]);
const maxDisplay = 3;

const fetchCrisisEvents = async () => {
  try {
    const events = await fetchAllCrisisEvents();
    crisisEvents.value = events.filter(event => event.active !== false);
  } catch (err) {
    console.error('Failed to fetch crisis events:', err);
  }
};

const mainCrisis = computed(() => {
  const sorted = [...crisisEvents.value].sort((a, b) => {
    const severityRank = { red: 3, yellow: 2, green: 1 };
    return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
  });
  return sorted[0];
});

const displayedEvents = computed(() => crisisEvents.value.slice(0, maxDisplay));
const hasMoreEvents = computed(() => crisisEvents.value.length > maxDisplay);

const containerClass = computed(() => {
  if (crisisEvents.value.length === 0) return 'bg-gray-100 dark:bg-gray-800';

  const hasRed = crisisEvents.value.some(e => e.severity === 'red');
  const hasYellow = crisisEvents.value.some(e => e.severity === 'yellow');

  if (hasRed) return 'bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700';
  if (hasYellow) return 'bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700';
  return 'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700';
});

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
}
</style>
