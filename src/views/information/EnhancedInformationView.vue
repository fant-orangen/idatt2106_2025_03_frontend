<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EnhancedInformationView'
})
</script>

<script setup lang="ts">
/**
 * EnhancedInformationView component
 *
 * This component serves as the main view for displaying information content.
 * It provides a sidebar navigation for different themes and displays the selected content.
 * Handles both static themes and dynamic scenario themes loaded from the backend.
 *
 * @component
 */
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EnhancedSidebar from '@/components/information/EnhancedSidebar.vue'
import ThemeContent from '@/components/information/ThemeContent.vue'
import { fetchAllScenarioThemes } from '@/services/api/ScenarioThemeService'
import type { ScenarioThemeDto } from '@/models/ScenarioTheme'

/**
 * Interface representing a node in the sidebar navigation tree
 * Used to build the hierarchical structure of the sidebar
 */
export interface SidebarNode {
  /** Unique identifier for the node */
  key: string;
  /** Translation key or display text for the node */
  titleKey: string;
  /** Optional child nodes for nested navigation */
  children?: SidebarNode[];
  /** Flag indicating if this node represents a scenario theme */
  isScenario?: boolean;
  /** ID of the scenario if this is a scenario node */
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

/**
 * Computed property that extracts the scenario ID from the route
 * Checks both route params and query params for the ID
 */
const routeScenarioId = computed(() => {
  if (route.params.id) {
    return parseInt(route.params.id as string, 10)
  }
  const id = route.query.scenarioId
  return id ? parseInt(id as string, 10) : null
})

/**
 * Static sidebar sections that are always available
 */
const staticSections: SidebarNode[] = [
  { key: 'preparednessStorage', titleKey: 'sidebar.themes-preparednessStorage' },
  { key: 'afterCrisis', titleKey: 'sidebar.themes-afterCrisis' }
]

/**
 * Computed property that combines static sections with dynamic scenario themes
 * Creates a hierarchical structure for the sidebar navigation
 */
const sections = computed<SidebarNode[]>(() => {
  const scenarioNodes: SidebarNode[] = scenarioThemes.value.map(theme => ({
    key: `scenario-${theme.id}`,
    titleKey: theme.name,
    isScenario: true,
    scenarioId: theme.id
  }))

  if (scenarioNodes.length > 0) {
    return [
      {
        key: 'scenarioThemes',
        titleKey: 'sidebar.categories',
        children: scenarioNodes
      },
      ...staticSections
    ]
  }

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
  if (themeKey.startsWith('scenario-')) {
    const scenarioId = parseInt(themeKey.replace('scenario-', ''), 10)
    router.push({
      name: 'ScenarioTheme',
      params: { id: scenarioId.toString() }
    })
    selectedScenarioId.value = scenarioId
    selectedTheme.value = null
  } else {
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

/**
 * Initialize the component when mounted
 * Loads scenario themes and sets the selected scenario based on the route
 */
onMounted(async () => {
  await loadScenarioThemes()

  if (routeScenarioId.value) {
    const scenario = scenarioThemes.value.find(theme => theme.id === routeScenarioId.value)
    if (scenario) {
      selectedScenarioId.value = scenario.id
    }
  }

  isLoading.value = false
})
</script>

<template>
  <div class="enhanced-information-view flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
    <!-- Sidebar -->
    <EnhancedSidebar
      :sections="sections"
      :selectedTheme="selectedTheme"
      :selectedScenarioId="selectedScenarioId"
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
</style>
