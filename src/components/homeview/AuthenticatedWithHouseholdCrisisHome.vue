<template>
  <div class="flex flex-col w-full gap-8 pb-20">
    <!-- Crisis Level Overview at top -->
    <section class="crisis-overview-section w-full px-4 flex justify-center pt-6 mt-4">
      <div class="w-full max-w-2xl">
        <CrisisLevelOverview :max-display="3" @select-crisis="handleCrisisSelect" />
      </div>
    </section>

    <!-- Crisis Theme Information (shown right under map when crisis in area) -->
    <section v-if="mainCrisis && mainCrisis.id" class="crisis-theme-section w-full px-4">
      <div
        class="crisis-theme-info bg-card p-6 rounded-lg"
        :class="getCrisisContainerClass(mainCrisis.severity)"
      >
        <h2 class="text-xl font-bold mb-3 flex items-center">
          <font-awesome-icon
            :icon="['fas', 'triangle-exclamation']"
            class="mr-2 w-[18px] h-[18px]"
            :class="getCrisisIconClass(mainCrisis.severity)"
          />
          {{ t('home.crisis_theme.title', 'Ongoing Crisis Scenario') }}
        </h2>
        <p class="mb-4 text-muted-foreground">
          {{
            t(
              'home.crisis_theme.description',
              'Read about this scenario and what you can do to stay safe',
            )
          }}
        </p>

        <!-- Scenario Theme Under Instructions -->
        <div
          v-if="scenarioUnderInstructions"
          class="mb-4 p-4 rounded-lg"
          :class="getCrisisContentClass(mainCrisis.severity)"
        >
          <h3 class="font-medium mb-2 text-center flex items-center justify-center gap-2">
            {{ mainCrisis.name }}
            <span
              class="text-xs px-2 py-0.5 rounded-full uppercase font-bold text-white"
              :style="{ backgroundColor: getSeverityColor(mainCrisis.severity) }"
            >
              {{ mainCrisis.severity }}
            </span>
          </h3>
          <div
            class="text-sm prose prose-sm max-w-none"
            :class="{
              'prose-a:text-[var(--crisis-level-red)]': mainCrisis.severity === 'red',
              'prose-a:text-[var(--crisis-level-yellow)]': mainCrisis.severity === 'yellow',
              'prose-a:text-[var(--crisis-level-green)]': mainCrisis.severity === 'green',
            }"
            v-html="markdownToHtml(scenarioUnderInstructions)"
          ></div>
        </div>
        <div v-else-if="loadingInstructions" class="text-center py-4">
          <div
            class="inline-block w-6 h-6 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
          ></div>
          <p class="text-sm text-muted-foreground mt-2">{{ t('common.loading', 'Loading...') }}</p>
        </div>

        <div class="mt-4 text-center">
          <Button
            variant="outline"
            class="border-[var(--crisis-level-red)]/30 text-[var(--crisis-level-red)] hover:bg-[var(--crisis-level-red)]/20 dark:hover:bg-[var(--crisis-level-red)]/40"
            :class="getCrisisButtonClass(mainCrisis.severity)"
            @click="navigateToScenarioTheme(mainCrisis.scenarioThemeId)"
          >
            {{ t('home.crisis_theme.learn_more', 'Learn More About This Crisis') }}
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
      <!-- News Section (2/5) - Shows general news -->
      <section class="news-section md:col-span-2 h-full flex flex-col">
        <NewsViewComponent class="flex-grow h-full" />
      </section>

      <!-- Information Sections (3/5) -->
      <section class="info-sections md:col-span-3 space-y-8">
        <!-- Household Supplies -->
        <div
          class="household-supplies bg-card p-6 rounded-lg border border-[var(--crisis-level-green)]/30"
        >
          <h2 class="text-xl font-bold mb-3 flex items-center">
            <font-awesome-icon
              :icon="['fas', 'box-open']"
              class="mr-2 text-[var(--crisis-level-green)] w-[18px] h-[18px]"
            />
            {{ t('household.supplies') }}
          </h2>

          <!-- Status messages about food and water -->
          <div class="mb-4">
            <div
              v-if="!daysOfFood && !daysOfWater"
              class="text-center text-gray-500 dark:text-gray-400"
            >
              {{ t('household.no-supplies', 'No supplies registered yet') }}
            </div>
            <div v-else>
              <div
                v-if="daysOfFood !== null"
                class="mb-2 p-2 rounded-md flex items-center"
                :class="getItemClasses(getFoodPriority(daysOfFood))"
              >
                <AlertTriangle
                  class="mr-2 flex-shrink-0"
                  :class="getIconClass(getFoodPriority(daysOfFood))"
                />
                <p class="text-sm">
                  {{ t('household.food-days-left', { days: Math.round(daysOfFood) }) }}
                </p>
              </div>
              <div
                v-if="daysOfWater !== null"
                class="mb-2 p-2 rounded-md flex items-center"
                :class="getItemClasses(getWaterPriority(daysOfWater))"
              >
                <AlertTriangle
                  class="mr-2 flex-shrink-0"
                  :class="getIconClass(getWaterPriority(daysOfWater))"
                />
                <p class="text-sm">
                  {{ t('household.water-days-left', { days: Math.round(daysOfWater) }) }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              class="flex-1 bg-[var(--crisis-level-green)] hover:bg-[var(--crisis-level-green)]/90"
              @click="navigateTo('/food-and-drinks')"
            >
              {{ t('household.manage-supplies', 'Manage Supplies') }}
            </Button>
            <Button
              variant="outline"
              class="flex-1 border-[var(--crisis-level-green)]/30 text-[var(--crisis-level-green)] hover:bg-[var(--crisis-level-green)]/20 dark:hover:bg-[var(--crisis-level-green)]/40"
              @click="navigateTo('/household')"
            >
              {{ t('household.view-household', 'View Household') }}
            </Button>
          </div>
        </div>

        <!-- Reflections & Groups -->
        <div
          class="reflections-groups bg-card p-6 rounded-lg border border-[var(--default-blue2)]/30"
        >
          <h2 class="text-xl font-bold mb-3 flex items-center">
            <font-awesome-icon
              :icon="['fas', 'users']"
              class="mr-2 text-[var(--default-blue2)] w-[18px] h-[18px]"
            />
            {{ t('home.community.title', 'Community Features') }}
          </h2>
          <p class="mb-4 text-muted-foreground">
            {{
              t('home.community.description', 'Share experiences and resources with your community')
            }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div
              class="text-center p-4 bg-[var(--default-blue2)]/10 rounded-lg border border-[var(--default-blue2)]/20"
            >
              <h3 class="font-medium mb-2">{{ t('home.reflections.title', 'Reflections') }}</h3>
              <p class="text-sm text-muted-foreground mb-3">
                {{
                  t('home.reflections.description', 'Share your experiences and learn from others')
                }}
              </p>
              <Button
                variant="outline"
                class="w-full border-[var(--default-blue2)]/30 text-[var(--default-blue2)] hover:bg-[var(--default-blue)]/5 dark:hover:bg-[var(--default-blue)]/40"
                @click="navigateTo('/reflections')"
              >
                {{ t('home.reflections.view', 'View Reflections') }}
                <ChevronRight class="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div
              class="text-center p-4 bg-[var(--default-blue2)]/10 rounded-lg border border-[var(--default-blue2)]/20"
            >
              <h3 class="font-medium mb-2">{{ t('home.groups.title', 'Groups') }}</h3>
              <p class="text-sm text-muted-foreground mb-3">
                {{
                  t(
                    'home.groups.description',
                    'Collaborate and share resources with other households',
                  )
                }}
              </p>
              <Button
                variant="outline"
                class="w-full border-[var(--default-blue2)]/30 text-[var(--default-blue2)] hover:bg-[var(--default-blue)]/5 dark:hover:bg-[var(--default-blue)]/40"
                @click="navigateTo('/group')"
              >
                {{ t('home.groups.view', 'View Groups') }} <ChevronRight class="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <QuizHomeViewComponent />
        <!-- Empty space for layout consistency -->
        <div v-if="!mainCrisis || !mainCrisis.id" class="h-4"></div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-vue-next'
import { AlertTriangle } from 'lucide-vue-next'
import MapViewComponent from '@/components/homeview/MapViewComponent.vue'
import NewsViewComponent from '@/components/homeview/NewsViewComponent.vue'

import CrisisLevelOverview from '@/components/homeview/CrisisLevelOverview.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faTriangleExclamation,
  faBoxOpen,
  faUsers,
  faArrowRight,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import { inventoryService } from '@/services/InventoryService'
import { fetchCrisisEventsInRadius, fetchCrisisEventById } from '@/services/CrisisEventService'
import { fetchScenarioThemeUnderInstructions } from '@/services/api/ScenarioThemeService'
import { getSeverityColor } from '@/utils/severityUtils'
import { marked } from 'marked'
import type { CrisisEventPreviewDto } from '@/models/CrisisEvent'
import QuizHomeViewComponent from '../gamification/quiz/QuizHomeViewComponent.vue'

// Register FontAwesome icons
library.add(faTriangleExclamation, faBoxOpen, faUsers, faArrowRight, faCheckCircle)

const router = useRouter()
const { t } = useI18n()

// State
const daysOfFood = ref<number | null>(null)
const daysOfWater = ref<number | null>(null)
const mainCrisis = ref<CrisisEventPreviewDto | null>(null)
const scenarioUnderInstructions = ref<string | null>(null)
const loadingInstructions = ref(false)

// Configure marked with essential options (copied from ThemeContent.vue)
marked.setOptions({
  gfm: true,
  breaks: true,
})

// Custom renderer for headers (copied from ThemeContent.vue)
const renderer = new marked.Renderer()
renderer.heading = function ({ tokens, depth }) {
  const text = tokens
    .map((t) => (typeof t === 'object' && 'text' in t && typeof t.text === 'string' ? t.text : ''))
    .join('')
  const fontSize = depth === 1 ? '3xl' : depth === 2 ? '2xl' : depth === 3 ? 'xl' : 'lg'
  return `<h${depth} class="text-${fontSize} font-bold my-4">${text}</h${depth}>`
}

// Priority levels for color coding
enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  GOOD = 'good',
}

/**
 * Returns the priority level based on days of food remaining
 * @param {number} days - Number of days of food remaining
 * @returns {Priority} Priority level
 */
const getFoodPriority = (days: number): Priority => {
  if (days < 3) return Priority.HIGH
  if (days < 7) return Priority.MEDIUM
  if (days < 14) return Priority.LOW
  return Priority.GOOD
}

/**
 * Returns the priority level based on days of water remaining
 * @param {number} days - Number of days of water remaining
 * @returns {Priority} Priority level
 */
const getWaterPriority = (days: number): Priority => {
  if (days < 3) return Priority.HIGH
  if (days < 7) return Priority.MEDIUM
  if (days < 14) return Priority.LOW
  return Priority.GOOD
}

/**
 * Returns CSS classes for styling items based on their priority level
 * @param {Priority} priority - Priority level of the item
 * @returns {string} CSS classes for styling
 */
const getItemClasses = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    case Priority.MEDIUM:
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    case Priority.LOW:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    case Priority.GOOD:
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
  }
}

/**
 * Returns CSS classes for styling icons based on priority level
 * @param {Priority} priority - Priority level of the item
 * @returns {string} CSS classes for icon styling
 */
const getIconClass = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'text-red-700 dark:text-red-300'
    case Priority.MEDIUM:
      return 'text-orange-700 dark:text-orange-300'
    case Priority.LOW:
      return 'text-yellow-700 dark:text-yellow-300'
    case Priority.GOOD:
      return 'text-green-700 dark:text-green-300'
    default:
      return 'text-gray-700 dark:text-gray-300'
  }
}

/**
 * Navigates to the specified route
 *
 * @param {string} route - The route to navigate to
 */
const navigateTo = (route: string) => {
  router.push(route)
}

/**
 * Navigates to the scenario theme page for the given theme ID
 * @param {number} themeId - The ID of the scenario theme to navigate to
 */
const navigateToScenarioTheme = (themeId: number) => {
  if (!themeId) {
    console.error('No theme ID provided')
    return
  }

  router.push({
    name: 'ScenarioTheme',
    params: { id: themeId.toString() },
  })
}

/**
 * Fetches the 'under' instructions for the current crisis scenario theme
 */
const fetchScenarioInstructions = async () => {
  if (!mainCrisis.value?.scenarioThemeId) return

  loadingInstructions.value = true
  try {
    const instructions = await fetchScenarioThemeUnderInstructions(mainCrisis.value.scenarioThemeId)
    scenarioUnderInstructions.value = instructions
  } catch (error) {
    console.error('Failed to fetch scenario instructions:', error)
    scenarioUnderInstructions.value = null
  } finally {
    loadingInstructions.value = false
  }
}

/**
 * Converts markdown text to HTML
 * @param {string} markdown - The markdown text to convert
 * @returns {string} The HTML representation of the markdown
 */
const markdownToHtml = (markdown: string): string => {
  if (!markdown) return ''
  return marked.parse(markdown, { renderer }) as string
}

/**
 * Returns CSS classes for the crisis container based on severity
 * @param {string} severity - The severity level (red, yellow, green)
 * @returns {string} CSS classes for the container
 */
const getCrisisContainerClass = (severity: string): string => {
  switch (severity) {
    case 'red':
      return 'border border-[var(--crisis-level-red)]/30'
    case 'yellow':
      return 'border border-[var(--crisis-level-yellow)]/30'
    case 'green':
      return 'border border-[var(--crisis-level-green)]/30'
    default:
      return 'border border-[var(--crisis-level-red)]/30'
  }
}

/**
 * Returns CSS classes for the crisis content area based on severity
 * @param {string} severity - The severity level (red, yellow, green)
 * @returns {string} CSS classes for the content area
 */
const getCrisisContentClass = (severity: string): string => {
  switch (severity) {
    case 'red':
      return 'bg-[var(--crisis-level-red)]/10 border border-[var(--crisis-level-red)]/20'
    case 'yellow':
      return 'bg-[var(--crisis-level-yellow)]/10 border border-[var(--crisis-level-yellow)]/20'
    case 'green':
      return 'bg-[var(--crisis-level-green)]/10 border border-[var(--crisis-level-green)]/20'
    default:
      return 'bg-[var(--crisis-level-red)]/10 border border-[var(--crisis-level-red)]/20'
  }
}

/**
 * Returns CSS classes for the crisis icon based on severity
 * @param {string} severity - The severity level (red, yellow, green)
 * @returns {string} CSS classes for the icon
 */
const getCrisisIconClass = (severity: string): string => {
  switch (severity) {
    case 'red':
      return 'text-[var(--crisis-level-red)]'
    case 'yellow':
      return 'text-[var(--crisis-level-yellow)]'
    case 'green':
      return 'text-[var(--crisis-level-green)]'
    default:
      return 'text-[var(--crisis-level-red)]'
  }
}

/**
 * Returns CSS classes for the crisis button based on severity
 * @param {string} severity - The severity level (red, yellow, green)
 * @returns {string} CSS classes for the button
 */
const getCrisisButtonClass = (severity: string): string => {
  switch (severity) {
    case 'red':
      return 'border-[var(--crisis-level-red)]/30 text-[var(--crisis-level-red)] hover:bg-[var(--crisis-level-red)]/5'
    case 'yellow':
      return 'border-[var(--crisis-level-yellow)]/30 text-[var(--crisis-level-yellow)] hover:bg-[var(--crisis-level-yellow)]/5'
    case 'green':
      return 'border-[var(--crisis-level-green)]/30 text-[var(--crisis-level-green)] hover:bg-[var(--crisis-level-green)]/5'
    default:
      return 'border-[var(--crisis-level-red)]/30 text-[var(--crisis-level-red)] hover:bg-[var(--crisis-level-red)]/5'
  }
}

/**
 * Handles the selection of a crisis from the CrisisLevelOverview component
 * @param {number} crisisId - The ID of the selected crisis
 */
const handleCrisisSelect = (crisisId: number) => {
  router.push({
    path: '/crisis-event',
    query: { id: crisisId.toString() },
  })
}

/**
 * Fetches the main crisis event (highest severity)
 */
const fetchMainCrisis = async () => {
  try {
    console.log('Fetching crisis events in radius')
    const response = await fetchCrisisEventsInRadius(0, 4)
    if (response.content.length > 0) {
      // Sort by severity (red > yellow > green)
      const sorted = [...response.content].sort((a, b) => {
        const severityRank = { red: 3, yellow: 2, green: 1 }
        return (
          (severityRank[b.severity as keyof typeof severityRank] || 0) -
          (severityRank[a.severity as keyof typeof severityRank] || 0)
        )
      })

      // Fetch full details of the highest severity crisis
      const fullDetails = await fetchCrisisEventById(sorted[0].id)
      if (fullDetails) {
        mainCrisis.value = fullDetails
        console.log('Main crisis found:', mainCrisis.value.name)
      } else {
        console.log('No crisis details found')
        mainCrisis.value = null
      }
    } else {
      console.log('No crisis in radius')
      mainCrisis.value = null
    }
  } catch (error) {
    console.error('Failed to fetch main crisis:', error)
    mainCrisis.value = null
  }
}

/**
 * Fetches the days remaining for food and water from the backend
 */
const fetchDaysRemaining = async () => {
  try {
    const [foodDays, waterDays] = await Promise.all([
      inventoryService.getFoodDaysRemaining(),
      inventoryService.getWaterDaysRemaining(),
    ])
    daysOfFood.value = foodDays
    daysOfWater.value = waterDays
  } catch (error) {
    console.error('Error fetching days remaining:', error)
  }
}

// Watch for changes in mainCrisis to fetch scenario instructions
watch(
  () => mainCrisis.value?.id,
  (newId) => {
    if (newId) {
      fetchScenarioInstructions()
    } else {
      scenarioUnderInstructions.value = null
    }
  },
)

// Initialize data on component mount
onMounted(async () => {
  await Promise.all([fetchMainCrisis(), fetchDaysRemaining()])
})
</script>
