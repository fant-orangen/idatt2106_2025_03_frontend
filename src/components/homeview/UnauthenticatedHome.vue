<template>
  <div class="flex flex-col w-full gap-8 pb-20">
    <!-- Hero Section -->
    <section class="hero-section py-10 md:py-16 relative overflow-hidden mt-0 w-full">
      <!-- Background with crisis colors - full width with no limit -->
      <div class="absolute inset-0 bg-gradient-to-r from-[var(--crisis-level-green)]/20 via-[var(--crisis-level-yellow)]/20 to-[var(--crisis-level-red)]/20 z-0 w-screen left-[calc(-50vw+50%)] right-0"></div>

      <div class="max-w-4xl mx-auto text-center relative z-10 px-4">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">{{ t('home.hero.title') }}</h1>
        <p class="text-lg md:text-xl text-muted-foreground mb-8">
          {{ t('home.hero.description') }}
        </p>
        <Button size="lg" class="bg-[var(--crisis-level-green)] hover:bg-[var(--crisis-level-green)]/90" @click="navigateTo('/register')">
          {{ t('login.signup') }}
        </Button>
      </div>
    </section>

    <!-- Crisis Button Section -->
    <section class="crisis-button-section w-full px-4">
      <div class="w-full rounded-lg shadow-sm overflow-hidden transition-all duration-300 ease-in-out border border-orange-300">
        <div
          @click="navigateTo('/crisis-event')"
          class="w-full py-2 flex items-center cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <div class="flex items-center justify-between w-full px-6">
            <div class="flex items-center flex-1 justify-center">
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="text-2xl mr-3 text-orange-600" />
              <span class="text-lg font-medium">{{ t('home.view_crisis', 'View Crisis Events') }}</span>
            </div>
            <ChevronRight class="h-5 w-5 text-orange-600" />
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
        <HouseholdInfoComponent @create="navigateToRegisterOrHousehold" />

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
import { ChevronRight } from 'lucide-vue-next';
import MapViewComponent from '@/components/homeview/MapViewComponent.vue';
import NewsViewComponent from '@/components/homeview/NewsViewComponent.vue';
import HouseholdInfoComponent from '@/components/homeview/HouseholdInfoComponent.vue';
import CrisisInfoComponent from '@/components/homeview/CrisisInfoComponent.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

// Register FontAwesome icons
library.add(faTriangleExclamation);

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

/**
 * Navigates to the household page if logged in, otherwise to the register page
 */
const navigateToRegisterOrHousehold = () => {
  // Since this component is only shown to unauthenticated users, we always navigate to register
  router.push('/register');
};
</script>

<style scoped>
.hero-section {
  background-size: cover;
  background-position: center;
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
}

/* We're now using standard grid columns (2/5 and 3/5) */
</style>
