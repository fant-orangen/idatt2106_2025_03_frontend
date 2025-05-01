<template>
  <div class="filter-toggle flex justify-end gap-4 mb-4 relative z-20">
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

  <Card v-if="isFilterMenuVisible" class="mb-8 filter-card relative z-20">
    <CardHeader>
      <CardTitle>{{ t('map.filter') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Button @click="fetchUserLocation" :disabled="isLoadingLocation" class="w-full">
            {{ isLoadingLocation ? t('map.getting-location') : t('map.my-location') }}
          </Button>
          <p
            v-if="locationStatusMessage"
            class="text-sm mt-1"
            :class="{ 'text-red-500': !!locationError }"
          >
            {{ locationStatusMessage }}
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

  <div class="relative z-0 overflow-visible h-[50em]">
    <div v-if="isLoadingPois || isLoadingCrisisEvents || isLoadingLocation" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">{{ t('map.loading') }}</div>
    <div v-else-if="poiError || locationError" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-red-600">
      {{ poiError || locationError?.message }}
    </div>
    <MapComponent
      :pois="convertedPois"
      :userLocation="userLocation"
      :crisisEvents="crisisEvents"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia'; // Import storeToRefs
import MapComponent from '@/components/map/MapComponent.vue';
import { useGeolocation } from '@/composables/useGeolocation'; // Import the composable
import { useUserStore } from '@/stores/UserStore'; // Import UserStore
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

// --- Pinia Store and Geolocation Composable ---
const userStore = useUserStore();
const { startWatching, stopWatching, getCurrentLocation, coords: locationCoords, error: locationError, isLoading: isLoadingLocation, status: locationStatus } = useGeolocation();
const { profile } = storeToRefs(userStore);

// Use storeToRefs to keep reactivity for store state
const { currentUserLocation } = storeToRefs(userStore);
// Alias store location to userLocation for clarity in this component
const userLocation = currentUserLocation;

// --- Local Reactive State ---
const allPois = ref<PoiData[]>([]);
const pointsOfInterest = ref<PoiData[]>([]);
const isLoadingPois = ref(false);
const poiError = ref<string | null>(null);
const crisisEvents = ref<CrisisEvent[]>([]);
const isLoadingCrisisEvents = ref(false);

// Filter state
const selectedPoiType = ref<number | null>(null);
const distanceInMeters = ref(1000);
const isFilterMenuVisible = ref(false);

// --- Computed Properties ---

// Convert PoiData to POI objects for the MapComponent
const convertedPois = computed<POI[]>(() => {
  return pointsOfInterest.value.map(poi => convertPoiData(poi));
});

// Derive POI types from all loaded POIs
const poiTypes = computed(() => {
  const types = new Map<number, string>();
  allPois.value.forEach((poi: PoiData) => {
    if (poi.poiTypeId && !types.has(poi.poiTypeId)) {
      types.set(poi.poiTypeId, poi.poiTypeName);
    }
  });
  return Array.from(types.entries()).map(([id, name]: [number, string]) => ({ id, name }));
});

// Computed property for displaying location status/error messages
const locationStatusMessage = computed(() => {
  if (isLoadingLocation.value) return t('map.getting-location');
  if (locationError.value) {
    // Provide more specific messages based on error or status from composable/store
    if (locationStatus.value === 'Permission Denied') return t('map.location-error') + ' (Permission Denied)';
    if (locationStatus.value === 'Disabled by User') return t('map.location-error') + ' (Disabled)';
    return t('map.location-error'); // Generic error
  }
  if (locationStatus.value === 'Success' && userLocation.value) return t('map.location-success');
  if (locationStatus.value === 'Not Supported') return t('map.location-unavailable');
  return null; // No status to show
});




// --- Methods ---

// Helper for ensuring numerical coordinates
function ensureNumericCoordinates(poi: PoiData): PoiData {
  return {
    ...poi,
    latitude: typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude,
    longitude: typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude
  };
}

// Fetches crisis events and processes them for display
async function loadCrisisEvents() {
  isLoadingCrisisEvents.value = true;
  try {
    const events = await fetchActiveCrisisEvents();
    console.log('Crisis events loaded from service:', events);
    const validEvents = events.filter(event =>
      event.latitude !== undefined && event.longitude !== undefined && event.level !== undefined
    );
    const processedEvents = validEvents.map(event => ({
      ...event,
      latitude: typeof event.latitude === 'string' ? parseFloat(event.latitude) : event.latitude,
      longitude: typeof event.longitude === 'string' ? parseFloat(event.longitude) : event.longitude,
      level: typeof event.level === 'string' ? parseInt(event.level) : event.level
    }));
    crisisEvents.value = processedEvents;
    console.log(`Loaded ${processedEvents.length} valid crisis events:`, processedEvents);
  } catch (error) {
    console.error('Error loading crisis events:', error);
    crisisEvents.value = [];
  } finally {
    isLoadingCrisisEvents.value = false;
  }
}

// Fetch user location using the composable
async function fetchUserLocation() {
  // Check preference before fetching (optional, composable also checks)
  if (!userStore.profile?.locationSharingEnabled) {
    alert(t('map.location-error') + ' (Sharing Disabled)'); // Inform user
    return false;
  }
  const fetchedLocation = await getCurrentLocation(); // Call composable method
  if (fetchedLocation) {
    // Reload crisis events if location fetch was successful (optional)
    // loadCrisisEvents();
  }
  return !!fetchedLocation;
}

// Reset filters
function resetFilters() {
  console.log("Resetting filters");
  selectedPoiType.value = null;
  distanceInMeters.value = 1000;
  poiError.value = null;
  // Don't reset userLocation or its status here, just the filters
  pointsOfInterest.value = [...allPois.value]; // Show all POIs again
  console.log("Filters reset, showing all POIs:", pointsOfInterest.value.length);
}

// Apply filtering
async function applyFilters() {
  console.log("Applying filters");
  poiError.value = null;

  // Read location from store/composable directly
  const currentLocation = userLocation.value;

  const hasType = selectedPoiType.value !== null;
  // Check if we have location data *and* a valid distance
  const hasLocationFilter = currentLocation !== null && distanceInMeters.value > 0;

  if (!hasType && !hasLocationFilter) {
    resetFilters(); // Reset to show all if no filter criteria
    return;
  }

  isLoadingPois.value = true;
  try {
    let fetchedResults: PoiData[] = [];

    if (hasLocationFilter && currentLocation) {
      if (hasType) {
        // Location + Type
        fetchedResults = await fetchPoisNearby(
          currentLocation.latitude,
          currentLocation.longitude,
          distanceInMeters.value,
          selectedPoiType.value!
        );
      } else {
        // Location Only
        fetchedResults = await fetchPoisNearby(
          currentLocation.latitude,
          currentLocation.longitude,
          distanceInMeters.value
        );
      }
    } else if (hasType) {
      // Type Only
      fetchedResults = await fetchPoisByType(selectedPoiType.value!);
    }

    pointsOfInterest.value = Array.isArray(fetchedResults) ? [...fetchedResults] : [];
    if (fetchedResults.length === 0) console.log("No POIs found matching the criteria");
    else console.log(`Found ${fetchedResults.length} POIs matching the criteria`);

  } catch (error: unknown) {
    console.error('Error applying filters:', error);
    poiError.value = t('map.filter-error') || 'Error applying filters'; // Add fallback
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

// Find nearest shelter
async function findNearestShelter() {
  console.log("Finding nearest shelter");
  poiError.value = null; // Clear previous errors

  // Read location from store/composable directly
  let currentLocation = userLocation.value;

  // Attempt to get location if not available or if status indicates an issue
  if (!currentLocation || locationError.value || locationStatus.value === 'Permission Denied' || locationStatus.value === 'Disabled by User') {
    const success = await fetchUserLocation(); // Use the refactored method
    if (!success) {
      poiError.value = locationStatusMessage.value || t('map.location-needed');
      return; // Stop if location cannot be obtained
    }
    currentLocation = userLocation.value; // Update local alias after fetch
    if (!currentLocation) return; // Should not happen if success is true, but safety check
  }

  isLoadingPois.value = true;
  try {
    const shelterTypeId = poiTypes.value.find((type) =>
      /shelter|tilfluktsrom/i.test(type.name)
    )?.id;

    if (!shelterTypeId) {
      poiError.value = t('map.no-shelter-type') || 'Shelter type not found'; // Add fallback
      isLoadingPois.value = false;
      return;
    }

    const nearest = await fetchNearestPoiByType(
      shelterTypeId,
      currentLocation.latitude,
      currentLocation.longitude
    );

    if (nearest) {
      pointsOfInterest.value = [ensureNumericCoordinates(nearest)];
      console.log("Nearest shelter found:", nearest);
    } else {
      pointsOfInterest.value = [];
      poiError.value = t('map.find-error') || 'Could not find nearest shelter'; // Add fallback
    }
  } catch (error: unknown) {
    console.error('Error finding nearest shelter:', error);
    poiError.value = t('map.find-error') || 'Error finding nearest shelter'; // Add fallback
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

// Find nearest POI of selected type
async function findNearestPoi() {
  console.log("Finding nearest POI");
  poiError.value = null; // Clear previous errors

  // Read location from store/composable directly
  let currentLocation = userLocation.value;

  // Ensure a type is selected
  if (selectedPoiType.value === null) {
    poiError.value = "Please select a POI type first."; // Provide feedback
    return;
  }

  // Attempt to get location if not available or if status indicates an issue
  if (!currentLocation || locationError.value || locationStatus.value === 'Permission Denied' || locationStatus.value === 'Disabled by User') {
    const success = await fetchUserLocation(); // Use the refactored method
    if (!success) {
      poiError.value = locationStatusMessage.value || t('map.location-needed');
      return; // Stop if location cannot be obtained
    }
    currentLocation = userLocation.value; // Update local alias after fetch
    if (!currentLocation) return; // Safety check
  }

  isLoadingPois.value = true;
  try {
    const nearest = await fetchNearestPoiByType(
      selectedPoiType.value, // Already checked it's not null
      currentLocation.latitude,
      currentLocation.longitude
    );

    if (nearest) {
      pointsOfInterest.value = [ensureNumericCoordinates(nearest)];
      console.log("Nearest POI found:", nearest);
    } else {
      pointsOfInterest.value = [];
      poiError.value = t('map.find-error') || 'Could not find nearest POI'; // Add fallback
    }
  } catch (error: unknown) {
    console.error('Error finding nearest POI:', error);
    poiError.value = t('map.find-error') || 'Error finding nearest POI'; // Add fallback
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

// Watch distance input for validation
watch(distanceInMeters, (val: number) => {
  if (val < 100) distanceInMeters.value = 100;
  else if (val > 5000000) distanceInMeters.value = 5000000;
});

// --- Lifecycle Hook ---
onMounted(async () => {
  console.log("Map overview component mounted");
  isLoadingPois.value = true;
  poiError.value = null;

  // Ensure profile (with location preference) is loaded first
  if (!userStore.profile) {
    await userStore.fetchUserProfile();
  }

  // *** START LIVE WATCHING (if enabled) ***
  if (profile.value?.locationSharingEnabled) {
    console.log("Location sharing is enabled, starting watch.");
    startWatching(); // Call the function from the composable
  } else {
    console.log("Location sharing is disabled, not starting watch.");
    // Optionally, get a one-time location if desired even if watch is off
    // await getCurrentLocation();
  }
  // *************************************

  // --- Load initial map data ---
  try {
    const pois = await fetchPublicPois();
    allPois.value = [...pois];
    pointsOfInterest.value = [...pois];
    console.log("Initial POIs loaded:", pointsOfInterest.value.length);
    await loadCrisisEvents();
  } catch (error: unknown) {
    // ... error handling ...
  } finally {
    isLoadingPois.value = false;
  }
});

// *** Clean up watcher when component is unmounted ***
onBeforeUnmount(() => {
  console.log("Map overview unmounting, stopping location watch.");
  stopWatching(); // Call the cleanup function from the composable
});
</script>
