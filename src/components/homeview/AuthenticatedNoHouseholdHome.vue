<template>
  <div class="flex flex-col w-full gap-8 pb-20">
    <!-- Notification Banner (Hero Style) -->
    <section class="hero-banner w-full px-4 mb-4">
      <div class="w-full rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out border border-orange-300 bg-gradient-to-r from-orange-50 to-white">
        <div class="p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex-grow">
              <div class="flex items-center gap-3 mb-2">
                <font-awesome-icon :icon="['fas', 'home']" class="text-2xl text-orange-600" />
                <h2 class="text-xl font-bold text-gray-800">{{ t('home.no_household.title', 'No Household Found') }}</h2>
              </div>
              <p class="mb-4 text-gray-600">{{ t('home.no_household.banner', 'Without a household, we won\'t be able to update you on active events nearby.') }}</p>
              <Button
                class="bg-orange-600 hover:bg-orange-700 text-white"
                @click="navigateTo('/household')"
              >
                {{ t('home.no_household.create_now', 'Create Household') }}
              </Button>
            </div>
            <div class="flex items-center">
              <Button
                @click="navigateTo('/crisis-event')"
                class="flex items-center gap-2 bg-white hover:bg-gray-50 border border-orange-300 text-orange-600 transition-all hover:shadow-md"
              >
                {{ t('home.national_crisis.view_all', 'See All Crisis Events') }}
                <font-awesome-icon :icon="['fas', 'arrow-right']" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Button Section -->
    <section class="map-button-section w-full px-4">
      <MapViewComponent />
    </section>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-8 px-4">
      <!-- News Section (2/5) -->
      <section class="news-section md:col-span-2 h-full flex flex-col">
        <NewsViewComponent class="flex-grow h-full" />
      </section>

      <!-- Information Sections (3/5) -->
      <section class="info-sections md:col-span-3 space-y-8">
        <!-- About Households -->
        <HouseholdInfoComponent @create="navigateTo('/household')" />

        <!-- Crisis Information -->
        <CrisisInfoComponent @learn-more="navigateTo('/info')" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import MapViewComponent from '@/components/shared/MapViewComponent.vue';
import NewsViewComponent from '@/components/shared/NewsViewComponent.vue';
import HouseholdInfoComponent from '@/components/shared/HouseholdInfoComponent.vue';
import CrisisInfoComponent from '@/components/shared/CrisisInfoComponent.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome } from '@fortawesome/free-solid-svg-icons';

// Register FontAwesome icons
library.add(faHome);

const router = useRouter();
const { t } = useI18n();

/**
 * Navigates to the specified route
 *
 * @param {string} route - The route to navigate to
 */
const navigateTo = (route: string) => {
  router.push(route);
};
</script>

<style scoped>
</style>
