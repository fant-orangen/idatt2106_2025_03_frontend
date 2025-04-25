<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EnhancedInformationView'
})
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EnhancedSidebar from '@/components/information/EnhancedSidebar.vue'
import ThemeContent from '@/components/information/ThemeContent.vue'

// Define the SidebarNode interface here instead of in a separate file
export interface SidebarNode {
  key: string;
  titleKey: string;
  children?: SidebarNode[];
}

const selectedTheme = ref<string | null>(null)
const isLoading = ref(true)
const showSidebarMobile = ref(false)

// Sidebar sections configuration
const sections: SidebarNode[] = [
  {
    key: 'crisisSituations',
    titleKey: 'sidebar.themes.crisisSituations.title',
    children: [
      { key: 'pandemic', titleKey: 'sidebar.themes.crisisSituations.pandemic' },
      { key: 'war', titleKey: 'sidebar.themes.crisisSituations.war' },
      {
        key: 'extremeWeather',
        titleKey: 'sidebar.themes.crisisSituations.extremeWeather.title',
        children: [
          { key: 'flood', titleKey: 'sidebar.themes.crisisSituations.extremeWeather.flood' },
          { key: 'hurricane', titleKey: 'sidebar.themes.crisisSituations.extremeWeather.hurricane' },
          { key: 'drought', titleKey: 'sidebar.themes.crisisSituations.extremeWeather.drought' },
          { key: 'heatwave', titleKey: 'sidebar.themes.crisisSituations.extremeWeather.heatwave' }
        ]
      },
      { key: 'forestFire', titleKey: 'sidebar.themes.crisisSituations.forestFire' },
      { key: 'powerOutage', titleKey: 'sidebar.themes.crisisSituations.powerOutage' },
      { key: 'waterShortage', titleKey: 'sidebar.themes.crisisSituations.waterShortage' },
      { key: 'cyberAttack', titleKey: 'sidebar.themes.crisisSituations.cyberAttack' },
      { key: 'majorAccident', titleKey: 'sidebar.themes.crisisSituations.majorAccident' }
    ]
  },
  { key: 'preparednessStorage', titleKey: 'sidebar.themes.preparednessStorage' },
  { key: 'afterCrisis', titleKey: 'sidebar.themes.afterCrisis' }
]

// Icon helper
function getThemeIcon(themeKey: string): string {
  const iconMap: Record<string, string> = {
    pandemic: '🦠', war: '🛡️', flood: '🌊', hurricane: '🌪️',
    drought: '☀️', heatwave: '🌡️', forestFire: '🌲',
    powerOutage: '💡', waterShortage: '💧', cyberAttack: '💻',
    majorAccident: '⚠️', preparednessStorage: '🧰', afterCrisis: '🏡'
  }
  return iconMap[themeKey] || '📄'
}

// Handlers
function handleThemeSelected(themeKey: string): void {
  selectedTheme.value = themeKey
}

function toggleMobileSidebar(): void {
  showSidebarMobile.value = !showSidebarMobile.value
}

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
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
        :themeIcon="selectedTheme ? getThemeIcon(selectedTheme) : ''"
      >
        <template #related-themes>
          <Card
            v-for="theme in ['preparednessStorage', 'afterCrisis']"
            :key="theme"
            class="cursor-pointer hover:shadow-lg transition-shadow"
            @click="handleThemeSelected(theme)"
          >
            <CardHeader class="pb-2">
              <CardTitle class="text-lg flex items-center gap-2">
                <span class="text-xl">{{ getThemeIcon(theme) }}</span>
                {{ $t(`sidebar.themes.${theme}`) }}
              </CardTitle>
            </CardHeader>
            <CardContent class="text-sm text-muted-foreground">
              {{ $t(`infoPage.${theme}Brief`) || $t('infoPage.learnMoreTopic') }}
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
