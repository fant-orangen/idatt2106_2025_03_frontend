<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center mb-6">
      <h1 class="text-2xl font-bold">{{ t('crisis.title', 'Crisis Events') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Map Area -->
      <Card class="lg:col-span-2">
        <CardHeader class="pb-2">
          <CardTitle>{{ t('crisis.map_view', 'Map View') }}</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <StaticMapWithCircle
            v-if="mapData"
            :lat="mapData.lat"
            :lng="mapData.lng"
            :radius="mapData.radius"
            :color="mapData.color"
            class="h-[400px] w-full"
          />
        </CardContent>
      </Card>

      <!-- Crisis Selection -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle>{{ t('crisis.active_events', 'Active Events') }}</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <ScrollArea className="h-[180px] px-4">
            <div class="space-y-2 py-2">
              <div
                v-for="event in crisisEvents"
                :key="event.id"
                class="flex items-start p-3 rounded-md cursor-pointer transition-colors"
                :class="[
                  selectedCrisis?.id === event.id
                    ? 'bg-muted'
                    : 'hover:bg-muted/50'
                ]"
                @click="handleCrisisSelect(event)"
              >
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="font-medium">{{ event.name }}</h3>
                    <Badge :class="getSeverityClass(event.severity)">
                      {{ event.severity.toUpperCase() }}
                    </Badge>
                  </div>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ formatDateFull(event.startTime) }}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>

    <div v-if="selectedCrisis" class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CrisisDetails :crisis="selectedCrisis" />

      <CrisisEventHistory
        :crisis-id="selectedCrisis.id"
        :key="`history-${selectedCrisis.id}`"
      />

      <NewsOverview
        :crisis-id="selectedCrisis.id"
        :title="t('news.related_news', 'Related News')"
        :page-size="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CrisisEventDto, CrisisEventPreviewDto } from '@/models/CrisisEvent.ts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StaticMapWithCircle from '@/components/map/StaticMapWithCircle.vue';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import CrisisDetails from '@/components/crisis/CrisisDetails.vue';
import CrisisEventHistory from '@/components/crisis/CrisisEventHistory.vue';
import NewsOverview from '../news/NewsOverview.vue';
import { watch } from 'vue';
import {formatDateFull} from '@/utils/dateUtils.ts';
import { getSeverityClass, getSeverityColor } from '@/utils/severityUtils';

import {
  fetchAllCrisisEvents,
  fetchCrisisEventById
} from '@/services/api/CrisisEventService.ts';

/**
 * CrisisEventOverview component
 *
 * This is the main component for displaying crisis events. It includes:
 * - A map view showing the selected crisis event's location
 * - A list of active crisis events that can be selected
 * - Detailed information about the selected crisis
 * - A history of changes made to the crisis event
 * - Related news articles
 *
 * @component
 */

const crisisEvents = ref<CrisisEventPreviewDto[]>([]);
const { t } = useI18n();
const selectedCrisis = ref<CrisisEventDto | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

/**
 * Fetch all crisis events when the component is mounted
 * and select the first one by default
 */
onMounted(async () => {
  try {
    const events = await fetchAllCrisisEvents();
    console.log("events: ", events);
    crisisEvents.value = events;

    if (crisisEvents.value.length > 0 && !selectedCrisis.value) {
      await fetchAndSelectCrisis(crisisEvents.value[0].id);
    }
  } catch (error) {
    console.error('Failed to fetch crisis events:', error);
  }
});

/**
 * Fetches detailed information about a specific crisis event and selects it
 *
 * @param crisisId - The ID of the crisis event to fetch and select
 */
const fetchAndSelectCrisis = async (crisisId: number) => {
  if (!crisisId) return;
  try {
    loading.value = true;
    error.value = null;
    const crisisDetails = await fetchCrisisEventById(crisisId);
    if (crisisDetails) {
      selectedCrisis.value = crisisDetails;
    } else {
      error.value = t('crisis.error_loading_details', 'Failed to load event details');
    }
  } catch (error) {
    error.value = t('crisis.error_loading_details', 'Failed to load event details');
  } finally {
    loading.value = false;
  }
};

/**
 * Computed property that formats map data for the selected crisis
 * Extracts coordinates, radius, and determines color based on severity
 */
const mapData = computed(() => {
  if (!selectedCrisis.value) {
    return null;
  }
  const lat = selectedCrisis.value.epicenterLatitude;
  const lng = selectedCrisis.value.epicenterLongitude;
  return {
    lat: lat,
    lng: lng,
    radius: selectedCrisis.value.radius || 1000,
    color: getSeverityColor(selectedCrisis.value.severity)
  };
});

/**
 * Watch for changes to map data for debugging purposes
 */
watch(mapData, (newVal) => {
  console.log('mapData updated:', newVal);
});

/**
 * Handles selection of a crisis event from the list
 *
 * @param event - The crisis event that was selected
 */
const handleCrisisSelect = (event: CrisisEventDto) => {
  fetchAndSelectCrisis(event.id);
};
</script>
