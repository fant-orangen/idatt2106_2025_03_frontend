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
            <button type="button" class="cancel-button" @click="cancelForm">
              {{ $t('admin.cancel') || 'Avbryt' }}
            </button>

            <button type="submit" class="submit-button" :disabled="!isFormValid || isSubmitting">
              <span v-if="isSubmitting">{{ $t('admin.submitting') || 'Lagrer...' }}</span>
              <span v-else>{{ $t('admin.submit') || 'Lagre' }}</span>
            </button>
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb/index.js'

// Define interfaces for the component
interface Location {
  lat: number | null;
  lng: number | null;
}

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
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()

    // Component references
    const mapComponent = ref<InstanceType<typeof MapComponent> | null>(null)
    const tempMarker = ref<L.Marker | null>(null)

    // Initial center coordinates (Norway)
    const initialCenter: Location = {
      lat: 63.4305,
      lng: 10.3951,
    }

    // Form data
    const formData = ref<FormData>({
      title: '',
      type: '', // Keep as string from select input
      description: '',
      address: '',
      latitude: null,
      longitude: null,
      openfrom: '',
      opento: '',
      contactinfo: '',
    })

    const isSubmitting = ref(false)
    const formError = ref('')

    // Computed property to get map component instance
    const mapComponentInstance = computed(() => {
      // Ensure mapComponent.value is defined before accessing its properties
      return mapComponent.value ? (mapComponent.value as InstanceType<typeof MapComponent>) : null;
    });

    // Computed property to check if form is valid
    const isFormValid = computed(() => {
      // Keep existing validation logic
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

    // Handle map click to select location
    function handleMapClick(event: MapClickEvent): void {
      // Keep existing logic
      console.log('Map clicked at:', event.latlng)
      const location: Location = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      }
      handleLocationSelected(location)
    }

    // Handle location selected from the map controller
    function handleLocationSelected(location: Location): void {
      // Keep existing logic
      console.log('Location selected:', location)
      formData.value.latitude = location.lat
      formData.value.longitude = location.lng
      if (location.lat !== null && location.lng !== null) {
        updateMapMarker(location.lat, location.lng)
        // Optional: Attempt reverse geocoding here if needed
        // tryReverseGeocode(location.lat, location.lng);
      }
      console.log('Selected location:', location)
    }

    // Handle location cleared
    function handleLocationCleared(): void {
      // Keep existing logic
      console.log('Location cleared')
      formData.value.latitude = null
      formData.value.longitude = null
      if (tempMarker.value && mapComponent.value && mapComponent.value.removeMarker) {
        mapComponent.value.removeMarker(tempMarker.value as any)
        tempMarker.value = null
      }
    }

    // Update or create marker on the map
    function updateMapMarker(lat: number, lng: number): void {
      // Keep existing logic
      if (!mapComponent.value || !mapComponent.value.addMarker) {
        console.error('Map component or addMarker method not available')
        return
      }
      if (tempMarker.value && mapComponent.value.removeMarker) {
        mapComponent.value.removeMarker(tempMarker.value as any)
      }
      const title = formData.value.title || t('navigation.new-POI') || 'Nytt interessepunkt'
      // Add marker using MapComponent's method
      tempMarker.value = mapComponent.value.addMarker(lat, lng, title)

      // --- ADDED: Update marker popup/tooltip if possible ---
      if (tempMarker.value) {
        if (typeof tempMarker.value.bindPopup === 'function') {
          tempMarker.value.bindPopup(`<b>${title}</b><br>${formData.value.description || ''}`).openPopup();
        } else if (typeof tempMarker.value.bindTooltip === 'function') {
          tempMarker.value.bindTooltip(title).openTooltip();
        }
      }
      // --- END ADDED ---
    }

    // *** MODIFIED: submitPOI function ***
    async function submitPOI(): Promise<void> {
      if (!isFormValid.value) {
        formError.value = t('admin.form-invalid') || 'Vennligst fyll ut alle påkrevde felt.'
        return
      }

      isSubmitting.value = true
      formError.value = ''

      // --- ADDED: Map frontend type string to backend poiTypeId integer ---
      // Based on data.sql and frontend options
      // Adjust IDs as needed based on your actual database setup or add new types.
      let poiTypeId: number | null = null;
      switch (formData.value.type) {
        case 'shelter':
          poiTypeId = 4; // Matches 'Shelter' in data.sql
          break;
        case 'water-source':
          poiTypeId = 6; // Matches 'Water Distribution Point'
          break;
        case 'food-station':
          poiTypeId = 5; // Matches 'Grocery Store' (assuming this is the intent for food distribution)
          break;
        case 'defibrillator':
          // Assuming Defibrillator might relate to Hospital or needs a new type ID
          // Use a placeholder or add a specific type ID in your backend/DB
          poiTypeId = 1; // Example: Using 'Hospital' ID as placeholder
          console.warn("Mapping 'defibrillator' to POI Type ID 1 (Hospital). Adjust if needed.");
          break;
        default:
          formError.value = t('add-event-info.errors.type') || 'Ugyldig interessepunkttype valgt.';
          isSubmitting.value = false;
          return;
      }
      // --- END ADDED ---

      // --- ADDED: Combine opening hours ---
      let openingHours = '';
      if (formData.value.openfrom && formData.value.opento) {
        openingHours = `${formData.value.openfrom} - ${formData.value.opento}`;
      } else if (formData.value.openfrom) {
        openingHours = `Fra ${formData.value.openfrom}`; // Adjusted translation
      } else if (formData.value.opento) {
        openingHours = `Til ${formData.value.opento}`; // Adjusted translation
      }
      // --- END ADDED ---


      try {
        // --- MODIFIED: Format data for API according to CreatePoiDto ---
        // Backend expects 'name', 'latitude', 'longitude', 'poiTypeId' as mandatory
        // Other fields like address, description, openingHours, contactInfo are optional
        const poiData = {
          // Map 'title' to 'name' as expected by backend DTO
          name: formData.value.title,
          latitude: formData.value.latitude!, // Use non-null assertion as isFormValid checks this
          longitude: formData.value.longitude!, // Use non-null assertion
          address: formData.value.address || null, // Send null if empty
          // Use the mapped poiTypeId
          poiTypeId: poiTypeId,
          description: formData.value.description || null,
          // Use combined openingHours
          openingHours: openingHours || null,
          contactInfo: formData.value.contactinfo || null, // Send null if empty
        }
        // --- END MODIFIED ---

        console.log('Submitting POI data:', poiData)

        // Call API to create the POI - Service endpoint URL should be corrected in AdminServices.ts
        const response = await createPOI(poiData)
        console.log('POI created:', response.data)

        // Consider adding a success notification (e.g., using a toast library)
        // toast.success('POI created successfully!')

        router.push('/admin-panel')
      } catch (error: any) {
        console.error('Error creating POI:', error)
        // Display more specific error from backend if possible
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        formError.value = `${t('admin.submission-error') || 'Feil ved lagring.'} ${errorMsg}`;
      } finally {
        isSubmitting.value = false
      }
    }
    // *** END MODIFIED: submitPOI function ***


    // Cancel and return to admin panel
    function cancelForm(): void {
      // Keep existing logic
      router.push('/admin-panel')
    }

    // *** MODIFIED: Watcher for title changes ***
    // Update marker tooltip/popup when title changes
    watch(
      () => formData.value.title,
      (newTitle: string) => {
        if (tempMarker.value && mapComponent.value) {
          const markerTitle = newTitle || t('navigation.new-POI') || 'Nytt interessepunkt';
          // Update popup or tooltip content if the marker exists and methods are available
          if (typeof tempMarker.value.setPopupContent === 'function') {
            tempMarker.value.setPopupContent(`<b>${markerTitle}</b><br>${formData.value.description || ''}`);
          }
          if (typeof tempMarker.value.setTooltipContent === 'function') {
            tempMarker.value.setTooltipContent(markerTitle);
          }
          console.log('Updated marker title/popup to:', markerTitle);
        }
      },
    )
    // *** END MODIFIED ***

    // Initialize
    onMounted((): void => {
      console.log('AdminAddPOIPage mounted')
      // Optional: Fetch POI Types from backend if needed for dynamic select options
      // fetchPoiTypes();
    })

    return {
      // Keep existing return values
      mapComponent,
      mapComponentInstance,
      initialCenter,
      formData,
      isSubmitting,
      formError,
      isFormValid,
      handleMapClick,
      handleLocationSelected,
      handleLocationCleared,
      submitPOI,
      cancelForm,
    }
  },
})
</script>

<style scoped>
/* Keep existing styles */
.admin-add-poi-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.content-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.form-section {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section-header {
  margin-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
}

.form-section-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}

input[type='number'] {
  -moz-appearance: textfield;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input:read-only {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.form-description {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.coordinates-container,
.hours-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.half-width {
  flex: 1;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.submit-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.submit-button {
  background-color: #4a89dc;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #3a79cc;
}

.submit-button:disabled {
  background-color: #a8c6f0;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  color: #212529;
}

.cancel-button:hover {
  background-color: #e9ecef;
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

/* Error message */
.form-error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

/* Responsive layout */
@media (max-width: 992px) {
  .content-container {
    grid-template-columns: 1fr;
  }

  .map-section {
    order: 1;
  }

  .form-section {
    order: 2;
  }

  .map-container {
    min-height: 400px;
  }
}

@media (max-width: 576px) {
  .coordinates-container,
  .hours-container {
    flex-direction: column;
    gap: 10px;
  }

  .half-width {
    margin-bottom: 10px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .submit-button,
  .cancel-button {
    width: 100%;
  }
}
</style>
