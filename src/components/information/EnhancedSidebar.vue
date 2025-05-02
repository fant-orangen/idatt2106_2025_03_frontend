<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EnhancedSidebar'
})
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import type { SidebarNode } from '@/views/information/EnhancedInformationView.vue'

const { t } = useI18n()

const props = defineProps<{
  sections: SidebarNode[]
  selectedTheme: string | null
  selectedScenarioId: number | null
  showSidebarMobile: boolean
}>()

const emit = defineEmits<{
  'theme-selected': [key: string]
  'toggle-mobile-sidebar': []
}>()

// Track expanded sections
const expandedSections = ref<Record<string, boolean>>({
  // Default to having the top-level sections expanded
  'crisisSituations': true,
  'extremeWeather': true,
  'scenarioThemes': true
})

// We're removing the icon helper function as requested

// Style helpers for different hierarchy levels
function getTextClass(level: number): string {
  if (level === 0) {
    return 'text-lg font-bold uppercase tracking-wide'
  } else if (level === 1) {
    return 'text-base font-semibold'
  } else {
    return 'text-sm font-medium'
  }
}

function getIndentClass(level: number): { paddingLeft: string } {
  return { paddingLeft: `${level * 1.5}rem` }
}

function getBorderClass(level: number, isActive: boolean): string {
  if (level === 0) {
    return isActive ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'
  } else if (level === 1) {
    return isActive ? 'border-l-3 border-primary/80' : 'border-l-3 border-transparent'
  } else {
    return isActive ? 'border-l-2 border-primary/60' : 'border-l-2 border-transparent'
  }
}

// Toggle section expansion
function toggleSection(sectionKey: string): void {
  expandedSections.value[sectionKey] = !expandedSections.value[sectionKey]
}

// Handle theme selection
function handleThemeSelected(themeKey: string): void {
  emit('theme-selected', themeKey)
}

// Toggle mobile sidebar
function toggleMobileSidebar(): void {
  emit('toggle-mobile-sidebar')
}

// Watch for changes in selectedScenarioId and ensure the scenario section is expanded
watch(() => props.selectedScenarioId, (newId) => {
  if (newId) {
    // Make sure the scenarioThemes section is expanded
    expandedSections.value['scenarioThemes'] = true;
  }
}, { immediate: true })
</script>

<template>
  <div>
    <!-- Mobile header with menu toggle -->
    <div class="md:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-10">
      <h1 class="text-xl font-bold">{{ t('sidebar.title') }}</h1>
      <Button variant="ghost" size="icon" @click="toggleMobileSidebar">
        <ChevronRight v-if="!showSidebarMobile" class="h-6 w-6" />
        <ChevronDown v-else class="h-6 w-6" />
      </Button>
    </div>

    <!-- Sidebar - hidden on mobile unless toggled -->
    <aside
      class="enhanced-sidebar bg-card border-r border-border overflow-y-auto transition-all duration-300 ease-in-out"
      :class="{
        'w-full md:w-72 fixed md:relative inset-0 z-20': showSidebarMobile,
        'hidden md:block md:w-72': !showSidebarMobile
      }"
    >
      <div class="p-4 border-b border-border hidden md:block">
        <h2 class="text-xl font-bold">{{ t('sidebar.title') }}</h2>
      </div>

      <nav class="p-2">
        <ul class="space-y-1">
          <template v-for="section in sections" :key="section.key">
            <!-- Section with children -->
            <li v-if="section.children?.length" class="enhanced-sidebar-section">
              <div
                class="enhanced-sidebar-item group flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent transition-all"
                :class="[
                  getBorderClass(0, false),
                  'hover:border-primary/50'
                ]"
                :style="getIndentClass(0)"
                @click="toggleSection(section.key)"
              >
                <span :class="getTextClass(0)">{{ t(section.titleKey) }}</span>
                <ChevronDown v-if="expandedSections[section.key]" class="h-5 w-5 text-primary" />
                <ChevronRight v-else class="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              </div>

              <ul v-if="expandedSections[section.key]" class="mt-1 ml-3 space-y-1 border-l-2 border-border pl-2">
                <template v-for="child in section.children" :key="child.key">
                  <!-- Nested section -->
                  <li v-if="child.children?.length" class="enhanced-sidebar-section">
                    <div
                      class="enhanced-sidebar-item group flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent transition-all"
                      :class="[
                        getBorderClass(1, false),
                        'hover:border-primary/50'
                      ]"
                      :style="getIndentClass(1)"
                      @click="toggleSection(child.key)"
                    >
                      <span :class="getTextClass(1)">{{ t(child.titleKey) }}</span>
                      <ChevronDown v-if="expandedSections[child.key]" class="h-4 w-4 text-primary" />
                      <ChevronRight v-else class="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </div>

                    <ul v-if="expandedSections[child.key]" class="mt-1 ml-4 space-y-1 border-l-2 border-border/70 pl-2">
                      <li v-for="subChild in child.children" :key="subChild.key" class="enhanced-sidebar-item">
                        <button
                          class="w-full text-left p-2 rounded-md flex items-center gap-2 hover:bg-accent transition-all"
                          :class="[
                            getBorderClass(2, selectedTheme === subChild.key || (subChild.isScenario && subChild.scenarioId === selectedScenarioId)),
                            { 'bg-accent/50': selectedTheme === subChild.key || (subChild.isScenario && subChild.scenarioId === selectedScenarioId) }
                          ]"
                          :style="getIndentClass(2)"
                          @click="handleThemeSelected(subChild.key)"
                        >
                          <div class="flex items-center gap-2">
                            <span
                              class="h-2 w-2 rounded-full"
                              :class="{
                                'bg-primary': subChild.isScenario && subChild.scenarioId === selectedScenarioId,
                                'bg-muted-foreground': !(subChild.isScenario && subChild.scenarioId === selectedScenarioId)
                              }"
                            ></span>
                            <span :class="[getTextClass(2), {'font-bold': subChild.isScenario && subChild.scenarioId === selectedScenarioId}]">
                              {{ subChild.isScenario ? subChild.titleKey : t(subChild.titleKey) }}
                            </span>
                          </div>
                        </button>
                      </li>
                    </ul>
                  </li>

                  <!-- Regular item -->
                  <li v-else class="enhanced-sidebar-item">
                    <button
                      class="w-full text-left p-2 rounded-md flex items-center gap-2 hover:bg-accent transition-all"
                      :class="[
                        getBorderClass(1, selectedTheme === child.key || (child.isScenario && child.scenarioId === selectedScenarioId)),
                        { 'bg-accent/50': selectedTheme === child.key || (child.isScenario && child.scenarioId === selectedScenarioId) }
                      ]"
                      :style="getIndentClass(1)"
                      @click="handleThemeSelected(child.key)"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="h-2 w-2 rounded-full"
                          :class="{
                            'bg-primary': child.isScenario && child.scenarioId === selectedScenarioId,
                            'bg-muted-foreground': !(child.isScenario && child.scenarioId === selectedScenarioId)
                          }"
                        ></span>
                        <span :class="[getTextClass(1), {'font-bold': child.isScenario && child.scenarioId === selectedScenarioId}]">
                          {{ child.isScenario ? child.titleKey : t(child.titleKey) }}
                        </span>
                      </div>
                    </button>
                  </li>
                </template>
              </ul>
            </li>

            <!-- Regular item -->
            <li v-else class="enhanced-sidebar-item">
              <button
                class="w-full text-left p-2 rounded-md flex items-center gap-2 hover:bg-accent transition-all"
                :class="[
                  getBorderClass(0, selectedTheme === section.key || (section.isScenario && section.scenarioId === selectedScenarioId)),
                  { 'bg-accent/50': selectedTheme === section.key || (section.isScenario && section.scenarioId === selectedScenarioId) }
                ]"
                :style="getIndentClass(0)"
                @click="handleThemeSelected(section.key)"
              >
                <div class="flex items-center gap-2">
                  <span :class="getTextClass(0)">
                    {{ section.isScenario ? section.titleKey : t(section.titleKey) }}
                  </span>
                </div>
              </button>
            </li>
          </template>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
/* Smooth transitions */
.enhanced-sidebar-item {
  transition: all 0.2s ease;
}

/* Prevent text selection on text elements */
span {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

/* Ensure proper list styling */
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Enhanced visual hierarchy */
.border-l-2, .border-l-3, .border-l-4 {
  transition: border-color 0.2s ease;
}

/* Nested list styling */
ul.border-l-2 {
  position: relative;
  transition: all 0.3s ease;
}

/* Active item styling */
button.bg-accent\/50 {
  transition: all 0.2s ease;
}
</style>
