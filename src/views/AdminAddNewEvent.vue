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

  <!-- Success Dialog -->
  <Dialog :open="isSuccessDialogOpen" @update:open="isSuccessDialogOpen = $event">
    <div class="fixed inset-0 bg-black/50 z-[1000]" />
    <!-- modal -->
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
        <DialogTitle>{{ $t('add-event-info.successfully') }}Event Created Successfully</DialogTitle>
        <DialogDescription>
          {{ $t('add-event-info.success-message') }} Your event has been added to the system.
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
            <strong>{{ createdEventName }}</strong> has been created successfully.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button @click="navigateToAdminPanel">Go to Admin Panel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { createEvent } from '@/services/api/AdminServices';
import router from '@/router/index.ts';
import { Button } from '@/components/ui/button';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useI18n } from 'vue-i18n';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogOverlay,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MapComponent from '@/components/map/MapComponent.vue';
import AdminMapController from '@/components/admin/AdminMapController.vue';
import * as L from 'leaflet';

interface Location {
  lat: number;
  lng: number;
}

interface MapClickEvent {
  latlng: {
    lat: number;
    lng: number;
  };
}

const { t } = useI18n();

// --- VeeValidate Form Setup ---
const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(2, t('add-event-info.errors.title')).max(50, t('add-event-info.errors.title')),
    latitude: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(-90, t('add-event-info.errors.latitude')).max(90, t('add-event-info.errors.latitude')).optional()
    ),
    longitude: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(-180, t('add-event-info.errors.longitude')).max(180, t('add-event-info.errors.longitude')).optional()
    ),
    address: z.string().max(100, t('add-event-info.errors.address')).optional(),
    radius: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), // Handle empty string
      z.number({required_error: "Radius is required"}).min(1, t('add-event-info.errors.radius')).max(10000, t('add-event-info.errors.radius'))
    ),
    time: z.string().optional(),
    date: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High'], { required_error: t('add-event-info.errors.priority') }),
    description: z.string().min(10, t('add-event-info.errors.description')).max(500, t('add-event-info.errors.description')),
  })
  .refine(
    (data) => {
      const hasCoords = (data.latitude !== undefined && !isNaN(data.latitude)) && (data.longitude !== undefined && !isNaN(data.longitude));
      const hasAddress = data.address && data.address.trim().length >= 2; // Require at least 2 chars for address
      return hasCoords || hasAddress;
    },
    {
      message: t('add-event-info.errors.position-missing'),
      path: ['address'], // Apply error to address field if neither is valid
    }
  )
  .refine(
    (data) => data.date && data.time, // Require both date and time if one is present
    {
      message: 'Både dato og tid må angis for starttidspunkt.',
      path: ['time'], // Or apply to both ['date', 'time']
    }
  )
);

// Initialize form AFTER schema definition
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: '',
    latitude: undefined,
    longitude: undefined,
    address: '',
    radius: undefined, // Initialize as undefined
    time: '',
    date: '',
    priority: undefined,
    description: '',
  },
});
// --- End VeeValidate Form Setup ---


// --- Map Component Refs and Logic ---
const mapComponent = ref<InstanceType<typeof MapComponent> | null>(null);
const tempMarker = ref<L.Marker | null>(null);
const isSuccessDialogOpen = ref(false);
const createdEventName = ref('');

const initialCenter: Location = { lat: 63.4305, lng: 10.3951 };

const mapComponentInstance = computed(() => {
  return mapComponent.value; // Direct ref access is fine in script setup computed
});

function handleMapClick(event: MapClickEvent): void {
  console.log('Map clicked at:', event.latlng);
  const location: Location = { lat: event.latlng.lat, lng: event.latlng.lng };
  handleLocationSelected(location);
}

function handleLocationSelected(location: Location): void {
  console.log('Location selected:', location);
  // Use setFieldValue with the initialized form object
  form.setFieldValue('latitude', location.lat);
  form.setFieldValue('longitude', location.lng);
  updateMapMarker(location.lat, location.lng);
  form.setFieldError('address', undefined); // Clear address error if coords are selected
}

function handleLocationCleared(): void {
  console.log('Location cleared');
  form.setFieldValue('latitude', undefined);
  form.setFieldValue('longitude', undefined);

  if (tempMarker.value && mapComponent.value?.removeMarker) {
    mapComponent.value.removeMarker(tempMarker.value as L.Marker);
    tempMarker.value = null;
  }
}

function navigateToAdminPanel(): void {
  isSuccessDialogOpen.value = false;
  router.push('/admin-panel');
}

function updateMapMarker(lat: number, lng: number): void {
  // Guard against mapComponent not being ready
  if (!mapComponent.value?.addMarker) {
    console.error('Map component or addMarker method not available yet.');
    return;
  }
  if (tempMarker.value && mapComponent.value?.removeMarker) {
    mapComponent.value.removeMarker(tempMarker.value as L.Marker);
  }

  // Access form values safely AFTER form is initialized
  const title = form.values.title || t('navigation.new-event') || 'Ny hendelse';
  tempMarker.value = mapComponent.value.addMarker(lat, lng, title);

  if (tempMarker.value) {
    const description = form.values.description || '';
    if (typeof tempMarker.value.bindPopup === 'function') {
      tempMarker.value.bindPopup(`<b>${title}</b><br>${description}`).openPopup();
    } else if (typeof tempMarker.value.bindTooltip === 'function') {
      tempMarker.value.bindTooltip(title).openTooltip();
    }
  }
}

watch(
  () => form.values.title,
  (newTitle) => {
    // GUARD against accessing uninitialized values
    if (form && tempMarker.value && mapComponent.value) {
      const markerTitle = newTitle || t('navigation.new-event') || 'Ny hendelse';
      const description = form.values.description || '';

      if (typeof tempMarker.value.setPopupContent === 'function') {
        tempMarker.value.setPopupContent(`<b>${markerTitle}</b><br>${description}`);
      }
      if (typeof tempMarker.value.setTooltipContent === 'function') {
        tempMarker.value.setTooltipContent(markerTitle);
      }
      console.log('Updated marker title/popup to:', markerTitle);
    }
  }
  // { immediate: false } // Default behavior, watcher runs after setup
);
// --- End Map Component Refs and Logic ---

// --- Form Submission ---
const onSubmit = form.handleSubmit(async (values) => {
  console.log('Form values on submit:', values);
  try {
    let severity: 'green' | 'yellow' | 'red'; // Use specific types
    switch (values.priority) {
      case 'Low': severity = 'green'; break;
      case 'Medium': severity = 'yellow'; break;
      case 'High': severity = 'red'; break;
      default:
        // This case should ideally not be reachable due to enum validation
        console.error('Invalid priority value:', values.priority);
        form.setFieldError('priority', 'Ugyldig prioritet valgt.');
        return;
    }

    // Ensure date and time are present (already refined in schema, but good practice)
    if (!values.date || !values.time) {
      form.setFieldError('date', 'Starttidspunkt (dato og tid) er påkrevd.');
      form.setFieldError('time', 'Starttidspunkt (dato og tid) er påkrevd.');
      console.error('Start time (date/time) is missing.');
      return;
    }
    // Combine date and time safely
    const startTime = `${values.date}T${values.time}:00`; // Ensure ISO 8601 format if possible

    const eventData = {
      name: values.title,
      latitude: values.latitude,
      longitude: values.longitude,
      address: values.address || null,
      // Ensure radius is a number before sending
      radius: typeof values.radius === 'number' ? values.radius : parseFloat(values.radius || '0'),
      severity: severity, // Backend expects lowercase enum as defined in CrisisEvent.java
      description: values.description,
      startTime: startTime
    };

    console.log('Submitting Event data:', eventData);
    const response = await createEvent(eventData);
    console.log('Event created successfully!', response.data);

    // Show success dialog instead of immediate redirect
    createdEventName.value = values.title;
    isSuccessDialogOpen.value = true;

  } catch (error: any) {
    console.error('An error occurred while submitting the event: ', error);
    // Handle specific API errors if possible
    const errorMessage = error.response?.data?.message || error.message || 'Ukjent feil oppstod.';
    // Display a general error message (consider using a toast notification)
    form.setFieldError('title', `Innsending feilet: ${errorMessage}`); // Set error on title field as a general form error
  }
});
// --- End Form Submission ---
</script>

<style scoped>
/* (Keep the same styles as provided in the previous response) */
.content-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 1200px;
  margin: 30px auto;
  padding: 20px;
}

.form-section {
  padding: 20px;
  background-color: #fff; /* Optional: White background for form */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Ensure form section takes available height */
  display: flex;
  flex-direction: column;
}

.form-section form {
  flex-grow: 1; /* Allow form to grow */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Push button to bottom */
}


.map-section {
  display: flex;
  flex-direction: column;
}

.map-container {
  flex-grow: 1;
  min-height: 500px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2em;
  text-align: center;
  margin-bottom: 30px;
}

.form-section-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid hsl(var(--border));
}

.form-section-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}


.coordinates-container,
.datetime-container {
  display: flex;
  gap: 15px;
  margin-bottom: 1rem;
}

.half-width {
  flex: 1;
}

/* Shadcn form components often handle width well, but ensure consistency */
.form-item {
  margin-bottom: 1rem; /* Consistent spacing */
}

Input {
  width: 100%;
}
Textarea {
  width: 100%;
  min-height: 80px; /* Ensure textarea has some height */
}
SelectTrigger {
  width: 100%;
}


/* Responsive adjustments */
@media (max-width: 992px) {
  .content-container {
    grid-template-columns: 1fr;
  }
  .map-section {
    order: -1;
    margin-bottom: 30px;
  }
  .map-container {
    min-height: 400px;
  }
}

@media (max-width: 576px) {
  .coordinates-container,
  .datetime-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
