<template>
  <div class="flex flex-col w-full gap-8 pb-20">
    <!-- Notification Banner -->
    <section class="notification-banner py-3 bg-orange-100 border-b border-orange-200 w-full">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center gap-2 text-orange-800">
          <font-awesome-icon :icon="['fas', 'info-circle']" class="text-lg" />
          <p>{{ t('home.no_household.banner', 'Create a household to see ongoing crises and manage your household resources') }}</p>
          <Button
            variant="link"
            class="text-orange-800 font-medium hover:text-orange-900 p-0 h-auto"
            @click="navigateTo('/household')"
          >
            {{ t('home.no_household.create_now', 'Create now') }}
          </Button>
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
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

// Register FontAwesome icons
library.add(faInfoCircle);

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
.notification-banner {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
}
</style>
