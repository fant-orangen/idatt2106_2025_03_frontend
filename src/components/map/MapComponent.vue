<template>
  <div id="mapContainer" class="h-full w-full relative">
    <div :id="mapContainerId" class="w-full h-full"></div>
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
  householdLocation: string;
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
    householdLocation: {
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
    const householdMarker = ref<L.Marker | null>(null);
    const adminMarkers = ref<L.Marker[]>([]);
    const mapContainerId: string = 'map-' + Math.random().toString(36).substring(2, 9);
    const routingControl = ref<L.Routing.Control | null>(null);
    const activeRouteMarker = ref<L.Marker | null>(null);
    const tempMarker = ref<L.Marker | null>(null);
    const markersMap = ref<Map<string | number, POIMarker>>(new Map()); // Store markers by POI ID for easier reference
    // Store crisis event layers for management
    const crisisLayers = ref<L.Layer[]>([]);

    // Translation strings with fallbacks
    const translatedStrings: TranslatedStrings = {
      address: t('map.address') || 'Adresse',
      openingHours: t('map.opening-hours') || 'Åpningstider',
      contact: t('map.contact') || 'Kontakt',
      directions: t('map.directions') || 'Veibeskrivelse',
      yourLocation: t('map.your-location') || 'Din posisjon',
      householdLocation: t('map.household-location') || 'Household Location',
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

    // Custom icon for household location
    const householdIcon = L.icon({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: 'household-location-icon',
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

          // Initial household location
          if (props.householdLocation) {
            updateHouseholdLocation(props.householdLocation);
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
        // Ensure the map container has proper dimensions
        map.value.invalidateSize({ animate: false });

        // Update user marker position if it exists
        if (userMarker.value && props.userLocation) {
          const latLng = L.latLng(props.userLocation.latitude, props.userLocation.longitude);
          userMarker.value.setLatLng(latLng);
        }

        // Update household marker position if it exists
        if (householdMarker.value && props.householdLocation) {
          const latLng = L.latLng(props.householdLocation.latitude, props.householdLocation.longitude);
          householdMarker.value.setLatLng(latLng);
        }

        // Update route end marker position if it exists
        if (activeRouteMarker.value && routingControl.value) {
          const waypoints = routingControl.value.getWaypoints();
          if (waypoints && waypoints.length >= 2 && waypoints[1].latLng) {
            activeRouteMarker.value.setLatLng(waypoints[1].latLng);
          }
        }

        // Refresh crisis markers positions
        crisisLayers.value.forEach(layer => {
          // For circle layers
          if (layer instanceof L.Circle) {
            const center = layer.getLatLng();
            layer.setLatLng(center);
          }
          // For marker layers
          else if (layer instanceof L.Marker) {
            const position = layer.getLatLng();
            layer.setLatLng(position);
          }
        });

        // Refresh marker clusters
        if (markerClusterGroup.value) {
          markerClusterGroup.value.refreshClusters();
        }
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

      // Store the destination coordinates for later use
      if (activeRouteMarker.value) {
        (activeRouteMarker.value as any).destinationLat = lat;
        (activeRouteMarker.value as any).destinationLng = lng;
      }
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

      // Add household location to bounds if available
      if (props.householdLocation) {
        bounds.extend([props.householdLocation.latitude, props.householdLocation.longitude]);
      }

      // Force refresh
      forceMapRefresh();

      // Fit bounds if we have valid bounds
      if (bounds.isValid() && (markers.length > 0 || props.userLocation || props.householdLocation)) {
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
      } else if (markers.length === 0 && (props.userLocation || props.householdLocation)) {
        // Center on user or household if no markers
        if (map.value) {
          if (props.userLocation) {
            map.value.setView(
              [props.userLocation.latitude, props.userLocation.longitude],
              13
            );
          } else if (props.householdLocation) {
            map.value.setView(
              [props.householdLocation.latitude, props.householdLocation.longitude],
              13
            );
          }
        }
      } else if (markers.length === 0) {
        // Fallback to default view
        if (map.value) {
          map.value.setView([props.centerLat, props.centerLon], props.initialZoom);
        }
      }
    }

    function updateCrisisEvents(events: CrisisEvent[]): void {
      if (!map.value) {
        console.warn("Cannot update crisis events: map not initialized");
        return;
      }

      // 1) clear old
      clearCrisisEvents();

      // 2) style lookup
      const LEVEL_STYLES: Record<number, { base: string; border: string }> = {
        1: { base: '#a6d96a', border: '#333333' },
        2: { base: '#fdae61', border: '#333333' },
        3: { base: '#f46d43', border: '#333333' }
      };
      const bounds = L.latLngBounds([]);

      // Create a layerGroup to hold all crisis elements for better management
      const crisisLayerGroup = L.layerGroup();

      // 3) draw each active
      events.forEach(event => {
        // Skip if event is explicitly marked as inactive
        if (event.isActive === false) return;

        // Skip if required properties are missing
        if (event.latitude === undefined || event.longitude === undefined || event.level === undefined) {
          console.warn("Skipping crisis event with missing required properties:", event);
          return;
        }

        const lat = typeof event.latitude === 'string' ? parseFloat(event.latitude) : event.latitude;
        const lon = typeof event.longitude === 'string' ? parseFloat(event.longitude) : event.longitude;
        if (!isFinite(lat) || !isFinite(lon)) {
          console.warn("Skipping invalid crisis event coords:", event);
          return;
        }

        const lvl = LEVEL_STYLES[event.level] ? event.level : 3;
        const { base, border } = LEVEL_STYLES[lvl];
        const radius = lvl * 1000;
        const fillOpacity = 0.4;

        try {
          // Create popup content for crisis event
          let popupContent = `
  <div class="crisis-popup">
    <h3>${event.name || 'Crisis Event'}</h3>
    ${event.description ? `<p>${event.description}</p>` : ''}
    <p class="crisis-level level-${lvl}">
      Alert Level: ${lvl}
    </p>
    ${event.startTime ? `<p class="crisis-time">
      Started: ${new Date(event.startTime).toLocaleString()}
    </p>` : ''}
    <button onclick="window.location.href='/crisis-event?id=${event.id}'" class="crisis-details-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      View Crisis Details
    </button>
  </div>
`;

          // a) main circle with pastel fill + dark border
          const circle = L.circle([lat, lon], {
            radius,
            fillColor: base,
            fillOpacity: fillOpacity,
            color: border,
            weight: 3,
            pane: 'overlayPane', // Ensure it's in the correct pane
            bubblingMouseEvents: false // Prevent event bubbling issues
          });

          // Add popup to the circle
          circle.bindPopup(popupContent);

          // Add circle to the layer group
          circle.addTo(crisisLayerGroup);
          crisisLayers.value.push(circle);

          // b) square badge
          const badge = L.marker([lat, lon], {
            interactive: true, // Make badge interactive so it can be clicked
            icon: L.divIcon({
              className: 'crisis-level-box',
              html: `<span>${lvl}</span>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            }),
            pane: 'markerPane', // Ensure it's in the marker pane
            zIndexOffset: 1000 // Keep it above other markers
          });

          // Add the same popup to the badge
          badge.bindPopup(popupContent);

          // Add badge to the layer group
          badge.addTo(crisisLayerGroup);
          crisisLayers.value.push(badge);

          // Add point to bounds
          bounds.extend([lat, lon]);
        } catch (error) {
          console.error("Error adding crisis event:", error);
        }
      });

      // Add the entire layer group to the map at once
      if (map.value && crisisLayerGroup) {
        crisisLayerGroup.addTo(map.value as L.Map);
      }

      // 4) force a refresh with a slight delay to ensure map is ready
      setTimeout(() => {
        if (map.value) {
          map.value.invalidateSize({ animate: false });

          // Only fit bounds if we have valid crisis events
          if (bounds.isValid() && bounds.getNorthEast().distanceTo(bounds.getSouthWest()) > 0) {
            try {
              map.value.fitBounds(bounds.pad(0.2), {
                animate: false,
                maxZoom: 15,
                duration: 0 // No animation duration
              });
            } catch (error) {
              console.error("Error fitting bounds:", error);
            }
          }

          // Final refresh to ensure everything is positioned correctly
          forceMapRefresh();
        }
      }, 100);
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

    // Update household location
    // Update household location
    function updateHouseholdLocation(location: UserLocation): void {
      if (!map.value) return;

      // Remove existing marker
      if (householdMarker.value) {
        householdMarker.value.remove();
        householdMarker.value = null;
      }

      // Add household marker
      if (location) {
        // Convert coordinates to numbers if they're strings
        const lat = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude;
        const lon = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude;

        // Skip if coordinates are invalid
        if (!isFinite(lat) || !isFinite(lon)) {
          console.warn('Invalid household coordinates:', location);
          return;
        }

        // Create custom popup content with router link
        const popupContent = `
      <div class="household-popup">
        <strong>${translatedStrings.householdLocation}</strong>
        <hr>
        <button onclick="window.location.href='/household'" class="household-link-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          ${t('map.view-household') || 'Go to Household'}
        </button>
      </div>
    `;

        householdMarker.value = L.marker(
          [lat, lon],
          {
            icon: householdIcon,
            zIndexOffset: 900
          }
        )
        .addTo(map.value as L.Map)
        .bindPopup(popupContent)
        .bindTooltip(translatedStrings.householdLocation, {
          permanent: false,
          direction: 'top',
          className: 'household-location-label',
          offset: [0, -30],
        });
      }
    }

    // Clear all crisis events from the map
    function clearCrisisEvents(): void {
      if (!map.value) return;

      console.log(`Clearing ${crisisLayers.value.length} crisis layers`);

      // Remove each layer from the map safely
      crisisLayers.value.forEach(layer => {
        try {
          if (map.value && layer) {
            // Check if the layer is still on the map
            if (map.value.hasLayer(layer as L.Layer)) {
              map.value.removeLayer(layer as L.Layer);
            }
          }
        } catch (error) {
          console.error("Error removing crisis layer:", error);
        }
      });

      // Reset the array
      crisisLayers.value = [];
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

    // Watch for household location changes
    watch(() => props.householdLocation, (newLocation: UserLocation | null) => {
      if (newLocation) {
        updateHouseholdLocation(newLocation);
      }
    }, { deep: true, immediate: false });

    // Watch for crisis events changes
    watch(() => props.crisisEvents, (newEvents: CrisisEvent[]) => {
      console.log("Crisis events prop changed, updating map");
      updateCrisisEvents(newEvents);
    }, { deep: true, immediate: false });

    // Watch for map container resize events
    watch(() => document.getElementById(mapContainerId)?.clientWidth, () => {
      console.log("Map container size changed");
      setTimeout(() => {
        forceMapRefresh();
      }, 100);
    });

    // Watch for map container resize events
    watch(() => document.getElementById(mapContainerId)?.clientHeight, () => {
      console.log("Map container height changed");
      setTimeout(() => {
        forceMapRefresh();
      }, 100);
    });

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

      // Clear crisis events
      clearCrisisEvents();

      // Remove user marker
      if (userMarker.value) {
        userMarker.value.remove();
        userMarker.value = null;
      }

      // Remove household marker
      if (householdMarker.value) {
        householdMarker.value.remove();
        householdMarker.value = null;
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

:deep(.admin-marker-icon) {
  filter: hue-rotate(90deg); /* Makes the marker green */
}

:deep(.user-location-icon) {
  filter: hue-rotate(210deg); /* Makes the marker blue */
}

:deep(.household-location-icon) {
  filter: hue-rotate(300deg); /* Makes the marker purple */
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

@media (max-width: 768px) {
  #mapContainer {
    height: 50vh; /* Map takes up half the viewport height on mobile */
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

:deep(.crisis-level-box span) {
  display:           flex;
  align-items:       center;
  justify-content:   center;
  width:             24px;
  height:            24px;
  background:        rgba(0, 0, 0, 0.7);
  color:             #fff;
  border:            2px solid #fff;
  border-radius:     4px;         /* 0 for perfect square */
  font-weight:       bold;
  font-size:         0.9rem;
  text-shadow:       0 0 1px black;
  pointer-events:    none;
}

:deep(.household-popup) {
  max-width: 250px;
}

:deep(.household-link-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: #6366f1; /* Indigo color to distinguish from POI buttons */
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  margin-top: 8px;
  cursor: pointer;
  width: 100%;
}

:deep(.household-link-btn:hover) {
  background-color: #4f46e5;
}
:deep(.crisis-popup) {
  max-width: 280px;
}

:deep(.crisis-popup h3) {
  margin-top: 0;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

:deep(.crisis-popup p) {
  margin: 0.5rem 0;
}

:deep(.crisis-level) {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

:deep(.level-1) {
  background-color: #a6d96a;
  color: #333;
}

:deep(.level-2) {
  background-color: #fdae61;
  color: #333;
}

:deep(.level-3) {
  background-color: #f46d43;
  color: white;
}

:deep(.crisis-time) {
  font-size: 0.9rem;
  color: #555;
}
:deep(.crisis-details-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: #ef4444; /* Red color for crisis */
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  margin-top: 8px;
  cursor: pointer;
  width: 100%;
}

:deep(.crisis-details-btn:hover) {
  background-color: #dc2626;
}
</style>
