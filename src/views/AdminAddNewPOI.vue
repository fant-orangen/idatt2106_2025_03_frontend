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
          <BreadcrumbPage href="/add-new-POI">{{ $t('navigation.new-POI') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
  <div class="admin-add-poi-page">
    <h1>{{ $t('admin.make-new-POI') || 'Legg til et nytt interessepunkt' }}</h1>

    <div class="content-container">
      <div class="form-section">
        <form @submit.prevent="submitPOI">
          <div class="form-section-header">
            <h2>{{ $t('admin.basic-info') || 'Grunnleggende informasjon' }}</h2>
          </div>

          <div class="form-group">
            <label for="title">{{ $t('add-event-info.titles.title') || 'Tittel' }}</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              :placeholder="
                $t('admin.poi-title-placeholder') || 'Skriv inn tittel på interessepunktet'
              "
              required
            />
            <div class="form-description">
              {{ $t('add-POI-info.info.title') || 'Dette vil være tittelen på interessepunktet.' }}
            </div>
          </div>

          <div class="form-group">
            <label for="type">{{ $t('add-POI-info.titles.type') || 'Type' }}</label>
            <select id="type" v-model="formData.type" required>
              <option value="" disabled selected>
                {{
                  $t('admin.select-poi-type') || 'Velg hvilken type interessepunkt dette skal være'
                }}
              </option>
              <option value="defibrillator">
                {{ $t('add-POI-info.POI-type.defibrillator') || 'Hjertestarter' }}
              </option>
              <option value="shelter">
                {{ $t('add-POI-info.POI-type.shelter') || 'Tilfluktsrom' }}
              </option>
              <option value="water-source">
                {{ $t('add-POI-info.POI-type.water-source') || 'Vannkilde' }}
              </option>
              <option value="food-station">
                {{ $t('add-POI-info.POI-type.food') || 'Matutdeling' }}
              </option>
            </select>
            <div class="form-description">
              {{
                $t('add-POI-info.info.type') || 'Velg hvilken type interessepunkt dette skal være.'
              }}
            </div>
          </div>

          <div class="form-group">
            <label for="description">{{
                $t('add-event-info.titles.description') || 'Informasjon'
              }}</label>
            <textarea
              id="description"
              v-model="formData.description"
              :placeholder="
                $t('admin.description-placeholder') ||
                'Skriv litt informasjon som beskriver interessepunktet. Hvor ligger det? Hva kan man finne der?'
              "
              rows="4"
              required
            ></textarea>
            <div class="form-description">
              {{
                $t('add-POI-info.info.description') ||
                'Skriv litt informasjo som beskriver interessepunktet. Hvor ligger det? Hva kan man finne der?'
              }}
            </div>
          </div>

          <div class="form-section-header">
            <h2>{{ $t('admin.location-info') || 'Plassering' }}</h2>
          </div>

          <div class="form-group">
            <label for="address">{{ $t('add-event-info.titles.address') || 'Adresse' }}</label>
            <input
              id="address"
              v-model="formData.address"
              type="text"
              :placeholder="$t('admin.address-placeholder') || 'Eksempelveien 2'"
            />
          </div>

          <div class="coordinates-container">
            <div class="form-group half-width">
              <label for="latitude">{{
                  $t('add-event-info.titles.latitude') || 'Breddegrad'
                }}</label>
              <input
                id="latitude"
                v-model="formData.latitude"
                type="number"
                step="0.000001"
                required
                readonly
              />
            </div>

            <div class="form-group half-width">
              <label for="longitude">{{
                  $t('add-event-info.titles.longitude') || 'Lengdegrad'
                }}</label>
              <input
                id="longitude"
                v-model="formData.longitude"
                type="number"
                step="0.000001"
                required
                readonly
              />
            </div>
          </div>

          <div class="form-section-header">
            <h2>{{ $t('admin.hours-contact-info') || 'Åpningstider og kontaktinformasjon' }}</h2>
          </div>

          <div class="hours-container">
            <div class="form-group half-width">
              <label for="openfrom">{{ $t('add-POI-info.titles.open-from') || 'Åpent fra' }}</label>
              <input id="openfrom" v-model="formData.openfrom" type="time" />
            </div>

            <div class="form-group half-width">
              <label for="opento">{{ $t('add-POI-info.titles.open-to') || 'Åpent til' }}</label>
              <input id="opento" v-model="formData.opento" type="time" />
            </div>
          </div>

          <div class="form-group">
            <label for="contactinfo">{{
                $t('add-POI-info.titles.contact-info') || 'Kontaktinformasjon'
              }}</label>
            <input
              id="contactinfo"
              v-model="formData.contactinfo"
              type="tel"
              placeholder="+47 123 45 678"
            />
            <div class="form-description">
              {{
                $t('admin.contact-info-description') ||
                'Telefonnummer til en ansvarlig kontaktperson.'
              }}
            </div>
          </div>

          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>

          <div class="form-actions">
            <Button type="button" class="cancel-button" @click="cancelForm">
              {{ $t('admin.cancel') || 'Avbryt' }}
            </Button>

            <Button type="submit" class="submit-button" :disabled="!isFormValid || isSubmitting">
              <span v-if="isSubmitting">{{ $t('admin.submitting') || 'Lagrer...' }}</span>
              <span v-else>{{ $t('admin.submit') || 'Lagre' }}</span>
            </Button>
          </div>
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
            :centerLat="initialCenter.lat ?? 63.4305"
            :centerLon="initialCenter.lng ?? 10.3951"
            :initialZoom="6"
            @map-clicked="handleMapClick"
          />
        </div>
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
            <strong>{{ createdPOIName }}</strong> {{ $t('add-event-info.success-added') }}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button @click="navigateToAdminPanel">{{ $t('add-event-info.go-to-admin') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts">
import { ref, computed, onMounted, watch, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Ensure createPOI is correctly imported
import { createPOI } from '@/services/api/AdminServices' // <-- Make sure path is correct
import MapComponent from '@/components/map/MapComponent.vue'
import AdminMapController from '@/components/admin/AdminMapController.vue'
import * as L from 'leaflet'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb/index.js'

/**
 * @fileoverview This file defines the AdminAddNewPOI Vue component.
 * It provides an administrative interface for adding new Points of Interest (POIs)
 * to the system. It includes a form for POI details and an interactive map for
 * location selection.
 */

// Define interfaces for the component
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
 * Represents the structure of the form data for adding a POI.
 * @interface FormData
 * @property {string} title - The title/name of the POI.
 * @property {string} type - The selected type of the POI (e.g., 'shelter', 'defibrillator').
 * @property {string} description - A description of the POI.
 * @property {string} address - The address of the POI.
 * @property {number | null} latitude - The latitude coordinate.
 * @property {number | null} longitude - The longitude coordinate.
 * @property {string} openfrom - The opening time (HH:MM format).
 * @property {string} opento - The closing time (HH:MM format).
 * @property {string} contactinfo - Contact phone number.
 */
interface FormData {
  title: string;
  type: string; // Keep as string from select input
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  openfrom: string;
  opento: string;
  contactinfo: string;
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

export default defineComponent({
  name: 'AdminAddPOIPage',
  components: {
    BreadcrumbLink,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    Breadcrumb,
    BreadcrumbSeparator,
    MapComponent,
    AdminMapController,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  },
  /**
   * Setup function for the component using Vue 3 Composition API.
   * Initializes reactive state, computed properties, methods, and lifecycle hooks.
   */
  setup() {
    const { t } = useI18n() // For internationalization
    const router = useRouter() // For navigation

    // Component references
    const mapComponent = ref<InstanceType<typeof MapComponent> | null>(null)
    const tempMarker = ref<L.Marker | null>(null) // Temporary marker on the map
    const isSuccessDialogOpen = ref(false) // Controls the success dialog visibility
    const createdPOIName = ref('') // Stores the name of the created POI for the dialog

    // Initial center coordinates (Norway) for the map
    const initialCenter: Location = {
      lat: 63.4305,
      lng: 10.3951,
    }

    // Reactive form data object
    const formData = ref<FormData>({
      title: '',
      type: '', // Mapped to poiTypeId (integer) before API call
      description: '',
      address: '',
      latitude: null,
      longitude: null,
      openfrom: '', // Combined into openingHours string before API call
      opento: '',   // Combined into openingHours string before API call
      contactinfo: '',
    })

    const isSubmitting = ref(false) // Tracks form submission status
    const formError = ref('') // Stores form or submission error messages

    /**
     * Computed property to safely access the MapComponent instance.
     * @returns {InstanceType<typeof MapComponent> | null} The map component instance or null.
     */
    const mapComponentInstance = computed(() => {
      return mapComponent.value ? (mapComponent.value as InstanceType<typeof MapComponent>) : null;
    });

    /**
     * Computed property to determine if the form is valid for submission.
     * Checks required fields and basic validation rules.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const isFormValid = computed(() => {
      return (
        formData.value.title &&
        formData.value.title.length >= 2 &&
        formData.value.type && // Ensure a type is selected
        formData.value.description &&
        formData.value.description.length >= 10 &&
        formData.value.latitude !== null &&
        formData.value.longitude !== null
      )
    })

    /**
     * Handles the 'map-clicked' event from the MapComponent.
     * Extracts coordinates and updates the form and marker.
     * @param {MapClickEvent} event - The map click event object.
     */
    function handleMapClick(event: MapClickEvent): void {
      console.log('Map clicked at:', event.latlng)
      const location: Location = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      }
      handleLocationSelected(location)
    }

    /**
     * Handles the 'location-selected' event from AdminMapController or map click.
     * Updates form data (latitude, longitude) and the map marker.
     * @param {Location} location - The selected location coordinates.
     */
    function handleLocationSelected(location: Location): void {
      console.log('Location selected:', location)
      formData.value.latitude = location.lat
      formData.value.longitude = location.lng
      if (location.lat !== null && location.lng !== null) {
        updateMapMarker(location.lat, location.lng)
        // Optional: Add reverse geocoding here if needed
      }
      console.log('Selected location:', location)
    }

    /**
     * Handles the 'location-cleared' event from AdminMapController.
     * Resets form coordinates and removes the temporary marker.
     */
    function handleLocationCleared(): void {
      console.log('Location cleared')
      formData.value.latitude = null
      formData.value.longitude = null
      if (tempMarker.value && mapComponent.value?.removeMarker) {
        mapComponent.value.removeMarker(tempMarker.value as any) // Type assertion might be needed depending on MapComponent implementation
        tempMarker.value = null
      }
    }

    /**
     * Updates or creates the temporary marker on the map at the given coordinates.
     * Also updates the marker's popup/tooltip content.
     * @param {number} lat - Latitude for the marker.
     * @param {number} lng - Longitude for the marker.
     */
    function updateMapMarker(lat: number, lng: number): void {
      if (!mapComponent.value?.addMarker) {
        console.error('Map component or addMarker method not available')
        return
      }
      // Remove existing temporary marker if it exists
      if (tempMarker.value && mapComponent.value.removeMarker) {
        mapComponent.value.removeMarker(tempMarker.value as any)
      }
      // Determine marker title, fallback to default/translated string
      const title = formData.value.title || t('navigation.new-POI') || 'Nytt interessepunkt'
      // Add new marker using MapComponent's method
      tempMarker.value = mapComponent.value.addMarker(lat, lng, title)

      // Update marker popup/tooltip content if the marker supports it
      if (tempMarker.value) {
        const popupContent = `<b>${title}</b><br>${formData.value.description || ''}`;
        if (typeof tempMarker.value.bindPopup === 'function') {
          tempMarker.value.bindPopup(popupContent).openPopup();
        } else if (typeof tempMarker.value.bindTooltip === 'function') {
          tempMarker.value.bindTooltip(title).openTooltip();
        }
      }
    }

    /**
     * Handles the form submission.
     * Validates the form, maps frontend data to the backend DTO format,
     * calls the createPOI API service, and handles success or error states.
     * @returns {Promise<void>}
     */
    async function submitPOI(): Promise<void> {
      // Validate form before proceeding
      if (!isFormValid.value) {
        formError.value = t('admin.form-invalid') || 'Vennligst fyll ut alle påkrevde felt.'
        return
      }

      isSubmitting.value = true // Indicate submission start
      formError.value = '' // Clear previous errors

      // Map frontend type string to backend poiTypeId integer
      // Adjust IDs based on backend `data.sql` or database schema
      let poiTypeId: number | null = null;
      switch (formData.value.type) {
        case 'shelter': poiTypeId = 4; break; // Matches 'Shelter' in data.sql
        case 'water-source': poiTypeId = 6; break; // Matches 'Water Distribution Point'
        case 'food-station': poiTypeId = 5; break; // Matches 'Grocery Store' (adjust if needed)
        case 'defibrillator':
          // Map to a relevant type ID (e.g., Hospital or create a specific type)
          poiTypeId = 1; // Example: Using 'Hospital' ID as placeholder
          console.warn("Mapping 'defibrillator' to POI Type ID 1 (Hospital). Adjust if needed.");
          break;
        default:
          // Handle invalid type selection
          formError.value = t('add-event-info.errors.type') || 'Ugyldig interessepunkttype valgt.';
          isSubmitting.value = false;
          return;
      }

      // Combine opening hours into a single string format
      let openingHours = '';
      if (formData.value.openfrom && formData.value.opento) {
        openingHours = `${formData.value.openfrom} - ${formData.value.opento}`;
      } else if (formData.value.openfrom) {
        openingHours = `Fra ${formData.value.openfrom}`; // Example format, adjust as needed
      } else if (formData.value.opento) {
        openingHours = `Til ${formData.value.opento}`; // Example format, adjust as needed
      }

      try {
        // Prepare data matching the backend CreatePoiDto structure
        const poiData = {
          name: formData.value.title, // Map frontend 'title' to backend 'name'
          latitude: formData.value.latitude!, // Non-null assertion due to isFormValid check
          longitude: formData.value.longitude!, // Non-null assertion
          address: formData.value.address || null, // Send null if empty
          poiTypeId: poiTypeId, // Use the mapped integer ID
          description: formData.value.description || null, // Send null if empty
          openingHours: openingHours || null, // Send combined string or null
          contactInfo: formData.value.contactinfo || null, // Send null if empty
        }

        console.log('Submitting POI data:', poiData)

        // Call the API service function to create the POI
        const response = await createPOI(poiData)
        console.log('POI created:', response.data) // Log success response

        // Show success dialog on successful creation
        createdPOIName.value = formData.value.title
        isSuccessDialogOpen.value = true

      } catch (error: any) {
        // Handle API errors
        console.error('Error creating POI:', error)
        // Extract and display a user-friendly error message
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        formError.value = `${t('admin.submission-error') || 'Feil ved lagring.'} ${errorMsg}`;
      } finally {
        // Reset submission state regardless of success or failure
        isSubmitting.value = false
      }
    }

    /**
     * Handles the cancel button click, navigating back to the admin panel.
     */
    function cancelForm(): void {
      router.push('/admin-panel')
    }

    /**
     * Handles the confirmation button click in the success dialog,
     * closing the dialog and navigating back to the admin panel.
     */
    function navigateToAdminPanel(): void {
      isSuccessDialogOpen.value = false
      router.push('/admin-panel')
    }

    /**
     * Watcher that observes changes in the form's title field.
     * Updates the temporary map marker's popup/tooltip content dynamically.
     */
    watch(
      () => formData.value.title, // Source to watch
      (newTitle: string) => { // Callback function
        if (tempMarker.value && mapComponent.value) {
          const markerTitle = newTitle || t('navigation.new-POI') || 'Nytt interessepunkt';
          const popupContent = `<b>${markerTitle}</b><br>${formData.value.description || ''}`;
          // Update popup content if method exists
          if (typeof tempMarker.value.setPopupContent === 'function') {
            tempMarker.value.setPopupContent(popupContent);
          }
          // Update tooltip content if method exists
          if (typeof tempMarker.value.setTooltipContent === 'function') {
            tempMarker.value.setTooltipContent(markerTitle);
          }
          console.log('Updated marker title/popup to:', markerTitle);
        }
      },
    )

    /**
     * Lifecycle hook called when the component is mounted.
     * Logs a message. Can be used for initial data fetching (e.g., POI types).
     */
    onMounted((): void => {
      console.log('AdminAddPOIPage mounted')
      // Optional: Fetch POI Types dynamically if needed
      // fetchPoiTypes();
    })

    // Return all reactive state, computed properties, and methods to be used in the template
    return {
      mapComponent,
      mapComponentInstance,
      initialCenter,
      formData,
      isSubmitting,
      formError,
      isFormValid,
      isSuccessDialogOpen,
      createdPOIName,
      handleMapClick,
      handleLocationSelected,
      handleLocationCleared,
      submitPOI,
      cancelForm,
      navigateToAdminPanel,
    }
  },
})
</script>

<style scoped>
/* Scoped styles for the AdminAddPOIPage component */

/* Main page container */
.admin-add-poi-page {
  max-width: 1200px; /* Limit maximum width */
  margin: 0 auto; /* Center the page horizontally */
  padding: 20px; /* Add padding around the content */
}

/* Page heading */
h1 {
  text-align: center; /* Center the heading text */
  margin-bottom: 30px; /* Add space below the heading */
}

/* Grid container for form and map */
.content-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two equal columns */
  gap: 30px; /* Space between columns */
}

/* Form section styling */
.form-section {
  padding: 20px;
  background-color: #fff; /* White background */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

/* Header within form sections */
.form-section-header {
  margin-bottom: 15px; /* Space below header */
  border-bottom: 1px solid #dee2e6; /* Bottom border */
}

/* Form section header text */
.form-section-header h2 {
  font-size: 1.2rem; /* Font size */
  font-weight: 600; /* Boldness */
  margin: 0;
  padding-bottom: 10px; /* Padding below text */
}

/* Individual form group styling */
.form-group {
  margin-bottom: 20px; /* Space between form groups */
}

/* Label styling */
label {
  display: block; /* Make label take full width */
  margin-bottom: 5px; /* Space below label */
  font-weight: 500; /* Medium boldness */
}

/* General styling for input, select, textarea */
input,
select,
textarea {
  width: 100%; /* Full width */
  padding: 8px 12px; /* Padding inside */
  border: 1px solid #ced4da; /* Border */
  border-radius: 4px; /* Rounded corners */
  font-family: inherit; /* Use parent font */
  font-size: 14px; /* Font size */
}

/* Remove spinners from number inputs */
input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none; /* Chrome, Safari, Edge */
  margin: 0;
}

/* Styling for read-only inputs */
input:read-only {
  background-color: #e9ecef; /* Light gray background */
  cursor: not-allowed; /* Indicate non-editable */
}

/* Styling for form descriptions */
.form-description {
  font-size: 12px; /* Smaller font size */
  color: #6c757d; /* Gray text color */
  margin-top: 4px; /* Space above description */
}

/* Container for coordinates and hours (flex layout) */
.coordinates-container,
.hours-container {
  display: flex;
  gap: 15px; /* Space between items */
  margin-bottom: 20px; /* Space below container */
}

/* Styling for half-width elements within flex containers */
.half-width {
  flex: 1; /* Allow items to grow equally */
  margin-bottom: 0; /* Remove default bottom margin */
}

/* Container for form action buttons (flex layout) */
.form-actions {
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  gap: 10px; /* Space between buttons */
  margin-top: 30px; /* Space above buttons */
}

/* Base styling for submit and cancel buttons */
.submit-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s; /* Smooth background transition */
}

/* Submit button specific styles */
.submit-button {
  background-color: #4a89dc; /* Blue background */
  color: white;
}
.submit-button:hover:not(:disabled) {
  background-color: #3a79cc; /* Darker blue on hover */
}
.submit-button:disabled {
  background-color: #a8c6f0; /* Lighter blue when disabled */
  cursor: not-allowed; /* Indicate disabled */
}

/* Cancel button specific styles */
.cancel-button {
  background-color: #f8f9fa; /* Light gray background */
  border: 1px solid #ced4da; /* Gray border */
  color: #212529; /* Dark text */
}
.cancel-button:hover {
  background-color: #e9ecef; /* Slightly darker gray on hover */
}

/* Map section styling (flex column layout) */
.map-section {
  display: flex;
  flex-direction: column;
}

/* Map container styling */
.map-container {
  flex-grow: 1; /* Allow map to take available space */
  min-height: 500px; /* Minimum height */
  border-radius: 8px;
  overflow: hidden; /* Hide anything overflowing */
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Error message styling */
.form-error {
  background-color: #f8d7da; /* Light red background */
  color: #721c24; /* Dark red text */
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px; /* Space below error message */
}

/* Responsive layout adjustments */
@media (max-width: 992px) {
  /* Stack form and map vertically on medium screens */
  .content-container {
    grid-template-columns: 1fr;
  }
  .map-section {
    order: 1; /* Map comes first */
  }
  .form-section {
    order: 2; /* Form comes second */
  }
  .map-container {
    min-height: 400px; /* Reduce map height */
  }
}

@media (max-width: 576px) {
  /* Stack coordinate and hour inputs vertically on small screens */
  .coordinates-container,
  .hours-container {
    flex-direction: column;
    gap: 10px;
  }
  .half-width {
    margin-bottom: 10px; /* Add margin back for stacked items */
  }
  /* Stack form action buttons vertically on small screens */
  .form-actions {
    flex-direction: column-reverse; /* Submit button appears below cancel */
  }
  .submit-button,
  .cancel-button {
    width: 100%; /* Make buttons full width */
  }
}
</style>
