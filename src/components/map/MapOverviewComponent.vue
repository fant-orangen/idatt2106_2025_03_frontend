<template>
  <div class="filter-toggle flex flex-col justify-end gap-4 mb-4 md:flex-row relative z-20">
    <Button @click="findNearestShelter" variant="destructive" class="w-full md:w-auto">
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
      <div class="grid grid-cols-1 gap-4 items-end md:grid-cols-3">
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
    <div v-if="isLoadingPois || isLoadingCrisisEvents || isLoadingLocation" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-10">{{ t('map.loading') || 'Loading...' }}</div>
    <div v-else-if="poiError || locationError" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-10 text-red-600">
      {{ poiError || locationStatusMessage || 'An error occurred' }}
    </div>
    <MapComponent
      :pois="convertedPois"
      :userLocation="userLocation"
      :crisisEvents="crisisEvents"
      class="absolute inset-0"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import MapComponent from '@/components/map/MapComponent.vue';
import { useGeolocation } from '@/composables/useGeolocation'; // Import the composable
import { useUserStore } from '@/stores/UserStore';
import { useGeolocationStore } from '@/stores/GeolocationStore'; // Import GeolocationStore
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome' // Import FontAwesomeIcon if not global
import { library } from '@fortawesome/fontawesome-svg-core' // For adding icons
import { faHouseChimney, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons' // Import necessary icons

// Add icons to the library
library.add(faHouseChimney, faChevronUp, faChevronDown);

const { t } = useI18n();

// --- Pinia Stores and Geolocation Composable ---
const userStore = useUserStore();
const geolocationStore = useGeolocationStore();
// Destructure composable return values
const {
  coords: locationCoords, // Renamed to avoid conflict if needed, points to geolocationStore.currentUserLocation
  error: locationError,
  isLoading: isLoadingLocation,
  status: locationStatus,
  startWatching,
  stopWatching,
  getCurrentLocation, // Use this function to fetch location
  canShareLocation // Use this computed ref to check if location can be shared
} = useGeolocation();

// Use storeToRefs to keep reactivity for store state
// Get user location directly from geolocationStore via the composable's coords ref
const userLocation = locationCoords; // Use the reactive ref from the composable

// --- Local Reactive State ---
const allPois = ref<PoiData[]>([]); // Holds all fetched POIs initially
const pointsOfInterest = ref<PoiData[]>([]); // Holds the currently displayed/filtered POIs
const isLoadingPois = ref(false);
const poiError = ref<string | null>(null); // Specific errors related to POI fetching/filtering
const crisisEvents = ref<CrisisEvent[]>([]);
const isLoadingCrisisEvents = ref(false);

// Filter state
const selectedPoiType = ref<number | null>(null);
const distanceInMeters = ref(1000);
const isFilterMenuVisible = ref(false);

// --- Computed Properties ---

// Convert displayed PoiData to POI objects for the MapComponent
const convertedPois = computed<POI[]>(() => {
  return pointsOfInterest.value.map(poi => convertPoiData(poi));
});

// Derive unique POI types from all loaded POIs
const poiTypes = computed(() => {
  const types = new Map<number, string>();
  allPois.value.forEach((poi: PoiData) => {
    // Ensure poiTypeId is treated as number for map keys
    const typeId = Number(poi.poiTypeId);
    if (!isNaN(typeId) && !types.has(typeId)) {
      types.set(typeId, poi.poiTypeName || `Type ${typeId}`); // Use name or fallback
    }
  });
  // Sort types alphabetically by name for consistent dropdown order
  return Array.from(types.entries())
  .map(([id, name]: [number, string]) => ({ id, name }))
  .sort((a, b) => a.name.localeCompare(b.name));
});


// Computed property for displaying location status/error messages
const locationStatusMessage = computed(() => {
  // Use the reactive status and error refs from the useGeolocation composable
  if (isLoadingLocation.value) return t('map.getting-location');
  if (locationError.value) {
    // Use the status string generated by the composable's errorCallback
    const statusKey = locationStatus.value?.replace(/\s+/g, '-').toLowerCase() || 'unknown-error';
    const translatedStatus = t(`map.status.${statusKey}`, locationStatus.value || 'Error'); // Example using i18n keys like map.status.permission-denied
    return `${t('map.location-error')} (${translatedStatus})`;
  }
  if (locationStatus.value === 'Success' && userLocation.value) return t('map.location-success');
  if (locationStatus.value === 'Not Supported') return t('map.location-unavailable');
  // Add a message if location sharing is disabled by user/browser but no explicit error occurred yet
  if (!canShareLocation.value && !isLoadingLocation.value && !locationError.value) {
    const reason = userStore.profile?.locationSharingEnabled === false ? t('map.status.disabled-by-user') : t('map.status.permission-denied-or-prompt');
    return `${t('map.location-sharing-disabled')} (${reason})`;
  }
  return null; // No status to show
});


// --- Methods ---

// Helper no longer needed if convertPoiData handles conversion robustly
// function ensureNumericCoordinates(poi: PoiData): PoiData { ... }

// Fetches crisis events and processes them for display
async function loadCrisisEvents() {
  isLoadingCrisisEvents.value = true;
  try {
    const events = await fetchActiveCrisisEvents();
    console.log('Crisis events loaded:', events);
    // Filter and process valid events (ensure lat/lon/level exist and are numbers)
    crisisEvents.value = events
    .filter(event =>
      event.latitude != null && event.longitude != null && event.level != null
    )
    .map(event => ({
      ...event,
      latitude: Number(event.latitude), // Ensure number
      longitude: Number(event.longitude), // Ensure number
      level: Number(event.level) // Ensure number
    }));
    console.log(`Processed ${crisisEvents.value.length} valid crisis events.`);
  } catch (error) {
    console.error('Error loading crisis events:', error);
    crisisEvents.value = []; // Clear on error
  } finally {
    isLoadingCrisisEvents.value = false;
  }
}

// Fetch user location using the composable; returns true on success, false on failure
async function fetchUserLocation(): Promise<boolean> {
  console.log('fetchUserLocation called');
  // getCurrentLocation now handles checks for canShareLocation internally
  const fetchedLocation = await getCurrentLocation(); // Use the composable's method

  if (fetchedLocation) {
    console.log('Location fetch successful via composable:', fetchedLocation);
    // Optional: Trigger watching if not already started (if desired behavior)
    // if (!isWatching.value) startWatching();
    return true;
  } else {
    // Error state (isLoadingLocation, locationError, locationStatus) is already set by the composable
    console.error('Location fetch failed. Status:', locationStatus.value, 'Error:', locationError.value);
    // Optionally show a toast or alert here based on locationStatusMessage
    // Example: toast.error(locationStatusMessage.value || t('map.location-error'));
    return false;
  }
}

// Reset filters to show all initially fetched POIs
function resetFilters() {
  console.log("Resetting filters");
  selectedPoiType.value = null;
  distanceInMeters.value = 1000; // Reset distance
  poiError.value = null; // Clear POI specific errors
  // User location is not reset by this action
  pointsOfInterest.value = [...allPois.value]; // Restore full list
  console.log("Filters reset, showing all POIs:", pointsOfInterest.value.length);
}

// Apply filtering based on selected type and/or location/distance
async function applyFilters() {
  console.log("Applying filters with:", { type: selectedPoiType.value, distance: distanceInMeters.value });
  poiError.value = null;

  // Get current location from the composable's reactive ref
  const currentLocation = userLocation.value;

  const hasType = selectedPoiType.value !== null;
  const hasLocationFilter = currentLocation !== null && distanceInMeters.value > 0;

  if (!hasType && !hasLocationFilter) {
    console.log("No filters applied, resetting to all POIs.");
    resetFilters(); // Reset to show all if no filter criteria
    return;
  }

  isLoadingPois.value = true;
  try {
    let fetchedResults: PoiData[] = [];

    if (hasLocationFilter && currentLocation) {
      // Use location from the composable ref
      const lat = currentLocation.latitude;
      const lon = currentLocation.longitude;
      console.log(`Filtering by location: Lat ${lat}, Lon ${lon}, Dist ${distanceInMeters.value}m, Type ${selectedPoiType.value}`);
      fetchedResults = await fetchPoisNearby(
        lat,
        lon,
        distanceInMeters.value,
        selectedPoiType.value ?? undefined // Pass typeId if selected
      );
    } else if (hasType) {
      // Type Only filter
      console.log(`Filtering by type ID: ${selectedPoiType.value}`);
      fetchedResults = await fetchPoisByType(selectedPoiType.value!);
    }

    // Update displayed POIs - use direct assignment for reactivity
    pointsOfInterest.value = [...fetchedResults]; // Ensure new array reference

    if (pointsOfInterest.value.length === 0) console.log("No POIs found matching the criteria");
    else console.log(`Found ${pointsOfInterest.value.length} POIs matching the criteria`);

  } catch (error: unknown) {
    console.error('Error applying filters:', error);
    poiError.value = t('map.filter-error', 'Error applying filters'); // Use i18n with fallback
    pointsOfInterest.value = []; // Clear results on error
  } finally {
    isLoadingPois.value = false;
  }
}

// Find nearest shelter functionality
async function findNearestShelter() {
  console.log("Finding nearest shelter");
  poiError.value = null;

  // Get current location, attempting fetch if needed
  let currentLocation = userLocation.value;
  if (!currentLocation) {
    const success = await fetchUserLocation();
    if (!success) {
      // Use the reactive status message computed property for error feedback
      poiError.value = locationStatusMessage.value || t('map.location-needed');
      return;
    }
    currentLocation = userLocation.value; // Re-assign after successful fetch
    if (!currentLocation) return; // Guard against unlikely null after success
  }

  isLoadingPois.value = true;
  try {
    // Find the shelter type ID dynamically
    const shelterType = poiTypes.value.find((type) =>
      /shelter|tilfluktsrom/i.test(type.name)
    );

    if (!shelterType) {
      poiError.value = t('map.no-shelter-type', 'Shelter type not found in POI list');
      isLoadingPois.value = false;
      return;
    }
    console.log(`Found shelter type ID: ${shelterType.id}`);

    const nearest = await fetchNearestPoiByType(
      shelterType.id,
      currentLocation.latitude,
      currentLocation.longitude
    );

    if (nearest) {
      // Update displayed POIs - use direct assignment
      pointsOfInterest.value = [convertPoiData(nearest)]; // Convert to POI and ensure new array
      console.log("Nearest shelter found:", nearest);
    } else {
      pointsOfInterest.value = [];
      poiError.value = t('map.find-error', 'Could not find nearest shelter');
    }
  } catch (error: unknown) {
    console.error('Error finding nearest shelter:', error);
    poiError.value = t('map.find-error', 'Error finding nearest shelter');
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

// Find nearest POI of the currently selected type
async function findNearestPoi() {
  console.log("Finding nearest POI of selected type");
  poiError.value = null;

  // Get current location, attempting fetch if needed
  let currentLocation = userLocation.value;
  if (!currentLocation) {
    const success = await fetchUserLocation();
    if (!success) {
      poiError.value = locationStatusMessage.value || t('map.location-needed');
      return;
    }
    currentLocation = userLocation.value;
    if (!currentLocation) return;
  }

  // Ensure a type is selected
  if (selectedPoiType.value === null) {
    poiError.value = t('map.select-type-first', "Please select a POI type first.");
    return;
  }

  isLoadingPois.value = true;
  try {
    console.log(`Finding nearest POI of type ID: ${selectedPoiType.value}`);
    const nearest = await fetchNearestPoiByType(
      selectedPoiType.value,
      currentLocation.latitude,
      currentLocation.longitude
    );

    if (nearest) {
      // Update displayed POIs - use direct assignment
      pointsOfInterest.value = [convertPoiData(nearest)]; // Convert and ensure new array
      console.log("Nearest POI found:", nearest);
    } else {
      pointsOfInterest.value = [];
      poiError.value = t('map.find-error', 'Could not find nearest POI of selected type');
    }
  } catch (error: unknown) {
    console.error('Error finding nearest POI:', error);
    poiError.value = t('map.find-error', 'Error finding nearest POI');
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

// Watch distance input for simple validation
watch(distanceInMeters, (val: number | string) => {
  const numVal = Number(val); // Handle potential string input
  if (isNaN(numVal)) {
    distanceInMeters.value = 1000; // Reset if invalid number
    return;
  }
  if (numVal < 100) distanceInMeters.value = 100;
  else if (numVal > 5000000) distanceInMeters.value = 5000000;
  // Ensure it's stored as a number if conversion happened
  else if (typeof val === 'string') distanceInMeters.value = numVal;
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  console.log("Map overview component mounted");
  isLoadingPois.value = true;
  poiError.value = null;

  // Load initial POIs and crisis events regardless of location state
  try {
    const pois = await fetchPublicPois();
    allPois.value = [...pois]; // Store all for resetting filters
    pointsOfInterest.value = [...pois]; // Initially display all
    console.log("Initial POIs loaded:", pointsOfInterest.value.length);
    await loadCrisisEvents();
  } catch (error: unknown) {
    console.error('Error loading initial POIs:', error);
    poiError.value = t('map.load-error', 'Failed to load points of interest');
    allPois.value = [];
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }

  // Note: Geolocation watching is NOT started automatically here.
  // It's triggered by user actions like clicking 'Use My Location' or 'Find Nearest'.
  console.log("Geolocation will be fetched on user interaction.");
});

onBeforeUnmount(() => {
  console.log("Map overview unmounting, stopping location watch.");
  stopWatching(); // Ensure watcher is stopped when leaving the component
});
</script>
