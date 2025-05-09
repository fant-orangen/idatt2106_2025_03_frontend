<template>
  <div class="m-5">

    <!-- Breadcrumb navigation -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbItem>
          <BreadcrumbLink href="/">
            {{ $t('navigation.home') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
          <BreadcrumbLink href="/admin/admin-panel">
            {{ $t('navigation.admin-panel') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage href="/admin/add-new-event">{{ $t('navigation.new-event') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <!-- Page title -->
  <h1 class="text-4xl text-center mb-8">{{ $t('admin.make-new-event') }}:</h1>

  <!-- Main layout: form and map -->
  <div class="grid lg:grid-cols-2 grid-cols-1 gap-8 max-w-7xl mx-auto my-8 p-5">

    <!-- Event form -->
    <div class="p-5 bg-background rounded-lg shadow-md flex flex-col">
      <form @submit.prevent="onSubmit" class="flex-grow flex flex-col justify-between">

        <!-- Title input -->
        <FormField v-slot="{ field, meta, errorMessage }" name="title">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.title') }}</FormLabel>
            <FormControl>
              <Input type="text" :placeholder="$t('add-event-info.titles.title')" v-bind="field" />
            </FormControl>
            <FormDescription>{{ $t('add-event-info.title') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <!-- Location section -->
        <div class="mb-4 pb-2.5 border-b border-border">
          <h2 class="text-xl font-semibold m-0">{{ $t('admin.location-info') || 'Plassering' }}</h2>
        </div>

        <!-- Latitude and longitude (readonly) -->
        <div class="flex sm:flex-row flex-col sm:gap-4 gap-2.5 mb-4">
          <FormField v-slot="{ field, meta, errorMessage }" name="latitude">
            <FormItem class="flex-1">
              <FormLabel>{{ $t('add-event-info.titles.latitude') }}</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" placeholder="latitude" v-bind="field" readonly />
              </FormControl>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field, meta, errorMessage }" name="longitude">
            <FormItem class="flex-1">
              <FormLabel>{{ $t('add-event-info.titles.longitude') }}</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" placeholder="longitude" v-bind="field" readonly />
              </FormControl>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <!-- Address input -->
        <FormField v-slot="{ field, meta, errorMessage }" name="address">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.address') }}</FormLabel>
            <FormControl>
              <Input type="text" :placeholder="$t('admin.address-placeholder') || 'Eksempelveien 2'" v-bind="field" />
            </FormControl>
            <FormDescription>{{ $t('add-event-info.coordinates') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <!-- Basic information section -->
        <div class="mb-4 pb-2.5 border-b border-border">
          <h2 class="text-xl font-semibold m-0">{{ $t('admin.basic-info') || 'Hendelsesdetaljer' }}</h2>
        </div>

        <FormField v-slot="{ field, meta, errorMessage }" name="radius">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.radius') }}</FormLabel>
            <FormControl>
              <Input type="number" placeholder="meters" v-bind="field" />
            </FormControl>
            <FormDescription>{{ $t('add-event-info.radius') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <!-- Time and date inputs -->
        <div class="flex sm:flex-row flex-col sm:gap-4 gap-2.5 mb-4">
          <FormField v-slot="{ field, meta, errorMessage }" name="time">
            <FormItem class="flex-1">
              <FormLabel>{{ $t('add-event-info.titles.time') }}</FormLabel>
              <FormControl>
                <Input type="time" v-bind="field" />
              </FormControl>
              <FormDescription>{{ $t('add-event-info.time') }}</FormDescription>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field, meta, errorMessage }" name="date">
            <FormItem class="flex-1">
              <FormLabel>{{ $t('add-event-info.titles.date') }}</FormLabel>
              <FormControl>
                <Input type="date" v-bind="field" />
              </FormControl>
              <FormDescription>{{ $t('add-event-info.date') }}</FormDescription>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>
        <br />

        <!-- Priority selection -->
        <FormField v-slot="{ field, meta, errorMessage }" name="priority">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.priority') }}</FormLabel>
            <Select v-bind="field">
              <FormControl>
                <SelectTrigger style="cursor: pointer;">
                  <SelectValue :placeholder="$t('add-event-info.titles.priority') || 'Velg et krisenivå'" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup class="text-white dark:text-black">
                  <SelectItem class="severity-tag green" value="green">{{ $t('add-event-info.crisis-level.low') }}</SelectItem>
                  <SelectItem class="severity-tag yellow" value="yellow">{{ $t('add-event-info.crisis-level.medium') }}</SelectItem>
                  <SelectItem class="severity-tag red" value="red">{{ $t('add-event-info.crisis-level.high') }}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormDescription>{{ $t('add-event-info.priority') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br>

        <!-- Event category selection -->
        <FormField v-slot="{ field, meta, errorMessage }" name="category">
          <FormItem>
            <FormLabel>{{$t('add-event-info.titles.category')}}</FormLabel>
            <FormControl>
              <Select v-bind="field">
                <SelectTrigger style="cursor: pointer;">
                  <SelectValue :placeholder="$t('add-event-info.scenarios.undefined')"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="type in scenarioPreviews" :key="type.id"
                    :value="type.name">
                    {{ type.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>{{ $t('add-event-info.category') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <!-- Description text area -->
        <FormField v-slot="{ field, meta, errorMessage }" name="description">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.description') }}:</FormLabel>
            <FormControl>
              <Textarea v-bind="field"></Textarea>
            </FormControl>
            <FormDescription>{{ $t('add-event-info.description') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <!-- Submit button -->
        <Button type="submit">{{ $t('add-event-info.titles.submit') }}</Button>
      </form>
    </div>

    <!-- Map section -->
    <div class="flex flex-col lg:order-none order-first lg:mb-0 mb-8 z-50">
      <AdminMapController
        :mapComponent="mapComponentInstance"
        @location-selected="handleLocationSelected"
        @location-cleared="handleLocationCleared"
      />

      <!-- Map display -->
      <div class="flex-grow lg:min-h-[500px] min-h-[400px] rounded-lg overflow-hidden border border-gray-300 shadow-md z-50">
        <MapComponent
          ref="mapComponent"
          :adminMode="true"
          :centerLat="initialCenter.lat"
          :centerLon="initialCenter.lng"
          :initialZoom="6"
          @map-clicked="handleMapClick"
        />
      </div>
    </div>
  </div>

  <!-- Success dialog shown once event is created -->
  <Dialog :open="isSuccessDialogOpen" @update:open="isSuccessDialogOpen = $event">
    <DialogContent
      class="
      fixed top-1/2 left-1/2
      transform -translate-x-1/2 -translate-y-1/2
      w-full max-w-md
      max-h-[80vh] overflow-auto
      bg-white rounded-lg p-6
      z-[1001]
    "
    >
      <!-- Dialog header with title and description -->
      <DialogHeader>
        <DialogTitle>{{ $t('add-event-info.successfully') }}</DialogTitle>
        <DialogDescription>
          {{ $t('add-event-info.success-message') }}
        </DialogDescription>

        <!-- Success content with icon and message -->
      </DialogHeader>
      <div class="py-4">
        <div class="flex items-center gap-2 mb-4">
          <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </div>
          <p class="text-lg">
            <strong>{{ createdEventName }}</strong> {{ $t('add-event-info.success-added') }}
          </p>
        </div>
      </div>

      <!-- Dialog footer with navigation button -->
      <DialogFooter>
        <Button @click="navigateToAdminPanel">{{ $t('add-event-info.go-to-admin') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
/**
 * @fileoverview This file defines the AdminAddNewEvent Vue component.
 * It provides an administrative interface for adding new crisis events to the system.
 * It utilizes VeeValidate for form handling and validation, Zod for schema definition,
 * and integrates with MapComponent and AdminMapController for location selection.
 * API calls are made via the AdminServices module.
 */

import { ref, computed, watch, onMounted } from 'vue';
import { createEvent } from '@/services/api/AdminServices';
import router from '@/router/index.ts';
import { Button } from '@/components/ui/button';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useI18n } from 'vue-i18n';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getScenarioThemePreview } from '@/services/api/ScenarioThemeService';
import type { CreateCrisisEventDto } from '@/models/CrisisEvent'
import type { ScenarioThemePreview } from '@/models/ScenarioTheme'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MapComponent from '@/components/map/MapComponent.vue';
import AdminMapController from '@/components/admin/AdminMapController.vue';
import * as L from 'leaflet';

/**
 * Represents geographical coordinates.
 * @interface Location
 * @property {number} lat - Latitude.
 * @property {number} lng - Longitude.
 */
interface Location {
  lat: number;
  lng: number;
}

/**
 * Represents the event object emitted when the map is clicked.
 * @interface MapClickEvent
 * @property {object} latlng - Contains latitude and longitude.
 * @property {number} latlng.lat - Latitude of the click event.
 * @property {number} latlng.lng - Longitude of the click event.
 */
interface MapClickEvent {
  latlng: {
    lat: number;
    lng: number;
  };
}

// --- State and Initialization ---
const { t } = useI18n();

// Map related state
const mapComponent = ref<InstanceType<typeof MapComponent> | null>(null);
const tempMarker = ref<L.Marker | null>(null);
const initialCenter: Location = { lat: 63.4305, lng: 10.3951 };

// Dialog state
const isSuccessDialogOpen = ref(false);
const createdEventName = ref('');

const scenarioPreviews = ref<ScenarioThemePreview[]>([]);
const allowedScenarios = ref<string[]>([]);

onMounted(() => {
	getCategories();
});

/**
 * Zod schema definition for form validation.
 * Defines rules for each form field, including type checks, length constraints,
 * and conditional validation (e.g., coordinates or address required).
 */
const formSchema = toTypedSchema(
  z.object({

    title: z.string().min(2, t('add-event-info.errors.title')).max(50, t('add-event-info.errors.title')),
    latitude: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(-90, t('add-event-info.errors.latitude')).max(90, t('add-event-info.errors.latitude'))
    ),
    longitude: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(-180, t('add-event-info.errors.longitude')).max(180, t('add-event-info.errors.longitude'))
    ),
    address: z.string().max(100, t('add-event-info.errors.address')).optional(),
    radius: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number({required_error: "Radius is required"}).min(1, t('add-event-info.errors.radius')).max(100000, t('add-event-info.errors.radius'))
    ),
    time: z.string().optional(),
    date: z.string().optional(),
    priority: z.enum(['green', 'yellow', 'red'], { required_error: t('add-event-info.errors.priority') }),
    category: z.string().refine(val => allowedScenarios.value.includes(val),'add-event-info.errors.category').optional(),
    description: z.string().min(10, t('add-event-info.errors.description')).max(500, t('add-event-info.errors.description')),
  })
  .refine(
    (data) => {
      const hasCoords = (data.latitude !== undefined && !isNaN(data.latitude)) && (data.longitude !== undefined && !isNaN(data.longitude));
      const hasAddress = data.address && data.address.trim().length >= 2;
      return hasCoords || hasAddress;
    },
    {
      message: t('add-event-info.errors.position-missing'),
      path: ['address'],
    }
  )
  .refine(
    (data) => !(data.date || data.time) || (data.date && data.time),
    {
      message: 'Både dato og tid må angis for starttidspunkt.',
      path: ['time'],
    }
  )
);

/**
 * VeeValidate form instance.
 * Manages form state, validation based on formSchema, and submission handling.
 */
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: '',
    latitude: undefined,
    longitude: undefined,
    address: '',
    radius: undefined,
    time: '',
    date: '',
    priority: undefined,
    category: undefined,
    description: '',
  },
});

// --- Computed Properties ---

/**
 * Computed property to safely access the MapComponent instance.
 * Adjusted to return null instead of undefined to match potential prop types.
 * @returns {InstanceType<typeof MapComponent> | null} The map component instance or null.
 */
const mapComponentInstance = computed(() => {
  return mapComponent.value || null;
});

// --- Map Interaction Functions ---

/**
 * Handles the 'map-clicked' event from the MapComponent.
 * Updates the form's latitude and longitude fields and the map marker.
 * @param {MapClickEvent} event - The event object containing click coordinates.
 */
function handleMapClick(event: MapClickEvent): void {
  console.log('Map clicked at:', event.latlng);
  const location: Location = { lat: event.latlng.lat, lng: event.latlng.lng };
  handleLocationSelected(location);
}

/**
 * Updates the form's latitude and longitude fields and the temporary map marker
 * when a location is selected via map click or controller.
 * Clears any validation error associated with the address field.
 * @param {Location} location - The selected location coordinates.
 */
function handleLocationSelected(location: Location): void {
  console.log('Location selected:', location);
  form.setFieldValue('latitude', location.lat);
  form.setFieldValue('longitude', location.lng);
  updateMapMarker(location.lat, location.lng);
  form.setFieldError('address', undefined);
}

/**
 * Clears the form's latitude and longitude fields and removes the temporary marker
 * when the location is cleared via the map controller.
 */
function handleLocationCleared(): void {
  console.log('Location cleared');
  form.setFieldValue('latitude', undefined);
  form.setFieldValue('longitude', undefined);

  // Remove marker from the map
  if (tempMarker.value && mapComponent.value?.removeMarker) {
    mapComponent.value.removeMarker(tempMarker.value as L.Marker);
    tempMarker.value = null;
  }
}

/**
 * Navigates the user back to the admin panel after closing the success dialog.
 */
function navigateToAdminPanel(): void {
  isSuccessDialogOpen.value = false;
  router.push('/admin/admin-panel');
}

/**
 * Adds or updates the temporary marker on the map at the specified coordinates.
 * Sets the marker's popup/tooltip content based on the current form title and description.
 * @param {number} lat - Latitude for the marker.
 * @param {number} lng - Longitude for the marker.
 */
function updateMapMarker(lat: number, lng: number): void {
  if (!mapComponent.value?.addMarker) {
    console.error('Map component or addMarker method not available yet.');
    return;
  }
  if (tempMarker.value && mapComponent.value?.removeMarker) {
    mapComponent.value.removeMarker(tempMarker.value as L.Marker);
  }

  // Get title and description from form values (use fallbacks)
  const title = form.values.title || t('navigation.new-event') || 'Ny hendelse';
  const description = form.values.description || '';
  const popupContent = `<b>${title}</b><br>${description}`;

  // Add the new marker
  tempMarker.value = mapComponent.value.addMarker(lat, lng, title);

  // Bind popup and tooltip if marker exists and methods are available
  if (tempMarker.value) {
    if (typeof tempMarker.value.bindPopup === 'function') {
      tempMarker.value.bindPopup(popupContent).openPopup();
    } else if (typeof tempMarker.value.bindTooltip === 'function') {
      tempMarker.value.bindTooltip(title).openTooltip();
    }
  }
}

// --- Watchers ---

/**
 * Watches the form's title field for changes.
 * Updates the temporary map marker's popup/tooltip content dynamically.
 */
watch(
  () => form.values.title, // Source: the title value from the form state
  (newTitle) => { // Callback executed when the title changes

    // Guard against accessing properties before initialization or if marker doesn't exist
    if (form.values && tempMarker.value && mapComponent.value) {
      const markerTitle = newTitle || t('navigation.new-event') || 'Ny hendelse';
      const description = form.values.description || '';
      const popupContent = `<b>${markerTitle}</b><br>${description}`;

      // Update popup content if the marker supports it
      if (typeof tempMarker.value.setPopupContent === 'function') {
        tempMarker.value.setPopupContent(popupContent);
      }
      // Update tooltip content if the marker supports it
      if (typeof tempMarker.value.setTooltipContent === 'function') {
        tempMarker.value.setTooltipContent(markerTitle);
      }
      console.log('Updated marker title/popup to:', markerTitle);
    }
  }
);

// --- Form Submission Logic ---

/**
 * Handles the form submission event triggered by VeeValidate.
 * Maps form data to the backend API structure (CrisisEventDto),
 * calls the `createEvent` service, and manages success/error states.
 * @param {object} values - The validated form values provided by VeeValidate.
 */
const onSubmit = form.handleSubmit(async (values) => {
  console.log('Form values on submit:', values);
  try {
    if (!values.date || !values.time) {
      console.error('Start time (date and time) is required but missing.');
      form.setFieldError('date', 'Starttidspunkt (dato og tid) er påkrevd.');
      form.setFieldError('time', 'Starttidspunkt (dato og tid) er påkrevd.');
      return;
    }

    // Combine date and time into ISO format (e.g., "YYYY-MM-DDTHH:MM:SS")
    const startTime = `${values.date}T${values.time}:00`; // Append seconds for potential backend requirements

    /**
     * Prepare the payload matching the backend's CreateCrisisEventDto
     */

    const radiusInMeters = typeof values.radius === 'number' ? values.radius : parseFloat(values.radius || '0');
    const radiusInKilometers = radiusInMeters / 1000;

    const eventData: CreateCrisisEventDto = {
      name: values.title,
      latitude: values.latitude,
      longitude: values.longitude,
      radius: radiusInKilometers,
      severity: values.priority,
      scenarioThemeId: getScenarioId(values.category?? ''),
      description: values.description,
      startTime: startTime,
    };

    console.log('Submitting Event data:', eventData);
    const response = await createEvent(eventData);
    console.log('Event created successfully!', response.data);

    // Show success dialog on successful creation
    createdEventName.value = values.title;
    isSuccessDialogOpen.value = true;

  } catch (error: any) {
    console.error('An error occurred while submitting the event: ', error);
    const errorMessage = error.response?.data?.message || error.message || 'Ukjent feil oppstod.';
    form.setFieldError('title', `Innsending feilet: ${errorMessage}`);
  }
});

async function getCategories() {
	try {
		const response = await getScenarioThemePreview();
		console.log('getting scenarios:', response);
		if (response && Array.isArray(response)) {
			scenarioPreviews.value = response;
      allowedScenarios.value = scenarioPreviews.value.map((s) => s.name);
		} else if (response && response.content && Array.isArray(response.content)) {
			scenarioPreviews.value = response.content;
      allowedScenarios.value = scenarioPreviews.value.map((s) => s.name);
		} else {
			console.error('Unexpected response format for scenario themes, not an array', response);
			scenarioPreviews.value = [];
      allowedScenarios.value = scenarioPreviews.value.map((s) => s.name);
		}
	} catch (error) {
		console.error('Something happened when fetching categories: ', error);
		scenarioPreviews.value = []; // setting empty arrays to prevent potential runtime fails
	}
}

function getScenarioId(category: string): number | null {
	if (!scenarioPreviews.value || category ==='') {
		return null;
	}
	let scenario: ScenarioThemePreview | null = null;
	for (let i = 0; i < scenarioPreviews.value.length; i++) {
		if (scenarioPreviews.value[i].name == category) {
			scenario = scenarioPreviews.value[i];
			break;
		}
	}
	return scenario ? scenario.id : null;
}
</script>

<style scoped>
.severity-tag {
	padding: 2px 10px;
	border-radius: 8px;
	text-transform: uppercase;
}

.green {
	background-color: var(--color-chart-2);
}
.yellow {
	background-color: var(--color-chart-4);
}
.red {
	background-color: var(--color-chart-1);
}
</style>
