<template>
  <div class="admin-map-controller">
    <h3>{{ $t('admin.map-controls') || 'Kartkontroller' }}</h3>

    <div class="map-controls">
      <div class="control-group">
        <button
          class="admin-button admin-get-location"
          @click="getUserLocation"
          :disabled="isGettingLocation"
        >
          <span v-if="isGettingLocation">{{ $t('admin.getting-location') || 'Henter...' }}</span>
          <span v-else>{{ $t('admin.get-location') || 'Hent posisjon' }}</span>
        </button>

        <button
          class="admin-button admin-reset-map"
          @click="resetMap"
        >
          {{ $t('admin.reset-map') || 'Tilbakestill kart' }}
        </button>
      </div>

      <div v-if="statusMessage" class="status-message">
        {{ statusMessage }}
      </div>
    </div>

    <div class="search-location">
      <div class="search-label">
        {{ $t('admin.search-location') || 'Søk etter adresse' }}
      </div>
      <div class="search-input-container">
        <input
          v-model="searchAddress"
          :placeholder="$t('admin.enter-address') || 'Skriv inn adresse'"
          class="search-input"
          @keyup.enter="searchLocation"
        />
        <button class="search-button" @click="searchLocation" :disabled="isSearching">
          <span v-if="isSearching">{{ $t('admin.searching') || 'Søker...' }}</span>
          <span v-else>{{ $t('admin.search') || 'Søk' }}</span>
        </button>
      </div>
    </div>

    <div v-if="selectedLocation.lat !== null && selectedLocation.lng !== null" class="current-selection">
      <h4>{{ $t('admin.selected-location') || 'Valgt plassering' }}</h4>
      <div class="selection-details">
        <p>
          <strong>{{ $t('admin.latitude') || 'Breddegrad' }}:</strong> {{ selectedLocation.lat.toFixed(6) }}<br>
          <strong>{{ $t('admin.longitude') || 'Lengdegrad' }}:</strong> {{ selectedLocation.lng.toFixed(6) }}
        </p>
        <button class="admin-button clear-button" @click="clearSelectedLocation">
          {{ $t('admin.clear-selection') || 'Fjern valgt plassering' }}
        </button>
      </div>
    </div>

    <div class="instructions">
      <p class="instruction-text">
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
  // Methods likely available from the assumed MapComponent structure
}

export default defineComponent({
  name: 'AdminMapController',
  props: {
    // Use the more specific interface for the prop type
    mapComponent: {
      type: Object as PropType<MapComponentRef | null>, // Allow null initially
      required: true
    }
  },
  emits: ['location-selected', 'location-cleared'], // Keep existing emits
  setup(props, { emit }) {
    const { t } = useI18n();
    const searchAddress = ref<string>('');
    const statusMessage = ref<string>('');
    const isGettingLocation = ref(false); // Added state for button disabling
    const isSearching = ref(false); // Added state for button disabling
    const selectedLocation = ref<Location>({ lat: null, lng: null });

    // Get user's current location
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
            timeout: 8000, // Increased timeout
            maximumAge: 0
          });
        });

        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Center map on user location
        if (props.mapComponent?.centerMap && location.lat !== null && location.lng !== null) {
          props.mapComponent.centerMap(location.lat, location.lng, 15); // Zoom in closer
          statusMessage.value = t('admin.location-found') || 'Posisjon funnet.';
          setTimeout(() => { statusMessage.value = ''; }, 3000);
        } else {
          console.error("Map component or centerMap method not available, or location coordinates are null");
          statusMessage.value = t('admin.location-error') || 'Kunne ikke sentrere kart.';
        }
      } catch (error: any) {
        console.error('Error getting location:', error);
        if (error.code === error.PERMISSION_DENIED) {
          statusMessage.value = t('map.location-error') || 'Posisjonstilgang nektet.';
        } else {
          statusMessage.value = t('admin.location-error') || 'Kunne ikke hente posisjon.';
        }
      } finally {
        isGettingLocation.value = false;
      }
    }

    // *** MODIFIED: searchLocation function ***
    async function searchLocation(): Promise<void> {
      if (!searchAddress.value.trim()) {
        statusMessage.value = t('admin.enter-valid-address') || 'Vennligst skriv inn en gyldig adresse.';
        return;
      }

      statusMessage.value = t('admin.searching') || 'Søker...';
      isSearching.value = true;

      try {
        // --- MODIFIED: Replace placeholder with real geocoding call ---
        const location = await geocodeAddressWithNominatim(searchAddress.value);
        // --- END MODIFIED ---

        if (location && location.lat !== null && location.lng !== null) {
          if (props.mapComponent?.centerMap) {
            props.mapComponent.centerMap(location.lat, location.lng, 15); // Zoom in
          } else {
            console.error("Map component or centerMap method not available");
          }

          // Emit the selected location
          setSelectedLocation(location); // This emits 'location-selected'
          statusMessage.value = t('admin.location-found') || 'Posisjon funnet.';
          setTimeout(() => { statusMessage.value = ''; }, 3000); // Clear message after delay
        } else {
          statusMessage.value = t('admin.address-not-found') || 'Kunne ikke finne adressen.';
        }
      } catch (error: any) {
        statusMessage.value = t('admin.search-error') || 'Feil ved søk etter adresse.';
        console.error('Error searching for address:', error);
      } finally {
        isSearching.value = false;
      }
    }
    // *** END MODIFIED: searchLocation function ***


    // *** REPLACED: Placeholder geocodeAddress function ***
    // Example implementation using Nominatim (OpenStreetMap's geocoder)
    // REMEMBER: Check Nominatim's Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
    async function geocodeAddressWithNominatim(address: string): Promise<Location | null> {
      // Prioritize search within Norway
      const viewbox = '5.0,57.8,31.5,71.2'; // Approximate bounding box for Norway
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=no&viewbox=${viewbox}&bounded=1`;
      console.log(`Geocoding address: ${address} using URL: ${url}`);

      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Krisefikser.no Admin Panel/1.0' // Be polite to Nominatim
          }
        });

        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          console.log("Nominatim result:", result);
          if (!isNaN(lat) && !isNaN(lng)) {
            // Optional: Update address field in parent if needed and emit
            // emit('address-found', result.display_name); // Needs adding emit to component
            return { lat, lng };
          } else {
            console.warn("Nominatim returned invalid coordinates:", result);
          }
        } else {
          console.log("Nominatim found no results for:", address);
        }
        return null; // Address not found or invalid coordinates
      } catch (error) {
        console.error('Nominatim geocoding failed:', error);
        throw error; // Re-throw to be caught by searchLocation
      }
    }
    // *** END REPLACED ***

    // Handle selection of a location
    function setSelectedLocation(location: Location): void {
      // Keep existing logic
      selectedLocation.value = location; // Update local state for display
      emit('location-selected', location); // Emit to parent (AdminAddNewPOI)
    }

    // Clear the currently selected location
    function clearSelectedLocation(): void {
      // Keep existing logic
      selectedLocation.value = { lat: null, lng: null };
      emit('location-cleared');
    }

    // Reset the map view
    function resetMap(): void {
      // Keep existing logic
      if (props.mapComponent?.centerMap) {
        // Using initial center from Norway as default
        props.mapComponent.centerMap(63.4305, 10.3951, 6); // Center on Trondheim with default zoom
        statusMessage.value = t('admin.map-reset') || 'Kart tilbakestilt.';
        setTimeout(() => { statusMessage.value = ''; }, 3000);
      } else {
        console.error("Map component or centerMap method not available");
      }
    }

    return {
      searchAddress,
      statusMessage,
      selectedLocation,
      isGettingLocation, // Return new state
      isSearching, // Return new state
      getUserLocation,
      searchLocation,
      // No need to return setSelectedLocation if only used internally before emit
      clearSelectedLocation,
      resetMap
    };
  }
});
</script>

<style scoped>
/* Keep existing styles */
.admin-map-controller {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

h3, h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-weight: 600;
}

.map-controls {
  margin-bottom: 16px;
}

.control-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.admin-button {
  background-color: #4a89dc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s, opacity 0.2s;
}

.admin-button:hover:not(:disabled) {
  background-color: #3a79cc;
}

.admin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-reset-map {
  background-color: #6c757d;
}

.admin-reset-map:hover:not(:disabled) {
  background-color: #5a6268;
}

.clear-button {
  background-color: #dc3545; /* Red color for clear/delete actions */
  margin-top: 8px; /* Add some space above the clear button */
}

.clear-button:hover:not(:disabled) {
  background-color: #c82333;
}


.status-message {
  font-size: 0.875rem; /* 14px */
  padding: 4px 0;
  color: #6c757d; /* Muted text color */
  min-height: 1.25rem; /* Reserve space to prevent layout shifts */
}

.search-location {
  margin-bottom: 16px;
}

.search-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.search-input-container {
  display: flex;
  gap: 8px;
}

.search-input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.search-button {
  background-color: #4a89dc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
}
.search-button:hover:not(:disabled) {
  background-color: #3a79cc;
}
.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.current-selection {
  background-color: #e9f5fe; /* Light blue background */
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #bde0fe; /* Slightly darker blue border */
}

.selection-details {
  font-size: 0.875rem; /* 14px */
}

.selection-details p {
  margin-bottom: 8px; /* Space between text and button */
  line-height: 1.4; /* Improve readability */
}

.instructions {
  margin-top: 16px;
  font-size: 0.875rem; /* 14px */
  color: #6c757d;
}

.instruction-text {
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .control-group {
    flex-direction: column;
  }
  .admin-button {
    width: 100%; /* Make buttons full width */
  }

  .search-input-container {
    flex-direction: column;
  }
  .search-button {
    width: 100%; /* Make button full width */
  }
  .clear-button {
    width: auto; /* Keep clear button width auto */
    align-self: flex-start; /* Align clear button to the left */
  }
}
</style>
