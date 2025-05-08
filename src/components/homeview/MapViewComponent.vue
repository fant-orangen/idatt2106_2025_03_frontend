<template>
  <div
    class="w-full rounded-lg shadow-sm overflow-hidden transition-all duration-300 ease-in-out border border-[var(--crisis-level-yellow)] bg-white"
  >
    <!-- Map Button Header -->
    <div
      @click="toggleMap"
      class="w-full py-2 flex flex-col items-center cursor-pointer transition-colors bg-white hover:bg-gray-50 px-6"
    >
      <div class="flex items-center justify-center">
        <font-awesome-icon :icon="['fas', 'map-location-dot']" class="text-2xl mr-3 text-[var(--crisis-level-yellow)]" />
        <span class="text-lg font-medium">{{ t('home.view_map') }}</span>
      </div>
      <div class="mt-1">
        <ChevronDown v-if="!showMap" class="h-5 w-5 text-[var(--crisis-level-yellow)]" />
        <ChevronUp v-else class="h-5 w-5 text-[var(--crisis-level-yellow)]" />
      </div>
    </div>

    <!-- Expandable Map Section -->
    <div
      v-if="showMap"
      class="map-container overflow-hidden transition-all duration-500 ease-in-out bg-white"
      :class="{'h-auto': showMap, 'h-0': !showMap}"
    >
      <!-- Reusing MapOverviewComponent's filter-toggle section -->
      <div class="p-3 border-b border-[var(--crisis-level-yellow)]">
        <!-- Map control buttons that stack vertically on narrow screens -->
        <div class="map-buttons-container flex md:items-center gap-2 mb-3 min-h-[40px] overflow-y-auto overflow-x-hidden md:flex-wrap md:overflow-visible scrollbar-thin scrollbar-thumb-[var(--crisis-level-yellow)] scrollbar-track-transparent">
          <Button
            @click="fetchUserLocation"
            :disabled="isLoadingLocation"
            variant="outline"
            class="flex items-center bg-white border-[var(--crisis-level-yellow)] text-black hover:bg-gray-50 hover:border-[var(--crisis-level-yellow)]"
          >
            <font-awesome-icon :icon="['fas', 'location-dot']" class="mr-2" />
            {{ isLoadingLocation
            ? t('map.getting-location')
            : t('map.my-location', 'Use my location')
            }}
          </Button>

          <Button
            @click="findNearestShelter"
            variant="outline"
            class="flex items-center bg-white border-[var(--crisis-level-yellow)] text-black hover:bg-gray-50 hover:border-[var(--crisis-level-yellow)]"
          >
            <font-awesome-icon :icon="['fas', 'house-chimney']" class="mr-2" />
            {{ t('map.nearest-shelter') }}
          </Button>

          <Button
            @click="isFilterMenuVisible = !isFilterMenuVisible"
            variant="outline"
            class="flex items-center bg-white border-[var(--crisis-level-yellow)] text-black hover:bg-gray-50 hover:border-[var(--crisis-level-yellow)]"
            :class="{ 'bg-gray-100': isFilterMenuVisible }"
          >
            <font-awesome-icon
              :icon="['fas', isFilterMenuVisible ? 'chevron-up' : 'chevron-down']"
              class="mr-2"
            />
            {{ isFilterMenuVisible ? t('map.hide-filter') : t('map.show-filter') }}
          </Button>

          <Button
            variant="outline"
            class="flex items-center bg-white border-[var(--crisis-level-yellow)] text-black hover:bg-gray-50 hover:border-[var(--crisis-level-yellow)]"
            @click="togglePoiVisibility"
          >
            <font-awesome-icon :icon="['fas', 'map-pin']" class="mr-2" />
            {{ t('map.show-pois', 'POIs') }}
            <div class="ml-1 w-3 h-3 rounded-full" :class="showPois ? 'bg-green-500' : 'bg-gray-300'"></div>
          </Button>

          <Button
            variant="outline"
            class="flex items-center bg-white border-[var(--crisis-level-yellow)] text-black hover:bg-gray-50 hover:border-[var(--crisis-level-yellow)]"
            @click="toggleCrisisVisibility"
          >
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="mr-2" />
            {{ t('map.show-crisis', 'Crisis') }}
            <div class="ml-1 w-3 h-3 rounded-full" :class="showCrisis ? 'bg-green-500' : 'bg-gray-300'"></div>
          </Button>

          <Button
            variant="outline"
            class="flex items-center bg-white border-[var(--crisis-level-yellow)] text-black hover:bg-gray-50 hover:border-[var(--crisis-level-yellow)]"
            @click="toggleMeetingPlacesVisibility"
          >
            <font-awesome-icon :icon="['fas', 'people-group']" class="mr-2" />
            {{ t('map.show-meeting-places', 'Meeting Places') }}
            <div class="ml-1 w-3 h-3 rounded-full" :class="showMeetingPlaces ? 'bg-green-500' : 'bg-gray-300'"></div>
          </Button>
        </div>
      </div>

      <!-- Filter Card -->
      <Card v-if="isFilterMenuVisible" class="mb-4 filter-card relative z-20 mx-3 border-[var(--crisis-level-yellow)] bg-white">
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
                class="w-full border-[var(--crisis-level-yellow)] focus-visible:ring-[var(--crisis-level-yellow)] bg-white"
              />
            </div>

            <div>
              <label for="poi-type" class="text-sm font-medium block mb-1">
                {{ t('map.poi-type') }}
              </label>
              <Select v-model="selectedPoiType" class="w-full">
                <SelectTrigger id="poi-type" class="w-full border-[var(--crisis-level-yellow)] focus:ring-[var(--crisis-level-yellow)]">
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

          <div class="filter-buttons-container flex flex-col md:flex-row gap-4 mt-4 md:justify-between overflow-y-auto overflow-x-hidden md:flex-wrap md:overflow-visible min-h-[40px]">
            <div class="flex flex-col md:flex-wrap md:flex-row gap-4 w-full">
              <Button
                variant="outline"
                class="w-full md:w-auto bg-white border-[var(--crisis-level-yellow)] text-black hover:bg-gray-50 hover:border-[var(--crisis-level-yellow)]"
                @click="resetFilters"
              >
                {{ t('map.reset-filter') }}
              </Button>
              <Button
                variant="outline"
                class="w-full md:w-auto bg-white border-[var(--crisis-level-yellow)] text-black hover:bg-gray-50 hover:border-[var(--crisis-level-yellow)]"
                :class="{ 'opacity-50': !userLocation || !selectedPoiType }"
                @click="findNearestPoi"
                :disabled="!userLocation || !selectedPoiType"
              >
                {{ t('map.find-nearest') }}
              </Button>
            </div>
            <Button
              variant="outline"
              class="w-full md:w-auto bg-white border-[var(--crisis-level-yellow)] text-black hover:bg-gray-50 hover:border-[var(--crisis-level-yellow)] font-medium"
              @click="applyFilters"
            >
              {{ t('map.apply-filter') }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Map and Legend container with collapsible legend -->
      <div class="relative" :style="{ height: legendHeight + 'px' }">
        <!-- Map Component -->
        <div class="absolute inset-0" :class="{ 'pr-[250px]': showLegend }">
          <MapComponent
            ref="mapComponentRef"
            :pois="showPois ? convertedPois : []"
            :crisisEvents="showCrisis ? crisisEvents : []"
            :meetingPlaces="showMeetingPlaces ? meetingPlaces : []"
            :userLocation="userLocation"
            :householdLocation="householdLocation"
            class="h-full w-full z-0"
          />
        </div>

        <!-- Legend Toggle Button -->
        <button
          @click="toggleLegend"
          class="absolute bottom-3 right-3 z-30 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
        >
          <font-awesome-icon :icon="['fas', showLegend ? 'chevron-right' : 'chevron-left']" class="text-black" />
        </button>

        <!-- Collapsible Legend Sidebar -->
        <div
          class="absolute top-0 right-0 h-full bg-white border-l border-[var(--crisis-level-yellow)] p-3 transition-all duration-300 ease-in-out z-10"
          :class="{ 'w-[250px]': showLegend, 'w-0 opacity-0': !showLegend }"
        >
          <MapLegend />
        </div>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import MapComponent from '@/components/map/MapComponent.vue';
import MapLegend from '@/components/map/MapLegend.vue';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faMapLocationDot,
  faLocationDot,
  faHouseChimney,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faMapPin,
  faTriangleExclamation,
  faPeopleGroup
} from '@fortawesome/free-solid-svg-icons';
import { useGeolocation } from '@/composables/useGeolocation.ts';
import {
  fetchPublicPois,
  fetchPoisByType,
  fetchPoisNearby,
  fetchNearestPoiByType
} from '@/services/api/PoiService.ts';
import { fetchActiveCrisisEvents } from '@/services/CrisisEventService.ts';
import { fetchMeetingPlacesNearby } from '@/services/api/MeetingPlaceService.ts';
import type { PoiData } from '@/models/PoiData.ts';
import { convertPoiData } from '@/types/map.ts';

// Register FontAwesome icons
library.add(
  faMapLocationDot,
  faLocationDot,
  faHouseChimney,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faMapPin,
  faTriangleExclamation,
  faPeopleGroup
);

const { t } = useI18n();
const showMap = ref(false);
const showLegend = ref(true); // Legend is visible by default
const legendHeight = ref(400); // Default height
const mapComponentRef = ref<any>(null);

// Map data
const showPois = ref(true);
const showCrisis = ref(true);
const showMeetingPlaces = ref(false);
const pois = ref<PoiData[]>([]);
const crisisEvents = ref<any[]>([]);
const meetingPlaces = ref<any[]>([]);
const userLocation = ref<{latitude: number, longitude: number} | null>(null);
const householdLocation = ref<{latitude: number, longitude: number} | null>(null);

// Filter state
const isFilterMenuVisible = ref(false);
const selectedPoiType = ref<number | null>(null);
const distanceInMeters = ref(1000);
const allPois = ref<PoiData[]>([]);
const poiError = ref<string | null>(null);
const isLoadingPois = ref(false);
const isLoadingMeetings = ref(false);
const isLoadingCrisisEvents = ref(false);

// Geolocation
const {
  coords: locationCoords,
  error: locationError,
  isLoading: isLoadingLocation,
  getCurrentLocation
} = useGeolocation();

/**
 * Computed property to convert POI data to the format expected by MapComponent
 */
const convertedPois = computed(() => {
  return pois.value.map(poi => {
    // Check if poi has the convertToMapFormat method
    if (poi && typeof (poi as any).convertToMapFormat === 'function') {
      return (poi as any).convertToMapFormat();
    }
    return convertPoiData(poi);
  });
});

/**
 * Computed property to get unique POI types from all loaded POIs
 */
const poiTypes = computed(() => {
  const types = new Map();
  allPois.value.forEach((poi) => {
    const typeId = Number((poi as any).poiTypeId);
    if (!isNaN(typeId) && !types.has(typeId)) {
      types.set(typeId, (poi as any).poiTypeName || `Type ${typeId}`);
    }
  });
  return Array.from(types.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

/**
 * Toggles the map visibility
 */
const toggleMap = () => {
  showMap.value = !showMap.value;

  // Load initial data when map is first shown
  if (showMap.value) {
    loadInitialData();
  }
};

/**
 * Toggles the legend sidebar visibility
 */
const toggleLegend = () => {
  showLegend.value = !showLegend.value;
};

/**
 * Loads initial POIs and crisis events
 */
async function loadInitialData() {
  if (allPois.value.length === 0) {
    isLoadingPois.value = true;
    try {
      const loadedPois = await fetchPublicPois();
      allPois.value = [...loadedPois];
      pois.value = [...loadedPois];
      console.log("Initial POIs loaded:", pois.value.length);
    } catch (error) {
      console.error('Error loading initial POIs:', error);
      allPois.value = [];
      pois.value = [];
    } finally {
      isLoadingPois.value = false;
    }
  }

  if (crisisEvents.value.length === 0) {
    await loadCrisisEvents();
  }
}

/**
 * Loads active crisis events
 */
async function loadCrisisEvents() {
  isLoadingCrisisEvents.value = true;
  try {
    const events = await fetchActiveCrisisEvents();
    crisisEvents.value = events
      .filter((event) => event.latitude != null && event.longitude != null && event.level != null)
      .map((event) => ({
        ...event,
        latitude: Number(event.latitude),
        longitude: Number(event.longitude),
        level: Number(event.level),
      }));
  } catch (error) {
    console.error('Error loading crisis events:', error);
    crisisEvents.value = [];
  } finally {
    isLoadingCrisisEvents.value = false;
  }
}

/**
 * Fetches the user's current location
 */
async function fetchUserLocation() {
  const fetchedLocation = await getCurrentLocation();
  if (fetchedLocation) {
    userLocation.value = locationCoords.value;
    if (mapComponentRef.value && userLocation.value) {
      mapComponentRef.value.centerMap(
        userLocation.value.latitude,
        userLocation.value.longitude,
        15
      );
    }
  }
}

/**
 * Resets all filter criteria to their default values
 */
function resetFilters() {
  selectedPoiType.value = null;
  distanceInMeters.value = 1000;
  poiError.value = null;
  pois.value = [...allPois.value];
}

/**
 * Applies the selected filters to the POI list
 */
async function applyFilters() {
  poiError.value = null;
  showPois.value = true;
  const currentLocation = userLocation.value;
  const hasType = selectedPoiType.value !== null;
  const hasLocationFilter = currentLocation !== null && distanceInMeters.value > 0;

  if (!hasType && !hasLocationFilter) {
    resetFilters();
    return;
  }

  isLoadingPois.value = true;
  try {
    let fetchedResults: PoiData[] = [];
    if (hasLocationFilter && currentLocation) {
      const lat = currentLocation.latitude;
      const lon = currentLocation.longitude;
      fetchedResults = await fetchPoisNearby(
        lat,
        lon,
        distanceInMeters.value,
        selectedPoiType.value ?? undefined,
      );
    } else if (hasType && selectedPoiType.value !== null) {
      fetchedResults = await fetchPoisByType(selectedPoiType.value);
    }
    pois.value = [...fetchedResults];
  } catch (error) {
    console.error('Error applying filters:', error);
    poiError.value = t('map.filter-error', 'Error applying filters');
    pois.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

/**
 * Finds the nearest POI of the selected type
 */
async function findNearestPoi() {
  poiError.value = null;
  showPois.value = true;
  let currentLocation = userLocation.value;
  if (!currentLocation) {
    await fetchUserLocation();
    currentLocation = userLocation.value;
    if (!currentLocation) return;
  }
  if (selectedPoiType.value === null) {
    poiError.value = t('map.select-type-first', 'Please select a POI type first.');
    return;
  }

  isLoadingPois.value = true;
  try {
    const nearest = await fetchNearestPoiByType(
      selectedPoiType.value,
      currentLocation.latitude,
      currentLocation.longitude,
    );
    if (nearest) {
      pois.value = [nearest];
      if (mapComponentRef.value) {
        mapComponentRef.value.fitBoundsToUserAndPoi();
      }
    } else {
      pois.value = [];
      poiError.value = t('map.find-error', 'Could not find nearest POI of selected type');
    }
  } catch (error) {
    console.error('Error finding nearest POI:', error);
    poiError.value = t('map.find-error', 'Error finding nearest POI');
    pois.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

/**
 * Finds the nearest shelter to the user's location
 */
async function findNearestShelter() {
  poiError.value = null;
  showPois.value = true;
  let currentLocation = userLocation.value;
  if (!currentLocation) {
    await fetchUserLocation();
    currentLocation = userLocation.value;
    if (!currentLocation) return;
  }

  isLoadingPois.value = true;
  try {
    // Find shelter type in the POI types list
    const shelterType = poiTypes.value.find((type) => /shelter|tilfluktsrom/i.test(type.name));
    if (!shelterType) {
      poiError.value = t('map.no-shelter-type', 'Shelter type not found in POI list');
      isLoadingPois.value = false;
      return;
    }

    const nearest = await fetchNearestPoiByType(
      shelterType.id,
      currentLocation.latitude,
      currentLocation.longitude
    );

    if (nearest) {
      pois.value = [nearest];
      if (mapComponentRef.value) {
        mapComponentRef.value.fitBoundsToUserAndPoi();
      }
    } else {
      pois.value = [];
      poiError.value = t('map.find-error', 'Could not find nearest shelter');
    }
  } catch (error) {
    console.error('Error finding nearest shelter:', error);
    poiError.value = t('map.find-error', 'Error finding nearest shelter');
    pois.value = [];
  } finally {
    isLoadingPois.value = false;
  }
}

/**
 * Watch for meeting places visibility changes
 */
watch(
  [() => showMeetingPlaces.value, () => userLocation.value],
  async ([show, loc]) => {
    if (show && loc) {
      isLoadingMeetings.value = true;
      try {
        meetingPlaces.value = await fetchMeetingPlacesNearby(
          loc.latitude,
          loc.longitude,
          distanceInMeters.value / 1000  // Convert meters to kilometers for API
        );
      } finally {
        isLoadingMeetings.value = false;
      }
    } else {
      meetingPlaces.value = [];
    }
  },
  { immediate: true }
);

/**
 * Validate distance input
 */
watch(distanceInMeters, (val) => {
  const numVal = Number(val);
  if (isNaN(numVal)) {
    distanceInMeters.value = 1000;
    return;
  }
  if (numVal < 100) distanceInMeters.value = 100;
  else if (numVal > 50000) distanceInMeters.value = 50000;
  else if (typeof val === 'string') distanceInMeters.value = numVal;
});

/**
 * Toggle POI visibility
 */
function togglePoiVisibility() {
  showPois.value = !showPois.value;
}

/**
 * Toggle crisis visibility
 */
function toggleCrisisVisibility() {
  showCrisis.value = !showCrisis.value;
}

/**
 * Toggle meeting places visibility
 */
function toggleMeetingPlacesVisibility() {
  showMeetingPlaces.value = !showMeetingPlaces.value;
}

/**
 * Sets the legend height based on the map container and legend content
 */
onMounted(() => {
  // Set a reasonable height for the map and legend
  legendHeight.value = Math.max(window.innerHeight * 0.6, 400);

  // Update height on window resize
  window.addEventListener('resize', () => {
    legendHeight.value = Math.max(window.innerHeight * 0.6, 400);
  });

  // Adjust legend height after it's loaded to avoid scrolling
  nextTick(() => {
    if (showLegend.value) {
      const legendElement = document.querySelector('.map-legend');
      if (legendElement) {
        const contentHeight = legendElement.scrollHeight + 20; // Add some padding
        legendHeight.value = Math.max(contentHeight, 400);
      }
    }
  });
});
</script>

<style scoped>
/* Ensure smooth transitions for the legend sidebar */
.map-container {
  position: relative;
}

/* Ensure the map takes up the full height of its container */
.h-full {
  height: 100%;
}

/* Prevent content overflow */
.overflow-hidden {
  overflow: hidden;
}

/* Ensure the legend scrolls if content is too long */
.overflow-y-auto {
  overflow-y: auto;
}

/* Horizontal scrollbar styling */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thumb-orange-300::-webkit-scrollbar-thumb {
  background-color: rgb(253, 186, 116);
  border-radius: 9999px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar {
  height: 8px; /* Slightly larger for better visibility */
  width: 6px;
}

/* Hide horizontal scrollbar on mobile for the map buttons */
@media (max-width: 767px) {
  .map-buttons-container::-webkit-scrollbar:horizontal,
  .filter-buttons-container::-webkit-scrollbar:horizontal {
    display: none;
  }
}

::-webkit-scrollbar-thumb {
  background-color: rgb(253, 186, 116);
  border-radius: 9999px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Responsive button layout */
.map-buttons-container,
.filter-buttons-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 300px;
  padding-right: 8px;
  width: 100%;
}

.map-buttons-container button,
.filter-buttons-container button {
  flex-shrink: 0;
  width: 100%;
  justify-content: flex-start;
  max-width: 100%;
  white-space: normal;
  text-align: left;
}

/* Switch to horizontal layout on medium screens and above */
@media (min-width: 768px) {
  .map-buttons-container,
  .filter-buttons-container {
    flex-direction: row;
    flex-wrap: wrap;
    overflow-x: visible;
    overflow-y: visible;
    max-height: none;
    padding-right: 0;
    width: auto;
  }

  .map-buttons-container button,
  .filter-buttons-container button {
    width: auto;
    white-space: normal;
    text-align: center;
    justify-content: center;
    margin-bottom: 4px;
  }
}
</style>
