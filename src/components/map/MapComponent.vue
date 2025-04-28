<template>
  <div id="mapContainer">
    <div :id="mapContainerId"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref, nextTick, toRefs, defineProps, defineEmits } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { useI18n } from 'vue-i18n';
import type { PoiData } from '@/models/PoiData';

// Define emits for map interactions
const emit = defineEmits(['map-clicked', 'marker-added', 'marker-removed', 'marker-moved']);

// Pre-translate popup strings
const { t } = useI18n();
const translatedStrings = {
  address: t('map.address') || 'Adresse',
  openingHours: t('map.opening-hours') || 'Åpningstider',
  contact: t('map.contact') || 'Kontaktinfo',
  directions: t('map.directions') || 'Veibeskrivelse',
  yourLocation: t('map.your-location') || 'Din posisjon',
  showDirections: t('map.show-directions') || 'Vis veibeskrivelse',
  closeDirections: t('map.close-directions') || 'Lukk veibeskrivelse',
  clickToSelectLocation: t('map.click-to-select-location') || 'Klikk for å velge plassering'
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
    adminMode?: boolean; // New prop for admin mode
  }>(),
  {
    pois: () => [],
    centerLat: 63.4305,
    centerLon: 10.3951,
    initialZoom: 6,
    userLocation: null,
    crisisEvents: () => [],
    adminMode: false
  }
);

const { pois, userLocation, adminMode } = toRefs(props);

// Map & layers
const map = ref<L.Map | null>(null);
const markerClusterGroup = ref<L.MarkerClusterGroup | null>(null);
const userMarker = ref<L.Marker | null>(null);
const adminMarkers = ref<L.Marker[]>([]);
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

// Custom icon for admin-created markers
const adminIcon = L.icon({
  iconUrl, iconRetinaUrl, shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'admin-marker-icon',
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
  console.log("Map component mounted", mapContainerId);

  // Fix icon paths globally
  // @ts-expect-error
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

  // Create map with a slight delay to ensure container is ready
  setTimeout(() => {
    try {
      const mapContainer = document.getElementById(mapContainerId);
      if (!mapContainer) {
        console.error(`Map container with ID ${mapContainerId} not found`);
        return;
      }

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

      // Add click listener for admin mode
      if (adminMode.value) {
        console.log("Admin mode enabled, adding click listener");
        map.value.on('click', (e) => {
          console.log("Map clicked at", e.latlng);
          emit('map-clicked', e);
        });
      }

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

      console.log("Map initialization completed successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, 100); // Short delay to ensure DOM is ready
});

// Method to add a marker programmatically
function addMarker(lat: number, lng: number, title: string = 'New Marker') {
  if (!map.value) {
    console.warn("Cannot add marker: map not initialized");
    return null;
  }

  console.log(`Adding marker at ${lat}, ${lng} with title '${title}'`);
  const marker = L.marker([lat, lng], {
    icon: adminIcon,
    draggable: adminMode.value,
    title: title
  }).addTo(map.value);

  // If in admin mode, make the marker draggable and track its changes
  if (adminMode.value) {
    marker.on('dragend', function(event) {
      const marker = event.target;
      const position = marker.getLatLng();
      console.log(`Marker moved to ${position.lat}, ${position.lng}`);
      emit('marker-moved', {
        marker: marker,
        latlng: { lat: position.lat, lng: position.lng }
      });
    });

    adminMarkers.value.push(marker);
    emit('marker-added', {
      marker: marker,
      latlng: { lat: lat, lng: lng }
    });
  }

  return marker;
}

// Method to remove a marker
function removeMarker(marker: L.Marker) {
  if (!map.value || !marker) return;

  console.log("Removing marker");
  map.value.removeLayer(marker);

  // Remove from admin markers if applicable
  const index = adminMarkers.value.indexOf(marker);
  if (index > -1) {
    adminMarkers.value.splice(index, 1);
    emit('marker-removed', { marker });
  }
}

// Method to center map on specific coordinates
function centerMap(lat: number, lng: number, zoom: number = 15) {
  if (!map.value) {
    console.warn("Cannot center map: map not initialized");
    return;
  }

  console.log(`Centering map at ${lat}, ${lng} with zoom ${zoom}`);
  map.value.setView([lat, lng], zoom);
}

// Function to show routing between user location and POI
function showRouteFor(lat: number, lng: number, poiName: string) {
  if (!map.value || !props.userLocation) {
    console.warn("Cannot show route: map or user location is not available");
    alert(t('map.need-location') || 'Du må dele din posisjon for å vise veibeskrivelse');
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
        <h3>Veibeskrivelse til ${poiName}</h3>
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
          nonBubblingEvents: ['click', 'dblclick', 'mouseover', 'mouseout'],
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

    // Ensure user marker is present if we have user location
    setTimeout(() => {
      if (props.userLocation && !userMarker.value && map.value) {
        console.log("Restoring user marker after POI update");
        userMarker.value = L.marker(
          [props.userLocation.latitude, props.userLocation.longitude],
          {
            icon: userIcon,
            zIndexOffset: 1000
          }
        )
        .addTo(map.value)
        .bindPopup(`<strong>${translatedStrings.yourLocation}</strong>`)
        .bindTooltip(translatedStrings.yourLocation, {
          permanent: false,
          direction: 'top',
          className: 'user-location-label',
          offset: [0, -30],
        });
      }
    }, 150); // Slightly longer timeout to ensure it runs after the other setTimeout
  },
  {
    deep: true
  }
);

// Watch the userLocation prop: add or remove the blue marker
watch(
  userLocation,
  async (loc, oldLoc) => {
    if (!map.value) return;

    await nextTick(); // Ensure map is ready

    // Only proceed if we have a location (either new or existing)
    if (loc) {
      // Remove existing marker if there is one
      if (userMarker.value) {
        userMarker.value.remove();
        userMarker.value = null;
      }

      // Create a new marker at the location
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
  console.log("Map component unmounting, cleaning up resources");

  // Clean up global functions
  delete window.showRouteFor;
  delete window.closeRouting;

  // Clear routing control
  clearRouting();

  // Clear user marker
  userMarker.value?.remove();

  // Clear admin markers
  adminMarkers.value.forEach(marker => marker.remove());
  adminMarkers.value = [];

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

// Expose methods to parent components
defineExpose({
  addMarker,
  removeMarker,
  centerMap
});
</script>

<style scoped>
#mapContainer {
  height: 100%;
  width: 100%;
  position: relative;
}

/* Make sure the map container div fills the space */
:deep(#mapContainer > div) {
  height: 100%;
  width: 100%;
}

/* Admin mode styling */
:deep(.admin-marker-icon) {
  filter: hue-rotate(90deg); /* Makes the marker green */
}

:deep(.user-location-icon) {
  filter: hue-rotate(210deg); /* Makes the marker blue */
}

:deep(.destination-marker) {
  background: transparent;
}

:deep(.destination-marker-inner) {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #4a89dc;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(74, 137, 220, 0.5), 0 0 10px rgba(0, 0, 0, 0.3);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    box-shadow: 0 0 0 0 rgba(74, 137, 220, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(74, 137, 220, 0);
  }
  100% {
    transform: scale(0.8);
    box-shadow: 0 0 0 0 rgba(74, 137, 220, 0);
  }
}

/* Popup styling */
:deep(.poi-popup) {
  max-width: 250px;
}

:deep(.directions-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: #4a89dc;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  margin-top: 8px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

:deep(.directions-btn:hover) {
  background-color: #3a79cc;
}

:deep(.routing-title) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #4a89dc;
  color: white;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

:deep(.close-routing-btn) {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

:deep(.close-routing-btn:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Address leaflet-routing-container zIndex issue that can make it appear under other elements */
:deep(.leaflet-routing-container) {
  z-index: 999 !important;
}
</style>
