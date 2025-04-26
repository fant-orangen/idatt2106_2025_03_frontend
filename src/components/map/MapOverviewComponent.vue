<template>
  <div class="filter-toggle flex justify-end gap-4 mb-4">
    <Button @click="findNearestShelter" variant="destructive">
      <font-awesome-icon :icon="['fas', 'house-chimney']" class="mr-2" />
      {{ t('map.nearest-shelter') }}
    </Button>
    <Button @click="isFilterMenuVisible = !isFilterMenuVisible">
      <font-awesome-icon
        :icon="['fas', isFilterMenuVisible ? 'chevron-up' : 'chevron-down']"
        class="mr-2"
      />
      {{ isFilterMenuVisible ? t('map.hide-filter') : t('map.show-filter') }}
    </Button>
  </div>

  <Card v-if="isFilterMenuVisible" class="mb-8 filter-card">
    <CardHeader>
      <CardTitle>{{ t('map.filter') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Button @click="getUserLocation" class="w-full">
            {{ t('map.my-location') }}
          </Button>
          <p
            v-if="locationStatus"
            class="text-sm mt-1"
            :class="{ 'text-red-500': locationStatus === t('map.location-error') }"
          >
            {{ locationStatus }}
          </p>
          <p v-if="userLocation" class="text-sm text-green-600 mt-1">
            Lat: {{ userLocation.latitude.toFixed(4) }}, Lon: {{ userLocation.longitude.toFixed(4) }}
          </p>
        </div>

        <div>
          <label for="distance" class="text-sm font-medium block mb-1">
            {{ t('map.distance') }}
          </label>
          <Input
            id="distance"
            type="number"
            v-model.number="distanceInMeters"
            :disabled="!userLocation"
            min="100"
            max="5000000"
            step="100"
            class="w-full"
          />
        </div>

        <div>
          <label for="poi-type" class="text-sm font-medium block mb-1">
            {{ t('map.poi-type') }}
          </label>
          <Select v-model="selectedPoiType" class="w-full">
            <SelectTrigger id="poi-type" class="w-full">
              <SelectValue :placeholder="t('map.all-types')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null">{{ t('map.all-types') }}</SelectItem>
              <SelectItem
                v-for="type in poiTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex justify-between items-center gap-4 mt-4">
        <div class="flex gap-4">
          <Button variant="outline" @click="resetFilters">
            {{ t('map.reset-filter') }}
          </Button>
          <Button
            variant="secondary"
            @click="findNearestPoi"
            :disabled="!userLocation || !selectedPoiType"
          >
            {{ t('map.find-nearest') }}
          </Button>
        </div>
        <Button
          variant="outline"
          class="border-primary text-primary hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/50"
          @click="applyFilters"
        >
          {{ t('map.apply-filter') }}
        </Button>
      </div>
    </CardContent>
  </Card>

  <div class="map-wrapper relative z-0 h-[50em]">
    <div v-if="isLoadingPois" class="overlay">{{ t('map.loading') }}</div>
    <div v-else-if="poiError" class="overlay text-red-600">
      {{ poiError }}
    </div>
    <MapComponent
      v-else
      :pois="pointsOfInterest"
      :userLocation="userLocation"
      :crisisEvents="dummyCrises"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
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

// Reactive state
const allPois = ref<PoiData[]>([]);
const pointsOfInterest = ref<PoiData[]>([]);
const isLoadingPois = ref(false);
const poiError = ref<string | null>(null);
const dummyCrises = ref<CrisisEvent[]>([]);

// Filter state
const userLocation = ref<{ latitude: number; longitude: number } | null>(null);
const selectedPoiType = ref<number | null>(null);
const distanceInMeters = ref(1000);
const isFilterMenuVisible = ref(false);
const locationStatus = ref<string | null>(null);

// Helper for ensuring numerical coordinates
function ensureNumericCoordinates(poi: PoiData): PoiData {
  return {
    ...poi,
    latitude: typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude,
    longitude: typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude
  };
}

// Derive POI types
const poiTypes = computed(() => {
  const types = new Map<number, string>();
  allPois.value.forEach((poi) => {
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
    return false;
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
    locationStatus.value = t('map.location-success');
    return true;
  } catch {
    locationStatus.value = t('map.location-error');
    return false;
  }
}

// Reset filters
function resetFilters() {
  console.log("Resetting filters");
  selectedPoiType.value = null;
  distanceInMeters.value = 1000;
  poiError.value = null;
  locationStatus.value = null;

  // Force reactivity by clearing and then setting with delay
  pointsOfInterest.value = [];
  setTimeout(() => {
    pointsOfInterest.value = [...allPois.value];
    console.log("Filters reset, showing all POIs:", pointsOfInterest.value.length);
  }, 10);
}

// Apply filtering
async function applyFilters() {
  console.log("Applying filters");
  poiError.value = null;

  const hasType = selectedPoiType.value !== null;
  const hasLocation = userLocation.value !== null && distanceInMeters.value > 0;

  // If neither a type nor a valid location+distance, reset to show all.
  if (!hasType && !hasLocation) {
    resetFilters();
    return;
  }

  isLoadingPois.value = true;
  try {
    let results = [];

    // 1) LOCATION-ONLY
    if (hasLocation && !hasType) {
      results = await fetchPoisNearby(
        userLocation.value.latitude,
        userLocation.value.longitude,
        distanceInMeters.value
      );
    }
    // 2) LOCATION + TYPE
    else if (hasLocation && hasType) {
      results = await fetchPoisNearby(
        userLocation.value.latitude,
        userLocation.value.longitude,
        distanceInMeters.value,
        selectedPoiType.value
      );
    }
    // 3) TYPE-ONLY
    else if (!hasLocation && hasType) {
      results = await fetchPoisByType(
        selectedPoiType.value
      );
    }

    // Create a completely new array and trigger reactivity with proper assignment
    pointsOfInterest.value = [];

    // Force reactivity by briefly setting to empty then to results
    setTimeout(() => {
      pointsOfInterest.value = Array.isArray(results) ? [...results] : [];

      if (results.length === 0) {
        console.log("No POIs found matching the criteria");
      } else {
        console.log(`Found ${results.length} POIs matching the criteria`);
      }
    }, 10);

  } catch (error) {
    console.error('Error applying filters:', error);
    poiError.value = t('map.filter-error');
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

// Find nearest shelter
async function findNearestShelter() {
  console.log("Finding nearest shelter");

  // Make sure we have user location
  if (!userLocation.value) {
    locationStatus.value = t('map.location-needed');
    const success = await getUserLocation();
    if (!success || !userLocation.value) return;
  }

  isLoadingPois.value = true;
  poiError.value = null;

  try {
    const shelterTypeId = poiTypes.value.find((type) =>
      /shelter|tilfluktsrom/i.test(type.name)
    )?.id;

    if (!shelterTypeId) {
      poiError.value = t('map.no-shelter-type');
      isLoadingPois.value = false;
      return;
    }

    const nearest = await fetchNearestPoiByType(
      shelterTypeId,
      userLocation.value.latitude,
      userLocation.value.longitude
    );

    // Force reactivity with proper array construction
    pointsOfInterest.value = [];

    setTimeout(() => {
      if (nearest) {
        // Ensure numeric coordinates
        pointsOfInterest.value = [ensureNumericCoordinates(nearest)];
        console.log("Nearest shelter found:", nearest);
      } else {
        pointsOfInterest.value = [];
        poiError.value = t('map.find-error');
      }
    }, 10);
  } catch (error) {
    console.error('Error finding nearest shelter:', error);
    poiError.value = t('map.find-error');
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

// Find nearest POI of selected type
async function findNearestPoi() {
  console.log("Finding nearest POI");
  if (!userLocation.value || !selectedPoiType.value) return;

  isLoadingPois.value = true;
  poiError.value = null;

  try {
    const nearest = await fetchNearestPoiByType(
      selectedPoiType.value,
      userLocation.value.latitude,
      userLocation.value.longitude
    );

    // Force reactivity with proper array construction
    pointsOfInterest.value = [];

    setTimeout(() => {
      if (nearest) {
        // Ensure numeric coordinates
        pointsOfInterest.value = [ensureNumericCoordinates(nearest)];
        console.log("Nearest POI found:", nearest);
      } else {
        pointsOfInterest.value = [];
        poiError.value = t('map.find-error');
      }
    }, 10);
  } catch (error) {
    console.error('Error finding nearest POI:', error);
    poiError.value = t('map.find-error');
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

watch(distanceInMeters, (val) => {
  if (val < 100) distanceInMeters.value = 100;
  else if (val > 5000000) distanceInMeters.value = 5000000;
});

// Load all POIs on mount
onMounted(async () => {
  console.log("Map overview component mounted");
  isLoadingPois.value = true;
  poiError.value = null;

  try {
    const pois = await fetchPublicPois();

    // First set allPois
    allPois.value = [...pois];

    // Clear pointsOfInterest first
    pointsOfInterest.value = [];

    // Then set pointsOfInterest with a small delay
    setTimeout(() => {
      pointsOfInterest.value = [...pois];
      console.log("Initial POIs loaded:", pointsOfInterest.value.length);
    }, 10);
  } catch (error) {
    console.error('Error loading POIs:', error);
    poiError.value = t('map.load-error');
    allPois.value = [];
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
});
</script>
<style scoped>
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
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}
</style>
