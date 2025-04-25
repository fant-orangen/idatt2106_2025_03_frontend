<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/*
example usage:
script:
const norwayMarkers = [
  { lat: 60.3913, lon: 5.3221, label: 'Bergen' },
  { lat: 63.4305, lon: 10.3951, label: 'Trondheim' },
  { lat: 59.9139, lon: 10.7522, label: 'Oslo' },
  { lat: 69.6496, lon: 18.9560, label: 'Tromsø' },
];

template:
 <MapComponent :markers="norwayMarkers" />
 */

interface MarkerData {
  lat: number;
  lon: number;
  label?: string;
}

const props = withDefaults(
  defineProps<{
    markers?: MarkerData[];
    centerLat?: number;
    centerLon?: number;
  }>(),
  {
    markers: () => [],
    centerLat: 59.9139,  // Oslo
    centerLon: 10.7522,
  }
);

const map = ref<L.Map | null>(null);
const markerGroup = ref<L.LayerGroup | null>(null);
const mapContainerId = 'map';

onMounted(() => {
  map.value = L.map(mapContainerId).setView([props.centerLat!, props.centerLon!], 6);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map.value as L.Map);

  markerGroup.value = L.layerGroup().addTo(map.value as L.Map);
});

watchEffect(() => {
  if (!map.value || !markerGroup.value) return;

  markerGroup.value.clearLayers();
  const bounds = L.latLngBounds([]);

  props.markers.forEach(({ lat, lon, label }) => {
    const leafletMarker = L.marker([lat, lon]);
    if (label) {
      leafletMarker.bindPopup(label);
    }
    leafletMarker.addTo(markerGroup.value! as L.LayerGroup);
    bounds.extend([lat, lon]);
  });

  if (props.markers.length > 0) {
    map.value.fitBounds(bounds.pad(0.3));
  } else {
    map.value.setView([props.centerLat!, props.centerLon!], 6);
  }
});
</script>



<template>
  <div id="mapContainer">
    <div :id="mapContainerId" style="height: 50em; width: 100%; max-width: 80em; margin: auto;"></div>
  </div>
</template>

<style scoped>
#map {
  width: 100%;
  height: 50em;
}
</style>
