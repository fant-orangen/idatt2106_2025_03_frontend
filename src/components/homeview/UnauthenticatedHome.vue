<template>
  <div class="flex flex-col w-full gap-8 pb-20">
    <!-- Hero Section -->
    <section class="hero-section py-10 md:py-16 relative overflow-hidden mt-0 w-full">
      <!-- Background with crisis colors - full width with no limit -->
      <div class="absolute inset-0 bg-gradient-to-r from-[var(--crisis-level-green)]/10 via-[var(--crisis-level-yellow)]/10 to-[var(--crisis-level-red)]/10 z-0 w-screen left-[calc(-50vw+50%)]"></div>

      <div class="max-w-4xl mx-auto text-center relative z-10 px-4">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">{{ t('home.hero.title') }}</h1>
        <p class="text-lg md:text-xl text-muted-foreground mb-8">
          {{ t('home.hero.description') }}
        </p>
        <Button size="lg" class="bg-[var(--crisis-level-green)] hover:bg-[var(--crisis-level-green)]/90 text-white" @click="navigateTo('/register')">
          {{ t('login.signup') }}
        </Button>
      </div>
    </section>

    <!-- Map Button Section -->
    <section class="map-button-section w-full px-4">
      <MapViewComponent />
    </section>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
      <!-- News Section (1/3) -->
      <section class="news-section md:col-span-1 h-full flex flex-col">
        <NewsViewComponent class="flex-grow" />
      </section>

      <!-- Information Sections (2/3) -->
      <section class="info-sections md:col-span-2 space-y-8">
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
import MapViewComponent from '@/components/shared/MapViewComponent.vue';
import NewsViewComponent from '@/components/shared/NewsViewComponent.vue';
import HouseholdInfoComponent from '@/components/shared/HouseholdInfoComponent.vue';
import CrisisInfoComponent from '@/components/shared/CrisisInfoComponent.vue';

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
}
</style>
