<template>
  <Card class="admin-map-controller">
    <CardHeader>
      <CardTitle>{{ $t('admin.map-controls') || 'Kartkontroller' }}</CardTitle>
    </CardHeader>

    <CardContent>
      <div class="map-controls">
        <div class="control-group">
          <Button
            class="control-button"
            @click="getUserLocation"
            :disabled="isGettingLocation"
            variant="default"
          >
            <span v-if="isGettingLocation">{{ $t('admin.getting-location') || 'Henter...' }}</span>
            <span v-else>{{ $t('admin.get-location') || 'Hent posisjon' }}</span>
          </Button>

          <Button
            class="control-button"
            @click="resetMap"
            variant="secondary"
          >
            {{ $t('admin.reset-map') || 'Tilbakestill kart' }}
          </Button>
        </div>

        <div v-if="statusMessage" class="status-message">
          {{ statusMessage }}
        </div>
      </div>

      <div class="search-location">
        <Label for="search-address">
          {{ $t('admin.search-location') || 'Søk etter adresse' }}
        </Label>
        <div class="search-input-container">
          <Input
            id="search-address"
            v-model="searchAddress"
            :placeholder="$t('admin.enter-address') || 'Skriv inn adresse'"
            @keyup.enter="searchLocation"
          />
          <Button
            @click="searchLocation"
            :disabled="isSearching"
            variant="default"
          >
            <span v-if="isSearching">{{ $t('admin.searching') || 'Søker...' }}</span>
            <span v-else>{{ $t('admin.search') || 'Søk' }}</span>
          </Button>
        </div>
      </div>

      <div v-if="selectedLocation.lat !== null && selectedLocation.lng !== null" class="current-selection">
        <Label as="h4" class="selection-title">{{ $t('admin.selected-location') || 'Valgt plassering' }}</Label>
        <div class="selection-details">
          <p>
            <strong>{{ $t('admin.latitude') || 'Breddegrad' }}:</strong> {{ selectedLocation.lat.toFixed(6) }}<br>
            <strong>{{ $t('admin.longitude') || 'Lengdegrad' }}:</strong> {{ selectedLocation.lng.toFixed(6) }}
          </p>
          <Button
            @click="clearSelectedLocation"
            variant="destructive"
            size="sm"
          >
            {{ $t('admin.clear-selection') || 'Fjern valgt plassering' }}
          </Button>
        </div>
      </div>

      <div class="instructions">
        <p class="instruction-text text-sm text-muted-foreground">
          {{ $t('admin.map-instructions') || 'Klikk på kartet for å velge plassering for nytt interessepunkt.' }}
        </p>
      </div>
    </CardContent>
  </Card>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';
import * as L from 'leaflet';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  components: {
    Button,
    Input,
    Label,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  },
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
      selectedLocation.value = location; // Update local state for display
      emit('location-selected', location); // Emit to parent (AdminAddNewPOI)
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

<style scoped>
.admin-map-controller {
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.control-button {
  flex: 1;
}

.status-message {
  font-size: 0.875rem;
  padding: 4px 0;
  color: hsl(var(--muted-foreground));
  min-height: 1.25rem;
  margin-bottom: 12px;
}

.search-location {
  margin-bottom: 16px;
}

.search-input-container {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.current-selection {
  background-color: hsl(var(--accent) / 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid hsl(var(--accent) / 0.5);
}

.selection-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1rem;
  font-weight: 600;
}

.selection-details p {
  margin-bottom: 8px;
  line-height: 1.4;
}

.instructions {
  margin-top: 16px;
}

.instruction-text {
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .control-group {
    flex-direction: column;
  }

  .search-input-container {
    flex-direction: column;
  }
}
</style>
