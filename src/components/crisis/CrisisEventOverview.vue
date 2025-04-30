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
                    {{ formatDate(event.start_time) }}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>

    <!-- Crisis Details Section -->
    <div v-if="selectedCrisis" class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Crisis Information -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle>{{ t('crisis.details', 'Crisis Details') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="crisisDetails" class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              {{ crisisDetails.name }}
              <Badge :class="crisisDetails.severityClass">
                {{ crisisDetails.severity.toUpperCase() }}
              </Badge>
            </h3>

            <p v-if="crisisDetails.description" class="mt-2 text-muted-foreground">
              {{ crisisDetails.description }}
            </p>

            <div class="mt-4 space-y-3">
              <div class="grid grid-cols-3 text-sm">
                <span class="font-semibold">{{ t('crisis.coordinates', 'Coordinates') }}</span>
                <span class="col-span-2">
                  {{ crisisDetails.epicenter_latitude.toFixed(4) }},
                  {{ crisisDetails.epicenter_longitude.toFixed(4) }}
                </span>
              </div>

              <div class="grid grid-cols-3 text-sm">
                <span class="font-semibold">{{ t('crisis.radius', 'Radius') }}</span>
                <span class="col-span-2">
                  {{ crisisDetails.radius ? `${crisisDetails.radius}m` : 'N/A' }}
                </span>
              </div>

              <div class="grid grid-cols-3 text-sm">
                <span class="font-semibold">{{ t('crisis.started', 'Started') }}</span>
                <span class="col-span-2">{{ crisisDetails.formattedStartTime }}</span>
              </div>

              <div class="grid grid-cols-3 text-sm">
                <span class="font-semibold">{{ t('crisis.updated', 'Updated') }}</span>
                <span class="col-span-2">{{ crisisDetails.formattedUpdateTime }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Crisis Status History -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle>{{ t('crisis.status_history', 'Event History') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex justify-center items-center py-6">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>

          <div v-else-if="error" class="text-center py-4 text-red-500">
            {{ error }}
          </div>

          <div v-else-if="!selectedCrisis" class="text-center py-4 text-muted-foreground">
            {{ t('crisis.select_event_for_history', 'Select a crisis event to view its history') }}
          </div>

          <div v-else-if="changes.length === 0" class="text-center py-4 text-muted-foreground">
            {{ t('crisis.no_changes', 'No history found for this event') }}
          </div>

          <ScrollArea v-else className="h-[300px]">
            <div class="relative pl-6 border-l border-muted space-y-4 py-2">
              <div
                v-for="change in sortedChanges"
                :key="change.id"
                class="relative"
              >
                <!-- Timeline dot -->
                <div class="absolute w-3 h-3 rounded-full bg-primary -left-7 top-2"></div>

                <div class="mb-1 flex items-center justify-between">
                  <Badge :class="getChangeTypeClass(change.change_type)">
                    {{ getChangeTypeName(change.change_type) }}
                  </Badge>
                  <time class="text-xs text-muted-foreground">
                    {{ formatDate(change.created_at) }}
                  </time>
                </div>

                <p class="text-sm mb-1">{{ getChangeDescription(change) }}</p>

                <div v-if="change.change_type === 'description_update'" class="mt-2 space-y-2">
                  <div v-if="change.old_value" class="text-xs bg-muted p-2 rounded">
                    <div class="font-semibold text-muted-foreground">{{ t('crisis.previous', 'Previous') }}:</div>
                    <div>{{ change.old_value }}</div>
                  </div>
                  <div v-if="change.new_value" class="text-xs bg-muted p-2 rounded">
                    <div class="font-semibold text-muted-foreground">{{ t('crisis.new', 'New') }}:</div>
                    <div>{{ change.new_value }}</div>
                  </div>
                </div>

                <div class="text-xs text-muted-foreground mt-1">
                  {{ t('crisis.by_user', 'By {user}', { user: change.user_name }) }}
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <!-- Related News -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle>{{ t('crisis.related_news', 'Related News') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loadingNews" class="flex justify-center items-center py-6">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>

          <div v-else-if="relatedNews.length === 0" class="text-center py-4 text-muted-foreground">
            {{ t('crisis.no_related_news', 'No related news found for this event') }}
          </div>

          <ScrollArea v-else className="h-[300px]">
            <ul class="timeline">
              <li v-for="news in relatedNews" :key="news.id">
                <div class="dot"></div>
                <div class="timeline-content">
                  <div class="flex justify-between items-baseline">
                    <strong class="text-sm text-muted-foreground">{{ formatDate(news.published_at) }}</strong>
                  </div>
                  <h3 class="font-medium mt-1">{{ news.title }}</h3>
                  <p class="text-sm mt-1">{{ news.content }}</p>
                </div>
              </li>
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CrisisEventDto, CrisisEventChange } from '@/models/CrisisEventDto.ts';
import type { News } from '@/models/News';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StaticMapWithCircle from '@/components/map/StaticMapWithCircle.vue';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchAllCrisisEvents } from '@/services/api/CrisisEventService.ts'

// Mock data for crisis events - would come from API in real implementation
const crisisEvents = ref<CrisisEventDto[]>([])

onMounted(async () => {
  try {
    const events = await fetchAllCrisisEvents()
    crisisEvents.value = events
  } catch (error) {
    console.error('Failed to fetch crisis events:', error)
  }
})

// Mock data for news - would come from API in real implementation
const allNews = ref<News[]>([
  {
    id: 1,
    title: 'Flood Warning Issued for Downtown',
    content: 'Local authorities have issued a flood warning for the downtown area due to heavy rainfall expected in the next 24 hours.',
    published_at: '2023-10-15T15:00:00',
    created_by_user_id: 1,
    created_at: '2023-10-15T15:00:00',
    updated_at: '2023-10-15T15:00:00'
  },
  {
    id: 2,
    title: 'Evacuation Routes Announced',
    content: 'Authorities have announced evacuation routes for residents in flood-prone areas. Please follow the designated routes if evacuation is necessary.',
    published_at: '2023-10-15T16:30:00',
    created_by_user_id: 1,
    created_at: '2023-10-15T16:30:00',
    updated_at: '2023-10-15T16:30:00'
  },
  {
    id: 3,
    title: 'Fire Department on High Alert',
    content: 'The local fire department is on high alert due to the forest fire in the northern region. Additional resources have been deployed.',
    published_at: '2023-10-16T09:00:00',
    created_by_user_id: 2,
    created_at: '2023-10-16T09:00:00',
    updated_at: '2023-10-16T09:00:00'
  }
]);

// Map news to crisis events (in a real implementation, this would be handled by the API)
const crisisNewsMap = {
  1: [1, 2], // Crisis ID 1 (Flood) is related to news IDs 1 and 2
  2: [3]     // Crisis ID 2 (Fire) is related to news ID 3
};

const { t } = useI18n();
const selectedCrisis = ref<CrisisEventDto | null>(null);
const changes = ref<CrisisEventChange[]>([]);
const loading = ref(false);
const loadingNews = ref(false);
const error = ref<string | null>(null);

// Get severity style class
const getSeverityClass = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'green': return 'bg-green-500 text-white';
    case 'yellow': return 'bg-yellow-500 text-black';
    case 'red': return 'bg-red-500 text-white';
    default: return 'bg-green-500 text-white';
  }
};

// Get severity color for map
const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'green': return '#10b981';
    case 'yellow': return '#f59e0b';
    case 'red': return '#ef4444';
    default: return '#10b981';
  }
};

// Format date for display
const formatDate = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleString();
};

// Computed properties for selected crisis
const crisisDetails = computed(() => {
  if (!selectedCrisis.value) return null;

  return {
    ...selectedCrisis.value,
    formattedStartTime: formatDate(selectedCrisis.value.start_time),
    formattedUpdateTime: formatDate(selectedCrisis.value.updated_at),
    severityClass: getSeverityClass(selectedCrisis.value.severity),
    color: getSeverityColor(selectedCrisis.value.severity)
  };
});

// Prepare map data for StaticMapWithCircle component
const mapData = computed(() => {
  if (!selectedCrisis.value) {
    return null;
  }

  return {
    lat: selectedCrisis.value.epicenter_latitude,
    lng: selectedCrisis.value.epicenter_longitude,
    radius: selectedCrisis.value.radius || 1000,
    color: getSeverityColor(selectedCrisis.value.severity)
  };
});

// Get related news for the selected crisis
const relatedNews = computed(() => {
  if (!selectedCrisis.value) return [];

  const newsIds = crisisNewsMap[selectedCrisis.value.id as keyof typeof crisisNewsMap] || [];
  return allNews.value.filter(news => newsIds.includes(news.id));
});

// Select first crisis by default if available
if (crisisEvents.value.length > 0 && !selectedCrisis.value) {
  selectedCrisis.value = crisisEvents.value[0];
}

// Handle crisis selection
const handleCrisisSelect = (event: CrisisEventDto) => {
  selectedCrisis.value = event;
};

// Get change type badge class
const getChangeTypeClass = (changeType: string): string => {
  switch (changeType) {
    case 'creation': return 'bg-green-500 text-white';
    case 'level_change': return 'bg-yellow-500 text-black';
    case 'description_update': return 'bg-blue-500 text-white';
    case 'epicenter_moved': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

// Get human-readable change type
const getChangeTypeName = (changeType: string): string => {
  return t(`crisis.change_types.${changeType}`, {
    'creation': 'Created',
    'level_change': 'Severity Changed',
    'description_update': 'Description Updated',
    'epicenter_moved': 'Location Changed'
  }[changeType] || changeType);
};

// Format change description based on type
const getChangeDescription = (change: CrisisEventChange): string => {
  switch (change.change_type) {
    case 'creation':
      return t('crisis.changes.created', 'Event was created');
    case 'level_change':
      return t('crisis.changes.level_changed', 'Severity changed from {old} to {new}', {
        old: change.old_value || '?',
        new: change.new_value || '?'
      });
    case 'description_update':
      return t('crisis.changes.description_updated', 'Description updated');
    case 'epicenter_moved':
      return t('crisis.changes.location_changed', 'Location coordinates updated');
    default:
      return t('crisis.changes.unknown', 'Unknown change');
  }
};

// Sort changes by date (newest first)
const sortedChanges = computed(() => {
  return [...changes.value].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
});

// Fetch changes for the crisis
const fetchChanges = async (crisisId: number) => {
  if (!crisisId) return;

  loading.value = true;
  error.value = null;

  try {
    // Replace with your actual API call
    // const response = await fetch(`/api/crisis-events/${crisisId}/changes`);
    // const data = await response.json();
    // changes.value = data;

    // Mock data for development
    changes.value = [
      {
        id: 1,
        crisis_event_id: crisisId,
        change_type: 'creation',
        old_value: null,
        new_value: 'Flood Warning',
        created_by_user_id: 1,
        created_at: '2023-10-15T14:30:00',
        updated_at: '2023-10-15T14:30:00',
        user_name: 'John Admin'
      },
      {
        id: 2,
        crisis_event_id: crisisId,
        change_type: 'description_update',
        old_value: 'Initial flooding reported',
        new_value: 'Flooding expected in downtown area',
        created_by_user_id: 1,
        created_at: '2023-10-15T15:45:00',
        updated_at: '2023-10-15T15:45:00',
        user_name: 'John Admin'
      },
      {
        id: 3,
        crisis_event_id: crisisId,
        change_type: 'level_change',
        old_value: 'green',
        new_value: 'yellow',
        created_by_user_id: 2,
        created_at: '2023-10-15T16:30:00',
        updated_at: '2023-10-15T16:30:00',
        user_name: 'Sarah Operator'
      },
      {
        id: 4,
        crisis_event_id: crisisId,
        change_type: 'epicenter_moved',
        old_value: '60.3900,5.3200',
        new_value: '60.3913,5.3221',
        created_by_user_id: 2,
        created_at: '2023-10-16T09:15:00',
        updated_at: '2023-10-16T09:15:00',
        user_name: 'Sarah Operator'
      }
    ];
  } catch (err) {
    console.error('Failed to fetch crisis event changes:', err);
    error.value = t('crisis.error_loading_changes', 'Failed to load event history');
  } finally {
    loading.value = false;
  }
};

// Watch for crisis ID changes
watch(() => selectedCrisis.value?.id, (newId) => {
  if (newId) {
    fetchChanges(newId);
  } else {
    changes.value = [];
  }
}, { immediate: true });

onMounted(() => {
  if (selectedCrisis.value?.id) {
    fetchChanges(selectedCrisis.value.id);
  }
});
</script>

<style scoped>
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
</style>
