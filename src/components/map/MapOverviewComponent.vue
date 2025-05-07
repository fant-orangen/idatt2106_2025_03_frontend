<template>
  <div class="filter-toggle flex flex-wrap items-center gap-3 mb-4 relative z-20">
    <!-- Location button styled consistently with other buttons -->
    <Button
      @click="fetchUserLocation"
      :disabled="isLoadingLocation"
      variant="outline"
      class="flex items-center"
    >
      <font-awesome-icon :icon="['fas', 'location-dot']" class="mr-2" />
      {{ isLoadingLocation
      ? t('map.getting-location')
      : t('map.my-location', 'Use my location')
      }}
    </Button>

    <Button @click="findNearestShelter" variant="destructive" class="flex items-center">
      <font-awesome-icon :icon="['fas', 'house-chimney']" class="mr-2" />
      {{ t('map.nearest-shelter') }}
    </Button>

    <Button @click="isFilterMenuVisible = !isFilterMenuVisible" class="flex items-center">
      <font-awesome-icon
        :icon="['fas', isFilterMenuVisible ? 'chevron-up' : 'chevron-down']"
        class="mr-2"
      />
      {{ isFilterMenuVisible ? t('map.hide-filter') : t('map.show-filter') }}
    </Button>

    <div class="flex flex-wrap gap-3">
      <div class="flex items-center gap-2">

        <label class="text-sm font-medium cursor-pointer">
          {{ t('map.show-pois', 'POIs') }}
        </label>
        <Switch v-model="showPois" />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium cursor-pointer">
          {{ t('map.show-crisis', 'Kriser') }}
        </label>
        <Switch v-model="showCrisis" />
      </div>
      <!-- Deactivate "Show Meeting Places" when position is not shared -->
      <div class="flex items-center gap-2 relative group">
        <label
          class="text-sm font-medium cursor-pointer flex items-center"
          :class="!userLocation ? 'opacity-70' : ''"
        >
          {{ t('map.show-meeting-places', 'Møteplasser') }}
          <font-awesome-icon
            v-if="!userLocation"
            :icon="['fas', 'location-crosshairs']"
            class="ml-1.5 text-gray-400 dark:text-gray-500"
          />
        </label>
        <Switch
          v-model="showMeetingPlaces"
          :disabled="!userLocation"
          @update:modelValue="handleMeetingPlacesToggle"
        />

        <!-- Tooltip that appears on hover -->
        <div
          v-if="!userLocation"
          class="absolute left-0 bottom-full mb-2 bg-black/90 text-white text-xs px-2 py-1 rounded shadow-lg max-w-xs
          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          {{ t('map.location-needed-tooltip', 'Aktiver posisjon først for å vise møteplasser') }}
          <div class="absolute w-2 h-2 bg-black/90 transform rotate-45 left-4 -bottom-1"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Location status message outside filter card -->
  <div v-if="locationStatusMessage" class="mb-4">
    <p
      class="text-sm py-2 px-4 rounded-md"
      :class="{
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': !!locationError,
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': !locationError && userLocation,
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': !locationError && !userLocation
      }"
    >
      {{ locationStatusMessage }}
      <span v-if="userLocation" class="font-medium">
        Lat: {{ userLocation.latitude.toFixed(4) }}, Lon: {{ userLocation.longitude.toFixed(4) }}
      </span>
    </p>
  </div>

  <Card v-if="isFilterMenuVisible" class="mb-8 filter-card relative z-20">
    <CardHeader>
      <CardTitle>{{ t('map.filter') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 gap-4 items-end md:grid-cols-2">
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
            max="50000"
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
              <SelectItem v-for="type in poiTypes" :key="type.id" :value="type.id">
                {{ t(`map.poiTypes.${type.id}`, type.name) }}
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

  <!-- Map and Legend container -->
  <div class="flex flex-col">
    <!-- Map area -->
    <div class="relative z-0 overflow-visible h-[50em] md:h-[60vh] w-full">
      <div
        v-if="isLoadingPois || isLoadingCrisisEvents || isLoadingLocation"
        class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-10"
      >
        {{ t('map.loading') || 'Loading...' }}
      </div>
      <div
        v-else-if="poiError || locationError"
        class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-10 text-red-600"
      >
        {{ poiError || locationStatusMessage || 'An error occurred' }}
      </div>

      <MapComponent
        ref="mapComponentRef"
        :pois="showPois ? convertedPois : []"
        :crisisEvents="showCrisis ? crisisEvents : []"
        :meetingPlaces="showMeetingPlaces ? meetingPlaces : []"
        :showPois="showPois"
        :showCrisis="showCrisis"
        :showMeetingPlaces="showMeetingPlaces"
        :userLocation="userLocation"
        :householdLocation="householdLocation"
        class="absolute inset-0"
      />
    </div>

    <!-- Legend underneath the map -->
    <MapLegend class="mt-4" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import MapComponent from '@/components/map/MapComponent.vue';
import { useGeolocation } from '@/composables/useGeolocation';
import { useUserStore } from '@/stores/UserStore';
import { useGeolocationStore } from '@/stores/GeolocationStore';
import { useHouseholdStore } from '@/stores/HouseholdStore';
import type { MeetingPlaceDto } from '@/types/meetingPlace'
import { fetchMeetingPlacesNearby } from '@/services/api/MeetingPlaceService'
import {
  fetchPublicPois,
  fetchPoisByType,
  fetchPoisNearby,
  fetchNearestPoiByType,
} from '@/services/api/PoiService'
import { fetchActiveCrisisEvents } from '@/services/CrisisEventService'
import type { PoiData } from '@/models/PoiData'
import type { POI, UserLocation, CrisisEvent } from '@/types/map'
import { convertPoiData } from '@/types/map'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHouseChimney, faChevronUp, faChevronDown, faLocationDot } from '@fortawesome/free-solid-svg-icons'

import MapLegend from './MapLegend.vue'

// Register FontAwesome icons
library.add(faHouseChimney, faChevronUp, faChevronDown, faLocationDot)

const { t } = useI18n()

/**
 * Store and Geolocation Setup
 * Initialize Pinia stores and geolocation functionality
 */
const userStore = useUserStore();
const geolocationStore = useGeolocationStore();
const householdStore = useHouseholdStore();

const {
  coords: locationCoords,
  error: locationError,
  isLoading: isLoadingLocation,
  status: locationStatus,
  startWatching,
  stopWatching,
  getCurrentLocation,
  canShareLocation,
  resetBrowserPermissionState,
} = useGeolocation()



const mapComponentRef = ref<InstanceType<typeof MapComponent> | null>(null);

/**
 * User Location Setup
 * Alias the coordinates from geolocation composable
 */
const userLocation = locationCoords

/**
 * Household Location
 * Compute household location from HouseholdStore data
 */
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

/**
 * Points of Interest State
 * Reactive state for POIs, crisis events, and loading indicators
 */
const allPois = ref<PoiData[]>([])
const pointsOfInterest = ref<PoiData[]>([])
const isLoadingPois = ref(false)
const poiError = ref<string | null>(null)
const crisisEvents = ref<CrisisEvent[]>([])
const isLoadingCrisisEvents = ref(false)

/**
 * Filter State
 * State variables for filtering POIs and UI controls
 */
const selectedPoiType = ref<number | null>(null)
const distanceInMeters = ref(50000)
const isFilterMenuVisible = ref(false)

const showPois          = ref(true)
const showCrisis        = ref(true)
const showMeetingPlaces = ref(false)

const meetingPlaces     = ref<MeetingPlaceDto[]>([])
const isLoadingMeetings = ref(false)

/**
 * Meeting Places Toggle Handler
 * Handles validation when toggling meeting places visibility
 * @param value - The new toggle state
 */
function handleMeetingPlacesToggle(value: boolean) {
  if (!userLocation.value && value) {
    // If trying to enable meeting places without location, show error
    poiError.value = t('map.location-needed-for-meetings', 'Location sharing is required to show meeting places');
    setTimeout(() => {
      poiError.value = null;
    }, 3000);
  }
}

/**
 * Computed Properties
 * Derived state and calculations
 */

/**
 * Converted POIs
 * Converts PoiData objects to POI objects for the MapComponent
 */
const convertedPois = computed<POI[]>(() => {
  return pointsOfInterest.value.map((poi) => convertPoiData(poi))
})

/**
 * POI Types
 * Derives unique POI types from all loaded POIs
 */
const poiTypes = computed(() => {
  const types = new Map<number, string>()
  allPois.value.forEach((poi: PoiData) => {
    const typeId = Number(poi.poiTypeId)
    if (!isNaN(typeId) && !types.has(typeId)) {
      types.set(typeId, poi.poiTypeName || `Type ${typeId}`)
    }
  })
  return Array.from(types.entries())
  .map(([id, name]: [number, string]) => ({ id, name }))
  .sort((a, b) => a.name.localeCompare(b.name))
})

/**
 * Location Status Message
 * Computes a user-friendly message about the current location status
 * @returns A translated status message or null if no status to display
 */
const locationStatusMessage = computed(() => {
  // First, handle loading state
  if (isLoadingLocation.value) return t('map.getting-location');

  // Handle errors
  if (locationError.value) {
    const statusKey = locationStatus.value?.replace(/\s+/g, '-').toLowerCase() || 'unknown-error';
    const translatedStatus = t(`map.status.${statusKey}`, locationStatus.value || 'Error');
    return `${t('map.location-error', 'Location Error')} (${translatedStatus})`;
  }

  // Success case
  if (locationStatus.value === 'Success' && userLocation.value) return t('map.location-success');

  // Unsupported case
  if (locationStatus.value === 'Not Supported') return t('map.location-unavailable');

  // Only show the permission error when actually trying to use location
  if (!canShareLocation.value && !isLoadingLocation.value && !locationError.value && locationStatus.value) {
    const userPrefDisabled = userStore.profile?.locationSharingEnabled === false;
    const reasonKey = userPrefDisabled
      ? 'map.status.disabled-by-user'
      : 'map.status.permission-denied-or-prompt';
    const reasonText = userPrefDisabled
      ? 'Disabled by user'
      : 'Permission required or denied by browser';
    return `${t('map.location-sharing-disabled', 'Location sharing disabled')} (${t(reasonKey, reasonText)})`;
  }

  // Default: no message when not yet attempted
  return null;
});

/**
 * Location Reset Handler
 * Resets all location-related state when user logs out or manually resets
 */
function handleLocationReset() {
  console.log
  ('Resetting location state due to user action or logout');

  // Stop any active location watching
  stopWatching();

  // Clear geolocation store state
  geolocationStore.clearLocationState();

  // Clear any error states in this component
  poiError.value = null;

  // Make sure meeting places are hidden when location is reset
  showMeetingPlaces.value = false;
}

/**
 * Core Functionality Methods
 * Main methods for data fetching and user interactions
 */
/**
 * Load Crisis Events
 * Fetches active crisis events from the API and processes them for display
 */
async function loadCrisisEvents() {
  isLoadingCrisisEvents.value = true
  try {
    const events = await fetchActiveCrisisEvents()
    console.log('Crisis events loaded:', events)
    crisisEvents.value = events
    .filter((event) => event.latitude != null && event.longitude != null && event.level != null)
    .map((event) => ({
      ...event,
      latitude: Number(event.latitude),
      longitude: Number(event.longitude),
      level: Number(event.level),
    }))
    console.log(`Processed ${crisisEvents.value.length} valid crisis events.`)
  } catch (error) {
    console.error('Error loading crisis events:', error)
    crisisEvents.value = []
  } finally {
    isLoadingCrisisEvents.value = false
  }
}

/**
 * Fetch User Location
 * Requests the user's current location and centers the map on it if successful
 * @returns Promise resolving to true if location was successfully obtained, false otherwise
 */
async function fetchUserLocation(): Promise<boolean> {
  console.log('fetchUserLocation called');

  // Reset any error state
  poiError.value = null;

  // Force complete state reset before trying again
  handleLocationReset();

  // Set a flag to indicate this is a user-initiated location request
  geolocationStore.setLocationStatus('Requested');

  console.log('Attempting to get current location...');
  const fetchedLocation = await getCurrentLocation();

  if (fetchedLocation) {
    console.log('Location fetch successful!', fetchedLocation);

    await nextTick();
    if (mapComponentRef.value && userLocation.value) {
      mapComponentRef.value.centerMap(
        userLocation.value.latitude,
        userLocation.value.longitude,
        15
      );
    }
    return true;
  } else {
    console.error(
      'Location fetch failed. Status:',
      locationStatus.value,
      'Error:',
      locationError.value
    );

    return false;
  }
}

/**
 * Reset Filters
 * Resets all filter criteria to their default values and shows all POIs
 */
function resetFilters() {
  console.log('Resetting filters')
  selectedPoiType.value = null
  distanceInMeters.value = 1000
  poiError.value = null
  pointsOfInterest.value = [...allPois.value]
  console.log('Filters reset, showing all POIs:', pointsOfInterest.value.length)
}

/**
 * Apply Filters
 * Applies the selected filters to the POI list
 * Filters by type and/or location based on user selections
 */
async function applyFilters() {
  console.log('Applying filters with:', {
    type: selectedPoiType.value,
    distance: distanceInMeters.value,
  })
  poiError.value = null
  showPois.value = true
  const currentLocation = userLocation.value
  const hasType = selectedPoiType.value !== null
  const hasLocationFilter = currentLocation !== null && distanceInMeters.value > 0

  if (!hasType && !hasLocationFilter) {
    console.log('No filters applied, resetting to all POIs.')
    resetFilters()
    return
  }

  isLoadingPois.value = true
  try {
    let fetchedResults: PoiData[] = []
    if (hasLocationFilter && currentLocation) {
      const lat = currentLocation.latitude
      const lon = currentLocation.longitude
      console.log(
        `Filtering by location: Lat ${lat}, Lon ${lon}, Dist ${distanceInMeters.value}m, Type ${selectedPoiType.value}`,
      )
      fetchedResults = await fetchPoisNearby(
        lat,
        lon,
        distanceInMeters.value,
        selectedPoiType.value ?? undefined,
      )
    } else if (hasType) {
      console.log(`Filtering by type ID: ${selectedPoiType.value}`)
      fetchedResults = await fetchPoisByType(selectedPoiType.value!)
    }
    pointsOfInterest.value = [...fetchedResults]
    if (pointsOfInterest.value.length === 0) console.log('No POIs found matching the criteria')
    else console.log(`Found ${pointsOfInterest.value.length} POIs matching the criteria`)
  } catch (error: unknown) {
    console.error('Error applying filters:', error)
    poiError.value = t('map.filter-error', 'Error applying filters')
    pointsOfInterest.value = []
  } finally {
    isLoadingPois.value = false
  }
}

/**
 * Find Nearest Shelter
 * Locates and displays the nearest shelter to the user's current location
 * Will attempt to get user location if not already available
 */
async function findNearestShelter() {
  console.log('Finding nearest shelter')
  poiError.value = null
  showPois.value = true
  let currentLocation = userLocation.value
  if (!currentLocation) {
    const success = await fetchUserLocation()
    if (!success) {
      poiError.value = locationStatusMessage.value || t('map.location-needed')
      return
    }
    currentLocation = userLocation.value
    if (!currentLocation) return
  }

  isLoadingPois.value = true
  try {
    const shelterType = poiTypes.value.find((type) => /shelter|tilfluktsrom/i.test(type.name))
    if (!shelterType) {
      poiError.value = t('map.no-shelter-type', 'Shelter type not found in POI list')
      isLoadingPois.value = false
      return
    }
    console.log(`Found shelter type ID: ${shelterType.id}`)
    const nearest = await fetchNearestPoiByType(
      shelterType.id,
      currentLocation.latitude,
      currentLocation.longitude,
    )
    if (nearest) {
      pointsOfInterest.value = [nearest]
      console.log('Nearest shelter found:', nearest)

      await nextTick();
      if (mapComponentRef.value) {
        mapComponentRef.value.fitBoundsToUserAndPoi();
      }
    } else {
      pointsOfInterest.value = []
      poiError.value = t('map.find-error', 'Could not find nearest shelter')
    }
  } catch (error: unknown) {
    console.error('Error finding nearest shelter:', error)
    poiError.value = t('map.find-error', 'Error finding nearest shelter')
    pointsOfInterest.value = []
  } finally {
    isLoadingPois.value = false
  }
}

/**
 * Find Nearest POI
 * Locates and displays the nearest POI of the selected type to the user's location
 * Will attempt to get user location if not already available
 * Requires a POI type to be selected first
 */
async function findNearestPoi() {
  console.log('Finding nearest POI of selected type')
  poiError.value = null
  showPois.value = true
  let currentLocation = userLocation.value
  if (!currentLocation) {
    const success = await fetchUserLocation()
    if (!success) {
      poiError.value = locationStatusMessage.value || t('map.location-needed')
      return
    }
    currentLocation = userLocation.value
    if (!currentLocation) return
  }
  if (selectedPoiType.value === null) {
    poiError.value = t('map.select-type-first', 'Please select a POI type first.')
    return
  }

  isLoadingPois.value = true
  try {
    console.log(`Finding nearest POI of type ID: ${selectedPoiType.value}`)
    const nearest = await fetchNearestPoiByType(
      selectedPoiType.value,
      currentLocation.latitude,
      currentLocation.longitude,
    )
    if (nearest) {
      pointsOfInterest.value = [nearest]
      console.log('Nearest POI found:', nearest)
    } else {
      pointsOfInterest.value = []
      poiError.value = t('map.find-error', 'Could not find nearest POI of selected type')
    }
  } catch (error: unknown) {
    console.error('Error finding nearest POI:', error)
    poiError.value = t('map.find-error', 'Error finding nearest POI')
    pointsOfInterest.value = []
  } finally {
    isLoadingPois.value = false
  }
}

/**
 * Distance Input Validation
 * Ensures the distance value stays within acceptable range
 */
watch(distanceInMeters, (val: number | string) => {
  const numVal = Number(val)
  if (isNaN(numVal)) {
    distanceInMeters.value = 1000
    return
  }
  if (numVal < 100) distanceInMeters.value = 100
  else if (numVal > 50000) distanceInMeters.value = 50000
  else if (typeof val === 'string') distanceInMeters.value = numVal
})

/**
 * Authentication State Watcher
 * Handles location reset when user logs out
 */
watch(() => userStore.loggedIn, (isLoggedIn, wasLoggedIn) => {
  console.log(`Auth state changed: ${wasLoggedIn} -> ${isLoggedIn}`);

  if (!isLoggedIn && wasLoggedIn) {
    // User logged out - reset location state
    console.log('User logged out - resetting location state');
    handleLocationReset();
  }
}, { immediate: true });

/**
 * User Location Watcher
 * Centers map when location changes and manages meeting places visibility
 */
watch(userLocation, (loc) => {
  if (loc && mapComponentRef.value) {
    // Center map on user location with zoom level 15
    mapComponentRef.value.centerMap(loc.latitude, loc.longitude, 15);
  }

  // If location is reset/removed, make sure meeting places are hidden
  if (!loc) {
    showMeetingPlaces.value = false;
  }
});

/**
 * Meeting Places Visibility Watcher
 * Fetches meeting places when visibility is toggled on and location is available
 */
watch(
  [ () => showMeetingPlaces.value, () => userLocation.value ],
  async ([show, loc]) => {
    if (show && loc) {
      isLoadingMeetings.value = true
      try {
        meetingPlaces.value = await fetchMeetingPlacesNearby(
          loc.latitude,
          loc.longitude,
          distanceInMeters.value / 1000  // Convert meters to kilometers for API
        )
        console.log('Fetched meetingPlaces:', meetingPlaces.value)
      } finally {
        isLoadingMeetings.value = false
      }
    } else {
      meetingPlaces.value = []
    }
  },
  { immediate: true }
)

/**
 * Lifecycle Hooks
 * Component initialization and cleanup
 */
/**
 * Component Initialization
 * Loads initial data when component is mounted
 */
onMounted(async () => {
  console.log('Map overview component mounted')
  isLoadingPois.value = true
  poiError.value = null

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
    console.error('Error loading initial POIs:', error)
    poiError.value = t('map.load-error', 'Failed to load points of interest')
    allPois.value = []
    pointsOfInterest.value = []
  } finally {
    isLoadingPois.value = false
  }
  // Geolocation is fetched on demand by user actions
  console.log('Geolocation will be fetched on user interaction.')
})

/**
 * Component Cleanup
 * Stops location watching when component is unmounted
 */
onBeforeUnmount(() => {
  console.log('Map overview unmounting, stopping location watch.')
  stopWatching() // Ensure watcher is stopped
})
</script>

<style scoped>
/**
 * Disabled button styling
 * Prevents pointer events on disabled buttons
 */
.cursor-not-allowed {
  pointer-events: none;
}
</style>
