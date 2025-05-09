<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ThemeContent',
})
</script>

<script setup lang="ts">
/**
 * ThemeContent component
 *
 * This component displays content for both static themes and dynamic scenario themes.
 * It handles loading scenario theme details from the backend and rendering appropriate content.
 *
 * @component
 */
import { computed, ref, watch } from 'vue'
import { marked } from 'marked'
import type { Token } from 'marked'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Info, AlertTriangle, ExternalLink, Phone } from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { fetchScenarioThemeById } from '@/services/api/ScenarioThemeService'
import type { ScenarioThemeDetailsDto } from '@/models/ScenarioTheme'

// Configure marked with essential options
marked.setOptions({
  gfm: true,
  breaks: true,
})

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

// Create a safe markdown parser function
const parseMarkdown = (content: string | null) => {
  if (!content) return ''
  const renderer = new marked.Renderer()

  // Customize header rendering with proper types
  renderer.heading = function ({ tokens, depth }: { tokens: Token[]; depth: number }): string {
    const text = tokens.map((t) => (t as any).text || '').join('')
    const fontSize = depth === 1 ? '3xl' : depth === 2 ? '2xl' : depth === 3 ? 'xl' : 'lg'
    return `<h${depth} class="text-${fontSize} font-bold my-4">${text}</h${depth}>`
  }

  return marked.parse(content, {
    gfm: true,
    breaks: true,
    renderer,
  })
}

/**
 * Gets the translation key for a theme based on its type
 * Maps theme keys to their corresponding translation paths
 *
 * @param themeKey - The identifier for the theme
 * @param type - Whether to get the title or content translation key
 * @returns The translation key path or null if not found
 */
function getTranslationKey(themeKey: string, type: 'title' | 'content'): string | null {
  if (!themeKey) return null

  let basePath = 'themes'

  if (
    [
      'pandemic',
      'war',
      'forestFire',
      'powerOutage',
      'waterShortage',
      'cyberAttack',
      'majorAccident',
    ].includes(themeKey)
  ) {
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

/**
 * Watch for changes to the selected scenario ID
 * Loads the scenario theme when a new ID is selected
 */
watch(
  () => props.selectedScenarioId,
  (newId) => {
    if (newId) {
      loadScenarioTheme(newId)
    } else {
      scenarioTheme.value = null
    }
  },
  { immediate: true },
)

/**
 * Computed property for the title translation key
 * Returns null for scenario themes (which have their own title)
 */
const titleKey = computed(() => {
  if (props.selectedScenarioId && scenarioTheme.value) {
    return null
  }

  if (!props.selectedTheme) return null
  return getTranslationKey(props.selectedTheme, 'title')
})

/**
 * Computed property for the content translation key
 * Returns null for scenario themes (which have their own content)
 */
const contentKey = computed(() => {
  if (props.selectedScenarioId && scenarioTheme.value) {
    return null
  }

  if (!props.selectedTheme) return null
  return getTranslationKey(props.selectedTheme, 'content')
})

/**
 * Computed property for the rendered content
 * Returns null for scenario themes (handled separately in template)
 */
const renderedContent = computed(() => {
  if (props.selectedScenarioId && scenarioTheme.value) {
    return null
  }

  if (contentKey.value) {
    return contentKey.value
  }
  return null
})

/**
 * Computed property for theme-specific resources translation key
 */
const themeResources = computed(() => {
  if (!props.selectedTheme) return null

  return `infoPage.themeSpecificResources.${props.selectedTheme}`
})

/**
 * Opens the read more sheet
 */
function openReadMore() {
  isReadMoreOpen.value = true
}

/**
 * Closes the read more sheet
 */
function closeReadMore() {
  isReadMoreOpen.value = false
}

/**
 * Opens the emergency contacts sheet
 */
function openEmergencyContacts() {
  isEmergencyContactsOpen.value = true
}

/**
 * Closes the emergency contacts sheet
 */
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
        <div
          v-if="scenarioTheme.description"
          class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary"
        >
          {{ scenarioTheme.description }}
        </div>
        <p v-else class="text-muted-foreground italic">
          {{ $t('scenarioThemes.noDescription') }}
        </p>
      </CardContent>
    </Card>
    <div class="sticky top-0 z-10 bg-background py-4 border-b mb-6">
      <nav class="flex justify-center gap-6 text-lg font-semibold" aria-label="Scenario Navigation">
        <a href="#before" class="hover:underline text-primary">
          {{ $t('scenarioThemes.before') }}
        </a>
        <a href="#under" class="hover:underline text-primary">
          {{ $t('scenarioThemes.under') }}
        </a>
        <a href="#after" class="hover:underline text-primary">
          {{ $t('scenarioThemes.after') }}
        </a>
      </nav>
    </div>
    <!-- Before Crisis Instructions -->
    <Card v-if="scenarioTheme.before" id="before" class="mb-8 shadow-md">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <BookOpen class="h-5 w-5 text-primary" />
          {{ $t('scenarioThemes.before') }}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base"
          v-html="parseMarkdown(scenarioTheme.before)"
        ></div>
      </CardContent>
    </Card>

    <!-- During Crisis Instructions -->
    <Card v-if="scenarioTheme.under" id="under" class="mb-6 shadow-md">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <AlertTriangle class="h-5 w-5 text-primary" />
          {{ $t('scenarioThemes.under') }}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base"
          v-html="parseMarkdown(scenarioTheme.under)"
        ></div>
      </CardContent>
    </Card>

    <!-- After Crisis Instructions -->
    <Card v-if="scenarioTheme.after" id="after" class="mb-6 shadow-md">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <BookOpen class="h-5 w-5 text-primary" />
          {{ $t('scenarioThemes.after') }}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base"
          v-html="parseMarkdown(scenarioTheme.after)"
        ></div>
      </CardContent>
    </Card>

    <div class="text-center mt-8">
      <a href="#top" class="text-primary hover:underline">Back to Top</a>
    </div>

    <!-- Legacy Instructions (for backward compatibility) -->
    <Card
      v-if="!scenarioTheme.before && !scenarioTheme.under && !scenarioTheme.after"
      class="mb-6 shadow-md"
    >
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <BookOpen class="h-5 w-5 text-primary" />
          {{ $t('scenarioThemes.instructions') }}
        </CardTitle>
      </CardHeader>
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
          {{
          $t('infoPage.themeDescription') ||
          'Essential information to help you prepare and respond.'
          }}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base"
          v-html="parseMarkdown($t(renderedContent))"
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
      <Sheet :open="isReadMoreOpen" @update:open="closeReadMore" class="z-100">
        <SheetContent class="overflow-y-auto z-101">
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
              <div
                v-for="(website, index) in $t(`${themeResources}.websites`)"
                :key="index"
                class="mb-4 p-4 border rounded-md"
              >
                <h4 class="font-medium text-primary">{{ (website as any).name }}</h4>
                <p class="text-sm text-muted-foreground mb-2">{{ (website as any).description }}</p>
                <a
                  :href="(website as any).url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm flex items-center text-primary hover:underline"
                >
                  {{ (website as any).url }}
                  <ExternalLink class="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            <div v-else class="text-muted-foreground text-center py-4">
              <p>{{ $t('infoPage.additionalResources') }}</p>
              <div class="mt-4">
                <a
                  href="https://www.dsb.no/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline flex items-center justify-center"
                >
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

      <Sheet class="z-101" :open="isEmergencyContactsOpen" @update:open="closeEmergencyContacts">
        <SheetContent class="overflow-y-auto z-101">
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
              <h3 class="text-lg font-medium mb-4">
                {{ $t('infoPage.generalEmergencyContacts.title') }}
              </h3>
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

            <div
              v-if="
                themeResources &&
                $t(`${themeResources}.contacts`) &&
                $t(`${themeResources}.contacts`).length > 0
              "
            >
              <h3 class="text-lg font-medium mb-4">
                {{ $t(titleKey) }} - {{ $t('infoPage.emergencyContacts') }}
              </h3>
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
                  <p class="text-sm text-muted-foreground mt-2">
                    {{ (contact as any).description }}
                  </p>
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
  </div>

  <!-- Home view with theme categories -->
  <div v-else-if="selectedTheme === 'home'" class="max-w-4xl mx-auto">
    <div class="mb-4">
      <h1 class="text-2xl md:text-3xl font-bold">{{ $t('infoPage.homeTitle') || 'Crisis Information Center' }}</h1>
      <p class="text-muted-foreground mt-2">{{ $t('infoPage.homeDescription') || 'Access comprehensive information about crisis preparation, response, and recovery.' }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      <slot name="related-themes"></slot>
    </div>
  </div>

  <!-- General Crisis Categories -->
  <div v-else-if="selectedTheme === 'before' || selectedTheme === 'under' || selectedTheme === 'after'" class="max-w-4xl mx-auto">
    <div class="mb-4">
      <h1 class="text-2xl md:text-3xl font-bold">
        {{ selectedTheme === 'before'
          ? ($t('infoPage.beforeTitle') || 'Before Crisis')
          : selectedTheme === 'under'
            ? ($t('infoPage.underTitle') || 'During Crisis')
            : ($t('infoPage.afterTitle') || 'After Crisis') }}
      </h1>
    </div>

    <!-- Before Crisis -->
    <Card id="general-before" v-if="selectedTheme === 'before'" class="mb-8 shadow-md">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <BookOpen class="h-5 w-5 text-primary" />
          {{ $t('scenarioThemes.before') || 'Before Crisis' }}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary">
          <h2>{{ $t('infoPage.generalBefore.title') || 'General Preparation' }}</h2>
          <p>{{ $t('infoPage.generalBefore.content') || 'Prepare an emergency kit with essential supplies including water, non-perishable food, medications, first aid supplies, flashlights, batteries, and important documents. Create a family emergency plan with meeting points and communication strategies. Stay informed about potential risks in your area and sign up for emergency alerts.' }}</p>

          <h3>{{ $t('infoPage.generalBefore.kitTitle') || 'Emergency Kit Essentials' }}</h3>
          <ul>
            <li>{{ $t('infoPage.generalBefore.water') || 'Water (at least 9 liters per person)' }}</li>
            <li>{{ $t('infoPage.generalBefore.food') || 'Non-perishable food (3-day supply)' }}</li>
            <li>{{ $t('infoPage.generalBefore.medications') || 'Medications and first aid supplies' }}</li>
            <li>{{ $t('infoPage.generalBefore.tools') || 'Flashlights, batteries, and multi-tool' }}</li>
            <li>{{ $t('infoPage.generalBefore.documents') || 'Copies of important documents' }}</li>
            <li>{{ $t('infoPage.generalBefore.cash') || 'Cash in small denominations' }}</li>
            <li>{{ $t('infoPage.generalBefore.clothing') || 'Extra clothing and blankets' }}</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <!-- During Crisis -->
    <Card id="general-under" v-if="selectedTheme === 'under'" class="mb-8 shadow-md">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <AlertTriangle class="h-5 w-5 text-primary" />
          {{ $t('scenarioThemes.under') || 'During Crisis' }}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary">
          <h2>{{ $t('infoPage.generalUnder.title') || 'During an Emergency' }}</h2>
          <p>{{ $t('infoPage.generalUnder.content') || 'Stay calm and follow instructions from emergency officials. If ordered to evacuate, do so immediately. If sheltering in place, secure your location and move to an interior room if necessary. Conserve phone battery and limit calls to emergency purposes. Check on vulnerable neighbors if it\'s safe to do so.' }}</p>

          <h3>{{ $t('infoPage.generalUnder.prioritiesTitle') || 'Priorities During Crisis' }}</h3>
          <ol>
            <li>{{ $t('infoPage.generalUnder.safety') || 'Ensure immediate safety of yourself and family' }}</li>
            <li>{{ $t('infoPage.generalUnder.information') || 'Get reliable information from official sources' }}</li>
            <li>{{ $t('infoPage.generalUnder.shelter') || 'Secure shelter and basic necessities' }}</li>
            <li>{{ $t('infoPage.generalUnder.communicate') || 'Communicate your status to family when possible' }}</li>
            <li>{{ $t('infoPage.generalUnder.conserve') || 'Conserve resources (water, food, power)' }}</li>
          </ol>
        </div>
      </CardContent>
    </Card>

    <!-- After Crisis -->
    <Card id="general-after" v-if="selectedTheme === 'after'" class="mb-8 shadow-md">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <BookOpen class="h-5 w-5 text-primary" />
          {{ $t('scenarioThemes.after') || 'After Crisis' }}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div class="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary">
          <h2>{{ $t('infoPage.generalAfter.title') || 'Recovery Phase' }}</h2>
          <p>{{ $t('infoPage.generalAfter.content') || 'After the immediate danger has passed, assess your situation carefully. Check for injuries and provide first aid if needed. Inspect your home for damage before re-entering and be alert for hazards like gas leaks, electrical damage, or structural issues. Document damage for insurance purposes. Reach out for mental health support if needed.' }}</p>

          <h3>{{ $t('infoPage.generalAfter.checklistTitle') || 'Post-Crisis Checklist' }}</h3>
          <ul>
            <li>{{ $t('infoPage.generalAfter.injuries') || 'Check for injuries and seek medical help if needed' }}</li>
            <li>{{ $t('infoPage.generalAfter.damage') || 'Assess and document property damage' }}</li>
            <li>{{ $t('infoPage.generalAfter.utilities') || 'Check utilities before using (gas, electric, water)' }}</li>
            <li>{{ $t('infoPage.generalAfter.contact') || 'Contact family members to confirm safety' }}</li>
            <li>{{ $t('infoPage.generalAfter.insurance') || 'Contact insurance company to report damage' }}</li>
            <li>{{ $t('infoPage.generalAfter.assistance') || 'Apply for disaster assistance if applicable' }}</li>
            <li>{{ $t('infoPage.generalAfter.mental') || 'Seek mental health support if experiencing distress' }}</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <div class="sticky bottom-4 right-4 flex justify-end">
      <Button variant="outline" class="shadow-md" @click="openReadMore">
        <BookOpen class="mr-2 h-4 w-4" />
        {{ $t('infoPage.readMore') || 'Read more' }}
      </Button>
    </div>
  </div>

  <!-- Empty state when no theme is selected -->
  <div v-else class="h-full flex flex-col items-center justify-center text-center p-4">
    <div class="mb-4 text-6xl">📚</div>
    <h2 class="text-2xl font-bold mb-2">{{ $t('infoPage.selectThemePrompt') }}</h2>
    <p class="text-muted-foreground max-w-md">
      {{
      $t('infoPage.browseThemesDescription') ||
      'Browse through our information resources to learn about different crisis situations and how to prepare.'
      }}
    </p>

    <Button variant="outline" class="mt-6" @click="openReadMore">
      <BookOpen class="mr-2 h-4 w-4" />
      {{ $t('infoPage.readMore') || 'Read more' }}
    </Button>
  </div>
</template>
