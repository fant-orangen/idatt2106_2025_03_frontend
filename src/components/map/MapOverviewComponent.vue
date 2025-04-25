<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import MapComponent from '@/components/map/MapComponent.vue';
import {
  fetchPublicPois,
  fetchPoisByType,
  fetchPoisNearby,
  fetchNearestPoiByType
} from '@/services/api/PoiService';
import type { PoiData } from '@/models/PoiData';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type CrisisEvent = { latitude: number; longitude: number; level: 1 | 2 | 3 };

const { t } = useI18n();

// Dummy crisis data for testing
const dummyCrises: CrisisEvent[] = [
  { latitude: 63.4305, longitude: 10.3951, level: 3 },
  { latitude: 63.4419, longitude: 10.4254, level: 1 }
];

// Reactive state
const allPois = ref<PoiData[]>([]);
const pointsOfInterest = ref<PoiData[]>([]);
const isLoadingPois = ref(false);
const poiError = ref<string | null>(null);

// Filter state
const userLocation = ref<{ latitude: number; longitude: number } | null>(null);
const selectedPoiType = ref<number | null>(null);
const distanceInMeters = ref(1000);
const isFilterApplied = ref(false);
const locationStatus = ref<string | null>(null);
const isFilterMenuVisible = ref(false);

// Derive POI types
const poiTypes = computed(() => {
  const types = new Map<number, string>();
  allPois.value.forEach(poi => {
    if (!types.has(poi.poiTypeId)) {
      types.set(poi.poiTypeId, poi.poiTypeName);
    }
  });
  return Array.from(types.entries()).map(([id, name]) => ({ id, name }));
});

// Geolocation helper
async function getUserLocation() {
  if (!navigator.geolocation) {
    locationStatus.value = t('map.location-error');
    return;
  }
  try {
    locationStatus.value = t('map.getting-location');
    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      })
    );
    userLocation.value = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    };
    // Ensure UI updates with success message
    setTimeout(() => {
      locationStatus.value = t('map.location-success');
    }, 100);
  } catch (error) {
    console.error('Geolocation error:', error);
    locationStatus.value = t('map.location-error');
  }
}

// Reset filters to show all POIs
function resetFilters() {
  selectedPoiType.value = null;
  distanceInMeters.value = 1000;
  isFilterApplied.value = false;
  poiError.value = null;
  pointsOfInterest.value = [...allPois.value];
}

// Apply filtering
async function applyFilters() {
  poiError.value = null;
  // If no type selected and distance <= 0, reset
  if (!selectedPoiType.value && distanceInMeters.value <= 0) {
    resetFilters();
    return;
  }

  isLoadingPois.value = true;
  try {
    if (userLocation.value && distanceInMeters.value > 0) {
      pointsOfInterest.value = await fetchPoisNearby(
        userLocation.value.latitude,
        userLocation.value.longitude,
        distanceInMeters.value,
        selectedPoiType.value || undefined
      );
    } else if (selectedPoiType.value) {
      pointsOfInterest.value = await fetchPoisByType(selectedPoiType.value);
    } else {
      pointsOfInterest.value = [...allPois.value];
    }
    isFilterApplied.value = true;
  } catch {
    poiError.value = t('map.filter-error');
  } finally {
    isLoadingPois.value = false;
  }
}

// Find nearest POI of selected type
async function findNearestPoi() {
  if (!userLocation.value) {
    locationStatus.value = t('map.location-needed');
    await getUserLocation();
    if (!userLocation.value) return;
  }
  if (!selectedPoiType.value) {
    poiError.value = t('map.select-type');
    return;
  }
  isLoadingPois.value = true;
  poiError.value = null;
  try {
    const nearest = await fetchNearestPoiByType(
      selectedPoiType.value,
      userLocation.value.latitude,
      userLocation.value.longitude
    );
    if (nearest) {
      pointsOfInterest.value = [nearest];
      isFilterApplied.value = true;
    } else {
      poiError.value = t('map.no-poi-found', { type: poiTypes.value.find(p => p.id === selectedPoiType.value)?.name });
    }
  } catch {
    poiError.value = t('map.find-error');
  } finally {
    isLoadingPois.value = false;
  }
}

// Find nearest shelter
async function findNearestShelter() {
  if (!userLocation.value) {
    locationStatus.value = t('map.location-needed');
    await getUserLocation();
    if (!userLocation.value) return;
  }
  isLoadingPois.value = true;
  poiError.value = null;
  try {
    const shelterTypeId = poiTypes.value.find(type =>
      type.name.toLowerCase().includes('shelter') ||
      type.name.toLowerCase().includes('tilfluktsrom')
    )?.id;
    if (!shelterTypeId) {
      poiError.value = t('map.no-shelter-type');
      return;
    }
    const nearest = await fetchNearestPoiByType(
      shelterTypeId,
      userLocation.value.latitude,
      userLocation.value.longitude
    );
    if (nearest) {
      pointsOfInterest.value = [nearest];
      isFilterApplied.value = true;
    } else {
      poiError.value = t('map.no-shelter-found');
    }
  } catch {
    poiError.value = t('map.find-error');
  } finally {
    isLoadingPois.value = false;
  }
}

// Validate distance input
watch(distanceInMeters, (newValue) => {
  if (newValue < 100) {
    distanceInMeters.value = 100;
  } else if (newValue > 5000000) {
    distanceInMeters.value = 5000000;
  }
});

// Initial load of POIs
onMounted(async () => {
  isLoadingPois.value = true;
  poiError.value = null;
  try {
    const pois = await fetchPublicPois();
    allPois.value = pois;
    pointsOfInterest.value = pois;
  } catch {
    poiError.value = t('map.load-error');
  } finally {
    isLoadingPois.value = false;
  }
});
</script>

<template>
  <!-- Toggle Buttons -->
  <div class="filter-toggle w-full max-w-7xl flex justify-end gap-4 mb-4 relative z-20">
    <Button @click="findNearestShelter" variant="destructive">
      <font-awesome-icon :icon="['fas', 'house-chimney']" class="mr-2"/>
      {{ t('map.nearest-shelter') }}
    </Button>
    <Button @click="isFilterMenuVisible = !isFilterMenuVisible">
      <font-awesome-icon :icon="['fas', isFilterMenuVisible ? 'chevron-up' : 'chevron-down']" class="mr-2"/>
      {{ isFilterMenuVisible ? t('map.hide-filter') : t('map.show-filter') }}
    </Button>
  </div>

  <!-- Filter Card -->
  <div v-if="isFilterMenuVisible" class="filter-card w-full max-w-7xl mb-8 relative z-20">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('map.filter') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Location -->
          <div>
            <Button @click="getUserLocation" class="w-full">{{ t('map.my-location') }}</Button>
            <p v-if="locationStatus" class="text-sm" :class="{ 'text-red-500': locationStatus === t('map.location-error') }">{{ locationStatus }}</p>
            <p v-if="userLocation" class="text-sm text-green-600">Lat: {{ userLocation.latitude.toFixed(4) }}, Lon: {{ userLocation.longitude.toFixed(4) }}</p>
          </div>
          <!-- Distance -->
          <div>
            <label for="distance" class="text-sm font-medium">{{ t('map.distance') }}</label>
            <Input
              id="distance"
              type="number"
              v-model.number="distanceInMeters"
              :disabled="!userLocation"
              min="100"
              max="10000"
              step="100"
              @input="e => {
                const val = parseInt(e.target.value);
                if (isNaN(val) || val < 100) e.target.value = '100';
                if (val > 5000000) e.target.value = '5000000';
              }"
            />
          </div>
          <!-- POI Type -->
          <div>
            <label for="poi-type" class="text-sm font-medium">{{ t('map.poi-type') }}</label>
            <Select v-model="selectedPoiType">
              <SelectTrigger id="poi-type">
                <SelectValue :placeholder="t('map.all-types')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">{{ t('map.all-types') }}</SelectItem>
                <SelectItem v-for="type in poiTypes" :key="type.id" :value="type.id">{{ type.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex justify-between gap-4 mt-4">
          <div class="flex flex-col gap-1">
            <Button @click="findNearestPoi" :disabled="!userLocation || !selectedPoiType" variant="secondary">
              <font-awesome-icon :icon="['fas', 'location-crosshairs']" class="mr-2"/>
              {{ t('map.find-nearest') }}
            </Button>
            <p v-if="!userLocation" class="text-xs text-muted-foreground">{{ t('map.location-required') }}</p>
          </div>
          <div class="flex gap-4">
            <Button variant="outline" @click="resetFilters">{{ t('map.reset-filter') }}</Button>
            <Button @click="applyFilters">{{ t('map.apply-filter') }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Map -->
  <div class="map-wrapper relative z-0" style="height:50em; min-height:300px; overflow:visible;">
    <div v-if="isLoadingPois" class="flex items-center justify-center h-full">{{ t('map.loading') }}</div>
    <div v-else-if="poiError" class="flex items-center justify-center h-full text-red-600">{{ poiError }}</div>
    <MapComponent
      v-else
      :pois="pointsOfInterest"
      :userLocation="userLocation"
      :crisisEvents="dummyCrises"
    />
  </div>
</template>

<style scoped>
/* Ensure dropdown floats above map */
:deep([role="dialog"]),
:deep(.select-content),
:deep(.SelectContent),
:deep(.select-dropdown),
:deep(.radix-select-content) {
  z-index: 10000 !important;
}

/* Filter UI stacking */
.filter-toggle,
.filter-card {
  position: relative;
  z-index: 20;
}

.map-wrapper {
  position: relative;
  z-index: 0;
  overflow: visible;
}
</style>
