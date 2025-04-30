<template>
  <div :id="mapId" class="map-container"></div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    default: 500 // in meters
  },
  color: {
    type: String,
    default: '#3388ff'
  },
  mapId: {
    type: String,
    default: 'static-map'
  }
})

const map = ref(null)

const calculateZoomLevel = computed(() => {
  if (props.radius <= 40000) {
    const zoom = Math.max(3, Math.log10(props.radius) * -2 + 18); // Adjust multiplier and offset for desired results
    return Math.round(zoom);
  } else if (props.radius <= 80000) {
    return 6;
  } else {
    return 4;
  }
})

onMounted(() => {
  map.value = L.map(props.mapId, {
    center: [props.lat, props.lng],
    zoom: calculateZoomLevel.value,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
    touchZoom: false,
    attributionControl: false
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    interactive: false
  }).addTo(map.value)

  L.circle([props.lat, props.lng], {
    radius: props.radius,
    color: props.color,
    fillColor: props.color,
    fillOpacity: 0.2,
    weight: 2
  }).addTo(map.value)
})

watch(
  [() => props.lat, () => props.lng, () => props.radius, () => props.color],
  ([newLat, newLng, newRadius, newColor]) => {
    if (!map.value) return;

    // Update map center and zoom
    map.value.setView([newLat, newLng], calculateZoomLevel.value);

    // Remove old layers (circles)
    map.value.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        map.value.removeLayer(layer);
      }
    });

    // Add new circle
    L.circle([newLat, newLng], {
      radius: newRadius,
      color: newColor,
      fillColor: newColor,
      fillOpacity: 0.2,
      weight: 2
    }).addTo(map.value);
  },
  { deep: true }
);
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
  pointer-events: none; /* disables interaction */
}
</style>
