<template>
  <div class="filter-toggle flex justify-end gap-4 mb-4">
    <Button @click="findNearestShelter" variant="destructive">
      <font-awesome-icon :icon="['fas', 'house-chimney']" class="mr-2" />
      {{ t('map.nearest-shelter') }}
    </Button>
    <Button @click="isFilterMenuVisible = !isFilterMenuVisible" class="w-full md:w-auto">
      <font-awesome-icon
        :icon="['fas', isFilterMenuVisible ? 'chevron-up' : 'chevron-down']"
        class="mr-2"
      />
      {{ isFilterMenuVisible ? t('map.hide-filter') : t('map.show-filter') }}
    </Button>
  </div>

  <Card v-if="isFilterMenuVisible" class="mb-8 filter-card relative z-20">
    <CardHeader>
      <CardTitle>{{ t('map.filter') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Grid Layout for Filters -->
      <div class="grid grid-cols-1 gap-4 items-end md:grid-cols-3">
        <div>
          <!-- My Location Button -->
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
        
        <!-- Distance Input -->
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

        <!-- POI Type Selector -->
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

      <!-- Action Buttons -->
      <div class="flex flex-col gap-4 mt-4 md:flex-row md:justify-between">
        <div class="flex flex-col gap-4 md:flex-row">
          <Button variant="outline" class="w-full md:w-auto" @click="resetFilters">
            {{ t('map.reset-filter') }}
          </Button>
          <Button
            variant="secondary"
            class="w-full md:w-auto"
            @click="findNearestPoi"
            :disabled="!userLocation || !selectedPoiType"
          >
            {{ t('map.find-nearest') }}
          </Button>
        </div>
        <Button
          variant="outline"
          class="w-full md:w-auto border-primary text-primary hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/50"
          @click="applyFilters"
        >
          {{ t('map.apply-filter') }}
        </Button>
      </div>
    </CardContent>
  </Card>

  <div class="relative z-0 overflow-visible h-[50em]">
    <div v-if="isLoadingPois || isLoadingCrisisEvents" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">{{ t('map.loading') }}</div>
    <div v-else-if="poiError" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-red-600">
      {{ poiError }}
    </div>
    <MapComponent
      v-else
      :pois="convertedPois"
      :userLocation="userLocation"
      :crisisEvents="crisisEvents"
    />
  </div>
</template>

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
import { fetchActiveCrisisEvents } from '@/services/api/CrisisEventService';
import type { PoiData } from '@/models/PoiData';
import type { POI, UserLocation, CrisisEvent } from '@/types/map';
import { convertPoiData } from '@/types/map';
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

const { t } = useI18n();

// Reactive state
const allPois = ref<PoiData[]>([]);
const pointsOfInterest = ref<PoiData[]>([]);
const isLoadingPois = ref(false);
const poiError = ref<string | null>(null);
const crisisEvents = ref<CrisisEvent[]>([]);
const isLoadingCrisisEvents = ref(false);

// Filter state
const userLocation = ref<UserLocation | null>(null);
const selectedPoiType = ref<number | null>(null);
const distanceInMeters = ref(1000);
const isFilterMenuVisible = ref(false);
const locationStatus = ref<string | null>(null);

// Convert PoiData to POI objects for the MapComponent
const convertedPois = computed<POI[]>(() => {
  return pointsOfInterest.value.map(poi => convertPoiData(poi));
});

// Helper for ensuring numerical coordinates
function ensureNumericCoordinates(poi: PoiData): PoiData {
  // Create a copy to avoid modifying the original
  return {
    ...poi,
    latitude: typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude,
    longitude: typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude
  };
}

// Derive POI types
const poiTypes = computed(() => {
  const types = new Map<number, string>();
  allPois.value.forEach((poi: PoiData) => {
    if (poi.poiTypeId && !types.has(poi.poiTypeId)) {
      types.set(poi.poiTypeId, poi.poiTypeName);
    }
  });
  return Array.from(types.entries()).map(([id, name]: [number, string]) => ({ id, name }));
});

/**
 * Fetches crisis events and processes them for display on the map
 */
async function loadCrisisEvents() {
  isLoadingCrisisEvents.value = true;
  try {
    // Fetch active crisis events
    const events = await fetchActiveCrisisEvents();

    // Debug log for events
    console.log('Crisis events loaded from service:', events);

    // Ensure each event has proper coordinates
    const validEvents = events.filter(event => {
      const hasCoords = event.latitude !== undefined &&
        event.longitude !== undefined &&
        event.level !== undefined;
      if (!hasCoords) {
        console.warn('Invalid crisis event missing coordinates or level:', event);
      }
      return hasCoords;
    });

    // Ensure numeric coordinates (convert strings if needed)
    const processedEvents = validEvents.map(event => ({
      ...event,
      latitude: typeof event.latitude === 'string' ? parseFloat(event.latitude) : event.latitude,
      longitude: typeof event.longitude === 'string' ? parseFloat(event.longitude) : event.longitude,
      level: typeof event.level === 'string' ? parseInt(event.level) : event.level
    }));

    crisisEvents.value = processedEvents;
    console.log(`Loaded ${processedEvents.length} valid crisis events:`, processedEvents);

    // Debug check for MapComponent prop
    setTimeout(() => {
      console.log('Current crisis events in component state:', crisisEvents.value);
    }, 500);
  } catch (error) {
    console.error('Error loading crisis events:', error);
    crisisEvents.value = [];
  } finally {
    isLoadingCrisisEvents.value = false;
  }
}

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

    // Reload crisis events when location changes
    loadCrisisEvents();

    return true;
  } catch (error: unknown) {
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
    // Initialize with empty array
    let fetchedResults: PoiData[] = [];

    // 1) LOCATION-ONLY
    if (hasLocation && !hasType && userLocation.value) {
      fetchedResults = await fetchPoisNearby(
        userLocation.value.latitude,
        userLocation.value.longitude,
        distanceInMeters.value
      );
    }
    // 2) LOCATION + TYPE
    else if (hasLocation && hasType && userLocation.value) {
      // We already know selectedPoiType.value !== null from hasType
      fetchedResults = await fetchPoisNearby(
        userLocation.value.latitude,
        userLocation.value.longitude,
        distanceInMeters.value,
        selectedPoiType.value!
      );
    }
    // 3) TYPE-ONLY
    else if (!hasLocation && hasType) {
      // We already know selectedPoiType.value !== null from hasType
      fetchedResults = await fetchPoisByType(
        selectedPoiType.value!
      );
    }

    // Create a completely new array and trigger reactivity with proper assignment
    pointsOfInterest.value = [];

    // Force reactivity by briefly setting to empty then to results
    setTimeout(() => {
      pointsOfInterest.value = Array.isArray(fetchedResults) ? [...fetchedResults] : [];

      if (fetchedResults.length === 0) {
        console.log("No POIs found matching the criteria");
      } else {
        console.log(`Found ${fetchedResults.length} POIs matching the criteria`);
      }
    }, 10);

  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  if (!userLocation.value || selectedPoiType.value === null) return;

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
  } catch (error: unknown) {
    console.error('Error finding nearest POI:', error);
    poiError.value = t('map.find-error');
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

watch(distanceInMeters, (val: number) => {
  if (val < 100) distanceInMeters.value = 100;
  else if (val > 5000000) distanceInMeters.value = 5000000;
});

// Load all POIs on mount
onMounted(async () => {
  console.log("Map overview component mounted");
  isLoadingPois.value = true;
  poiError.value = null;

  try {
    // Load POIs
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

    // Load crisis events
    await loadCrisisEvents();

  } catch (error: unknown) {
    console.error('Error loading POIs:', error);
    poiError.value = t('map.load-error');
    allPois.value = [];
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
});
</script>
