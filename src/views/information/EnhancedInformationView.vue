<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EnhancedInformationView'
})
</script>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EnhancedSidebar from '@/components/information/EnhancedSidebar.vue'
import ThemeContent from '@/components/information/ThemeContent.vue'
import { fetchAllScenarioThemes } from '@/services/api/ScenarioThemeService'
import type { ScenarioThemeDto } from '@/models/ScenarioTheme'

// Define the SidebarNode interface here instead of in a separate file
export interface SidebarNode {
  key: string;
  titleKey: string;
  children?: SidebarNode[];
  isScenario?: boolean;
  scenarioId?: number;
}

const route = useRoute()
const selectedTheme = ref<string | null>(null)
const selectedScenarioId = ref<number | null>(null)
const isLoading = ref(true)
const showSidebarMobile = ref(false)
const scenarioThemes = ref<ScenarioThemeDto[]>([])
const loadingScenarios = ref(true)
const scenarioError = ref<string | null>(null)

// Check if there's a scenario ID in the route
const routeScenarioId = computed(() => {
  const id = route.query.scenarioId
  return id ? parseInt(id as string, 10) : null
})

// Sidebar sections configuration with static themes
const staticSections: SidebarNode[] = [
  { key: 'preparednessStorage', titleKey: 'sidebar.themes.preparednessStorage' },
  { key: 'afterCrisis', titleKey: 'sidebar.themes.afterCrisis' }
]

// Combined sections with dynamic scenario themes
const sections = computed<SidebarNode[]>(() => {
  // Create scenario theme nodes
  const scenarioNodes: SidebarNode[] = scenarioThemes.value.map(theme => ({
    key: `scenario-${theme.id}`,
    titleKey: theme.name, // Use the actual name instead of a translation key
    isScenario: true, // Flag to identify scenario themes
    scenarioId: theme.id
  }))

  // If we have scenario themes, add them under a parent node
  if (scenarioNodes.length > 0) {
    return [
      {
        key: 'scenarioThemes',
        titleKey: 'scenarioThemes.title',
        children: scenarioNodes
      },
      ...staticSections
    ]
  }

  // Otherwise just return static sections
  return staticSections
})

/**
 * Loads scenario themes from the backend API
 */
async function loadScenarioThemes() {
  loadingScenarios.value = true
  scenarioError.value = null

  try {
    const response = await fetchAllScenarioThemes()
    scenarioThemes.value = response.content
  } catch (err) {
    console.error('Failed to load scenario themes:', err)
    scenarioError.value = 'Failed to load scenario themes'
  } finally {
    loadingScenarios.value = false
  }
}

const router = useRouter()

/**
 * Handles theme selection from the sidebar
 *
 * @param themeKey - The key of the selected theme
 */
function handleThemeSelected(themeKey: string): void {
  // Check if this is a scenario theme
  if (themeKey.startsWith('scenario-')) {
    const scenarioId = parseInt(themeKey.replace('scenario-', ''), 10)
    // Navigate to the info page with the scenario ID in the query parameter
    router.push({
      path: '/info',
      query: { scenarioId: scenarioId.toString() }
    })
    selectedScenarioId.value = scenarioId
    selectedTheme.value = null
  } else {
    // Regular theme
    selectedTheme.value = themeKey
    selectedScenarioId.value = null
  }
}

/**
 * Toggles the mobile sidebar visibility
 */
function toggleMobileSidebar(): void {
  showSidebarMobile.value = !showSidebarMobile.value
}

// On component mount
onMounted(async () => {
  // Load scenario themes
  await loadScenarioThemes()

  // Check if there's a scenario ID in the route
  if (routeScenarioId.value) {
    // Find the scenario in our loaded themes
    const scenario = scenarioThemes.value.find(theme => theme.id === routeScenarioId.value)
    if (scenario) {
      selectedScenarioId.value = scenario.id
    }
  }

  // Set loading to false
  isLoading.value = false
})
</script>

<template>
  <div class="enhanced-information-view flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
    <!-- Sidebar -->
    <EnhancedSidebar
      :sections="sections"
      :selectedTheme="selectedTheme"
      :showSidebarMobile="showSidebarMobile"
      @theme-selected="handleThemeSelected"
      @toggle-mobile-sidebar="toggleMobileSidebar"
    />

    <!-- Main content -->
    <main class="flex-1 w-full p-4 md:p-6 overflow-y-auto bg-background">

      <!-- Loading state -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Content -->
      <ThemeContent
        v-else
        :selectedTheme="selectedTheme"
        :selectedScenarioId="selectedScenarioId"
        :themeIcon="''"
      >
        <template #related-themes>
          <!-- Static themes -->
          <Card
            v-for="theme in ['preparednessStorage', 'afterCrisis']"
            :key="theme"
            class="cursor-pointer hover:shadow-lg transition-shadow"
            @click="handleThemeSelected(theme)"
          >
            <CardHeader class="pb-2">
              <CardTitle class="text-lg flex items-center gap-2">
                {{ $t(`sidebar.themes.${theme}`) }}
              </CardTitle>
            </CardHeader>
            <CardContent class="text-sm text-muted-foreground">
              {{ $t(`infoPage.${theme}Brief`) || $t('infoPage.learnMoreTopic') }}
            </CardContent>
          </Card>

          <!-- Scenario themes -->
          <Card
            v-for="theme in scenarioThemes"
            :key="`scenario-${theme.id}`"
            class="cursor-pointer hover:shadow-lg transition-shadow"
            @click="handleThemeSelected(`scenario-${theme.id}`)"
          >
            <CardHeader class="pb-2">
              <CardTitle class="text-lg">
                {{ theme.name }}
              </CardTitle>
            </CardHeader>
            <CardContent class="text-sm text-muted-foreground">
              {{ theme.description || $t('infoPage.learnMoreTopic') }}
            </CardContent>
          </Card>
        </template>
      </ThemeContent>
    </main>
  </div>
</template>

<style scoped>
/* Layout handled via Tailwind classes */
</style>
