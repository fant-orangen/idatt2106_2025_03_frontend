<template>
  <div style="margin: 20px;">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            {{ $t('navigation.home') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator/>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/admin-panel">
            {{ $t('navigation.admin-panel') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator/>
        <BreadcrumbItem>
          <BreadcrumbPage href="/admin/edit-event">{{ $t('admin.edit-event') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <h1>{{$t('admin.edit-event')}}:</h1>

    <!--Go back button shows up when an event is chosen-->
    <div v-if="selectedEvent">
      <Button @click="cancelUpdate()">{{ $t('navigation.go-back') }}</Button>
    </div>

    <div class="page">
      <!--Scrollable element of all current events-->
      <div class="events" v-if="!selectedEvent">
        <Card>
          <CardHeader>
            <CardTitle>{{ $t('add-event-info.titles.choose-event') }}: </CardTitle>
          </CardHeader>
          <CardContent class="card-content">
            <InfiniteScroll :is-loading="isFetchingNextPage" :has-more="hasNextPage" @load-more="fetchNextPage">
              <div
                v-for="(event, index) in allEvents"
                :key="event.id"
                @click="selectEvent(index)"
                :class="['text-sm', 'cursor-pointer', 'transition-colors', 'hover:bg-gray-200', 'dark:hover:bg-gray-700']"
              >
                <div class="listOfEvents items-center">
                  <!-- Crisis Name -->
                  <span class="severity-tag">{{ event.name }}</span>

                  <span
                    :class="['severity-tag', event.severity]"
                    class="flex items-center justify-center h-8 rounded-full text-sm text-accent font-semibold"
                  >
                    {{ $t('crisis.color.' + event.severity) }}
                  </span>

                  <span class="severity-tag">{{ formatDateFull(event.startTime) }}</span>

                  <span
                    :class="['severity-tag', event.active ? 'true' : 'false']"
                    class="flex items-center justify-center h-8 rounded-full text-sm font-semibold"
                  >
                    {{ $t('add-event-info.active.' + event.active) }}
                  </span>
                </div>
                <Separator class="my-2" />
              </div>
            </InfiniteScroll>
          </CardContent>
          <CardFooter>
            <template #loading>
              <div class="text-center p-4">Laster...</div>
            </template>
            <template #end-message>
              <div class="text-center p-4">Alle hendelser er lastet inn</div>
            </template>
          </CardFooter>
        </Card>
      </div>

      <div>
        <Card class="edit" v-if="selectedEvent">
          <CardContent>
            <form @submit.prevent="onSubmit">
              <div class="read-only">
                <FormField name="title">
                  <FormItem>
                    <FormLabel>{{ $t('add-event-info.titles.title') }}</FormLabel>
                    <FormControl>
                      <Input type="text" v-model="selectedEvent.name" readonly disabled />
                    </FormControl>
                    <FormDescription>{{ $t('add-event-info.title') }}</FormDescription>
                  </FormItem>
                </FormField>
                <br />
                <FormField name="active">
                  <FormItem>
                    <FormLabel>{{ $t('add-event-info.titles.active') }}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        :placeholder="$t('add-event-info.active.' + selectedEvent?.active)"
                        readonly
                        disabled
                      />
                    </FormControl>
                    <FormDescription>{{ $t('add-event-info.active.description') }}</FormDescription>
                  </FormItem>
                </FormField>
              </div>

              <br />
              <div class="container">
                <FormField v-slot="{ field, meta, errorMessage }" name="epicenterLatitude">
                  <FormItem>
                    <FormLabel>{{ $t('add-event-info.titles.latitude') }}</FormLabel>
                    <FormControl>
                      <Input class="w-[100px]" type="number" step="any" v-bind="field" />
                    </FormControl>
                    <FormMessage v-if="meta.touched || meta.validated">{{
                        errorMessage
                      }}</FormMessage>
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field, meta, errorMessage }" name="epicenterLongitude">
                  <FormItem>
                    <FormLabel>{{ $t('add-event-info.titles.longitude') }}</FormLabel>
                    <FormControl>
                      <Input class="w-[100px]" type="number" step="any" v-bind="field" />
                    </FormControl>
                    <FormMessage v-if="meta.touched || meta.validated">{{
                        errorMessage
                      }}</FormMessage>
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field, meta, errorMessage }" name="address">
                  <FormItem>
                    <FormLabel>{{ $t('add-event-info.titles.address') }}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Eksempelveien 2" v-bind="field" />
                    </FormControl>
                    <FormMessage v-if="meta.touched || meta.validated">{{
                        errorMessage
                      }}</FormMessage>
                  </FormItem>
                </FormField>
              </div>
              <p class="text-muted-foreground text-sm">{{ $t('add-event-info.coordinates') }}</p>
              <br />

              <FormField v-slot="{ field, meta, errorMessage }" name="radius">
                <FormItem>
                  <FormLabel>{{ $t('add-event-info.titles.radius') }}</FormLabel>
                  <FormControl>
                    <Input type="number" v-bind="field" />
                  </FormControl>
                  <FormDescription>{{ $t('add-event-info.radius') }}</FormDescription>
                  <FormMessage v-if="meta.touched || meta.validated">{{
                      errorMessage
                    }}</FormMessage>
                </FormItem>
              </FormField>
              <br />

              <div class="read-only">
                <FormField name="startTime">
                  <FormItem>
                    <FormLabel>{{ $t('add-event-info.titles.time') }}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        :placeholder="formatDateFull(selectedEvent.startTime)"
                        readonly
                        disabled
                      />
                    </FormControl>
                    <FormDescription>{{ $t('add-event-info.time') }}</FormDescription>
                  </FormItem>
                </FormField>
              </div>
              <br />

              <div class="container">
                <FormField v-slot="{ field, meta, errorMessage }" name="severity">
                  <FormItem>
                    <FormLabel>{{ $t('add-event-info.titles.priority') }}</FormLabel>
                    <FormControl>
                      <Select v-bind="field">
                        <SelectTrigger style="cursor: pointer">
                          <SelectValue class="text-white dark:text-black" :class="['severity-tag', field.value]">{{
                              $t('add-event-info.crisis-level.' + field.value)
                            }}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup class="text-white dark:text-black">
                            <SelectItem class="severity-tag green" value="green">{{
                                $t('add-event-info.crisis-level.low')
                              }}</SelectItem>
                            <SelectItem class="severity-tag yellow" value="yellow">{{
                                $t('add-event-info.crisis-level.medium')
                              }}</SelectItem>
                            <SelectItem class="severity-tag red" value="red">{{
                                $t('add-event-info.crisis-level.high')
                              }}</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>{{ $t('add-event-info.priority') }}</FormDescription>
                    <FormMessage v-if="meta.touched || meta.validated">{{
                        errorMessage
                      }}</FormMessage>
                  </FormItem>
                </FormField>
                <br />

                <FormField v-slot="{ field, meta, errorMessage }" name="category">
                  <FormItem>
                    <FormLabel>{{ $t('add-event-info.titles.category') }}</FormLabel>
                    <FormControl>
                      <Select v-bind="field">
                        <SelectTrigger style="cursor: pointer">
                          <SelectValue :placeholder="scenarioName" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="type in scenarioPreviews" :key="type.id" :value="type.name">
                            {{ type.name }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>{{ $t('add-event-info.category') }}</FormDescription>
                    <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
                  </FormItem>
                </FormField>
              </div>
              <br />
              <FormField v-slot="{ field, meta, errorMessage }" name="description">
                <FormItem>
                  <FormLabel>{{ $t('add-event-info.titles.description') }}:</FormLabel>
                  <FormControl>
                    <Textarea class="descriptionArea" v-bind="field"> </Textarea>
                  </FormControl>
                  <FormDescription>{{ $t('add-event-info.description') }}</FormDescription>
                  <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
                </FormItem> </FormField
              ><br />

              <div class="buttons">
                <Button>{{ $t('add-event-info.titles.submit') }}</Button>
                <Button
                  type="button"
                  variant="destructive"
                  @click="deactivateEvent(selectedEvent.id)"
                >{{ $t('add-event-info.titles.deactivate') }}</Button
                >
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div class="map-area z-50" v-if="selectedEvent">
        <StaticMapWithCircle
          v-if="
            selectedEvent.epicenterLatitude != null && selectedEvent.epicenterLongitude != null
          "
          :key="`${selectedEvent.id}-${selectedEvent.epicenterLatitude}-${selectedEvent.epicenterLongitude}-${selectedEvent.radius}-${selectedEvent.severity}`"
          :lat="selectedEvent.epicenterLatitude"
          :lng="selectedEvent.epicenterLongitude"
          :radius="selectedEventRadiusInMeters"
          :color="getSeverityMapColor(selectedEvent.severity)"
          :mapId="`event-map-${selectedEvent.id}`"
        />
        <div v-else class="map-placeholder text-center text-muted-foreground p-4">
          {{$t('admin.map-location-missing')}}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { updateCurrentEvent, deactivateCurrentEvent, getCurrentEvents } from '@/services/api/AdminServices'
import type { CrisisEventDto, UpdateCrisisEventDto } from '@/models/CrisisEvent.ts'
import { fetchCrisisEventById } from '@/services/CrisisEventService'
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import { getScenarioThemePreview } from '@/services/api/ScenarioThemeService'
import type { ScenarioThemePreview } from '@/models/ScenarioTheme'
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import { formatDateFull } from '@/utils/dateUtils.ts'
import { getSeverityColor } from '@/utils/severityUtils.ts' // Import severity color utility
import { useI18n } from 'vue-i18n'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
// Import the StaticMapWithCircle component
import StaticMapWithCircle from '@/components/map/StaticMapWithCircle.vue';

const { t } = useI18n()
const selectedEvent = ref<CrisisEventDto | null>(null)
const updatedEvent = ref<UpdateCrisisEventDto | null>(null)
const scenarioPreviews = ref<ScenarioThemePreview[]>([])
const allowedCategories = ref<String[]>([])
const form = ref()
const onSubmit = ref<(e?: Event) => void>()
const scenarioName = ref<string | undefined>(undefined)
/**
 * For pagination:
 */
const queryClient = useQueryClient()
const pageSize = 10
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
  CrisisEventDto[],
  Error
>({
  queryKey: ['events'],
  queryFn: async ({ pageParam = 0 }) => {
    const pageNumber = pageParam as number
    const page = await getCurrentEvents(pageNumber, 10)
    return page.content
  },
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < pageSize ? undefined : allPages.length
  },
  initialPageParam: 0,
})

const allEvents = computed<CrisisEventDto[]>(() => data.value?.pages.flat() ?? [])
// allEvents.value.forEach((event: CrisisEventDto) => { console.log(event.id) }); // Removed console.log

/**
 * Saves the event the admin user chose to edit to the 'selectedEvent' variable.
 * @param index - index of event in the 'events' array.
 */
async function selectEvent(index: number) {
  const event = allEvents.value[index]
  if (!event) {
    console.log('Event doesnt exist in array from backend')
    return
  }
  try {
    const crisisEventDetails = await fetchCrisisEventById(event.id)
    console.log('Crisis Event details are: ', crisisEventDetails) // Changed 'er' to 'are'
    if (crisisEventDetails) {
      selectedEvent.value = crisisEventDetails
    } else {
      callToast('Could not load event...')
    }
  } catch (error) {
    console.error('Failed to select event', error)
  }
}

/**
 * When the component is loaded, the events saved will be displayed automatically.
 * Awaits response from fetchAllCrisisEvents() from backend API.
 */
onMounted(() => {
  fetchNextPage()
  try {
    getCategories()
    setUpFormSchema()
  } catch (error) {
    console.error('Could not set up form: ', error) // Changed 'klarte ikke sette opp skjema'
  }
})

function setUpFormSchema() {
  const formSchema = toTypedSchema(
    z
    .object({
      epicenterLatitude: z
      .preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z
        .number()
        .min(-90, t('add-event-info.errors.latitude'))
        .max(90, t('add-event-info.errors.latitude')),
      )
      .optional(),
      epicenterLongitude: z
      .preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z
        .number()
        .min(-180, t('add-event-info.errors.longitude'))
        .max(180, t('add-event-info.errors.longitude')),
      )
      .optional(),
      address: z.string().max(100, t('add-event-info.errors.address')).optional(),
      radius: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z
        .number()
        .min(1, t('add-event-info.errors.radius'))
        .max(10000, t('add-event-info.errors.radius')), // Assuming radius is in meters for the form
      ),
      severity: z.enum(['green', 'yellow', 'red']),
      category: z
      .string()
      .refine((val) => allowedCategories.value.includes(val), 'add-event-info.errors.category')
      .optional(),
      description: z
      .preprocess(
        (val) => (val === '' ? undefined : val),
        z.string().max(500, t('add-event-info.errors.description')).optional(),
      ),
    })
    .refine(
      (data) => {
        if (
          data.epicenterLatitude === undefined ||
          isNaN(data.epicenterLatitude) ||
          data.epicenterLongitude === undefined ||
          isNaN(data.epicenterLongitude)
        ) {
          return !!data.address && data.address.length > 0
        }
        return true
      },
      {
        message: t('add-event-info.errors.position-missing'),
        path: ['address'], // Associate error with address if coordinates are missing
      },
    ),
  )
  form.value = useForm({ validationSchema: formSchema })
  onSubmit.value = form.value.handleSubmit(handleFormSubmit)
}

/**
 * Every time selectedEvent changes, like after selecting an event from the list,
 * the form will reset its values to the selected events' values.
 */
watch(selectedEvent, async (event) => {
  if (event && form.value) {
    if (scenarioPreviews.value.length === 0) {
      console.warn('Scenarios not yet loaded in...')
      // Consider fetching categories if not loaded or showing a loading state
      await getCategories(); // Attempt to fetch if empty
      if(scenarioPreviews.value.length === 0) {
        console.error("Failed to load scenarios before setting form values.");
        return; // Exit if still empty after fetch attempt
      }
    }
    await nextTick()
    scenarioName.value = getScenarioName(event.scenarioThemeId)

    const radiusInMetersForForm =
      event.radius !== null && event.radius !== undefined ? event.radius * 1000 : '' // Convert km to meters for the form input

    form.value.setValues({
      epicenterLatitude: event.epicenterLatitude ?? '',
      epicenterLongitude: event.epicenterLongitude ?? '',
      address: '', // Reset address field on event change, let user re-enter if needed
      radius: radiusInMetersForForm,
      severity: event.severity ?? '',
      category: scenarioName.value === 'undefined' ? '' : scenarioName.value, // Handle undefined case
      description: event.description ?? '',
    })
  } else {
    scenarioName.value = undefined
  }
})

// Computed property to convert selectedEvent.radius (km) to meters for the map component
const selectedEventRadiusInMeters = computed(() => {
  if (selectedEvent.value?.radius != null) {
    return selectedEvent.value.radius * 1000
  }
  return 500 // Default radius if not set
})

// Function to get appropriate color for the map circle based on severity
const getSeverityMapColor = (severity: 'green' | 'yellow' | 'red' | string | undefined) => {
  if (!severity) return getSeverityColor('green'); // Default color
  return getSeverityColor(severity);
}


/**
 * the updated fields should be saved with the new changes,
 * and the fields unchanged should stay as they were when first fetched
 * from the backend API. Then submit.
 */
async function handleFormSubmit(values: any) {
  if (!selectedEvent.value) {
    console.error('No event selected')
    return
  }
  // Get radius from form (which is in meters)
  const radiusFromFormInMeters =
    values.radius !== undefined && values.radius !== null && values.radius !== ''
      ? Number(values.radius)
      : selectedEvent.value.radius !== null && selectedEvent.value.radius !== undefined
        ? selectedEvent.value.radius * 1000 // Use existing radius in meters if form is empty
        : null

  // Convert back to kilometers for the backend
  const radiusInKilometersForBackend =
    radiusFromFormInMeters !== null ? radiusFromFormInMeters / 1000 : null

  updatedEvent.value = {
    name: selectedEvent.value.name,
    latitude: values.epicenterLatitude ?? selectedEvent.value.epicenterLatitude,
    longitude: values.epicenterLongitude ?? selectedEvent.value.epicenterLongitude,
    description: values.description ?? selectedEvent.value.description,
    severity: values.severity ?? selectedEvent.value.severity,
    scenarioThemeId: getScenarioId(values.category ?? '') ?? selectedEvent.value.scenarioThemeId,
    radius: radiusInKilometersForBackend, // Send radius in KM
  }
  console.log('Updating event values to:', updatedEvent.value) // Changed 'Oppdaterte event verdier til'

  updateSelectedEvent()
}

/**
 * Update the selected event with the new details in backend API.
 */
async function updateSelectedEvent() {
  if (!selectedEvent.value || !updatedEvent.value) {
    console.log('No event selected or updated!')
    return
  }
  try {
    const response = await updateCurrentEvent(selectedEvent.value.id, updatedEvent.value)

    console.log('Event updated successfully!', response.data)
    callToast('Updated the event with your new values!')

    selectedEvent.value = null // redirects user back to the list of events
    updatedEvent.value = null

    await queryClient.invalidateQueries({ queryKey: ['events'] })
  } catch (error) {
    callToast('Failed to update event details...')
    console.error('Failed to update event: ', error)
  }
}

/**
 * Cancels the potential changes of variables.
 * Being used in 'Go back' button.
 */
function cancelUpdate() {
  selectedEvent.value = null
  updatedEvent.value = null
  form.value?.resetForm()
}

/**
 * Deactivates the event by setting the 'active' attribute in backend API to 'false'.
 * Shows up in the form as 'inactive' if false, or 'active' if true.
 * @param id
 */
async function deactivateEvent(id: number) {
  if (!selectedEvent.value) {
    console.log("didnt select any event...")
    return
  }
  try {
    await deactivateCurrentEvent(id)
    callToast('Hendelsen er nå satt som inaktiv!')

    selectedEvent.value = null // redirects user back to the list of events
    updatedEvent.value = null

    await queryClient.invalidateQueries({ queryKey: ['events'] })
  } catch (error) {
    callToast('Failed to deactivate event!')
    console.error('Something happened when trying to deactivate: ', error)
  }
}

async function getCategories() {
  try {
    const response = await getScenarioThemePreview()
    console.log('getting scenarios:', response)
    if (response && Array.isArray(response)) {
      scenarioPreviews.value = response
      allowedCategories.value = scenarioPreviews.value.map((s) => s.name)
      console.log('allowedCategories: ', allowedCategories.value)
    } else if (response && response.content && Array.isArray(response.content)) {
      // Handle potential paginated response format
      scenarioPreviews.value = response.content
      allowedCategories.value = scenarioPreviews.value.map((s) => s.name)
      console.log('allowedCategories from paginated response: ', allowedCategories.value)
    }
    else {
      console.error('Unexpected response format for scenario themes, not an array', response)
      scenarioPreviews.value = [] // Setting empty arrays to prevent potential runtime fails
      allowedCategories.value = []
    }
  } catch (error) {
    console.error('Something happened when fetching categories: ', error)
    scenarioPreviews.value = [] // Setting empty arrays to prevent potential runtime fails
    allowedCategories.value = []
  }
}

function getScenarioName(id: number): string {
  if (!scenarioPreviews.value || id === null) {
    console.log('Could not find scenario type...') // Changed 'Fant ikke scenariotypen'
    return 'undefined'
  } else {
    const scenario = scenarioPreviews.value.find(s => s.id === id);
    console.log('Got scenario name: ', scenario?.name) // Changed 'henta scenario navn'
    return scenario ? scenario.name : 'undefined';
  }
}


function getScenarioId(category: string): number | null {
  if (!scenarioPreviews.value) {
    return null
  }
  const scenario = scenarioPreviews.value.find(s => s.name === category);
  return scenario ? scenario.id : null;
}

/**
 * Pop-up functionality.
 * Takes in a message to show the user that some action has happened.
 * @param message
 */
function callToast(message: string) {
  console.log('Called toast for message: ', message)
  toast(message)
}
</script>

<style scoped>
h1 {
  font-size: 2em;
  margin: 20px;
}

.buttons > Button {
  margin: 5px;
}

.page {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  margin: 30px;
  gap: 15px;
  align-items: flex-start;
}

.container {
  display: flex;
  flex-flow: row nowrap;
  gap: 10px;
}

.events {
  min-width: fit-content;
  max-height: 600px;
  border-radius: 8px;
}

.listOfEvents {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  font-size: 1.3em;
  gap: 3px;
  justify-content: space-evenly;
}

.edit {
  min-width: fit-content;
  max-width: 450px;
}

.read-only {
  cursor: not-allowed;
}

.read-only input {
  background-color: var(--color-muted);
  cursor: not-allowed;
  text-transform: capitalize;
}

.card-content > div {
  padding-top: 10px;
  border-radius: 8px;
  text-align: center;
  font-size: 1em;
}

.descriptionArea {
  min-height: 100px;
  overflow: auto;
}

.severity-tag {
  padding: 2px 10px;
  border-radius: 8px;
  text-transform: capitalize;
}
.true {
  background-color: var(--default-blue); /**endre fargene senere */
}
.false {
  background-color: var(--gray);
}

.green {
  background-color: var(--crisis-level-green);
}
.yellow {
  background-color: var(--crisis-level-yellow);
}
.red {
  background-color: var(--crisis-level-red);
}

/* Added styling for the map area */
.map-area {
  border-radius: 8px;
  border: 1px solid var(--border); /* Use theme border */
  min-width: 300px;
  min-height: 400px; /* Match map container height */
  overflow: hidden; /* Ensure map stays within bounds */
  background-color: var(--muted); /* Placeholder background */
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
