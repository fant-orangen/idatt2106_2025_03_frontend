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
      :householdLocation="householdLocation"
      :crisisEvents="crisisEvents"
      class="absolute inset-0"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
// import { storeToRefs } from 'pinia'; // Removed if only profile was destructured and not used
import MapComponent from '@/components/map/MapComponent.vue';
import { useGeolocation } from '@/composables/useGeolocation';
import { useUserStore } from '@/stores/UserStore';
import { useGeolocationStore } from '@/stores/GeolocationStore'; // Keep if needed, or remove if composable handles all interaction
import { useHouseholdStore } from '@/stores/HouseholdStore';
import {
  fetchPublicPois,
  fetchPoisByType,
  fetchPoisNearby,
  fetchNearestPoiByType
} from '@/services/api/PoiService';
import { fetchActiveCrisisEvents } from '@/services/CrisisEventService';
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHouseChimney, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'

library.add(faHouseChimney, faChevronUp, faChevronDown);

const { t } = useI18n();

// --- Pinia Stores and Geolocation Composable ---
const userStore = useUserStore(); // Still needed for the composable internally
const geolocationStore = useGeolocationStore(); // Import used for clarity or direct access if needed
const householdStore = useHouseholdStore(); // Used to get household location
const {
  coords: locationCoords, // Destructure coords from the composable
  error: locationError,
  isLoading: isLoadingLocation,
  status: locationStatus,
  startWatching,
  stopWatching,
  getCurrentLocation,
  canShareLocation
} = useGeolocation();

// --- Correctly Alias userLocation ---
const userLocation = locationCoords; // Use the ref returned by the composable

// --- Compute household location from HouseholdStore ---
const householdLocation = computed(() => {
  const household = householdStore.currentHousehold;
  if (household && household.latitude && household.longitude) {
    return {
      latitude: typeof household.latitude === 'string' ? parseFloat(household.latitude) : household.latitude,
      longitude: typeof household.longitude === 'string' ? parseFloat(household.longitude) : household.longitude
    };
  }
  return null;
});
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
// (Keep existing computed properties: convertedPois, poiTypes, locationStatusMessage)
// Convert displayed PoiData to POI objects for the MapComponent
const convertedPois = computed<POI[]>(() => {
  return pointsOfInterest.value.map(poi => convertPoiData(poi));
});

// Derive unique POI types from all loaded POIs
const poiTypes = computed(() => {
  const types = new Map<number, string>();
  allPois.value.forEach((poi: PoiData) => {
    const typeId = Number(poi.poiTypeId);
    if (!isNaN(typeId) && !types.has(typeId)) {
      types.set(typeId, poi.poiTypeName || `Type ${typeId}`);
    }
  });
  return Array.from(types.entries())
  .map(([id, name]: [number, string]) => ({ id, name }))
  .sort((a, b) => a.name.localeCompare(b.name));
});

// Computed property for displaying location status/error messages
const locationStatusMessage = computed(() => {
  if (isLoadingLocation.value) return t('map.getting-location');
  if (locationError.value) {
    const statusKey = locationStatus.value?.replace(/\s+/g, '-').toLowerCase() || 'unknown-error';
    // Add fallback messages directly in t() if keys don't exist in locales
    const translatedStatus = t(`map.status.${statusKey}`, locationStatus.value || 'Error');
    return `${t('map.location-error', 'Location Error')} (${translatedStatus})`;
  }
  if (locationStatus.value === 'Success' && userLocation.value) return t('map.location-success');
  if (locationStatus.value === 'Not Supported') return t('map.location-unavailable');
  if (!canShareLocation.value && !isLoadingLocation.value && !locationError.value) {
    // Provide more specific feedback based on user preference vs browser permission
    const userPrefDisabled = userStore.profile?.locationSharingEnabled === false;
    const reasonKey = userPrefDisabled ? 'map.status.disabled-by-user' : 'map.status.permission-denied-or-prompt';
    const reasonText = userPrefDisabled ? 'Disabled by user' : 'Permission required or denied by browser';
    return `${t('map.location-sharing-disabled', 'Location sharing disabled')} (${t(reasonKey, reasonText)})`;
  }
  return null;
});


// --- Methods ---
// (Keep existing methods: loadCrisisEvents, fetchUserLocation, resetFilters, applyFilters, findNearestShelter, findNearestPoi)
// Ensure they use 'userLocation' which now points to 'locationCoords'

async function loadCrisisEvents() {
  isLoadingCrisisEvents.value = true;
  try {
    const events = await fetchActiveCrisisEvents();
    console.log('Crisis events loaded:', events);
    crisisEvents.value = events
    .filter(event =>
      event.latitude != null && event.longitude != null && event.level != null
    )
    .map(event => ({
      ...event,
      latitude: Number(event.latitude),
      longitude: Number(event.longitude),
      level: Number(event.level)
    }));
    console.log(`Processed ${crisisEvents.value.length} valid crisis events.`);
  } catch (error) {
    console.error('Error loading crisis events:', error);
    crisisEvents.value = [];
  } finally {
    isLoadingCrisisEvents.value = false;
  }
}

async function fetchUserLocation(): Promise<boolean> {
  console.log('fetchUserLocation called');
  const fetchedLocation = await getCurrentLocation(); // Use the composable's method
  if (fetchedLocation) {
    console.log('Location fetch successful via composable:', fetchedLocation);
    // Optional: startWatching();
    return true;
  } else {
    console.error('Location fetch failed. Status:', locationStatus.value, 'Error:', locationError.value);
    // Display error via computed locationStatusMessage automatically
    return false;
  }
}

function resetFilters() {
  console.log("Resetting filters");
  selectedPoiType.value = null;
  distanceInMeters.value = 1000;
  poiError.value = null;
  pointsOfInterest.value = [...allPois.value];
  console.log("Filters reset, showing all POIs:", pointsOfInterest.value.length);
}

async function applyFilters() {
  console.log("Applying filters with:", { type: selectedPoiType.value, distance: distanceInMeters.value });
  poiError.value = null;
  const currentLocation = userLocation.value; // Uses the aliased reactive ref
  const hasType = selectedPoiType.value !== null;
  const hasLocationFilter = currentLocation !== null && distanceInMeters.value > 0;

  if (!hasType && !hasLocationFilter) {
    console.log("No filters applied, resetting to all POIs.");
    resetFilters();
    return;
  }

  isLoadingPois.value = true;
  try {
    let fetchedResults: PoiData[] = [];
    if (hasLocationFilter && currentLocation) {
      const lat = currentLocation.latitude;
      const lon = currentLocation.longitude;
      console.log(`Filtering by location: Lat ${lat}, Lon ${lon}, Dist ${distanceInMeters.value}m, Type ${selectedPoiType.value}`);
      fetchedResults = await fetchPoisNearby(lat, lon, distanceInMeters.value, selectedPoiType.value ?? undefined);
    } else if (hasType) {
      console.log(`Filtering by type ID: ${selectedPoiType.value}`);
      fetchedResults = await fetchPoisByType(selectedPoiType.value!);
    }
    pointsOfInterest.value = [...fetchedResults];
    if (pointsOfInterest.value.length === 0) console.log("No POIs found matching the criteria");
    else console.log(`Found ${pointsOfInterest.value.length} POIs matching the criteria`);
  } catch (error: unknown) {
    console.error('Error applying filters:', error);
    poiError.value = t('map.filter-error', 'Error applying filters');
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

async function findNearestShelter() {
  console.log("Finding nearest shelter");
  poiError.value = null;
  let currentLocation = userLocation.value; // Uses the aliased reactive ref
  if (!currentLocation) {
    const success = await fetchUserLocation();
    if (!success) {
      poiError.value = locationStatusMessage.value || t('map.location-needed');
      return;
    }
    currentLocation = userLocation.value;
    if (!currentLocation) return;
  }

  isLoadingPois.value = true;
  try {
    const shelterType = poiTypes.value.find((type) => /shelter|tilfluktsrom/i.test(type.name));
    if (!shelterType) {
      poiError.value = t('map.no-shelter-type', 'Shelter type not found in POI list');
      isLoadingPois.value = false;
      return;
    }
    console.log(`Found shelter type ID: ${shelterType.id}`);
    const nearest = await fetchNearestPoiByType(shelterType.id, currentLocation.latitude, currentLocation.longitude);
    if (nearest) {
      pointsOfInterest.value = [nearest];
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

async function findNearestPoi() {
  console.log("Finding nearest POI of selected type");
  poiError.value = null;
  let currentLocation = userLocation.value; // Uses the aliased reactive ref
  if (!currentLocation) {
    const success = await fetchUserLocation();
    if (!success) {
      poiError.value = locationStatusMessage.value || t('map.location-needed');
      return;
    }
    currentLocation = userLocation.value;
    if (!currentLocation) return;
  }
  if (selectedPoiType.value === null) {
    poiError.value = t('map.select-type-first', "Please select a POI type first.");
    return;
  }

  isLoadingPois.value = true;
  try {
    console.log(`Finding nearest POI of type ID: ${selectedPoiType.value}`);
    const nearest = await fetchNearestPoiByType(selectedPoiType.value, currentLocation.latitude, currentLocation.longitude);
    if (nearest) {
      pointsOfInterest.value = [nearest];
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
  const numVal = Number(val);
  if (isNaN(numVal)) {
    distanceInMeters.value = 1000;
    return;
  }
  if (numVal < 100) distanceInMeters.value = 100;
  else if (numVal > 5000000) distanceInMeters.value = 5000000;
  else if (typeof val === 'string') distanceInMeters.value = numVal;
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  console.log("Map overview component mounted");
  isLoadingPois.value = true;
  poiError.value = null;

  // Load initial POIs and crisis events
  try {
    const pois = await fetchPublicPois();
    allPois.value = [...pois];
    pointsOfInterest.value = [...pois];
    console.log("Initial POIs loaded:", pointsOfInterest.value.length);
    await loadCrisisEvents();

    // Fetch household data if user is logged in
    if (userStore.loggedIn) {
      await householdStore.fetchCurrentHousehold();
      console.log("Household data fetched:", householdStore.currentHousehold);
    }
  } catch (error: unknown) {
    console.error('Error loading initial POIs:', error);
    poiError.value = t('map.load-error', 'Failed to load points of interest');
    allPois.value = [];
    pointsOfInterest.value = [];
  } finally {
    isLoadingPois.value = false;
  }
  // Geolocation is fetched on demand by user actions
  console.log("Geolocation will be fetched on user interaction.");
});

onBeforeUnmount(() => {
  console.log("Map overview unmounting, stopping location watch.");
  stopWatching(); // Ensure watcher is stopped
});
</script>
