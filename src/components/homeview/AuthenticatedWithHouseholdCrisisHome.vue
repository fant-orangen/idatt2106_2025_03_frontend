<template>
  <div class="flex flex-col w-full gap-8 pb-20">
    <!-- Crisis Level Overview at top -->
    <section class="crisis-overview-section w-full px-4 flex justify-center pt-6 mt-4">
      <div class="w-full max-w-2xl">
        <CrisisLevelOverview
          :max-display="3"
          @select-crisis="handleCrisisSelect"
        />
      </div>
    </section>

    <!-- Map Button Section -->
    <section class="map-button-section w-full px-4">
      <MapViewComponent />
    </section>

    <!-- Crisis Theme Information (shown right under map when crisis in area) -->
    <section v-if="mainCrisis && mainCrisis.id" class="crisis-theme-section w-full px-4">
      <div class="crisis-theme-info bg-card p-6 rounded-lg border border-[var(--crisis-level-red)]/30">
        <h2 class="text-xl font-bold mb-3 flex items-center">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="mr-2 text-[var(--crisis-level-red)]" />
          {{ t('home.crisis_theme.title', 'Current Crisis Information') }}
        </h2>
        <p class="mb-4 text-muted-foreground">
          {{ t('home.crisis_theme.read_more_specific', 'Read more about {crisisType} here', { crisisType: mainCrisis.name }) }}
        </p>

        <div class="mt-4 text-center">
          <Button
            variant="outline"
            class="border-[var(--crisis-level-red)]/30 text-[var(--crisis-level-red)] hover:bg-[var(--crisis-level-red)]/5"
            @click="navigateToScenarioTheme(mainCrisis.id)"
          >
            {{ t('home.crisis_theme.learn_more', 'Learn More About This Crisis') }}
          </Button>
        </div>
      </div>
    </section>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-8 px-4">
      <!-- News Section (2/5) - Shows general news -->
      <section class="news-section md:col-span-2 h-full flex flex-col">
        <NewsViewComponent class="flex-grow h-full" />
      </section>

      <!-- Information Sections (3/5) -->
      <section class="info-sections md:col-span-3 space-y-8">
        <!-- Household Supplies -->
        <div class="household-supplies bg-card p-6 rounded-lg border border-[var(--crisis-level-green)]/30">
          <h2 class="text-xl font-bold mb-3 flex items-center">
            <font-awesome-icon :icon="['fas', 'box-open']" class="mr-2 text-[var(--crisis-level-green)]" />
            {{ t('home.household.supplies', 'Household Supplies') }}
          </h2>

          <!-- Status messages about food and water -->
          <div class="mb-4">
            <div v-if="!daysOfFood && !daysOfWater" class="text-center text-gray-500">
              {{ t('household.no-supplies', 'No supplies registered yet') }}
            </div>
            <div v-else>
              <div
                v-if="daysOfFood !== null"
                class="mb-2 p-2 rounded-md flex items-center"
                :class="getItemClasses(getFoodPriority(daysOfFood))"
              >
                <AlertTriangle class="mr-2 flex-shrink-0" :class="getIconClass(getFoodPriority(daysOfFood))" />
                <p class="text-sm">
                  {{ t('household.food-days-left', { days: Math.round(daysOfFood) }) }}
                </p>
              </div>
              <div
                v-if="daysOfWater !== null"
                class="mb-2 p-2 rounded-md flex items-center"
                :class="getItemClasses(getWaterPriority(daysOfWater))"
              >
                <AlertTriangle class="mr-2 flex-shrink-0" :class="getIconClass(getWaterPriority(daysOfWater))" />
                <p class="text-sm">
                  {{ t('household.water-days-left', { days: Math.round(daysOfWater) }) }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              class="flex-1 bg-[var(--crisis-level-green)] hover:bg-[var(--crisis-level-green)]/90 text-white"
              @click="navigateTo('/food-and-drinks')"
            >
              {{ t('household.manage-supplies', 'Manage Supplies') }}
            </Button>
            <Button
              variant="outline"
              class="flex-1 border-[var(--crisis-level-green)]/30 text-[var(--crisis-level-green)] hover:bg-[var(--crisis-level-green)]/5"
              @click="navigateTo('/household')"
            >
              {{ t('household.view-household', 'View Household') }}
            </Button>
          </div>
        </div>

        <!-- Reflections & Groups -->
        <div class="reflections-groups bg-card p-6 rounded-lg border border-[var(--default-blue)]/30">
          <h2 class="text-xl font-bold mb-3 flex items-center">
            <font-awesome-icon :icon="['fas', 'users']" class="mr-2 text-[var(--default-blue)]" />
            {{ t('home.community.title', 'Community Features') }}
          </h2>
          <p class="mb-4 text-muted-foreground">{{ t('home.community.description', 'Share experiences and resources with your community') }}</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div class="text-center p-4 bg-[var(--default-blue)]/10 rounded-lg border border-[var(--default-blue)]/20">
              <h3 class="font-medium mb-2">{{ t('home.reflections.title', 'Reflections') }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t('home.reflections.description', 'Share your experiences and learn from others') }}</p>
              <Button
                variant="outline"
                class="w-full border-[var(--default-blue)]/30 text-[var(--default-blue)] hover:bg-[var(--default-blue)]/5"
                @click="navigateTo('/reflections')"
              >
                {{ t('home.reflections.view', 'View Reflections') }}
              </Button>
            </div>
            <div class="text-center p-4 bg-[var(--default-blue)]/10 rounded-lg border border-[var(--default-blue)]/20">
              <h3 class="font-medium mb-2">{{ t('home.groups.title', 'Groups') }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t('home.groups.description', 'Collaborate and share resources with other households') }}</p>
              <Button
                variant="outline"
                class="w-full border-[var(--default-blue)]/30 text-[var(--default-blue)] hover:bg-[var(--default-blue)]/5"
                @click="navigateTo('/groups')"
              >
                {{ t('home.groups.view', 'View Groups') }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Empty space for layout consistency -->
        <div v-if="!mainCrisis || !mainCrisis.id" class="h-4"></div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-vue-next';
import MapViewComponent from '@/components/shared/MapViewComponent.vue';
import NewsViewComponent from '@/components/shared/NewsViewComponent.vue';

import CrisisLevelOverview from '@/components/homeview/CrisisLevelOverview.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTriangleExclamation, faBoxOpen, faUsers, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { inventoryService } from '@/services/InventoryService';
import { fetchCrisisEventsInRadius } from '@/services/CrisisEventService';
import type { CrisisEventPreviewDto } from '@/models/CrisisEvent';

// Register FontAwesome icons
library.add(faTriangleExclamation, faBoxOpen, faUsers, faArrowRight, faCheckCircle);

const router = useRouter();
const { t } = useI18n();

// State
const daysOfFood = ref<number | null>(null);
const daysOfWater = ref<number | null>(null);
const mainCrisis = ref<CrisisEventPreviewDto | null>(null);


// Priority levels for color coding
enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  GOOD = 'good'
}

/**
 * Returns the priority level based on days of food remaining
 * @param {number} days - Number of days of food remaining
 * @returns {Priority} Priority level
 */
const getFoodPriority = (days: number): Priority => {
  if (days < 3) return Priority.HIGH;
  if (days < 7) return Priority.MEDIUM;
  if (days < 14) return Priority.LOW;
  return Priority.GOOD;
};

/**
 * Returns the priority level based on days of water remaining
 * @param {number} days - Number of days of water remaining
 * @returns {Priority} Priority level
 */
const getWaterPriority = (days: number): Priority => {
  if (days < 3) return Priority.HIGH;
  if (days < 7) return Priority.MEDIUM;
  if (days < 14) return Priority.LOW;
  return Priority.GOOD;
};

/**
 * Returns CSS classes for an item based on its priority
 * @param {Priority} priority - The priority level
 * @returns {string} CSS classes
 */
const getItemClasses = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'bg-red-100 text-red-700';
    case Priority.MEDIUM:
      return 'bg-orange-100 text-orange-700';
    case Priority.LOW:
      return 'bg-yellow-100 text-yellow-700';
    case Priority.GOOD:
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Returns CSS classes for an icon based on its priority
 * @param {Priority} priority - The priority level
 * @returns {string} CSS classes
 */
const getIconClass = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'text-red-700';
    case Priority.MEDIUM:
      return 'text-orange-700';
    case Priority.LOW:
      return 'text-yellow-700';
    case Priority.GOOD:
      return 'text-green-700';
    default:
      return 'text-gray-700';
  }
};

/**
 * Navigates to the specified route
 *
 * @param {string} route - The route to navigate to
 */
const navigateTo = (route: string) => {
  router.push(route);
};

/**
 * Navigates to the scenario theme page for the given theme ID
 * @param {number} themeId - The ID of the scenario theme to navigate to
 */
const navigateToScenarioTheme = (themeId: number) => {
  if (!themeId) {
    console.error('No theme ID provided');
    return;
  }

  router.push({
    name: 'ScenarioTheme',
    params: { id: themeId.toString() }
  });
};

/**
 * Handles the selection of a crisis from the CrisisLevelOverview component
 * @param {number} crisisId - The ID of the selected crisis
 */
const handleCrisisSelect = (crisisId: number) => {
  router.push({
    path: '/crisis-event',
    query: { id: crisisId.toString() }
  });
};

/**
 * Fetches the main crisis event (highest severity)
 */
const fetchMainCrisis = async () => {
  try {
    console.log("Fetching crisis events in radius");
    const response = await fetchCrisisEventsInRadius(0, 4);
    if (response.content.length > 0) {
      // Sort by severity (red > yellow > green)
      const sorted = [...response.content].sort((a, b) => {
        const severityRank = { red: 3, yellow: 2, green: 1 };
        return (severityRank[b.severity as keyof typeof severityRank] || 0) -
               (severityRank[a.severity as keyof typeof severityRank] || 0);
      });

      mainCrisis.value = sorted[0];
      console.log("Main crisis found:", mainCrisis.value.name);
    } else {
      console.log("No crisis in radius");
      mainCrisis.value = null;
    }
  } catch (error) {
    console.error('Failed to fetch main crisis:', error);
    mainCrisis.value = null;
  }
};

/**
 * Format a date in full format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
const formatDateFull = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Fetches the days remaining for food and water from the backend
 */
const fetchDaysRemaining = async () => {
  try {
    const [foodDays, waterDays] = await Promise.all([
      inventoryService.getFoodDaysRemaining(),
      inventoryService.getWaterDaysRemaining()
    ]);
    daysOfFood.value = foodDays;
    daysOfWater.value = waterDays;
  } catch (error) {
    console.error('Error fetching days remaining:', error);
  }
};

// Initialize data on component mount
onMounted(async () => {
  await Promise.all([
    fetchMainCrisis(),
    fetchDaysRemaining()
  ]);
});
</script>

<style scoped>
.mr-2 {
  width: 18px;
  height: 18px;
}

.notification-banner {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
}
</style>
