<template>
  <div id="mapContainer">
    <div :id="mapContainerId"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref, nextTick, toRefs } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { useI18n } from 'vue-i18n';
import type { PoiData } from '@/models/PoiData';

// Pre-translate popup strings
const { t } = useI18n();
const translatedStrings = {
  address: t('map.address'),
  openingHours: t('map.opening-hours'),
  contact: t('map.contact'),
  directions: t('map.directions'),
  yourLocation: t('map.your-location'),
  showDirections: t('map.show-directions'),
  closeDirections: t('map.close-directions')
};

// Fix default Leaflet icon paths
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Props
const props = withDefaults(
  defineProps<{
    pois?: PoiData[];
    centerLat?: number;
    centerLon?: number;
    initialZoom?: number;
    userLocation?: { latitude: number; longitude: number } | null;
    crisisEvents?: { latitude: number; longitude: number; level: number }[];
  }>(),
  {
    pois: () => [],
    centerLat: 63.4305,
    centerLon: 10.3951,
    initialZoom: 6,
    userLocation: null,
    crisisEvents: () => [],
  }
);

const { pois, userLocation } = toRefs(props);

// Map & layers
const map = ref<L.Map | null>(null);
const markerClusterGroup = ref<L.MarkerClusterGroup | null>(null);
const userMarker = ref<L.Marker | null>(null);
const mapContainerId = 'map-' + Math.random().toString(36).substring(2, 9);
const routingControl = ref<any>(null);
const activeRouteMarker = ref<L.Marker | null>(null);

// Custom icon for user
const userIcon = L.icon({
  iconUrl, iconRetinaUrl, shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'user-location-icon',
});

// Helper function to force map refresh
const forceMapRefresh = () => {
  if (map.value) {
    map.value.invalidateSize({ animate: false });
  }
};

// Function to refresh marker positions
function refreshMarkerPositions() {
  if (!map.value || !markerClusterGroup.value) return;

  // Refresh marker cluster groups
  markerClusterGroup.value.refreshClusters();

  // Force map to recognize changes
  map.value.invalidateSize({ animate: false });
}

// Initialize the Leaflet map and make the routing function globally available
onMounted(() => {
  console.log("Map component mounted");

  // Fix icon paths globally
  // @ts-expect-error
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

  // Create map
  map.value = L.map(mapContainerId, {
    fadeAnimation: false,
    markerZoomAnimation: false, // Disable marker zoom animation to prevent issues
    zoomAnimation: true
  }).setView([props.centerLat!, props.centerLon!], props.initialZoom!);

  // Add tile layer
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 19,
      attribution: '© OSM © CartoDB',
      noWrap: false // Allow the map to be repeated
    }
  ).addTo(map.value);

  // Create marker cluster
  markerClusterGroup.value = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 18,
    maxClusterRadius: 50,
    removeOutsideVisibleBounds: false, // Keep markers in memory
    animate: false, // Disable cluster animations
    animateAddingMarkers: false // Disable animations when adding markers
  }).addTo(map.value);

  // Set up event listeners for debugging and refresh
  map.value.on('zoomend moveend', () => {
    console.log(`Map view changed: zoom=${map.value?.getZoom()}`);
    forceMapRefresh();
  });

  // Add additional event listener for zoom to update markers during zoom
  map.value.on('zoom', () => {
    // Force immediate update of markers during zoom
    if (markerClusterGroup.value) {
      markerClusterGroup.value.refreshClusters();
    }
  });

  // Expose the routing function to the global scope so the popup can access it
  // This is necessary because Leaflet creates popups outside Vue's scope
  window.showRouteFor = (lat: number, lng: number, poiName: string) => {
    showRouteFor(lat, lng, poiName);
  };

  window.closeRouting = () => {
    clearRouting();
  };

  // Initial map size invalidation
  setTimeout(() => {
    forceMapRefresh();
  }, 100);
});

// Function to show routing between user location and POI
function showRouteFor(lat: number, lng: number, poiName: string) {
  if (!map.value || !props.userLocation) {
    console.warn("Cannot show route: map or user location is not available");
    alert(t('map.need-location'));
    return;
  }

  clearRouting(); // Clear any existing route

  console.log(`Showing route to ${poiName} (${lat}, ${lng})`);

  // Create the routing control with fixed options
  routingControl.value = L.Routing.control({
    waypoints: [
      L.latLng(props.userLocation.latitude, props.userLocation.longitude),
      L.latLng(lat, lng)
    ],
    lineOptions: {
      styles: [
        {color: '#4a89dc', weight: 4}
      ],
      extendToWaypoints: true,
      missingRouteTolerance: 0
    },
    altLineOptions: {
      styles: [
        {color: '#4a89dc', weight: 2, opacity: 0.6}
      ]
    },
    show: true,
    collapsible: false, // Prevent the collapse button from appearing
    collapsed: false,
    autoRoute: true,
    routeWhileDragging: false,
    addWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: true,
    useZoomParameter: true,
    draggableWaypoints: false, // Prevent waypoints from being dragged
    createMarker: function(i, waypoint, n) {
      // Return null for all waypoints (both start and end)
      return null;
    },

  }).addTo(map.value);

  // Add a custom title to the directions panel and remove default controls
  routingControl.value.on('routesfound', () => {
    const container = routingControl.value.getContainer();

    // Only add title if it doesn't exist yet
    if (!container.querySelector('.routing-title')) {
      // Remove any default collapse buttons that might be present
      const existingCollapseButtons = container.querySelectorAll('.leaflet-routing-collapse-btn');
      existingCollapseButtons.forEach(btn => btn.remove());

      const controlTitle = document.createElement('div');
      controlTitle.className = 'routing-title';
      controlTitle.innerHTML = `
        <h3>Directions to ${poiName}</h3>
        <button class="close-routing-btn" onclick="window.closeRouting()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          ${translatedStrings.closeDirections}
        </button>
      `;
      container.prepend(controlTitle);
    }
  });

  // Highlight the destination marker
  activeRouteMarker.value = L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'destination-marker',
      html: '<div class="destination-marker-inner"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    }),
    zIndexOffset: 1000 // Ensure it's on top
  }).addTo(map.value);
}

// Function to clear routing
function clearRouting() {
  if (routingControl.value) {
    console.log("Clearing routing control");
    map.value?.removeControl(routingControl.value);
    routingControl.value = null;
  }

  if (activeRouteMarker.value) {
    activeRouteMarker.value.remove();
    activeRouteMarker.value = null;
  }
}

// Build popup HTML with directions button
function createPopupContent(poi: PoiData): string {
  let html = `<div class="poi-popup"><strong>${poi.name}</strong> (${poi.poiTypeName})<br>`;
  if (poi.description) html += `${poi.description}<hr>`;
  if (poi.address) html += `<strong>${translatedStrings.address}:</strong> ${poi.address}<br>`;
  if (poi.openingHours) html += `<strong>${translatedStrings.openingHours}:</strong> ${poi.openingHours}<br>`;
  if (poi.contactInfo) html += `<strong>${translatedStrings.contact}:</strong> ${poi.contactInfo}<br>`;

  // Add a directions button that calls our global function
  html += `
    <button class="directions-btn" onclick="window.showRouteFor(${poi.latitude}, ${poi.longitude}, '${poi.name.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
      ${translatedStrings.showDirections}
    </button>`;

  html += '</div>';
  return html;
}

// The critical watch function with improved zoom handling
watch(
  pois,
  async (newPois) => {
    // Basic guard clauses
    if (!map.value) {
      console.log("Map not ready, skipping update.");
      return;
    }

    console.log(`POI Watcher triggered. New POIs count: ${newPois?.length ?? 0}`);

    // Clear any existing routing when POIs change
    clearRouting();

    // Ensure DOM/Vue updates are processed before map operations
    await nextTick();

    // --- Force Cluster Group Recreation ---

    // 1. Remove the existing cluster group if it exists on the map
    if (markerClusterGroup.value && map.value.hasLayer(markerClusterGroup.value)) {
      console.log("Removing existing marker cluster group from map.");
      map.value.removeLayer(markerClusterGroup.value);
    }

    // 2. Create a NEW cluster group instance with fixed zoom settings
    console.log("Creating a new marker cluster group instance.");
    markerClusterGroup.value = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 18,
      maxClusterRadius: 50,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: false, // Keep markers in memory
      animate: false, // Disable cluster animations
      animateAddingMarkers: false // Disable animations when adding markers
    });

    // --- Marker processing logic (using the new cluster group) ---
    const bounds = L.latLngBounds([]);
    const markers: L.Marker[] = [];

    if (!newPois || newPois.length === 0) {
      console.log("No POIs to process for the new cluster group.");
      // Reset view only if there are no POIs and no user location marker
      if (!props.userLocation) {
        map.value.setView([props.centerLat!, props.centerLon!], props.initialZoom!);
      } else {
        map.value.setView([props.userLocation.latitude, props.userLocation.longitude], 13);
      }
    } else {
      console.log(`Processing ${newPois.length} POIs for the new cluster group...`);
      newPois.forEach(poi => {
        // Ensure coordinates are numbers
        const lat = typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude;
        const lon = typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude;

        if (!isFinite(lat) || !isFinite(lon)) {
          console.warn(`Invalid coordinates for POI: ${poi.name} (${lat}, ${lon}) - Skipping.`);
          return;
        }

        // Create a marker with improved options for better zoom behavior
        const marker = L.marker([lat, lon], {
          riseOnHover: true,
          bubblingMouseEvents: false, // Improves event handling
          zIndexOffset: 100, // Stack markers above route line
          // The following disables any animations for this marker
          nonBubblingEvents: ['click', 'dblclick', 'mouseover', 'mouseout'],
          // Ensure marker position is always correct
          interactive: true
        });

        marker.bindPopup(createPopupContent(poi));
        marker.bindTooltip(poi.name, {
          permanent: false,
          direction: 'top',
          className: 'poi-label'
        });

        // Store reference to the coordinates on the marker for easier access
        // @ts-expect-error
        marker.poiLat = lat;
        // @ts-expect-error
        marker.poiLng = lon;

        markers.push(marker);
        bounds.extend([lat, lon]);
      });

      // 3. Add markers to the NEW cluster group instance
      if (markers.length) {
        console.log(`Adding ${markers.length} markers to the new cluster group.`);
        markerClusterGroup.value.addLayers(markers);
      } else {
        console.log("No valid markers were created for the new cluster group.");
      }
    }

    // 4. Add the NEW cluster group (even if empty) to the map
    console.log("Adding the new marker cluster group to the map.");
    markerClusterGroup.value.addTo(map.value);

    // --- Bounds fitting logic ---
    if (props.userLocation) {
      bounds.extend([props.userLocation.latitude, props.userLocation.longitude]);
    }

    await nextTick(); // Wait again before fitting bounds

    // Force map to recognize changes
    map.value.invalidateSize({ animate: false });

    // Refresh marker positions
    refreshMarkerPositions();

    // Short delay to ensure map is fully ready before fitting bounds
    setTimeout(() => {
      if (bounds.isValid() && markers.length > 0) {
        console.log("Fitting bounds...");
        try {
          map.value?.fitBounds(bounds.pad(0.2), {
            animate: false // Disable animation for more reliable positioning
          });
        } catch(e) {
          console.error("Error fitting bounds:", e, bounds);
          map.value?.setView([props.centerLat!, props.centerLon!], props.initialZoom!); // Fallback
        }
      } else if (markers.length === 0 && props.userLocation) {
        console.log("No POI markers, centering on user location.");
        map.value?.setView([props.userLocation.latitude, props.userLocation.longitude], 13, {
          animate: false
        });
      } else if (markers.length === 0 && !props.userLocation) {
        console.log("No POI markers or user location, resetting view.");
        map.value?.setView([props.centerLat!, props.centerLon!], props.initialZoom!, {
          animate: false
        });
      }

      // Final invalidate size to ensure everything renders correctly
      map.value?.invalidateSize({ animate: false });
    }, 100);
  },
  {
    deep: true
  }
);

// Watch the userLocation prop: add or remove the blue marker.
watch(
  userLocation,
  async (loc) => {
    if (!map.value) return;

    await nextTick(); // Ensure map is ready

    if (userMarker.value) {
      userMarker.value.remove();
      userMarker.value = null;
    }
    if (loc) {
      userMarker.value = L.marker([loc.latitude, loc.longitude], {
        icon: userIcon,
        zIndexOffset: 1000 // Ensure user marker stays on top
      })
      .addTo(map.value)
      .bindPopup(`<strong>${translatedStrings.yourLocation}</strong>`)
      .bindTooltip(translatedStrings.yourLocation, {
        permanent: false,
        direction: 'top',
        className: 'user-location-label',
        offset: [0, -30],
      });

      // Invalidate size when user location changes
      map.value.invalidateSize();

      // Refresh marker positions
      refreshMarkerPositions();

      // If we have an active route and user location changes, update the route
      if (routingControl.value) {
        const waypoints = routingControl.value.getWaypoints();
        if (waypoints && waypoints.length >= 2) {
          // Update the first waypoint (starting point) to the new user location
          waypoints[0].latLng = L.latLng(loc.latitude, loc.longitude);
          routingControl.value.setWaypoints(waypoints);
        }
      }
    }
  },
  { immediate: true }
);

// Clean up on unmount
onBeforeUnmount(() => {
  // Clean up global functions
  delete window.showRouteFor;
  delete window.closeRouting;

  // Clear routing control
  clearRouting();

  // Clear user marker
  userMarker.value?.remove();

  // Clear marker cluster
  if (markerClusterGroup.value) {
    markerClusterGroup.value.clearLayers();
    map.value?.removeLayer(markerClusterGroup.value);
  }

  // Remove map
  if (map.value) {
    map.value.off();
    map.value.remove();
    map.value = null;
  }
});
</script>

<style scoped>
#mapContainer > div {
  height: 50em;
  width: 100%;
  max-width: 80em;
  margin: auto;
}

/* Scoped styles remain the same, but deep selectors need correct syntax */
:deep(.poi-popup) {
  font-family: sans-serif;
  line-height: 1.5;
}
:deep(.poi-popup strong) { font-weight: bold; margin-right: 5px; }
:deep(.poi-popup hr) { border:0; height:1px; background:#ccc; margin:5px 0; }
:deep(.poi-popup a) { color:#007bff; text-decoration:none; margin-top:5px; display:inline-block; }
:deep(.poi-popup a:hover) { text-decoration:underline; }

:deep(.directions-btn) {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #4a89dc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

:deep(.directions-btn:hover) {
  background-color: #3d7acb;
}

:deep(.routing-title) {
  padding: 10px;
  background: #f1f5f9;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.routing-title h3) {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

:deep(.close-routing-btn) {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 3px 6px;
  cursor: pointer;
  font-size: 12px;
}

:deep(.close-routing-btn:hover) {
  background: #e2e8f0;
}

:deep(.poi-label) {
  background: rgba(255,255,255,0.8);
  border: 1px solid #666;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  pointer-events: none;
  z-index: 650;
}

:deep(.user-location-icon) {
  filter: hue-rotate(210deg);
  z-index: 1000 !important;
}

:deep(.user-location-label) {
  background: rgba(0,120,255,0.8);
  color: white;
  border: 1px solid #0066cc;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  z-index: 1000;
  pointer-events: none;
}

:deep(.destination-marker-inner) {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #ff6b6b;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
}

:deep(.destination-marker) {
  background: none !important;
  border: none !important;
}

/* Fix for marker position during zoom */
:deep(.leaflet-marker-icon),
:deep(.leaflet-marker-shadow) {
  transition: none !important;
  transform-origin: center bottom !important;
  /* Prevent default transition effects from being applied */
  -webkit-transition: none !important;
  -moz-transition: none !important;
  -o-transition: none !important;
}

/* Styling for the routing control panel */
:deep(.leaflet-routing-container) {
  max-width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.2);
  z-index: 1000; /* Ensure it stays on top */
}

:deep(.leaflet-routing-container-hide) {
  display: none !important; /* Forcibly hide when closed */
}

:deep(.leaflet-routing-alt) {
  max-height: none;
  padding: 0 10px 10px 10px;
}

:deep(.leaflet-routing-alt table) {
  margin: 0 0 10px 0;
  width: 100%;
}

:deep(.leaflet-routing-alt tr:hover) {
  background-color: #f8f9fa;
}

/* Hide the default collapse button */
:deep(.leaflet-routing-collapse-btn) {
  display: none !important;
}

/* Fix for zoom transition issues */
:deep(.leaflet-zoom-anim .leaflet-zoom-animated) {
  transition: none !important;
}

:deep(.leaflet-fade-anim .leaflet-popup) {
  transition: opacity 0.2s linear;
}

/* Ensure markers stay above route line */
:deep(.leaflet-marker-pane) {
  z-index: 600;
}

:deep(.leaflet-routing-line-pane) {
  z-index: 500;
}

:deep(.leaflet-popup-pane) {
  z-index: 700;
}

:deep(.leaflet-tooltip-pane) {
  z-index: 650;
}
</style>
