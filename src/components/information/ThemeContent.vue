<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ThemeContent'
})
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { marked } from 'marked'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Info, AlertTriangle, ExternalLink, Phone } from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { fetchScenarioThemeById } from '@/services/api/ScenarioThemeService'
import type { ScenarioThemeDetailsDto } from '@/models/ScenarioTheme'

const props = defineProps<{
  selectedTheme: string | null
  themeIcon: string
  selectedScenarioId: number | null
}>()

const isReadMoreOpen = ref(false)
const isEmergencyContactsOpen = ref(false)

const scenarioTheme = ref<ScenarioThemeDetailsDto | null>(null)
const loadingScenario = ref(false)
const scenarioError = ref<string | null>(null)

function getTranslationKey(themeKey: string, type: 'title' | 'content'): string | null {
  if (!themeKey) return null

  let basePath = 'themes'

  if (['pandemic', 'war', 'forestFire', 'powerOutage', 'waterShortage', 'cyberAttack', 'majorAccident'].includes(themeKey)) {
    return `${basePath}.crisisSituations.${themeKey}.${type}`
  }

  if (['flood', 'hurricane', 'drought', 'heatwave'].includes(themeKey)) {
    return `${basePath}.crisisSituations.extremeWeather.${themeKey}.${type}`
  }

  if (['preparednessStorage', 'afterCrisis'].includes(themeKey)) {
    return `${basePath}.${themeKey}.${type}`
  }

  return null
}

/**
 * Loads a scenario theme by ID
 *
 * @param id - The ID of the scenario theme to load
 */
async function loadScenarioTheme(id: number) {
  loadingScenario.value = true
  scenarioError.value = null

  try {
    const theme = await fetchScenarioThemeById(id)
    scenarioTheme.value = theme
  } catch (err) {
    console.error(`Failed to load scenario theme with ID ${id}:`, err)
    scenarioError.value = 'Failed to load scenario theme'
  } finally {
    loadingScenario.value = false
  }
}

watch(() => props.selectedScenarioId, (newId) => {
  if (newId) {
    loadScenarioTheme(newId)
  } else {
    scenarioTheme.value = null
  }
}, { immediate: true })

const titleKey = computed(() => {
  if (props.selectedScenarioId && scenarioTheme.value) {
    return null
  }

  if (!props.selectedTheme) return null
  return getTranslationKey(props.selectedTheme, 'title')
})

const contentKey = computed(() => {
  if (props.selectedScenarioId && scenarioTheme.value) {
    return null // We'll use the scenario theme content directly
  }

  if (!props.selectedTheme) return null
  return getTranslationKey(props.selectedTheme, 'content')
})

const renderedContent = computed(() => {
  if (props.selectedScenarioId && scenarioTheme.value) {
    return null // We'll use the scenario theme content directly
  }

  if (contentKey.value) {
    return contentKey.value
  }
  return null
})

const themeResources = computed(() => {
  if (!props.selectedTheme) return null

  return `infoPage.themeSpecificResources.${props.selectedTheme}`
})

function openReadMore() {
  isReadMoreOpen.value = true
}

function closeReadMore() {
  isReadMoreOpen.value = false
}

function openEmergencyContacts() {
  isEmergencyContactsOpen.value = true
}

function closeEmergencyContacts() {
  isEmergencyContactsOpen.value = false
}
</script>

<template>
  <div v-if="loadingScenario" class="flex items-center justify-center h-full">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>

  <div v-else-if="scenarioError" class="bg-destructive/10 p-4 rounded-md text-destructive mb-6">
    {{ scenarioError }}
  </div>

  <div v-else-if="selectedScenarioId && scenarioTheme" class="max-w-4xl mx-auto">
    <div class="mb-4">
      <h1 class="text-2xl md:text-3xl font-bold">{{ scenarioTheme.name }}</h1>
    </div>

    <Card class="mb-6 shadow-md">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Info class="h-5 w-5 text-primary" />
          {{ $t('scenarioThemes.description') }}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div v-if="scenarioTheme.description" class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary">
          {{ scenarioTheme.description }}
        </div>
        <p v-else class="text-muted-foreground italic">
          {{ $t('scenarioThemes.noDescription') }}
        </p>
      </CardContent>
    </Card>

    <Card v-if="scenarioTheme.instructions" class="mb-6 shadow-md">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <BookOpen class="h-5 w-5 text-primary" />
          {{ $t('scenarioThemes.instructions') }}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary" v-html="marked.parse(scenarioTheme.instructions)"></div>
      </CardContent>
    </Card>
  </div>

  <!-- Regular theme content -->
  <div v-else-if="selectedTheme && titleKey && renderedContent" class="max-w-4xl mx-auto">
    <div class="mb-4">
      <h1 class="text-2xl md:text-3xl font-bold">{{ $t(titleKey) }}</h1>
    </div>

    <Card class="mb-6 shadow-md">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Info class="h-5 w-5 text-primary" />
          {{ $t('infoPage.aboutThisTheme') || 'About this theme' }}
        </CardTitle>
        <CardDescription>
          {{ $t('infoPage.themeDescription') || 'Essential information to help you prepare and respond.' }}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary"
          v-html="marked.parse($t(renderedContent))"
        ></div>
      </CardContent>

      <CardFooter class="flex flex-col sm:flex-row gap-4 border-t pt-4">
        <Button variant="outline" class="w-full sm:w-auto" @click="openReadMore">
          <BookOpen class="mr-2 h-4 w-4" />
          {{ $t('infoPage.readMore') || 'Read more' }}
        </Button>
        <Button variant="default" class="w-full sm:w-auto" @click="openEmergencyContacts">
          <AlertTriangle class="mr-2 h-4 w-4" />
          {{ $t('infoPage.emergencyContacts') || 'Emergency contacts' }}
        </Button>
      </CardFooter>

      <!-- Read More Modal -->
      <Sheet :open="isReadMoreOpen" @update:open="closeReadMore">
        <SheetContent class="overflow-y-auto">
          <SheetHeader>
            <SheetTitle class="flex items-center gap-2">
              <BookOpen class="h-5 w-5 text-primary" />
              {{ $t('infoPage.readMoreTitle') }}
            </SheetTitle>
            <SheetDescription>
              {{ $t('infoPage.readMoreDescription') }}
            </SheetDescription>
          </SheetHeader>

          <div class="py-6">
            <h3 class="text-lg font-medium mb-4">{{ $t('infoPage.officialWebsites') }}</h3>

            <div v-if="themeResources && $te(`${themeResources}.websites`)">
              <div v-for="(website, index) in $t(`${themeResources}.websites`)" :key="index" class="mb-4 p-4 border rounded-md">
                <h4 class="font-medium text-primary">{{ (website as any).name }}</h4>
                <p class="text-sm text-muted-foreground mb-2">{{ (website as any).description }}</p>
                <a :href="(website as any).url" target="_blank" rel="noopener noreferrer" class="text-sm flex items-center text-primary hover:underline">
                  {{ (website as any).url }}
                  <ExternalLink class="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            <div v-else class="text-muted-foreground text-center py-4">
              <p>{{ $t('infoPage.additionalResources') }}</p>
              <div class="mt-4">
                <a href="https://www.dsb.no/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline flex items-center justify-center">
                  DSB - Norwegian Directorate for Civil Protection
                  <ExternalLink class="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button @click="closeReadMore">{{ $t('infoPage.close') }}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet :open="isEmergencyContactsOpen" @update:open="closeEmergencyContacts">
        <SheetContent class="overflow-y-auto">
          <SheetHeader>
            <SheetTitle class="flex items-center gap-2">
              <AlertTriangle class="h-5 w-5 text-primary" />
              {{ $t('infoPage.emergencyContactsTitle') }}
            </SheetTitle>
            <SheetDescription>
              {{ $t('infoPage.emergencyContactsDescription') }}
            </SheetDescription>
          </SheetHeader>

          <div class="py-6">
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-4">{{ $t('infoPage.generalEmergencyContacts.title') }}</h3>
              <div class="space-y-2">
                <div class="p-3 border rounded-md flex items-center">
                  <Phone class="h-5 w-5 text-red-500 mr-3" />
                  <span>{{ $t('infoPage.generalEmergencyContacts.police') }}</span>
                </div>
                <div class="p-3 border rounded-md flex items-center">
                  <Phone class="h-5 w-5 text-red-500 mr-3" />
                  <span>{{ $t('infoPage.generalEmergencyContacts.ambulance') }}</span>
                </div>
                <div class="p-3 border rounded-md flex items-center">
                  <Phone class="h-5 w-5 text-red-500 mr-3" />
                  <span>{{ $t('infoPage.generalEmergencyContacts.fire') }}</span>
                </div>
                <div class="p-3 border rounded-md flex items-center">
                  <Phone class="h-5 w-5 text-blue-500 mr-3" />
                  <span>{{ $t('infoPage.generalEmergencyContacts.civilDefense') }}</span>
                </div>
              </div>
            </div>

            <div v-if="themeResources && $te(`${themeResources}.contacts`) && $t(`${themeResources}.contacts`).length > 0">
              <h3 class="text-lg font-medium mb-4">{{ $t(titleKey) }} - {{ $t('infoPage.emergencyContacts') }}</h3>
              <div class="space-y-2">
                <div
                  v-for="(contact, index) in $t(`${themeResources}.contacts`)"
                  :key="index"
                  class="p-4 border rounded-md"
                >
                  <h4 class="font-medium">{{ (contact as any).name }}</h4>
                  <div class="flex items-center mt-1 text-primary">
                    <Phone class="h-4 w-4 mr-2" />
                    <span>{{ (contact as any).contact }}</span>
                  </div>
                  <p class="text-sm text-muted-foreground mt-2">{{ (contact as any).description }}</p>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button @click="closeEmergencyContacts">{{ $t('infoPage.close') }}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Card>

    <div v-if="!selectedScenarioId" class="mt-8">
      <h2 class="text-xl font-bold mb-4">{{ $t('infoPage.relatedThemes') || 'Related themes' }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <slot name="related-themes"></slot>
      </div>
    </div>
  </div>

  <div v-else class="h-full flex flex-col items-center justify-center text-center p-4">
    <div class="mb-4 text-6xl">📚</div>
    <h2 class="text-2xl font-bold mb-2">{{ $t('infoPage.selectThemePrompt') }}</h2>
    <p class="text-muted-foreground max-w-md">
      {{ $t('infoPage.browseThemesDescription') || 'Browse through our information resources to learn about different crisis situations and how to prepare.' }}
    </p>
  </div>
</template>
