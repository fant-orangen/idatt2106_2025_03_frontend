<template>
  <div id="mapContainer">
    <div :id="mapContainerId" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<script lang="ts">
import { onMounted, onBeforeUnmount, watch, ref, defineComponent } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { useI18n } from 'vue-i18n';

// Import shared types
import type { POI, UserLocation, CrisisEvent, MarkerMovedEvent, MarkerAddedEvent, MarkerRemovedEvent, POIMarker } from '@/types/map';

// Fix default Leaflet icon paths
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface TranslatedStrings {
  address: string;
  openingHours: string;
  contact: string;
  directions: string;
  yourLocation: string;
  showDirections: string;
  closeDirections: string;
}

// Declare global functions for window
declare global {
  interface Window {
    showRouteFor: (lat: number, lng: number, poiName: string) => void;
    closeRouting: () => void;
  }
}

export default defineComponent({
  name: 'MapComponent',
  props: {
    // Original props
    pois: {
      type: Array as () => POI[],
      default: () => []
    },
    centerLat: {
      type: Number,
      default: 63.4305
    },
    centerLon: {
      type: Number,
      default: 10.3951
    },
    initialZoom: {
      type: Number,
      default: 6
    },
    userLocation: {
      type: Object as () => UserLocation | null,
      default: null
    },
    crisisEvents: {
      type: Array as () => CrisisEvent[],
      default: () => []
    },
    // Admin functionality prop
    adminMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['map-clicked', 'marker-added', 'marker-removed', 'marker-moved'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const map = ref<L.Map | null>(null);
    const markerClusterGroup = ref<L.MarkerClusterGroup | null>(null);
    const userMarker = ref<L.Marker | null>(null);
    const adminMarkers = ref<L.Marker[]>([]);
    const mapContainerId: string = 'map-' + Math.random().toString(36).substring(2, 9);
    const routingControl = ref<L.Routing.Control | null>(null);
    const activeRouteMarker = ref<L.Marker | null>(null);
    const tempMarker = ref<L.Marker | null>(null);
    const markersMap = ref<Map<string | number, POIMarker>>(new Map()); // Store markers by POI ID for easier reference

    // Translation strings with fallbacks
    const translatedStrings: TranslatedStrings = {
      address: t('map.address') || 'Adresse',
      openingHours: t('map.opening-hours') || 'Åpningstider',
      contact: t('map.contact') || 'Kontakt',
      directions: t('map.directions') || 'Veibeskrivelse',
      yourLocation: t('map.your-location') || 'Din posisjon',
      showDirections: t('map.show-directions') || 'Vis veibeskrivelse',
      closeDirections: t('map.close-directions') || 'Lukk veibeskrivelse'
    };

    // Custom icon for user location
    const userIcon = L.icon({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: 'user-location-icon',
    });

    // Custom icon for admin-created markers
    const adminIcon = L.icon({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: 'admin-marker-icon',
    });

    // Initialize map
    onMounted(() => {
      // Fix icon paths globally
      // Use type assertion to access _getIconUrl property
      const defaultIconPrototype = L.Icon.Default.prototype as any;
      if (defaultIconPrototype._getIconUrl) {
        delete defaultIconPrototype._getIconUrl;
      }
      L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl
      });

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          console.log("Initializing map", mapContainerId);

          // Ensure container exists
          const container = document.getElementById(mapContainerId);
          if (!container) {
            console.error("Map container not found:", mapContainerId);
            return;
          }

          // Create map instance
          map.value = L.map(mapContainerId, {
            fadeAnimation: false,
            markerZoomAnimation: false,
            zoomAnimation: true
          }).setView([props.centerLat, props.centerLon], props.initialZoom);

          // Add tile layer
          L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            {
              maxZoom: 19,
              attribution: '© OSM © CartoDB',
              noWrap: false
            }
          ).addTo(map.value as L.Map);

          // Create marker cluster
          const clusterOptions: L.MarkerClusterGroupOptions = {
            spiderfyOnMaxZoom: true,
            disableClusteringAtZoom: 18,
            maxClusterRadius: 50,
            removeOutsideVisibleBounds: false,
            animate: false,
            animateAddingMarkers: false
          };
          markerClusterGroup.value = L.markerClusterGroup(clusterOptions);
          if (map.value) {
            map.value.addLayer(markerClusterGroup.value as unknown as L.Layer);
          }

          // Set up map event listeners
          map.value.on('zoomend moveend', () => {
            // console.log(`Map view changed: zoom=${map.value?.getZoom()}`);
            forceMapRefresh();
          });

          // Add click listener for admin mode only
          if (props.adminMode) {
            console.log("Admin mode enabled, adding click listener");
            map.value.on('click', (e: L.LeafletMouseEvent) => {
              console.log("Map clicked at", e.latlng);
              // Emit in the format expected by AdminAddNewPOI.vue
              emit('map-clicked', { latlng: e.latlng });
            });
          }

          // Global functions for routing - these are necessary for the original functionality
          window.showRouteFor = (lat: number, lng: number, poiName: string) => {
            showRouteFor(lat, lng, poiName);
          };

          window.closeRouting = () => {
            clearRouting();
          };

          // Initial refresh
          setTimeout(() => {
            forceMapRefresh();
          }, 100);

          console.log("Map initialization completed");

          // Initial population of POIs
          if (props.pois && props.pois.length > 0) {
            updatePOIs(props.pois);
          }

          // Initial user location
          if (props.userLocation) {
            updateUserLocation(props.userLocation);
          }

          // Initial crisis events
          if (props.crisisEvents && props.crisisEvents.length > 0) {
            updateCrisisEvents(props.crisisEvents);
          }
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      }, 200);
    });

    // Force map refresh
    const forceMapRefresh = (): void => {
      if (map.value) {
        map.value.invalidateSize({ animate: false });
      }
    };

    // Refresh marker positions
    function refreshMarkerPositions(): void {
      if (!map.value || !markerClusterGroup.value) return;
      markerClusterGroup.value.refreshClusters();
      forceMapRefresh();
    }

    // Add a marker to the map - admin functionality
    function addMarker(lat: number, lng: number, title: string = 'New Marker'): L.Marker | null {
      if (!map.value) {
        console.warn("Cannot add marker: map not initialized");
        return null;
      }

      console.log(`Adding marker at ${lat}, ${lng} with title '${title}'`);
      const marker = L.marker([lat, lng], {
        icon: adminIcon,
        draggable: props.adminMode,
        title: title
      }).addTo(map.value as L.Map);

      // If in admin mode, make the marker draggable
      if (props.adminMode) {
        marker.on('dragend', function(event) {
          const position = event.target.getLatLng();
          console.log(`Marker moved to ${position.lat}, ${position.lng}`);
          emit('marker-moved', {
            marker: event.target,
            latlng: { lat: position.lat, lng: position.lng }
          });
        });

        adminMarkers.value.push(marker);
        emit('marker-added', {
          marker: marker,
          latlng: { lat: lat, lng: lng }
        });
      }

      tempMarker.value = marker;
      return marker;
    }

    // Remove a marker from the map - admin functionality
    function removeMarker(marker: L.Marker): void {
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

    // Center the map on a location
    function centerMap(lat: number, lng: number, zoom: number = 15): void {
      if (!map.value) {
        console.warn("Cannot center map: map not initialized");
        return;
      }

      // console.log(`Centering map at ${lat}, ${lng} with zoom ${zoom}`);
      map.value.setView([lat, lng], zoom);
    }

    // Show routing between user location and POI - original functionality
    function showRouteFor(lat: number, lng: number, poiName: string): void {
      if (!map.value || !props.userLocation) {
        console.warn("Cannot show route: map or user location is not available");
        alert(t('map.need-location') || 'Du må dele din posisjon for å vise veibeskrivelse');
        return;
      }

      clearRouting(); // Clear any existing route

      console.log(`Showing route to ${poiName} (${lat}, ${lng})`);

      // Create the routing control
      routingControl.value = L.Routing.control({
        waypoints: [
          { latLng: L.latLng(props.userLocation.latitude, props.userLocation.longitude) },
          { latLng: L.latLng(lat, lng) }
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
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        show: true,
        collapsible: false,
        collapsed: false,
        autoRoute: true,
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: true,
        useZoomParameter: true,
        draggableWaypoints: false,
        createMarker: function(_i: number, _waypoint: L.Routing.Waypoint, _n: number): L.Marker | null {
          return null; // No waypoint markers
        },
      }).addTo(map.value as L.Map);

      // Add a custom title to the directions panel
      routingControl.value.on('routesfound', () => {
        if (!routingControl.value) return;

        const container = routingControl.value.getContainer();

        // Only add title if it doesn't exist yet and container exists
        if (container && !container.querySelector('.routing-title')) {
          // Remove any default collapse buttons
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
      }).addTo(map.value as L.Map);
    }

    // Clear routing - original functionality
    function clearRouting(): void {
      if (routingControl.value && map.value) {
        console.log("Clearing routing control");
        map.value.removeControl(routingControl.value);
        routingControl.value = null;
      }

      if (activeRouteMarker.value) {
        activeRouteMarker.value.remove();
        activeRouteMarker.value = null;
      }
    }

    // Create popup content for POIs - original functionality
    function createPopupContent(poi: POI): string {
      let html = `<div class="poi-popup"><strong>${poi.name}</strong> (${poi.poiTypeName})<br>`;
      if (poi.description) html += `${poi.description}<hr>`;
      if (poi.address) html += `<strong>${translatedStrings.address}:</strong> ${poi.address}<br>`;
      if (poi.openingHours) html += `<strong>${translatedStrings.openingHours}:</strong> ${poi.openingHours}<br>`;
      if (poi.contactInfo) html += `<strong>${translatedStrings.contact}:</strong> ${poi.contactInfo}<br>`;

      // Add a directions button
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

    // Update POIs on the map - core functionality used by both original and admin features
    function updatePOIs(newPois: POI[]): void {
      if (!map.value || !markerClusterGroup.value) {
        console.log("Map or marker cluster not ready, deferring POI update");
        return;
      }

      console.log(`Updating POIs. Count: ${newPois?.length ?? 0}`);

      // Clear routing when POIs change
      clearRouting();

      // Remove existing cluster group
      markerClusterGroup.value.clearLayers();

      // Reset markers map
      markersMap.value.clear();

      // Add markers to the cluster group
      const bounds = L.latLngBounds([]);
      const markers: L.Marker[] = [];

      if (newPois && newPois.length > 0) {
        newPois.forEach(poi => {
          // Skip if no coordinates
          if (!poi.latitude || !poi.longitude) return;

          // Ensure coordinates are numbers
          const lat = typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude;
          const lon = typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude;

          if (!isFinite(lat) || !isFinite(lon)) {
            console.warn(`Invalid coordinates for POI: ${poi.name}`, lat, lon);
            return;
          }

          // Create marker
          const marker = L.marker([lat, lon], {
            riseOnHover: true,
            bubblingMouseEvents: false,
            zIndexOffset: 100
          });

          marker.bindPopup(createPopupContent(poi));
          marker.bindTooltip(poi.name, {
            permanent: false,
            direction: 'top',
            className: 'poi-label'
          });

          // Store reference to coordinates
          const poiMarker = marker as POIMarker;
          poiMarker.poiLat = lat;
          poiMarker.poiLng = lon;

          // Store in markers map if POI has an ID
          if (poi.id) {
            markersMap.value.set(poi.id, poiMarker);
          }

          markers.push(marker);
          bounds.extend([lat, lon]);
        });

        // Add markers to cluster group
        if (markers.length) {
          markerClusterGroup.value.addLayers(markers);
        }
      }

      // Add user location to bounds if available
      if (props.userLocation) {
        bounds.extend([props.userLocation.latitude, props.userLocation.longitude]);
      }

      // Force refresh
      forceMapRefresh();

      // Fit bounds if we have valid bounds
      if (bounds.isValid() && (markers.length > 0 || props.userLocation)) {
        try {
          // Use a short timeout to ensure the map is ready
          setTimeout(() => {
            if (map.value) {
              map.value.fitBounds(bounds.pad(0.2), {
                animate: false,
                maxZoom: 15 // Limit how far it zooms in
              });
              forceMapRefresh();
            }
          }, 100);
        } catch(e: unknown) {
          console.error("Error fitting bounds:", e);
          // Fallback to default view
          if (map.value) {
            map.value.setView([props.centerLat, props.centerLon], props.initialZoom);
          }
        }
      } else if (markers.length === 0 && props.userLocation) {
        // Center on user if no markers
        if (map.value) {
          map.value.setView(
            [props.userLocation.latitude, props.userLocation.longitude],
            13
          );
        }
      } else if (markers.length === 0) {
        // Fallback to default view
        if (map.value) {
          map.value.setView([props.centerLat, props.centerLon], props.initialZoom);
        }
      }
    }

    // Update user location - original functionality
    function updateUserLocation(location: UserLocation): void {
      if (!map.value) return;

      // Remove existing marker
      if (userMarker.value) {
        userMarker.value.remove();
        userMarker.value = null;
      }

      // Add user marker
      if (location) {
        userMarker.value = L.marker(
          [location.latitude, location.longitude],
          {
            icon: userIcon,
            zIndexOffset: 1000
          }
        )
        .addTo(map.value as L.Map)
        .bindPopup(`<strong>${translatedStrings.yourLocation}</strong>`)
        .bindTooltip(translatedStrings.yourLocation, {
          permanent: false,
          direction: 'top',
          className: 'user-location-label',
          offset: [0, -30],
        });

        // Update route if active
        if (routingControl.value) {
          const waypoints = routingControl.value.getWaypoints();
          if (waypoints && waypoints.length >= 2) {
            waypoints[0].latLng = L.latLng(location.latitude, location.longitude);
            routingControl.value.setWaypoints(waypoints);
          }
        }
      }
    }

    // Update crisis events - original functionality
    function updateCrisisEvents(events: CrisisEvent[]): void {
      if (!map.value) return;

      // Implementation for crisis events visualization
      // This would add circles/markers for crisis events
      events.forEach(event => {
        if (!event.latitude || !event.longitude || !event.level) return;

        const radius = event.level * 1000; // Simple example
        const color = event.level === 1 ? 'yellow' :
          event.level === 2 ? 'orange' : 'red';

        L.circle([event.latitude, event.longitude], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: 1
        }).addTo(map.value as L.Map);
      });
    }

    // Watch for POI changes
    watch(() => props.pois, (newPois: POI[]) => {
      updatePOIs(newPois);
    }, { deep: true, immediate: false });

    // Watch for user location changes
    watch(() => props.userLocation, (newLocation: UserLocation | null) => {
      if (newLocation) {
        updateUserLocation(newLocation);
      }
    }, { deep: true, immediate: false });

    // Watch for crisis events changes
    watch(() => props.crisisEvents, (newEvents: CrisisEvent[]) => {
      if (newEvents.length > 0) {
        updateCrisisEvents(newEvents);
      }
    }, { deep: true, immediate: false });

    // Cleanup on component unmount
    onBeforeUnmount(() => {
      console.log("Map component unmounting");

      // Remove global functions - using type assertion to avoid TypeScript errors
      if ('showRouteFor' in window) {
        (window as any).showRouteFor = undefined;
      }
      if ('closeRouting' in window) {
        (window as any).closeRouting = undefined;
      }

      // Clear routing
      clearRouting();

      // Remove user marker
      if (userMarker.value) {
        userMarker.value.remove();
        userMarker.value = null;
      }

      // Remove admin markers
      adminMarkers.value.forEach(marker => {
        if (marker) marker.remove();
      });
      adminMarkers.value = [];

      // Clear marker cluster
      if (markerClusterGroup.value && map.value) {
        markerClusterGroup.value.clearLayers();
        // Use type assertion to avoid type error with removeLayer
        map.value.removeLayer(markerClusterGroup.value as unknown as L.Layer);
        markerClusterGroup.value = null;
      }

      // Remove map
      if (map.value) {
        map.value.off();
        map.value.remove();
        map.value = null;
      }
    });

    return {
      mapContainerId,
      // Expose public methods
      addMarker,
      removeMarker,
      centerMap,
      forceMapRefresh,
      tempMarker
    };
  }
});
</script>

<style scoped>
#mapContainer {
  height: 100%;
  width: 100%;
  position: relative;
}

/* Make sure the map container fills its parent */
:deep(#mapContainer > div) {
  height: 100%;
  width: 100%;
}

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
}

:deep(.close-routing-btn:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}

:deep(.leaflet-routing-container) {
  z-index: 999 !important;
}
</style>
