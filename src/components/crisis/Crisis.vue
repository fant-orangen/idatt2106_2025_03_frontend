<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CrisisEventDto } from '@/models/CrisisEventDto.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StaticMapWithCircle from '@/components/map/StaticMapWithCircle.vue';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Mock data for now - would come from API in real implementation
const crisisEvents = ref<CrisisEventDto[]>([
  {
    id: 1,
    name: 'Flood Warning',
    description: 'Flooding expected in downtown area',
    severity: 'yellow',
    epicenter_latitude: 60.3913,
    epicenter_longitude: 5.3221, // Bergen coordinates
    radius: 1000000,
    start_time: '2023-10-15T14:30:00',
    updated_at: '2023-10-15T16:45:00',
    active: true
  },
  {
    id: 2,
    name: 'Fire Hazard',
    description: 'Forest fire in northern region',
    severity: 'red',
    epicenter_latitude: 60.4200,
    epicenter_longitude: 5.3700,
    radius: 2500,
    start_time: '2023-10-16T08:15:00',
    updated_at: '2023-10-16T10:20:00',
    active: true
  }
]);

const { t } = useI18n();
const selectedCrisis = ref<CrisisEventDto | null>(null);

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
const formatDate = (dateString: string): string => {
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

// Select first crisis by default if available
if (crisisEvents.value.length > 0 && !selectedCrisis.value) {
  selectedCrisis.value = crisisEvents.value[0];
}

// Handle crisis selection
const handleCrisisSelect = (event: CrisisEventDto) => {
  selectedCrisis.value = event;
};
</script>

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

      <!-- Crisis Details -->
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

          <Separator class="my-4 mx-4" />

          <div v-if="crisisDetails" class="px-4 pb-4 pt-2">
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

          <div v-else class="px-4 pb-4 text-center text-muted-foreground">
            {{ t('crisis.select_event', 'Select a crisis event to view details') }}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
