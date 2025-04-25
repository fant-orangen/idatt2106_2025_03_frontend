<script setup lang="ts">
import { onMounted, ref, watchEffect, onBeforeUnmount } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PoiData } from '@/models/PoiData.ts';
import { useI18n } from 'vue-i18n';

// Initialize i18n for use in script section
const { t } = useI18n();

// --- Leaflet Icon Fix ---
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

onMounted(() => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  });
});
// --- End Leaflet Icon Fix ---

const props = withDefaults(
  defineProps<{
    pois?: PoiData[]; // Changed from markers to pois
    centerLat?: number;
    centerLon?: number;
    initialZoom?: number;
    userLocation?: { latitude: number; longitude: number } | null;
  }>(),
  {
    pois: () => [], // Default to empty array
    centerLat: 63.4305,  // Default Trondheim
    centerLon: 10.3951,
    initialZoom: 6,
    userLocation: null,
  }
);

const map = ref<L.Map | null>(null);
const poiLayerGroup = ref<L.LayerGroup | null>(null); // Renamed for clarity
const userMarker = ref<L.Marker | null>(null); // Reference to user location marker
const mapContainerId = 'map-' + Math.random().toString(36).substring(7); // Unique ID

// Create a blue icon for user location
const userIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'user-location-icon' // This will allow us to style it with CSS
});

onMounted(() => {
  map.value = L.map(mapContainerId).setView([props.centerLat!, props.centerLon!], props.initialZoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
  }).addTo(map.value as L.Map);

  poiLayerGroup.value = L.layerGroup().addTo(map.value as L.Map);
});

// Function to create informative popup content from POI data
function createPopupContent(poi: PoiData): string {
  let content = `<div class="poi-popup">`;
  content += `<strong>${poi.name}</strong> (${poi.poiTypeName})<br>`; // Name and Type
  if (poi.description) {
    content += `${poi.description}<hr>`;
  }
  if (poi.address) {
    content += `<strong>${t('map.address')}:</strong> ${poi.address}<br>`;
  }
  if (poi.openingHours) {
    content += `<strong>${t('map.opening-hours')}:</strong> ${poi.openingHours}<br>`;
  }
  if (poi.contactInfo) {
    content += `<strong>${t('map.contact')}:</strong> ${poi.contactInfo}<br>`;
  }
  // Directions link with translated text
  content += `<a href="https://www.google.com/maps/dir/?api=1&destination=${poi.latitude},${poi.longitude}" target="_blank" rel="noopener noreferrer">${t('map.directions')}</a>`;
  content += `</div>`;
  return content;
}

// Watch for changes in POIs
watchEffect(() => {
  if (!map.value || !poiLayerGroup.value) return;

  poiLayerGroup.value.clearLayers(); // Clear previous POIs
  const bounds = L.latLngBounds([]);

  // Iterate over the 'pois' prop
  props.pois.forEach((poi) => {
    // Ensure lat/lon are valid numbers before creating marker
    if (typeof poi.latitude !== 'number' || typeof poi.longitude !== 'number') {
      console.warn(`Invalid coordinates for POI: ${poi.name}`, poi);
      return; // Skip this POI
    }

    const latLng: L.LatLngExpression = [poi.latitude, poi.longitude];
    const leafletMarker = L.marker(latLng);

    // Create and bind the informative popup
    const popupContent = createPopupContent(poi);
    leafletMarker.bindPopup(popupContent);

    // Add permanent tooltip as label
    leafletMarker.bindTooltip(poi.name, {
      permanent: true,
      direction: 'top',
      className: 'poi-label',
      offset: [0, -30] // Offset to position above the marker
    });

    leafletMarker.addTo(poiLayerGroup.value!);
    bounds.extend(latLng);
  });

  // Add user location to bounds if available
  if (props.userLocation && map.value) {
    const userLatLng: L.LatLngExpression = [props.userLocation.latitude, props.userLocation.longitude];
    bounds.extend(userLatLng);
  }

  // Adjust map view to fit POIs if any exist
  if ((props.pois.length > 0 || props.userLocation) && bounds.isValid()) {
    map.value.fitBounds(bounds.pad(0.2)); // Add some padding around bounds
  } else if (props.pois.length === 0 && !props.userLocation) {
    // Optionally reset view if all POIs are removed and map hasn't been moved
    if (map.value.getZoom() === props.initialZoom) {
      map.value.setView([props.centerLat!, props.centerLon!], props.initialZoom);
    }
  }
});

// Watch for changes in user location
watchEffect(() => {
  if (!map.value) return;

  // Remove previous user marker if it exists
  if (userMarker.value) {
    userMarker.value.remove();
    userMarker.value = null;
  }

  // Add user location marker if available
  if (props.userLocation) {
    const userLatLng: L.LatLngExpression = [props.userLocation.latitude, props.userLocation.longitude];
    userMarker.value = L.marker(userLatLng, { icon: userIcon })
      .addTo(map.value)
      .bindPopup(`<strong>${t('map.your-location')}</strong>`)
      .bindTooltip(t('map.your-location'), {
        permanent: true,
        direction: 'top',
        className: 'user-location-label',
        offset: [0, -30]
      });
  }
});

// --- Cleanup ---
onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

</script>

<template>
  <div id="mapContainer">
    <div :id="mapContainerId"></div> </div>
</template>

<style scoped>
@import '../../../node_modules/leaflet/dist/leaflet.css';

#mapContainer > div {
  height: 50em; /* Ensure container dictates size */
  width: 100%;
  max-width: 80em;
  margin: auto;
}

/* Style the popups */
:deep(.poi-popup) { /* Use :deep to target Leaflet's default classes */
  font-family: sans-serif;
  line-height: 1.5;
}
:deep(.poi-popup strong) {
  font-weight: bold;
  margin-right: 5px;
}
:deep(.poi-popup hr) {
  border: 0;
  height: 1px;
  background-color: #ccc;
  margin: 5px 0;
}
:deep(.poi-popup a) {
  color: #007bff;
  text-decoration: none;
  display: inline-block;
  margin-top: 5px;
}
:deep(.poi-popup a:hover) {
  text-decoration: underline;
}

/* Style for permanent tooltip labels */
:deep(.poi-label) {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #666;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
}

/* Style for user location marker */
::deep(.user-location-icon) {
  filter: hue-rotate(210deg); /* Make the icon blue */
}

/* Style for user location label */
::deep(.user-location-label) {
  background-color: rgba(0, 120, 255, 0.8); /* Blue background */
  color: white;
  border: 1px solid #0066cc;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
}

</style>
