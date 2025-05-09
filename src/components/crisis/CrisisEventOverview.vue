<template>
  <div class="container mx-auto p-4">

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Map Area -->
      <Card class="lg:col-span-2 z-50">
        <CardHeader class="pb-2 flex justify-center">
          <CardTitle class="text-2xl font-bold">{{ selectedCrisis ? selectedCrisis.name : t('crisis.map_view', 'Map View') }}</CardTitle>
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
      <Card class="flex flex-col h-full">
        <CardHeader class="pb-2">

          <!-- Search Component -->
          <div class="relative w-full mb-4">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Search crisis events..."
              class="w-full pl-10 py-3 text-base h-10"
              @input="handleSearch"
            />
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          <!-- Crisis Filter Buttons -->
          <div class="grid grid-cols-3 gap-2">
            <Button
              :variant="selectedFilter === 'history' ? 'default' : 'outline'"
              @click="setFilter('history')"
            >
              {{ t('crisis.historical', 'History') }}
            </Button>

            <Button
              :variant="selectedFilter === 'nearby' ? 'default' : 'outline'"
              @click="setFilter('nearby')"
            >
              {{ t('crisis.for_you', 'In Your Area') }}
            </Button>

            <Button
              :variant="selectedFilter === 'active' ? 'default' : 'outline'"
              @click="setFilter('active')"
            >
              {{ t('crisis.active', 'Active') }}
            </Button>
          </div>

          <!-- Error message for 'For You' when not logged in -->
          <div v-if="nearbyError" class="mt-2 text-sm text-red-500 px-2">
            {{ nearbyError }}
          </div>
        </CardHeader>
        <CardContent class="p-0 flex-grow">
          <ScrollArea className="h-[400px] px-4">
            <InfiniteScroll
              :isLoading="loading"
              :hasMore="hasMore"
              :loadingText="t('crisis.loading_more', 'Loading more events...')"
              :endMessage="t('crisis.no_more_events', 'No more events to load')"
              @load-more="loadCrisisEvents"
            >
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
                      <Badge :style="{ backgroundColor: getSeverityColor(event.severity) }">
                        {{ event.severity.toUpperCase() }}
                      </Badge>
                    </div>
                    <p class="text-sm text-muted-foreground mt-1">
                      {{ formatDateFull(event.startTime) }}
                    </p>
                  </div>
                </div>
              </div>
            </InfiniteScroll>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>

    <div v-if="selectedCrisis" class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div class="lg:col-span-1">
        <CrisisDetails :crisis="selectedCrisis" />
      </div>

      <CrisisEventHistory
        :crisis-id="selectedCrisis.id"
        :key="`history-${selectedCrisis.id}`"
      />

      <NewsOverview
        :crisis-id="selectedCrisis.id"
        :title="t('news.related_news', 'Related News')"
        :page-size="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { CrisisEventDto, CrisisEventPreviewDto } from '@/models/CrisisEvent.ts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StaticMapWithCircle from '@/components/map/StaticMapWithCircle.vue';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import CrisisDetails from '@/components/crisis/CrisisDetails.vue';
import CrisisEventHistory from '@/components/crisis/CrisisEventHistory.vue';
import NewsOverview from './NewsOverview.vue';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { watch } from 'vue';
import {formatDateFull} from '@/utils/dateUtils.ts';
import { getSeverityClass, getSeverityColor } from '@/utils/severityUtils';
import { Search } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/composables/useGeolocation.ts';
import { useUserStore } from '@/stores/UserStore';
import { getCurrentHousehold } from '@/services/HouseholdService';

import {
  fetchAllPreviewCrisisEvents,
  fetchCrisisEventById,
  fetchInactivePreviewCrisisEvents,
  fetchCrisisEventsInRadius,
  searchCrisisEvents
} from '@/services/CrisisEventService.ts';

/**
 * @component CrisisEventOverview
 * @description This is the main component for displaying crisis events. It includes:
 * - A map view showing the selected crisis event's location
 * - A list of active crisis events that can be selected
 * - Detailed information about the selected crisis
 * - A history of changes made to the crisis event
 * - Related news articles
 *
 *
 */

const router = useRouter();
const crisisEvents = ref<CrisisEventPreviewDto[]>([]);
const { t } = useI18n();
const selectedCrisis = ref<CrisisEventDto | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const nearbyError = ref<string | null>(null);
const page = ref(0);
const size = 10;
const hasMore = ref(true);
const searchQuery = ref('');
const selectedFilter = ref('active'); // Default to active events
const { coords } = useGeolocation();
const userStore = useUserStore();

// Debounce search to avoid too many API calls
let searchTimeout: number | null = null;

/**
 * Loads a page of crisis events based on the selected filter
 */
const loadCrisisEvents = async () => {
  if (loading.value || !hasMore.value) return;

  try {
    loading.value = true;
    error.value = null;
    nearbyError.value = null;

    let response;

    switch (selectedFilter.value) {
      case 'active':
        // For active events, search in active events
        if (searchQuery.value.trim()) {
          response = await searchCrisisEvents(searchQuery.value, page.value, size, true);
        } else {
          response = await fetchAllPreviewCrisisEvents(page.value, size);
        }
        break;
      case 'history':
        // For history, search in inactive events
        if (searchQuery.value.trim()) {
          response = await searchCrisisEvents(searchQuery.value, page.value, size, false);
        } else {
          response = await fetchInactivePreviewCrisisEvents(page.value, size);
        }
        break;
      case 'nearby':
        // Check if user is logged in
        if (!userStore.loggedIn) {
          nearbyError.value = t('crisis.login_required', 'Please log in to see events near you');
          // Fallback to active events if not logged in
          if (searchQuery.value.trim()) {
            response = await searchCrisisEvents(searchQuery.value, page.value, size, true);
          } else {
            response = await fetchAllPreviewCrisisEvents(page.value, size);
          }
          break;
        }

        // Check if user is in a household
        try {
          const household = await getCurrentHousehold();
          if (!household) {
            nearbyError.value = t('crisis.household_required', 'You need to be in a household to see events in your area');
            // Fallback to active events if not in a household
            if (searchQuery.value.trim()) {
              response = await searchCrisisEvents(searchQuery.value, page.value, size, true);
            } else {
              response = await fetchAllPreviewCrisisEvents(page.value, size);
            }
            break;
          }
        } catch (err) {
          console.error('Error checking household:', err);
          nearbyError.value = t('crisis.error_checking_household', 'Error checking household status');
          // Fallback to active events if there's an error
          if (searchQuery.value.trim()) {
            response = await searchCrisisEvents(searchQuery.value, page.value, size, true);
          } else {
            response = await fetchAllPreviewCrisisEvents(page.value, size);
          }
          break;
        }

        // User is logged in and in a household, show nearby events
        response = await fetchCrisisEventsInRadius(page.value, size);
        break;
      default:
        // Default to active events
        if (searchQuery.value.trim()) {
          response = await searchCrisisEvents(searchQuery.value, page.value, size, true);
        } else {
          response = await fetchAllPreviewCrisisEvents(page.value, size);
        }
        break;
    }

    console.log(`Crisis events page (${selectedFilter.value}):`, response);

    crisisEvents.value.push(...response.content);
    page.value++;
    hasMore.value = page.value < response.totalPages;
  } catch (err) {
    console.error('Failed to fetch crisis events:', err);
    error.value = t('crisis.error_loading_events', 'Failed to load crisis events');
  } finally {
    loading.value = false;
  }
};

/**
 * Sets the filter type and reloads crisis events
 */
const setFilter = async (filter: string) => {
  if (selectedFilter.value === filter) return;

  selectedFilter.value = filter;
  crisisEvents.value = [];
  page.value = 0;
  hasMore.value = true;
  await loadCrisisEvents();
};

/**
 * Handles search input changes
 */
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    // Keep the current filter but reset the data
    crisisEvents.value = [];
    page.value = 0;
    hasMore.value = true;
    await loadCrisisEvents();
  }, 300) as unknown as number;
};

/**
 * Fetch crisis events when the component is mounted
 * and select the first one by default
 */
onMounted(async () => {
  try {
    await loadCrisisEvents();

    // Check if there's a crisis ID in the URL query parameter
    const crisisIdFromQuery = router.currentRoute.value.query.id;

    if (crisisIdFromQuery && typeof crisisIdFromQuery === 'string') {
      // If there's a crisis ID in the URL, select that crisis
      const crisisId = parseInt(crisisIdFromQuery, 10);
      if (!isNaN(crisisId)) {
        await fetchAndSelectCrisis(crisisId);
      }
    } else if (crisisEvents.value.length > 0 && !selectedCrisis.value) {
      // Otherwise, select the first crisis
      await fetchAndSelectCrisis(crisisEvents.value[0].id);
    }
  } catch (error) {
    console.error('Failed to fetch crisis events:', error);
  }
});

/**
 * Fetches detailed information about a specific crisis event and selects it
 *
 * @param crisisId - The ID of the crisis event to fetch and select
 */
const fetchAndSelectCrisis = async (crisisId: number) => {
  if (!crisisId) return;
  try {
    loading.value = true;
    error.value = null;
    const crisisDetails = await fetchCrisisEventById(crisisId);
    if (crisisDetails) {
      selectedCrisis.value = crisisDetails;
    } else {
      error.value = t('crisis.error_loading_details', 'Failed to load event details');
    }
  } catch (err) {
    console.error('Error loading crisis details:', err);
    error.value = t('crisis.error_loading_details', 'Failed to load event details');
  } finally {
    loading.value = false;
  }
};

/**
 * Computed property that formats map data for the selected crisis
 * Extracts coordinates, radius, and determines color based on severity
 */
const mapData = computed(() => {
  if (!selectedCrisis.value) {
    return null;
  }
  const radiusInKm = typeof selectedCrisis.value.radius === 'number' ? selectedCrisis.value.radius : null;
  const lat = selectedCrisis.value.epicenterLatitude;
  const lng = selectedCrisis.value.epicenterLongitude;
  return {
    lat: lat,
    lng: lng,
    radius: radiusInKm !== null ? radiusInKm * 1000 : null,
    color: getSeverityColor(selectedCrisis.value.severity)
  };
});

/**
 * Watch for changes to map data for debugging purposes
 */
watch(mapData, (newVal) => {
  console.log('mapData updated:', newVal);
});

/**
 * Handles selection of a crisis event from the list
 *
 * @param event - The crisis event that was selected
 */
const handleCrisisSelect = (event: CrisisEventPreviewDto | CrisisEventDto) => {
  // Update the URL with the selected crisis ID
  router.replace({
    path: router.currentRoute.value.path,
    query: { id: event.id.toString() }
  });

  fetchAndSelectCrisis(event.id);
};
</script>
