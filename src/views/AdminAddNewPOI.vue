<template>
  <div style="margin: 20px">
    <!-- Breadcrumb at the top left -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin-panel">
            {{ $t('navigation.admin-panel') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage href="/add-new-POI">
            {{ $t('navigation.new-POI') }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="admin-add-poi-page">
    <!-- Page title -->
    <h1>{{ $t('admin.make-new-POI') || 'Legg til et nytt interessepunkt' }}</h1>

    <!-- Main content container -->
    <div class="content-container">
      <!-- Form section -->
      <div class="form-section">
        <form @submit.prevent="submitPOI">
          <!-- Basic info section -->
          <div class="form-section-header">
            <h2>{{ $t('admin.basic-info') || 'Grunnleggende informasjon' }}</h2>
          </div>

          <!-- Title -->
          <div class="form-group">
            <label for="title">{{ $t('add-event-info.titles.title') || 'Tittel' }}</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              :placeholder="
                $t('admin.poi-title-placeholder') ||
                'Skriv inn tittel på interessepunktet'
              "
              required
            />
            <div class="form-description">
              {{ $t('add-POI-info.info.title') || 'Dette vil være tittelen på interessepunktet.' }}
            </div>
          </div>

          <!-- Type -->
          <div class="form-group">
            <label for="type">{{ $t('add-POI-info.titles.type') || 'Type' }}</label>
            <select id="type" v-model="formData.type" required>
              <option value="" disabled selected>
                {{
                  $t('admin.select-poi-type') ||
                  'Velg hvilken type interessepunkt dette skal være'
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
                $t('add-POI-info.info.type') ||
                'Velg hvilken type interessepunkt dette skal være.'
              }}
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description">
              {{ $t('add-event-info.titles.description') || 'Informasjon' }}
            </label>
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
                'Skriv litt informasjon som beskriver interessepunktet. Hvor ligger det? Hva kan man finne der?'
              }}
            </div>
          </div>

          <!-- Location section -->
          <div class="form-section-header">
            <h2>{{ $t('admin.location-info') || 'Plassering' }}</h2>
          </div>

          <!-- Address -->
          <div class="form-group">
            <label for="address">
              {{ $t('add-event-info.titles.address') || 'Adresse' }}
            </label>
            <input
              id="address"
              v-model="formData.address"
              type="text"
              :placeholder="$t('admin.address-placeholder') || 'Eksempelveien 2'"
            />
          </div>

          <!-- Coordinates -->
          <div class="coordinates-container">
            <div class="form-group half-width">
              <label for="latitude">
                {{ $t('add-event-info.titles.latitude') || 'Breddegrad' }}
              </label>
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
              <label for="longitude">
                {{ $t('add-event-info.titles.longitude') || 'Lengdegrad' }}
              </label>
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

          <!-- Hours & Contact section -->
          <div class="form-section-header">
            <h2>
              {{ $t('admin.hours-contact-info') || 'Åpningstider og kontaktinformasjon' }}
            </h2>
          </div>

          <!-- Opening Hours -->
          <div class="hours-container">
            <div class="form-group half-width">
              <label for="openfrom">
                {{ $t('add-POI-info.titles.open-from') || 'Åpent fra' }}
              </label>
              <input id="openfrom" v-model="formData.openfrom" type="time" />
            </div>
            <div class="form-group half-width">
              <label for="opento">
                {{ $t('add-POI-info.titles.open-to') || 'Åpent til' }}
              </label>
              <input id="opento" v-model="formData.opento" type="time" />
            </div>
          </div>

          <!-- Contact Info -->
          <div class="form-group">
            <label for="contactinfo">
              {{ $t('add-POI-info.titles.contact-info') || 'Kontaktinformasjon' }}
            </label>
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

          <!-- Error message -->
          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>

          <!-- Submit/Cancel buttons -->
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="cancelForm">
              {{ $t('admin.cancel') || 'Avbryt' }}
            </button>
            <button
              type="submit"
              class="submit-button"
              :disabled="!isFormValid || isSubmitting"
            >
              <span v-if="isSubmitting">
                {{ $t('admin.submitting') || 'Lagrer...' }}
              </span>
              <span v-else>{{ $t('admin.submit') || 'Lagre' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Map section -->
      <div class="map-section">
        <!-- Map controls -->
        <AdminMapController
          :mapComponent="mapComponentInstance"
          @location-selected="handleLocationSelected"
          @location-cleared="handleLocationCleared"
        />

        <!-- Map container -->
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
import { createPOI } from '@/services/api/AdminServices'
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
  lat: number | null
  lng: number | null
}

interface FormData {
  title: string
  type: string
  description: string
  address: string
  latitude: number | null
  longitude: number | null
  openfrom: string
  opento: string
  contactinfo: string
}

interface MapClickEvent {
  latlng: {
    lat: number
    lng: number
  }
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

    // Component refs
    const mapComponent = ref<InstanceType<typeof MapComponent> | null>(null)
    const tempMarker = ref<L.Marker | null>(null)

    // Initial center (Norway)
    const initialCenter: Location = { lat: 63.4305, lng: 10.3951 }

    // Form data
    const formData = ref<FormData>({
      title: '',
      type: '',
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

    const mapComponentInstance = computed(
      () => mapComponent.value! as InstanceType<typeof MapComponent>,
    )

    const isFormValid = computed(() => {
      return (
        formData.value.title.length >= 2 &&
        !!formData.value.type &&
        formData.value.description.length >= 10 &&
        formData.value.latitude !== null &&
        formData.value.longitude !== null
      )
    })

    function handleMapClick(event: MapClickEvent): void {
      handleLocationSelected({ lat: event.latlng.lat, lng: event.latlng.lng })
    }

    function handleLocationSelected(location: Location): void {
      formData.value.latitude = location.lat
      formData.value.longitude = location.lng
      if (location.lat !== null && location.lng !== null) {
        updateMapMarker(location.lat, location.lng)
      }
    }

    function handleLocationCleared(): void {
      formData.value.latitude = null
      formData.value.longitude = null
      if (tempMarker.value && mapComponent.value?.removeMarker) {
        mapComponent.value.removeMarker(tempMarker.value as any)
        tempMarker.value = null
      }
    }

    function updateMapMarker(lat: number, lng: number): void {
      if (!mapComponent.value || !mapComponent.value.addMarker) {
        console.error('Map component not ready')
        return
      }
      if (tempMarker.value && mapComponent.value.removeMarker) {
        mapComponent.value.removeMarker(tempMarker.value as any)
      }
      const title = formData.value.title || 'Nytt interessepunkt'
      tempMarker.value = mapComponent.value.addMarker(lat, lng, title)
    }

    async function submitPOI(): Promise<void> {
      if (!isFormValid.value) {
        formError.value = t('admin.form-invalid') || 'Vennligst fyll ut alle påkrevde felt.'
        return
      }
      isSubmitting.value = true
      formError.value = ''

      try {
        const poiData = {
          title: formData.value.title,
          latitude: formData.value.latitude!,
          longitude: formData.value.longitude!,
          address: formData.value.address || '',
          type: formData.value.type,
          openfrom: formData.value.openfrom || '',
          opento: formData.value.opento || '',
          contactinfo: formData.value.contactinfo || '',
          description: formData.value.description,
        }
        await createPOI(poiData)
        router.push('/admin-panel')
      } catch (err) {
        console.error(err)
        formError.value =
          t('admin.submission-error') || 'Feil ved lagring av interessepunkt. Prøv igjen senere.'
      } finally {
        isSubmitting.value = false
      }
    }

    function cancelForm(): void {
      router.push('/admin-panel')
    }

    watch(
      () => formData.value.title,
      (newTitle) => {
        if (tempMarker.value && mapComponent.value) {
          console.log('Update marker title to:', newTitle)
        }
      },
    )

    onMounted(() => {
      console.log('AdminAddPOIPage mounted')
    })

    return {
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
