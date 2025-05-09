<template>
  <div class="flex flex-col w-full gap-8 pb-20">
    <!-- Notification Banner (Hero Style) -->
    <section
      class="relative overflow-hidden mt-0 w-screen ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] py-6 md:py-8 bg-cover bg-center"
    >
      <!-- Background with crisis colors - full width with no limit -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-[var(--crisis-level-green)]/20 via-[var(--crisis-level-yellow)]/20 to-[var(--crisis-level-red)]/20 z-0 w-screen left-[calc(-50vw+50%)] right-0"
      ></div>

      <div class="relative z-10 px-4 w-full max-w-7xl mx-auto">
        <div
          class="w-full rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out border border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80"
        >
          <div class="p-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex-grow">
                <div class="flex items-center gap-3 mb-2">
                  <font-awesome-icon
                    :icon="['fas', 'home']"
                    class="text-2xl text-[var(--crisis-level-green)]"
                  />
                  <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {{ t('home.no_household.title', 'No Household Found') }}
                  </h2>
                </div>
                <p class="mb-4 text-gray-600 dark:text-gray-200">
                  {{
                    t(
                      'home.no_household.banner',
                      "Without a household, we won't be able to update you on active events nearby.",
                    )
                  }}
                </p>
                <Button
                  class="bg-[var(--crisis-level-green)] hover:bg-[var(--crisis-level-green)]/75"
                  @click="navigateTo('/household')"
                >
                  {{ t('home.no_household.create_now', 'Create Household') }}
                </Button>
              </div>
              <div class="flex items-center">
                <Button
                  @click="navigateTo('/crisis-event')"
                  class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-[var(--crisis-level-red)]/30 text-[var(--crisis-level-red)] transition-all"
                >
                  {{ t('home.national_crisis.view_all', 'See All Crisis Events') }}
                  <font-awesome-icon :icon="['fas', 'arrow-right']" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Button Section -->
    <section class="w-full px-4">
      <MapViewComponent />
    </section>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-8 px-4">
      <!-- News Section (2/5) -->
      <section class="md:col-span-2 h-full flex flex-col">
        <NewsViewComponent class="flex-grow h-full" />
      </section>

      <!-- Information Sections (3/5) -->
      <section class="md:col-span-3 space-y-8">
        <!-- About Households -->
        <HouseholdInfoComponent @create="navigateTo('/household')" />

        <!-- Crisis Information -->
        <CrisisInfoComponent @learn-more="navigateTo('/info')" />

        <QuizHomeViewComponent />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import MapViewComponent from '@/components/homeview/MapViewComponent.vue'
import NewsViewComponent from '@/components/homeview/NewsViewComponent.vue'
import HouseholdInfoComponent from '@/components/homeview/HouseholdInfoComponent.vue'
import CrisisInfoComponent from '@/components/homeview/CrisisInfoComponent.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHome, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import QuizHomeViewComponent from '../gamification/quiz/QuizHomeViewComponent.vue'

// Register FontAwesome icons
library.add(faHome, faArrowRight)

const router = useRouter()
const { t } = useI18n()

/**
 * Navigates to the specified route
 *
 * @param {string} route - The route to navigate to
 */
const navigateTo = (route: string) => {
  router.push(route)
}
</script>
