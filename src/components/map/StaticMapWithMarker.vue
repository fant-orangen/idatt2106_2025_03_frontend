<template>
  <div :id="mapId" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Import POI type-specific SVG icons
import firestationIconUrl from '@/assets/mapicons/firestation.svg'
import gasstationIconUrl from '@/assets/mapicons/gasstation.svg'
import grocerystoreIconUrl from '@/assets/mapicons/grocerystore.svg'
import hospitalIconUrl from '@/assets/mapicons/hospital.svg'
import meetingpointIconUrl from '@/assets/mapicons/meetingpoint.svg'
import pharmacyIconUrl from '@/assets/mapicons/pharmacy.svg'
import policestationIconUrl from '@/assets/mapicons/policestation.svg'
import shelterIconUrl from '@/assets/mapicons/shelter.svg'
import waterpointIconUrl from '@/assets/mapicons/waterpoint.svg'
import defaultPoiIconUrl from '@/assets/mapicons/home.svg'

// Define component props
const props = defineProps({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  poiTypeName: { type: String, default: '' },
  mapId: { type: String, default: 'static-map-marker' }
})

const map = ref<L.Map | null>(null)
const marker = ref<L.Marker | null>(null)

// Map POI type names to icon URLs
const poiIconUrls: Record<string, string> = {
  'fire station': firestationIconUrl,
  'gas station': gasstationIconUrl,
  'grocery store': grocerystoreIconUrl,
  'hospital': hospitalIconUrl,
  'meeting point': meetingpointIconUrl,
  'pharmacy': pharmacyIconUrl,
  'police station': policestationIconUrl,
  'shelter': shelterIconUrl,
  'water distribution point': waterpointIconUrl,
}

// Helper to create a Leaflet icon based on POI type
function getPoiIcon(typeName: string): L.Icon {
  const key = typeName.toLowerCase()
  const iconUrl = poiIconUrls[key] || defaultPoiIconUrl
  return L.icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

// Initialize map and marker
onMounted(() => {
  map.value = L.map(props.mapId, {
    center: [props.lat, props.lng],
    zoom: 15,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    // @ts-ignore - 'tap' is a valid Leaflet option but not in the type definitions
    tap: false,
    touchZoom: false,
    attributionControl: false
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    // @ts-ignore - 'interactive' is a valid Leaflet option but not in the type definitions
    interactive: false
  }).addTo(map.value as L.Map)

  marker.value = L.marker([props.lat, props.lng], {
    icon: getPoiIcon(props.poiTypeName),
    // @ts-ignore - 'interactive' is a valid Leaflet option but not in the type definitions
    interactive: false
  }).addTo(map.value as L.Map)
})

// Watch for prop changes and update marker position/icon
watch(
  () => [props.lat, props.lng, props.poiTypeName],
  ([newLat, newLng, newType]) => {
    if (!map.value) return
    // Update center
    map.value.setView([Number(newLat), Number(newLng)], map.value.getZoom())
    // Update marker
    if (marker.value) {
      marker.value.setLatLng([Number(newLat), Number(newLng)])
      marker.value.setIcon(getPoiIcon(String(newType)))
    }
  }
)
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
  pointer-events: none;
}
</style>
