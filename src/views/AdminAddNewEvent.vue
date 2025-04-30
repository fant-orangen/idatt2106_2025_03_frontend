<template>
  <div style="margin: 20px">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin-panel">
            {{ $t('navigation.admin-panel') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage href="/add-new-event">{{ $t('navigation.new-event') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <h1>{{ $t('admin.make-new-event') }}:</h1>

  <div class="content-container">
    <div class="form-section">
      <form @submit="onSubmit">
        <FormField v-slot="{ componentField, meta, errorMessage }" name="title">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.title') }}</FormLabel>
            <FormControl>
              <Input type="text" :placeholder="$t('add-event-info.titles.title')" v-bind="componentField" />
            </FormControl>
            <FormDescription>{{ $t('add-event-info.title') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <div class="form-section-header">
          <h2>{{ $t('admin.location-info') || 'Plassering' }}</h2>
        </div>

        <div class="coordinates-container">
          <FormField v-slot="{ componentField, meta, errorMessage }" name="latitude">
            <FormItem class="half-width">
              <FormLabel>{{ $t('add-event-info.titles.latitude') }}</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" placeholder="latitude" v-bind="componentField" readonly />
              </FormControl>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, meta, errorMessage }" name="longitude">
            <FormItem class="half-width">
              <FormLabel>{{ $t('add-event-info.titles.longitude') }}</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" placeholder="longitude" v-bind="componentField" readonly />
              </FormControl>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField, meta, errorMessage }" name="address">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.address') }}</FormLabel>
            <FormControl>
              <Input type="text" :placeholder="$t('admin.address-placeholder') || 'Eksempelveien 2'" v-bind="componentField" />
            </FormControl>
            <FormDescription>{{ $t('add-event-info.coordinates') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <div class="form-section-header">
          <h2>{{ $t('admin.basic-info') || 'Hendelsesdetaljer' }}</h2>
        </div>

        <FormField v-slot="{ componentField, meta, errorMessage }" name="radius">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.radius') }}</FormLabel>
            <FormControl>
              <Input type="number" placeholder="meters" v-bind="componentField" />
            </FormControl>
            <FormDescription>{{ $t('add-event-info.radius') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <div class="datetime-container">
          <FormField v-slot="{ componentField, meta, errorMessage }" name="time">
            <FormItem class="half-width">
              <FormLabel>{{ $t('add-event-info.titles.time') }}</FormLabel>
              <FormControl>
                <Input type="time" v-bind="componentField" />
              </FormControl>
              <FormDescription>{{ $t('add-event-info.time') }}</FormDescription>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, meta, errorMessage }" name="date">
            <FormItem class="half-width">
              <FormLabel>{{ $t('add-event-info.titles.date') }}</FormLabel>
              <FormControl>
                <Input type="date" v-bind="componentField" />
              </FormControl>
              <FormDescription>{{ $t('add-event-info.date') }}</FormDescription>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>
        <br />

        <FormField v-slot="{ componentField, meta, errorMessage }" name="priority">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.priority') }}</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger style="cursor: pointer;">
                  <SelectValue :placeholder="$t('add-event-info.titles.priority') || 'Velg et krisenivå'" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Low">{{ $t('add-event-info.crisis-level.low') }}</SelectItem>
                  <SelectItem value="Medium">{{ $t('add-event-info.crisis-level.medium') }}</SelectItem>
                  <SelectItem value="High">{{ $t('add-event-info.crisis-level.high') }}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormDescription>{{ $t('add-event-info.priority') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <FormField v-slot="{ componentField, meta, errorMessage }" name="description">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.description') }}:</FormLabel>
            <FormControl>
              <Textarea :placeholder="$t('add-event-info.description')" v-bind="componentField"></Textarea>
            </FormControl>
            <FormDescription>{{ $t('add-event-info.description') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br />

        <Button type="submit">{{ $t('add-event-info.titles.submit') }}</Button>
      </form>
    </div>

    <div class="map-section">
      <AdminMapController
        :mapComponent="mapComponentInstance"
        @location-selected="handleLocationSelected"
        @location-cleared="handleLocationCleared"
      />
      <div class="map-container">
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
      <DialogHeader>
        <DialogTitle>{{ $t('add-event-info.successfully') }}</DialogTitle>
        <DialogDescription>
          {{ $t('add-event-info.success-message') }}
        </DialogDescription>
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

import { ref, computed, watch } from 'vue';
import { createEvent } from '@/services/api/AdminServices'; // API service for creating events
import router from '@/router/index.ts'; // Vue router instance
import { Button } from '@/components/ui/button'; // UI Button component
import { useForm } from 'vee-validate'; // Form handling library
import { toTypedSchema } from '@vee-validate/zod'; // VeeValidate Zod adapter
import * as z from 'zod'; // Schema validation library
import { useI18n } from 'vue-i18n'; // Internationalization library
import { Input } from '@/components/ui/input'; // UI Input component
import { Textarea } from '@/components/ui/textarea'; // UI Textarea component
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'; // UI Form components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'; // UI Breadcrumb components
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // UI Select components
import {
  Dialog,
  DialogContent,
  // DialogOverlay, // Typically not directly used with DialogContent
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'; // UI Dialog components
import MapComponent from '@/components/map/MapComponent.vue'; // Custom Map component
import AdminMapController from '@/components/admin/AdminMapController.vue'; // Custom Map controller component
import * as L from 'leaflet'; // Leaflet library for map interactions

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
const { t } = useI18n(); // i18n instance

// Map related state
const mapComponent = ref<InstanceType<typeof MapComponent> | null>(null); // Ref to the map component
const tempMarker = ref<L.Marker | null>(null); // Ref to the temporary marker on the map
const initialCenter: Location = { lat: 63.4305, lng: 10.3951 }; // Initial map center (Norway)

// Dialog state
const isSuccessDialogOpen = ref(false); // Controls success dialog visibility
const createdEventName = ref(''); // Stores the created event name for the dialog

/**
 * Zod schema definition for form validation.
 * Defines rules for each form field, including type checks, length constraints,
 * and conditional validation (e.g., coordinates or address required).
 */
const formSchema = toTypedSchema(
  z.object({
    // Title: required string, min 2, max 50 chars
    title: z.string().min(2, t('add-event-info.errors.title')).max(50, t('add-event-info.errors.title')),
    // Latitude: optional number between -90 and 90
    latitude: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(-90, t('add-event-info.errors.latitude')).max(90, t('add-event-info.errors.latitude')).optional()
    ),
    // Longitude: optional number between -180 and 180
    longitude: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(-180, t('add-event-info.errors.longitude')).max(180, t('add-event-info.errors.longitude')).optional()
    ),
    // Address: optional string, max 100 chars
    address: z.string().max(100, t('add-event-info.errors.address')).optional(),
    // Radius: required number, min 1, max 10000
    radius: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), // Handle empty string properly
      z.number({required_error: "Radius is required"}).min(1, t('add-event-info.errors.radius')).max(10000, t('add-event-info.errors.radius'))
    ),
    // Time: optional string (HH:MM format expected)
    time: z.string().optional(),
    // Date: optional string (YYYY-MM-DD format expected)
    date: z.string().optional(),
    // Priority/Severity: required enum ('Low', 'Medium', 'High')
    priority: z.enum(['Low', 'Medium', 'High'], { required_error: t('add-event-info.errors.priority') }),
    // Description: required string, min 10, max 500 chars
    description: z.string().min(10, t('add-event-info.errors.description')).max(500, t('add-event-info.errors.description')),
  })
  // Refine step 1: Ensure either coordinates or address (min 2 chars) are provided
  .refine(
    (data) => {
      const hasCoords = (data.latitude !== undefined && !isNaN(data.latitude)) && (data.longitude !== undefined && !isNaN(data.longitude));
      const hasAddress = data.address && data.address.trim().length >= 2;
      return hasCoords || hasAddress;
    },
    {
      message: t('add-event-info.errors.position-missing'),
      path: ['address'], // Show error message associated with the address field if condition fails
    }
  )
  // Refine step 2: Ensure both date and time are provided if either one is
  .refine(
    (data) => !(data.date || data.time) || (data.date && data.time), // If either is set, both must be set
    {
      message: 'Både dato og tid må angis for starttidspunkt.', // Translation key can be used here too
      path: ['time'], // Show error message associated with the time field
    }
  )
);

/**
 * VeeValidate form instance.
 * Manages form state, validation based on formSchema, and submission handling.
 */
const form = useForm({
  validationSchema: formSchema,
  initialValues: { // Set initial values (important for reactivity)
    title: '',
    latitude: undefined, // Initialize number fields as undefined
    longitude: undefined,
    address: '',
    radius: undefined, // Initialize as undefined to avoid "0" placeholder issues
    time: '',
    date: '',
    priority: undefined, // Initialize select as undefined
    description: '',
  },
});

// --- Computed Properties ---

/**
 * Computed property to safely access the MapComponent instance.
 * @returns {InstanceType<typeof MapComponent> | undefined} The map component instance or undefined.
 */
const mapComponentInstance = computed(() => {
  return mapComponent.value || undefined; // Return undefined if ref is null
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
  form.setFieldError('address', undefined); // Clear address validation error if coordinates are now set
}

/**
 * Clears the form's latitude and longitude fields and removes the temporary marker
 * when the location is cleared via the map controller.
 */
function handleLocationCleared(): void {
  console.log('Location cleared');
  form.setFieldValue('latitude', undefined); // Reset coordinates
  form.setFieldValue('longitude', undefined);

  // Remove marker from the map
  if (tempMarker.value && mapComponent.value?.removeMarker) {
    mapComponent.value.removeMarker(tempMarker.value as L.Marker); // Type assertion might be needed
    tempMarker.value = null;
  }
}

/**
 * Navigates the user back to the admin panel after closing the success dialog.
 */
function navigateToAdminPanel(): void {
  isSuccessDialogOpen.value = false; // Close the dialog
  router.push('/admin-panel'); // Navigate
}

/**
 * Adds or updates the temporary marker on the map at the specified coordinates.
 * Sets the marker's popup/tooltip content based on the current form title and description.
 * @param {number} lat - Latitude for the marker.
 * @param {number} lng - Longitude for the marker.
 */
function updateMapMarker(lat: number, lng: number): void {
  // Ensure map component and its methods are available
  if (!mapComponent.value?.addMarker) {
    console.error('Map component or addMarker method not available yet.');
    return;
  }
  // Remove existing marker if present
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
 * Maps form data to the backend API structure (CreateCrisisEventDto),
 * calls the `createEvent` service, and manages success/error states.
 * @param {object} values - The validated form values provided by VeeValidate.
 */
const onSubmit = form.handleSubmit(async (values) => {
  console.log('Form values on submit:', values);
  try {
    // Map frontend priority ('Low', 'Medium', 'High') to backend severity ('green', 'yellow', 'red')
    let severity: 'green' | 'yellow' | 'red';
    switch (values.priority) {
      case 'Low': severity = 'green'; break;
      case 'Medium': severity = 'yellow'; break;
      case 'High': severity = 'red'; break;
      default:
        // Should not happen due to Zod enum validation, but provides robustness
        console.error('Invalid priority value encountered during submission:', values.priority);
        form.setFieldError('priority', 'Ugyldig prioritet valgt.'); // Set error and return
        return;
    }

    // Combine date and time into a single ISO 8601 string for the backend
    // Zod refine ensures both date and time exist if one does
    if (!values.date || !values.time) {
      console.error('Start time (date and time) is required but missing.');
      form.setFieldError('date', 'Starttidspunkt (dato og tid) er påkrevd.');
      form.setFieldError('time', 'Starttidspunkt (dato og tid) er påkrevd.');
      return;
    }
    // Combine date and time into ISO format (e.g., "YYYY-MM-DDTHH:MM:SS")
    const startTime = `${values.date}T${values.time}:00`; // Append seconds for potential backend requirements

    // Prepare the payload matching the backend's CreateCrisisEventDto
    const eventData = {
      name: values.title, // Map 'title' to 'name'
      latitude: values.latitude, // Use validated latitude
      longitude: values.longitude, // Use validated longitude
      address: values.address || null, // Send null if address is empty/undefined
      // Ensure radius is passed as a number
      radius: typeof values.radius === 'number' ? values.radius : parseFloat(values.radius || '0'),
      severity: severity, // Use the mapped lowercase severity string
      description: values.description, // Use validated description
      startTime: startTime // Use combined date-time string
    };

    console.log('Submitting Event data:', eventData);
    const response = await createEvent(eventData); // Call the API service
    console.log('Event created successfully!', response.data); // Log success

    // Show success dialog on successful creation
    createdEventName.value = values.title;
    isSuccessDialogOpen.value = true;

  } catch (error: any) {
    // Handle errors during submission
    console.error('An error occurred while submitting the event: ', error);
    // Extract a user-friendly error message from the API response or error object
    const errorMessage = error.response?.data?.message || error.message || 'Ukjent feil oppstod.';
    // Display error (e.g., associate with a form field or show a general alert/toast)
    form.setFieldError('title', `Innsending feilet: ${errorMessage}`); // Example: show error near title
  }
});
</script>

<style scoped>
/* Grid layout for form and map */
.content-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two equal columns */
  gap: 30px; /* Space between columns */
  max-width: 1200px; /* Max width of the container */
  margin: 30px auto; /* Center container and add margin top/bottom */
  padding: 20px; /* Padding inside container */
}

/* Form section styling */
.form-section {
  padding: 20px;
  background-color: #fff; /* Optional: white background */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  display: flex; /* Use flexbox */
  flex-direction: column; /* Stack children vertically */
}

/* Make the form itself grow to fill the form section */
.form-section form {
  flex-grow: 1; /* Allow form to take available vertical space */
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; Optional: pushes button to bottom if needed */
}

/* Map section styling */
.map-section {
  display: flex;
  flex-direction: column; /* Stack controller and map vertically */
}

/* Map container styling */
.map-container {
  flex-grow: 1; /* Allow map to take available space */
  min-height: 500px; /* Minimum height */
  border-radius: 8px;
  overflow: hidden; /* Clip map content */
  border: 1px solid hsl(var(--border)); /* Use theme border color */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

/* Page heading */
h1 {
  font-size: 2em; /* Large heading */
  text-align: center; /* Center align */
  margin-bottom: 30px; /* Space below heading */
}

/* Form section headers */
.form-section-header {
  margin-bottom: 15px; /* Space below header */
  padding-bottom: 10px; /* Space below text */
  border-bottom: 1px solid hsl(var(--border)); /* Use theme border color */
}

.form-section-header h2 {
  font-size: 1.2rem; /* Sub-heading size */
  font-weight: 600; /* Boldness */
  margin: 0;
}

/* Containers for coordinate and datetime inputs */
.coordinates-container,
.datetime-container {
  display: flex;
  gap: 15px; /* Space between inputs */
  margin-bottom: 1rem; /* Space below container (using rem) */
}

/* Allow coordinate/datetime inputs to share space */
.half-width {
  flex: 1; /* Each takes half the available width */
}

/* Consistent spacing for form items */
.form-item {
  margin-bottom: 1rem; /* Standard space below form items */
}

/* Ensure inputs/textareas/selects take full width within their container */
Input, Textarea, SelectTrigger {
  width: 100%;
}

/* Give Textarea a minimum height */
Textarea {
  min-height: 80px;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  /* Stack form and map vertically on medium/tablet screens */
  .content-container {
    grid-template-columns: 1fr; /* Single column */
  }
  .map-section {
    order: -1; /* Display map above the form */
    margin-bottom: 30px; /* Add space below map when stacked */
  }
  .map-container {
    min-height: 400px; /* Reduce map height */
  }
}

@media (max-width: 576px) {
  /* Stack coordinate and datetime inputs vertically on small/mobile screens */
  .coordinates-container,
  .datetime-container {
    flex-direction: column; /* Stack vertically */
    gap: 10px; /* Adjust gap for vertical stacking */
  }
  /* Remove flex property for half-width items when stacked */
  .half-width {
    flex: none;
  }
}
</style>
