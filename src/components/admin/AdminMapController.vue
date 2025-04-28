<template>
  <div class="admin-map-controller">
    <h3>{{ $t('admin.map-controls') || 'Kartkontroller' }}</h3>

    <!-- Map Controls -->
    <div class="map-controls">
      <div class="control-group">
        <button
          class="admin-button admin-get-location"
          @click="getUserLocation"
        >
          {{ $t('admin.get-location') || 'Hent posisjon' }}
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

    <!-- Search Location -->
    <div class="search-location">
      <div class="search-label">
        {{ $t('admin.search-location') || 'Søk etter adresse' }}
      </div>
      <div class="search-input-container">
        <input
          v-model="searchAddress"
          :placeholder="$t('admin.enter-address') || 'Skriv inn adresse'"
          class="search-input"
        />
        <button class="search-button" @click="searchLocation">
          {{ $t('admin.search') || 'Søk' }}
        </button>
      </div>
    </div>

    <!-- Current Selection Info -->
    <div v-if="selectedLocation.lat && selectedLocation.lng" class="current-selection">
      <h4>{{ $t('admin.selected-location') || 'Valgt plassering' }}</h4>
      <div class="selection-details">
        <p>
          <strong>{{ $t('admin.latitude') || 'Breddegrad' }}:</strong> {{ selectedLocation.lat.toFixed(6) }}<br>
          <strong>{{ $t('admin.longitude') || 'Lengdegrad' }}:</strong> {{ selectedLocation.lng.toFixed(6) }}
        </p>
        <button class="admin-button" @click="clearSelectedLocation">
          {{ $t('admin.clear-selection') || 'Fjern valgt plassering' }}
        </button>
      </div>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <p class="instruction-text">
        {{ $t('admin.map-instructions') || 'Klikk på kartet for å velge plassering for nytt interessepunkt.' }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, defineEmits, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'AdminMapController',
  props: {
    mapComponent: {
      type: Object,
      required: true
    }
  },
  emits: ['location-selected', 'location-cleared'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const searchAddress = ref('');
    const statusMessage = ref('');
    const selectedLocation = ref({ lat: null, lng: null });

    // Get user's current location
    async function getUserLocation() {
      statusMessage.value = t('admin.getting-location') || 'Henter posisjon...';

      if (!navigator.geolocation) {
        statusMessage.value = t('admin.location-unavailable') || 'Stedstjenester er ikke tilgjengelig i nettleseren din.';
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Center map on user location
        if (props.mapComponent && props.mapComponent.centerMap) {
          props.mapComponent.centerMap(location.lat, location.lng, 15);
        } else {
          console.error("Map component or centerMap method not available");
        }

        statusMessage.value = t('admin.location-found') || 'Posisjon funnet.';
        setTimeout(() => {
          statusMessage.value = '';
        }, 3000);
      } catch (error) {
        statusMessage.value = t('admin.location-error') || 'Kunne ikke hente posisjon.';
        console.error('Error getting location:', error);
      }
    }

    // Search for a location by address
    async function searchLocation() {
      if (!searchAddress.value) {
        statusMessage.value = t('admin.enter-valid-address') || 'Vennligst skriv inn en gyldig adresse.';
        return;
      }

      statusMessage.value = t('admin.searching') || 'Søker...';

      try {
        // This would be replaced with a real geocoding service
        const location = await geocodeAddress(searchAddress.value);

        if (location) {
          if (props.mapComponent && props.mapComponent.centerMap) {
            props.mapComponent.centerMap(location.lat, location.lng, 15);
          } else {
            console.error("Map component or centerMap method not available");
          }

          // Set the selected location
          setSelectedLocation(location);
          statusMessage.value = t('admin.location-found') || 'Posisjon funnet.';
        } else {
          statusMessage.value = t('admin.address-not-found') || 'Kunne ikke finne adressen.';
        }
      } catch (error) {
        statusMessage.value = t('admin.search-error') || 'Feil ved søk etter adresse.';
        console.error('Error searching for address:', error);
      }
    }

    // Placeholder geocoding function - would be replaced with a real geocoding service
    async function geocodeAddress(address) {
      // This is a dummy implementation - in a real app you would call a geocoding API
      console.log(`Geocoding address: ${address}`);

      // For demonstration, return a dummy location based on input length
      return {
        lat: 63.4305 + (address.length * 0.01),
        lng: 10.3951 - (address.length * 0.01)
      };
    }

    // Handle selection of a location
    function setSelectedLocation(location) {
      selectedLocation.value = location;
      emit('location-selected', location);
    }

    // Clear the currently selected location
    function clearSelectedLocation() {
      selectedLocation.value = { lat: null, lng: null };
      emit('location-cleared');
    }

    // Reset the map view
    function resetMap() {
      if (props.mapComponent && props.mapComponent.centerMap) {
        props.mapComponent.centerMap(63.4305, 10.3951, 6);
        statusMessage.value = t('admin.map-reset') || 'Kart tilbakestilt.';
        setTimeout(() => {
          statusMessage.value = '';
        }, 3000);
      } else {
        console.error("Map component or centerMap method not available");
      }
    }

    return {
      searchAddress,
      statusMessage,
      selectedLocation,
      getUserLocation,
      searchLocation,
      setSelectedLocation,
      clearSelectedLocation,
      resetMap
    };
  }
};
</script>

<style scoped>
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
  transition: background-color 0.2s;
}

.admin-button:hover {
  background-color: #3a79cc;
}

.admin-reset-map {
  background-color: #6c757d;
}

.admin-reset-map:hover {
  background-color: #5a6268;
}

.status-message {
  font-size: 0.875rem;
  padding: 4px 0;
  color: #666;
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
}

.current-selection {
  background-color: #e9f5fe;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.selection-details {
  font-size: 0.875rem;
}

.instructions {
  margin-top: 16px;
  font-size: 0.875rem;
  color: #6c757d;
}

.instruction-text {
  line-height: 1.5;
}

@media (max-width: 640px) {
  .control-group {
    flex-direction: column;
  }

  .search-input-container {
    flex-direction: column;
  }
}
</style>
