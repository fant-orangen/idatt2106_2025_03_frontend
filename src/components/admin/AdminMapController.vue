<template>
  <div class="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm mb-5">
    <h3 class="text-lg font-semibold mb-4">
      {{ $t('admin.map-controls') || 'Kartkontroller' }}
    </h3>

    <!-- Map Controls -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="getUserLocation"
          :disabled="isGettingLocation"
        >
          <span v-if="isGettingLocation">{{ $t('admin.getting-location') || 'Henter...' }}</span>
          <span v-else>{{ $t('admin.get-location') || 'Hent posisjon' }}</span>
        </button>

        <button
          class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          @click="resetMap"
        >
          {{ $t('admin.reset-map') || 'Tilbakestill kart' }}
        </button>
      </div>

      <div v-if="statusMessage" class="text-sm text-gray-600">
        {{ statusMessage }}
      </div>
    </div>

    <!-- Search Location -->
    <div class="mt-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ $t('admin.search-location') || 'Søk etter adresse' }}
      </label>
      <div class="flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchAddress"
          :placeholder="$t('admin.enter-address') || 'Skriv inn adresse'"
          class="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          @keyup.enter="searchLocation"
        />
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="searchLocation"
          :disabled="isSearching"
        >
          <span v-if="isSearching">{{ $t('admin.searching') || 'Søker...' }}</span>
          <span v-else>{{ $t('admin.search') || 'Søk' }}</span>
        </button>
      </div>
    </div>

    <!-- Selected Location -->
    <div
      v-if="selectedLocation.lat !== null && selectedLocation.lng !== null"
      class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
    >
      <h4 class="text-sm font-semibold text-blue-700 mb-2">
        {{ $t('admin.selected-location') || 'Valgt plassering' }}
      </h4>
      <div class="text-sm text-gray-700">
        <p>
          <strong>{{ $t('admin.latitude') || 'Breddegrad' }}:</strong>
          {{ selectedLocation.lat.toFixed(6) }}<br />
          <strong>{{ $t('admin.longitude') || 'Lengdegrad' }}:</strong>
          {{ selectedLocation.lng.toFixed(6) }}
        </p>
        <button
          class="bg-red-500 text-white px-4 py-2 mt-3 rounded-md hover:bg-red-600"
          @click="clearSelectedLocation"
        >
          {{ $t('admin.clear-selection') || 'Fjern valgt plassering' }}
        </button>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-6 text-sm text-gray-600">
      <p>
        {{ $t('admin.map-instructions') || 'Klikk på kartet for å velge plassering for nytt interessepunkt.' }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';
import * as L from 'leaflet';

// Define interfaces for the component
interface Location {
  lat: number | null;
  lng: number | null;
}

// Define the expected interface for the MapComponent prop more accurately
interface MapComponentRef {
  mapContainerId?: string;
  addMarker?: (lat: number, lng: number, title?: string) => L.Marker | null;
  removeMarker?: (marker: L.Marker) => void;
  centerMap?: (lat: number, lng: number, zoom?: number) => void;
  forceMapRefresh?: () => void;
}

export default defineComponent({
  name: 'AdminMapController',
  props: {
    mapComponent: {
      type: Object as PropType<MapComponentRef | null>,
      required: true,
    },
  },
  emits: ['location-selected', 'location-cleared'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const searchAddress = ref<string>('');
    const statusMessage = ref<string>('');
    const isGettingLocation = ref(false);
    const isSearching = ref(false);
    const selectedLocation = ref<Location>({ lat: null, lng: null });

    async function getUserLocation(): Promise<void> {
      statusMessage.value = t('admin.getting-location') || 'Henter posisjon...';
      isGettingLocation.value = true;

      if (!navigator.geolocation) {
        statusMessage.value = t('admin.location-unavailable') || 'Stedstjenester er ikke tilgjengelig.';
        isGettingLocation.value = false;
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0,
          });
        });

        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (props.mapComponent?.centerMap && location.lat !== null && location.lng !== null) {
          props.mapComponent.centerMap(location.lat, location.lng, 15);
          statusMessage.value = t('admin.location-found') || 'Posisjon funnet.';
          setTimeout(() => {
            statusMessage.value = '';
          }, 3000);
        } else {
          statusMessage.value = t('admin.location-error') || 'Kunne ikke sentrere kart.';
        }
      } catch (error: any) {
        if (error.code === error.PERMISSION_DENIED) {
          statusMessage.value = t('map.location-error') || 'Posisjonstilgang nektet.';
        } else {
          statusMessage.value = t('admin.location-error') || 'Kunne ikke hente posisjon.';
        }
      } finally {
        isGettingLocation.value = false;
      }
    }

    async function searchLocation(): Promise<void> {
      if (!searchAddress.value.trim()) {
        statusMessage.value = t('admin.enter-valid-address') || 'Vennligst skriv inn en gyldig adresse.';
        return;
      }

      statusMessage.value = t('admin.searching') || 'Søker...';
      isSearching.value = true;

      try {
        const location = await geocodeAddressWithNominatim(searchAddress.value);

        if (location && location.lat !== null && location.lng !== null) {
          if (props.mapComponent?.centerMap) {
            props.mapComponent.centerMap(location.lat, location.lng, 15);
          }

          setSelectedLocation(location);
          statusMessage.value = t('admin.location-found') || 'Posisjon funnet.';
          setTimeout(() => {
            statusMessage.value = '';
          }, 3000);
        } else {
          statusMessage.value = t('admin.address-not-found') || 'Kunne ikke finne adressen.';
        }
      } catch (error: any) {
        statusMessage.value = t('admin.search-error') || 'Feil ved søk etter adresse.';
      } finally {
        isSearching.value = false;
      }
    }

    async function geocodeAddressWithNominatim(address: string): Promise<Location | null> {
      const viewbox = '5.0,57.8,31.5,71.2';
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1&countrycodes=no&viewbox=${viewbox}&bounded=1`;

      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Krisefikser.no Admin Panel/1.0',
          },
        });

        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
        return null;
      } catch (error) {
        throw error;
      }
    }

    function setSelectedLocation(location: Location): void {
      selectedLocation.value = location;
      emit('location-selected', location);
    }

    function clearSelectedLocation(): void {
      selectedLocation.value = { lat: null, lng: null };
      emit('location-cleared');
    }

    function resetMap(): void {
      if (props.mapComponent?.centerMap) {
        props.mapComponent.centerMap(63.4305, 10.3951, 6);
        statusMessage.value = t('admin.map-reset') || 'Kart tilbakestilt.';
        setTimeout(() => {
          statusMessage.value = '';
        }, 3000);
      }
    }

    return {
      searchAddress,
      statusMessage,
      selectedLocation,
      isGettingLocation,
      isSearching,
      getUserLocation,
      searchLocation,
      clearSelectedLocation,
      resetMap,
    };
  },
});
</script>