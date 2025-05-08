<template>
  <div class="m-5">
    <!--Breadcrumb at the top left-->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            {{ $t('navigation.home') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/admin-panel">
            {{ $t('navigation.admin-panel') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator/>
        <BreadcrumbItem>
          <BreadcrumbPage href="/admin/add-new-POI">{{ $t('navigation.new-POI') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <!--Title-->
  <h1 class="text-4xl text-center mb-6">{{ $t('admin.make-new-POI') }}:</h1>

  <div class="grid lg:grid-cols-2 grid-cols-1 gap-8 max-w-7xl mx-auto my-8 p-5">
    <div class="p-5 bg-background rounded-lg shadow-md flex flex-col">
      <form @submit="onSubmit" class="flex-grow flex flex-col justify-between">
        <!--Title of POI -->
        <FormField v-slot="{ componentField, meta, errorMessage }" name="title">
          <FormItem>
            <FormLabel>{{$t('add-event-info.titles.title')}}</FormLabel>
            <FormControl>
              <Input type="text" :placeholder="$t('add-event-info.titles.title')" v-bind="componentField" />
            </FormControl>
            <FormDescription>{{ $t('add-POI-info.info.title') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br>

        <div class="mb-4 pb-2.5 border-b border-border">
          <h2 class="text-xl font-semibold m-0">{{ $t('admin.location-info') || 'Plassering' }}</h2>
        </div>

        <!--Placement of POI-->
        <div class="flex sm:flex-row flex-col sm:gap-4 gap-2.5 mb-4">
          <FormField v-slot="{ componentField, meta, errorMessage }" name="latitude">
            <FormItem class="flex-1">
              <FormLabel>{{$t('add-event-info.titles.latitude')}}</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" placeholder="latitude" v-bind="componentField" readonly />
              </FormControl>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, meta, errorMessage }" name="longitude">
            <FormItem class="flex-1">
              <FormLabel>{{$t('add-event-info.titles.longitude')}}</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" placeholder="longitude" v-bind="componentField" readonly />
              </FormControl>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField, meta, errorMessage }" name="address">
          <FormItem>
            <FormLabel>{{$t('add-event-info.titles.address')}}</FormLabel>
            <FormControl>
              <Input type="text" :placeholder="$t('admin.address-placeholder') || 'Eksempelveien 2'" v-bind="componentField" />
            </FormControl>
            <FormDescription>{{ $t('add-event-info.coordinates') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br>

        <div class="mb-4 pb-2.5 border-b border-border">
          <h2 class="text-xl font-semibold m-0">{{ $t('admin.poi-details') || 'POI-detaljer' }}</h2>
        </div>

        <!--Select type field-->
        <FormField v-slot="{ componentField, meta, errorMessage }" name="type">
          <FormItem>
            <FormLabel>{{$t('add-POI-info.titles.type')}}</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger style="cursor: pointer;">
                  <SelectValue :placeholder="$t('add-POI-info.titles.type') || 'Velg en type'" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  v-for="type in poiTypes"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ t(`map.poiTypes.${type.id}`, type.name) }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>{{ $t('add-POI-info.info.type') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br>

        <div class="flex sm:flex-row flex-col sm:gap-4 gap-2.5 mb-4">
          <!--Open from time-->
          <FormField v-slot="{ componentField, meta, errorMessage }" name="openfrom">
            <FormItem class="flex-1">
              <FormLabel>{{$t('add-POI-info.titles.open-from')}}</FormLabel>
              <FormControl>
                <Input type="time" v-bind="componentField" />
              </FormControl>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!--Open to time-->
          <FormField v-slot="{ componentField, meta, errorMessage }" name="opento">
            <FormItem class="flex-1">
              <FormLabel>{{$t('add-POI-info.titles.open-to')}}</FormLabel>
              <FormControl>
                <Input type="time" v-bind="componentField" />
              </FormControl>
              <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>
        <br>

        <!--Contact information field-->
        <FormField v-slot="{ componentField, meta, errorMessage }" name="contactinfo">
          <FormItem>
            <FormLabel>{{$t('add-POI-info.titles.contact-info')}}</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="+47 123 45 678" v-bind="componentField" />
            </FormControl>
            <FormDescription>{{ $t('add-POI-info.titles.contact-info') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br>

        <!--Description of POI-->
        <FormField v-slot="{ componentField, meta, errorMessage }" name="description">
          <FormItem>
            <FormLabel>{{$t('add-event-info.titles.description')}}:</FormLabel>
            <FormControl>
              <Textarea :placeholder="$t('add-POI-info.info.description-placeholder') || 'Description'" v-bind="componentField"></Textarea>
            </FormControl>
            <FormDescription>{{ $t('add-POI-info.info.description') }}</FormDescription>
            <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        <br>

        <Button type="submit" :disabled="isSubmitting">
          <span v-if="isSubmitting">{{ $t('admin.submitting') || 'Lagrer...' }}</span>
          <span v-else>{{ $t('admin.submit') || 'Lagre' }}</span>
        </Button>
      </form>
    </div>

    <div class="flex flex-col lg:order-none order-first lg:mb-0 mb-8">
      <!-- Add AdminMapController component -->
      <AdminMapController
        :mapComponent="mapComponentInstance"
        @location-selected="handleLocationSelected"
        @location-cleared="handleLocationCleared"
      />

      <!-- Map container -->
      <div class="flex-grow lg:min-h-[500px] min-h-[400px] rounded-lg overflow-hidden border border-gray-300 shadow-md">
        <MapComponent
          ref="mapComponent"
          :adminMode="true"
          :centerLat="mapCenterLat"
          :centerLon="mapCenterLng"
          :initialZoom="6"
          @map-clicked="handleMapClick"
        />
      </div>
    </div>
  </div>

  <!-- Success Dialog -->
  <Dialog :open="isSuccessDialogOpen" @update:open="isSuccessDialogOpen = $event">
    <DialogContent
      class="
      fixed top-1/2 left-1/2
      transform -translate-x-1/2 -translate-y-1/2
      w-full max-w-md
      max-h-[80vh] overflow-auto
      rounded-lg p-6
      z-[1001]
    "
    >
      <DialogHeader>
        <DialogTitle>{{ $t('add-POI-info.info.successfully') }}</DialogTitle>
        <DialogDescription>
          {{ $t('add-POI-info.info.success-message') }}
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
            <strong>{{ createdPOIName }}</strong> {{ $t('add-POI-info.info.success-added') }}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button @click="navigateToAdminPanel">{{ $t('add-POI-info.info.go-to-admin') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
/**
 * @fileoverview This file defines the AdminAddPOI Vue component.
 * It provides an administrative interface for adding new points of interest (POIs) to the system.
 * It utilizes VeeValidate for form handling and validation, Zod for schema definition,
 * and integrates with MapComponent and AdminMapController for location selection.
 * API calls are made via the AdminServices module.
 */

import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createPOI } from '@/services/api/AdminServices'
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import * as L from 'leaflet'
import MapComponent from '@/components/map/MapComponent.vue'
import AdminMapController from '@/components/admin/AdminMapController.vue'
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
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchPoiTypes } from '@/services/api/PoiService'

/**
 * Represents geographical coordinates.
 * @interface Location
 * @property {number | null} lat - Latitude.
 * @property {number | null} lng - Longitude.
 */
interface Location {
  lat: number | null;
  lng: number | null;
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

const { t } = useI18n();
const router = useRouter();

// --- State and Initialization ---
const mapComponent = ref<InstanceType<typeof MapComponent> | null>(null);
const tempMarker = ref<L.Marker | null>(null);
const isSuccessDialogOpen = ref(false);
const createdPOIName = ref('');
const isSubmitting = ref(false);

// Initial center coordinates for Norway (fixed as number for MapComponent requirements)
const initialCenter = ref<Location>({
  lat: 63.4305,
  lng: 10.3951,
});

// Computed properties to safely map initialCenter to required number types
const mapCenterLat = computed(() => initialCenter.value.lat ?? 63.4305);
const mapCenterLng = computed(() => initialCenter.value.lng ?? 10.3951);

// Form validation schema
const formSchema = toTypedSchema(
  z.object({
    // Title: required string, min 2, max 50 chars
    title: z.string().min(2, t('add-event-info.errors.title')).max(50, t('add-event-info.errors.title')),

    // Latitude: optional number between -90 and 90
    latitude: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number()
      .min(-90, t('add-event-info.errors.latitude'))
      .max(90, t('add-event-info.errors.latitude'))
      .optional()
    ),

    // Longitude: optional number between -180 and 180
    longitude: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number()
      .min(-180, t('add-event-info.errors.longitude'))
      .max(180, t('add-event-info.errors.longitude'))
      .optional()
    ),

    // Address: optional string, max 100 chars
    address: z.string()
    .max(100, t('add-event-info.errors.address'))
    .optional(),

    // Type: required enum with POI types
    type: z.preprocess(
      (val) => (val == null ? undefined : Number(val)),
      z.number({
        required_error: t('add-POI-info.errors.type'),
        invalid_type_error: t('add-POI-info.errors.type'),
      })
    ),

    // Contact info: optional string with phone number format validation
    contactinfo: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{8,12}$/;
      return phoneRegex.test(val);
    }, {
      message: t('add-event-info.errors.contact-info') || 'Invalid phone number format'
    }),

    // Opening hours fields
    openfrom: z.string().optional(),
    opento: z.string().optional(),

    // Description: required string, min 10, max 500 chars
    description: z.string()
    .min(10, t('add-event-info.errors.description'))
    .max(500, t('add-event-info.errors.description')),
  })
  // Refine step 1: Ensure either coordinates or address are provided
  .refine(
    (data) => {
      const hasCoords = (data.latitude !== undefined && !isNaN(data.latitude)) &&
        (data.longitude !== undefined && !isNaN(data.longitude));
      const hasAddress = data.address && data.address.trim().length >= 2;
      return hasCoords || hasAddress;
    },
    {
      message: t('add-event-info.errors.position-missing') || 'Either coordinates or address must be provided',
      path: ['address'],
    }
  )
  // Refine step 2: Ensure both opening time fields are provided if either one is
  .refine(
    (data) => !(data.openfrom || data.opento) || (data.openfrom && data.opento),
    {
      message: t('add-POI-info.errors.opening-hours') || 'Both opening and closing times must be provided',
      path: ['openfrom'],
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
    type: undefined,
    contactinfo: '',
    openfrom: '',
    opento: '',
    description: ''
  }
});

// --- Computed Properties ---

/**
 * Computed property to safely access the MapComponent instance.
 * @returns {InstanceType<typeof MapComponent> | null} The map component instance or null.
 */
const mapComponentInstance = computed(() => {
  return mapComponent.value || null;
});

/**
 * Point of Interest types used in drop-down menu
 */
const poiTypes = ref<{ id: number; name: string }[]>([])

// --- Map Interaction Functions ---

/**
 * Handles the 'map-clicked' event from the MapComponent.
 * Updates the form's latitude and longitude fields and the map marker.
 * @param {MapClickEvent} event - The event object containing click coordinates.
 */
function handleMapClick(event: MapClickEvent): void {
  console.log('Map clicked at:', event.latlng);
  const location: Location = {
    lat: event.latlng.lat,
    lng: event.latlng.lng
  };
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
  if (location.lat !== null && location.lng !== null) {
    form.setFieldValue('latitude', location.lat);
    form.setFieldValue('longitude', location.lng);
    updateMapMarker(location.lat, location.lng);
    form.setFieldError('address', undefined); // Clear address validation error if coordinates are now set
  }
}

/**
 * Clears the form's latitude and longitude fields and removes the temporary marker
 * when the location is cleared via the map controller.
 */
function handleLocationCleared(): void {
  console.log('Location cleared');
  form.setFieldValue('latitude', undefined);
  form.setFieldValue('longitude', undefined);
  if (tempMarker.value && mapComponent.value?.removeMarker) {
    mapComponent.value.removeMarker(tempMarker.value as L.Marker);
    tempMarker.value = null;
  }
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
    console.error('Map component or addMarker method not available');
    return;
  }

  // Remove existing marker if present
  if (tempMarker.value && mapComponent.value.removeMarker) {
    mapComponent.value.removeMarker(tempMarker.value as L.Marker);
  }

  // Get title and description from form values (use fallbacks)
  const title = form.values.title || t('navigation.new-POI') || 'Nytt interessepunkt';
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

/**
 * Navigates the user back to the admin panel after closing the success dialog.
 */
function navigateToAdminPanel(): void {
  isSuccessDialogOpen.value = false;
  router.push('/admin/admin-panel');
}

// --- Form Submission Logic ---

/**
 * Handles the form submission event triggered by VeeValidate.
 * Maps form data to the backend API structure,
 * calls the createPOI service, and manages success/error states.
 * @param {object} values - The validated form values provided by VeeValidate.
 */
const onSubmit = form.handleSubmit(async (values) => {
  console.log('Form values on submit:', values);
  isSubmitting.value = true;

  try {
    // Map POI type to backend ID
    const poiTypeId = values.type;


        // Prepare payload in the new required shape
          const poiData = {
            name: values.title,
            latitude: values.latitude ?? null,
            longitude: values.longitude ?? null,
            poiTypeId: poiTypeId,
            description: values.description,
            address: values.address || null,
            openFrom: values.openfrom || null,
            openTo: values.opento || null,
            contactInfo: values.contactinfo || null,
          };

    console.log('Submitting POI data:', poiData);
    const response = await createPOI(poiData);
    console.log('POI created successfully:', response.data);

    // Show success dialog on successful creation
    createdPOIName.value = values.title;
    isSuccessDialogOpen.value = true;

  } catch (error: any) {
    // Handle errors during submission
    console.error('Error creating POI:', error);
    // Extract a user-friendly error message from the API response or error object
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    // Display error to user (e.g., associate with a form field)
    form.setFieldError('title', `${t('admin.submission-error') || 'Submission error:'} ${errorMessage}`);
  } finally {
    isSubmitting.value = false;
  }
});


onMounted(async () => {
  try {
    poiTypes.value = await fetchPoiTypes()
  } catch (err) {
    console.error('Failed to load POI types', err)
  }
})

// --- Watchers ---

/**
 * Watches the form's title field for changes.
 * Updates the temporary map marker's popup/tooltip content dynamically.
 */
watch(
  () => form.values.title,
  (newTitle) => {
    if (form.values && tempMarker.value && mapComponent.value) {
      const markerTitle = newTitle || t('navigation.new-POI') || 'Nytt interessepunkt';
      const description = form.values.description || '';
      const popupContent = `<b>${markerTitle}</b><br>${description}`;

      if (typeof tempMarker.value.setPopupContent === 'function') {
        tempMarker.value.setPopupContent(popupContent);
      }

      if (typeof tempMarker.value.setTooltipContent === 'function') {
        tempMarker.value.setTooltipContent(markerTitle);
      }
    }
  }
);
</script>
