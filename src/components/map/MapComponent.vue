<template>
  <div id="mapContainer" class="h-full w-full relative">
    <div :id="mapContainerId" class="w-full h-full"></div>
  </div>
</template>

<script lang="ts">
import { onMounted, onBeforeUnmount, watch, ref, defineComponent, nextTick } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { useI18n } from 'vue-i18n';
import type { MeetingPlaceDto } from '@/types/meetingPlace'

// Import shared types
import type { POI, UserLocation, CrisisEvent, MarkerMovedEvent, MarkerAddedEvent, MarkerRemovedEvent, POIMarker } from '@/types/map';

// Fix default Leaflet icon paths
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import firestationIconUrl from '@/assets/mapicons/firestation.svg';
import gasstationIconUrl from '@/assets/mapicons/gasstation.svg';
import grocerystoreIconUrl from '@/assets/mapicons/grocerystore.svg';
import hospitalIconUrl from '@/assets/mapicons/hospital.svg';
import meetingpointIconUrl from '@/assets/mapicons/meetingpoint.svg';
import pharmacyIconUrl from '@/assets/mapicons/pharmacy.svg';
import policestationIconUrl from '@/assets/mapicons/policestation.svg';
import shelterIconUrl from '@/assets/mapicons/shelter.svg';
import waterpointIconUrl from '@/assets/mapicons/waterpoint.svg';
import defaultPoiIconUrl from '@/assets/mapicons/home.svg';


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
    },

    showPois: {
      type: Boolean,
      default: true
              },
    showCrisis: {
      type: Boolean,
      default: true
    },
    meetingPlaces:     { type: Array as () => MeetingPlaceDto[], default: () => [] },
    showMeetingPlaces: { type: Boolean, default: false },
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
    const crisisRenderer = L.canvas({ padding: 0.5 });
    const meetingLayer   = ref<L.MarkerClusterGroup|null>(null)
    const meetingMarkers = ref<Map<string | number, L.Marker>>(new Map())

    const MIN_ZOOM_FOR_POIS = 10;

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

    // --- Icon Definitions ---

    // User Location Icon (still uses default PNGs, styled blue)
    const userIcon = L.icon({
      iconUrl, iconRetinaUrl, shadowUrl,
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
      className: 'user-location-icon',
    });

    // Household Location Icon (still uses default PNGs, styled purple)
    const householdIcon = L.icon({
      iconUrl, iconRetinaUrl, shadowUrl,
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
      className: 'household-location-icon',
    });

    // Admin-created Marker Icon (still uses default PNGs, styled green)
    const adminIcon = L.icon({
      iconUrl, iconRetinaUrl, shadowUrl,
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
      className: 'admin-marker-icon',
    });

    // --- SVG Icon Handling for POIs ---
    const poiIconUrls: Record<string, string> = {
      // *** Adjust these lowercase keys to match your actual poiTypeName values ***
      'fire station': firestationIconUrl,
      'gas station': gasstationIconUrl,
      'grocery store': grocerystoreIconUrl,
      'hospital': hospitalIconUrl,
      'meeting point': meetingpointIconUrl,
      'pharmacy': pharmacyIconUrl,
      'police station': policestationIconUrl,
      'shelter': shelterIconUrl,
      'water distribution point': waterpointIconUrl, // Example key, adjust if needed
      // 'home': homeIconUrl, // Add if 'Home' is a POI type
      // Add other type mappings here...
    };
    // Use the imported default SVG as fallback
    const defaultIconUrlForPoi = defaultPoiIconUrl;

    function getPoiIcon(poiTypeName: string): L.DivIcon {
      const typeKey = poiTypeName ? poiTypeName.toLowerCase() : 'default';
      const iconUrlToUse = poiIconUrls[typeKey] || defaultIconUrlForPoi; // Fallback

      // --- Adjust these values to fit your SVG icons' natural size and desired anchor ---
      const iconWidth = 32; // Example width in pixels
      const iconHeight = 32; // Example height in pixels
      const iconAnchorX = iconWidth / 2; // Center horizontally
      const iconAnchorY = iconHeight;    // Bottom vertically (typical for pins)
      // --------------------------------------------------------------------------------

      return L.divIcon({
        html: `<img src="${iconUrlToUse}" alt="${poiTypeName}" style="width: ${iconWidth}px; height: ${iconHeight}px; display: block;">`,
        iconSize: [iconWidth, iconHeight],
        iconAnchor: [iconAnchorX, iconAnchorY],
        popupAnchor: [0, -iconAnchorY + 5], // Adjust popup anchor if needed
        className: 'poi-svg-icon' // Class for custom styling
      });
    }
    // --- End SVG Icon Handling ---

    // Only cluster the POIs actually in view (plus a 50% padding)
    function getVisiblePois(): POI[] {
      if (!map.value) return [];
      const bounds = map.value.getBounds().pad(0.5);
      return props.pois.filter(poi => {
        const lat = typeof poi.latitude === 'string'
          ? parseFloat(poi.latitude)
          : poi.latitude;
        const lng = typeof poi.longitude === 'string'
          ? parseFloat(poi.longitude)
          : poi.longitude;
        return bounds.contains([lat, lng]);
      });
    }

    function getMeetingIcon(): L.DivIcon {
      return L.divIcon({
        html: `<img src="${meetingpointIconUrl}" style="width:32px;height:32px" />`,
        iconSize: [32,32],
        iconAnchor: [16,32],
        className: 'meetingpoint-icon'
      })
    }

    function updateMeetingPlaces(list: MeetingPlaceDto[]) {
      console.log('Drawing meeting places:', list)
      if (!meetingLayer.value) return;

      // Clear all existing markers
      meetingLayer.value.clearLayers();
      meetingMarkers.value.clear();

      // Add all markers fresh
      const markers: L.Marker[] = [];
      for (const mp of list) {
        const marker = L.marker([mp.latitude, mp.longitude], { icon: getMeetingIcon() })
        .bindPopup(`<strong>${mp.name}</strong><br/>${mp.description||''}`);

        // Use an auto-incrementing index if ID is not available
        const id = mp.id !== undefined ? mp.id : `temp-${markers.length}`;
        meetingMarkers.value.set(id, marker);
        markers.push(marker);
      }

      if (markers.length) meetingLayer.value.addLayers(markers);
    }

// Debounce scheduler: wait 200ms after the last zoom/pan before re-clustering
    let updateTimeout: number | null = null;


    function scheduleViewportUpdate() {
      if (!map.value || !markerClusterGroup.value) return;

      const zoom = map.value.getZoom();
      const tooFar = zoom < MIN_ZOOM_FOR_POIS;

      // if zoomed out too far, hide everything _and_ dump the pending debounce
      if (tooFar) {
        // 1) cancel the pending update
        if (updateTimeout) {
          clearTimeout(updateTimeout);
          updateTimeout = null;
        }

        // 2) hide the layer (or clear it if you prefer)
        if (map.value.hasLayer(markerClusterGroup.value as unknown as L.Layer)) {
          map.value.removeLayer(markerClusterGroup.value as unknown as L.Layer);
        }

        return;
      }

      // zoom is fine → show layer (if it was hidden) and debounce an update
      if (!map.value.hasLayer(markerClusterGroup.value as unknown as L.Layer)) {
        map.value.addLayer(markerClusterGroup.value as unknown as L.Layer);
      }

      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = window.setTimeout(() => {
        updatePOIs(getVisiblePois());
        updateTimeout = null;
      }, 200);
    }

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
      nextTick(() => {
        try {

          // Ensure container exists
          const container = document.getElementById(mapContainerId);
          if (!container) {
            console.error("Map container not found:", mapContainerId);
            return;
          }

          // Create map instance
          map.value = L.map(mapContainerId, {
            preferCanvas: true,
            fadeAnimation: false,
            // markerZoomAnimation: true,
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

          // Create marker cluster with chunked loading enabled
          const clusterOptions: L.MarkerClusterGroupOptions = {
            spiderfyOnMaxZoom: true,
            disableClusteringAtZoom: 45,
            maxClusterRadius: 50,
            removeOutsideVisibleBounds: true,
            animate: false,
            animateAddingMarkers: false,
            chunkedLoading: true,           // Enable chunked loading
            chunkInterval: 50,              // Process chunks every 50ms
            chunkDelay: 10,                 // Delay between chunks
            chunkProgress: undefined,       // No progress callback needed
          };
          markerClusterGroup.value = L.markerClusterGroup(clusterOptions);
          if (map.value) {
            map.value.addLayer(markerClusterGroup.value as unknown as L.Layer);
          }

          meetingLayer.value = L.markerClusterGroup({ chunkedLoading: true });
          map.value!.addLayer(meetingLayer.value as unknown as L.Layer);

          // Set up map event listeners
          map.value.on('zoomend moveend', scheduleViewportUpdate);

          // Add click listener for admin mode only
          if (props.adminMode) {
            map.value.on('click', (e: L.LeafletMouseEvent) => {
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
          nextTick(() => {
            forceMapRefresh();
          });


          // Initial population of POIs
          if (props.pois && props.pois.length > 0) {
            nextTick(() => scheduleViewportUpdate());
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
      });

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

        if (activeRouteMarker.value) {
          // Access the coordinates stored on the marker itself
          const destLat = (activeRouteMarker.value as any).destinationLat;
          const destLng = (activeRouteMarker.value as any).destinationLng;

          // Check if the stored coordinates are valid numbers
          if (typeof destLat === 'number' && typeof destLng === 'number' && isFinite(destLat) && isFinite(destLng)) {
            const correctLatLng = L.latLng(destLat, destLng);
            // Ensure the marker's position is always set to the correct destination
            activeRouteMarker.value.setLatLng(correctLatLng);
          } else {
            // Optional Fallback (less reliable during rapid zoom):
            // If stored coords are missing, try getting from waypoints, but be aware it might be stale.
            console.warn("Stored destination coordinates missing on activeRouteMarker. Falling back to routingControl waypoints.");
            if (routingControl.value) {
              const waypoints = routingControl.value.getWaypoints();
              if (waypoints && waypoints.length >= 2 && waypoints[1].latLng) {
                activeRouteMarker.value.setLatLng(waypoints[1].latLng);
              }
            }
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

      const marker = L.marker([lat, lng], {
        icon: adminIcon,
        draggable: props.adminMode,
        title: title
      }).addTo(map.value as L.Map);

      // If in admin mode, make the marker draggable
      if (props.adminMode) {
        marker.on('dragend', function(event) {
          const position = event.target.getLatLng();
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
    // Update POIs on the map - using SVG Icons and without fitBounds
    function updatePOIs(newPois: POI[]): void {

      if (!map.value || map.value.getZoom() < MIN_ZOOM_FOR_POIS) {
        markerClusterGroup.value?.clearLayers();
        return;
      }
      // Ensure map and cluster group are initialized
      if (!map.value || !markerClusterGroup.value) {
        console.warn("Map or marker cluster group not ready for POI update.");
        return;
      }



      const newPoiIds = new Set<string | number>();
      const markersToAdd: L.Marker[] = [];
      // Bounds calculation is kept in case you need it elsewhere, but not used for fitBounds here
      const bounds = L.latLngBounds([]);

      // Process the list of POIs provided (should be the full list from props)
      if (newPois && newPois.length > 0) {
        newPois.forEach(poi => {
          // Basic validation for essential POI data
          if (poi.latitude === undefined || poi.longitude === undefined || poi.id === undefined) {
            console.warn(`POI missing essential data (id, lat, or lon):`, poi);
            return; // Skip this POI
          }
          newPoiIds.add(poi.id); // Track IDs of POIs in the current props

          // Ensure coordinates are valid numbers
          const lat = typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude;
          const lon = typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude;

          if (!isFinite(lat) || !isFinite(lon)) {
            console.warn(`Invalid coordinates for POI: ${poi.name || poi.id}`, lat, lon);
            return; // Skip this POI
          }

          // Determine POI type for icon selection, default if missing
          const currentPoiTypeName = poi.poiTypeName || 'default';
          if (!poi.poiTypeName) {
            console.warn(`POI ${poi.id || poi.name} is missing poiTypeName. Using default icon.`);
          }

          // Check if a marker for this POI already exists in our map
          const existingMarker = markersMap.value.get(poi.id) as POIMarker | undefined; // Type assertion for clarity

          if (existingMarker) {
            // --- Update Existing Marker ---
            // 1. Update position if latitude or longitude changed
            if (existingMarker.poiLat !== lat || existingMarker.poiLng !== lon) {
              existingMarker.setLatLng([lat, lon]);
              // Update stored coordinates on the marker object
              existingMarker.poiLat = lat;
              existingMarker.poiLng = lon;
            }
            // 2. Update popup content (always update in case details changed)
            existingMarker.setPopupContent(createPopupContent(poi));
            // 3. Update tooltip content (always update in case name changed)
            existingMarker.setTooltipContent(poi.name);
            // 4. Update icon *only if the POI type changed*
            if (existingMarker.poiTypeName !== currentPoiTypeName) {
              existingMarker.setIcon(getPoiIcon(currentPoiTypeName));
              existingMarker.poiTypeName = currentPoiTypeName; // Update stored type
            }
          } else {
            // --- Create New Marker ---
            const marker = L.marker([lat, lon], {
              icon: getPoiIcon(currentPoiTypeName), // Use the SVG icon function
              riseOnHover: true,
              bubblingMouseEvents: false, // Prevent events from bubbling up to the map (optional)
              zIndexOffset: 100 // Ensure POIs are generally below user/household markers
            });

            // Bind popup and tooltip
            marker.bindPopup(createPopupContent(poi));
            marker.bindTooltip(poi.name, { permanent: false, direction: 'top', className: 'poi-label' });

            // Store custom properties directly on the marker object
            const poiMarker = marker as POIMarker; // Assert type
            poiMarker.poiLat = lat;
            poiMarker.poiLng = lon;
            poiMarker.poiTypeName = currentPoiTypeName; // Store type name for future comparisons

            // Add to our internal map and the list to be added to the cluster group
            markersMap.value.set(poi.id, poiMarker);
            markersToAdd.push(poiMarker); // Add the typed marker
          }
          // Extend bounds (still useful for potential manual centering logic elsewhere)
          bounds.extend([lat, lon]);
        });

        // --- Remove Old Markers ---
        // Identify markers in our internal map that are NOT in the new POI list
        const markersToRemove: L.Marker[] = [];
        markersMap.value.forEach((marker, id) => {
          if (!newPoiIds.has(id)) {
            // Found a marker for a POI that's no longer in the props
            markersToRemove.push(marker as unknown as L.Marker); // Add to removal list
            markersMap.value.delete(id); // Remove from our internal map
          }
        });

        // Perform bulk add/remove operations on the cluster group for efficiency
        if (markersToRemove.length > 0) {
          markerClusterGroup.value.removeLayers(markersToRemove);
          console.log(`Removed ${markersToRemove.length} old POI markers.`);
        }
        if (markersToAdd.length > 0) {
          markerClusterGroup.value.addLayers(markersToAdd);
          console.log(`Added ${markersToAdd.length} new POI markers.`);
        }

      } else {
        // If the newPois list is empty, clear everything
        console.log("Received empty POI list, clearing all markers.");
        markerClusterGroup.value.clearLayers();
        markersMap.value.clear();
      }

      // Extend bounds with user/household locations if they exist
      if (props.userLocation) {
        bounds.extend([props.userLocation.latitude, props.userLocation.longitude]);
      }
      if (props.householdLocation) {
        // Ensure household coordinates are valid before extending bounds
        const hhLat = typeof props.householdLocation.latitude === 'string' ? parseFloat(props.householdLocation.latitude) : props.householdLocation.latitude;
        const hhLon = typeof props.householdLocation.longitude === 'string' ? parseFloat(props.householdLocation.longitude) : props.householdLocation.longitude;
        if (isFinite(hhLat) && isFinite(hhLon)) {
          bounds.extend([hhLat, hhLon]);
        }
      }

      // Force a map refresh to ensure visuals are updated correctly
      // This invalidates size and redraws, but DOES NOT change zoom/center
      forceMapRefresh();

      console.log(`updatePOIs finished. Markers in map: ${markersMap.value.size}`);
    }

    function updateCrisisEvents(events: CrisisEvent[], fit: boolean = true): void {
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
        if (event.latitude === undefined || event.longitude === undefined || event.level === undefined || event.radius === undefined) {
          console.warn("Skipping crisis event with missing required properties (lat, lon, level, or radius):", event);
          return;
        }

        const lat = typeof event.latitude === 'string' ? parseFloat(event.latitude) : event.latitude;
        const lon = typeof event.longitude === 'string' ? parseFloat(event.longitude) : event.longitude;
        const eventRadiusInKm = typeof event.radius === 'string' ? parseFloat(event.radius) : event.radius;

        if (!isFinite(lat) || !isFinite(lon) || !isFinite(eventRadiusInKm)) {
          console.warn("Skipping invalid crisis event coords or radius:", event);
          return;
        }

        const lvl = LEVEL_STYLES[event.level] ? event.level : 3;
        const { base, border } = LEVEL_STYLES[lvl];
        const radiusInMetersForDisplay = eventRadiusInKm * 1000;

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
                      renderer: crisisRenderer, // ← use our shared canvas renderer
                      radius: radiusInMetersForDisplay,
                      fillColor: base,
                      fillOpacity: 0.4,
                      color: border,
                      weight: 2,               // slight weight reduction for performance
                      pane: 'overlayPane',
                      bubblingMouseEvents: false
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
            pane: 'overlayPane', // Ensure it's in the marker pane
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
      nextTick(() => {
        if (map.value) {
          map.value.invalidateSize({ animate: false });

          // Only fit bounds if we have valid crisis events
          if (fit && bounds.isValid() && bounds.getNorthEast().distanceTo(bounds.getSouthWest()) > 0) {
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
      });
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

    function fitBoundsToUserAndPoi(): void {
      if (!map.value || !props.userLocation || !props.pois || props.pois.length === 0) {
        console.warn("Cannot fit bounds: map, user location, or POI data missing.");
        return;
      }

      const userLatLng = L.latLng(props.userLocation.latitude, props.userLocation.longitude);
      const poi = props.pois[0]; // Assume the first (and likely only) POI is the target

      // Validate POI coordinates
      const poiLat = typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude;
      const poiLng = typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude;

      if (!isFinite(poiLat) || !isFinite(poiLng)) {
        console.warn(`Cannot fit bounds: Invalid coordinates for POI: ${poi.name || poi.id}`);
        return;
      }

      const poiLatLng = L.latLng(poiLat, poiLng);

      const bounds = L.latLngBounds(userLatLng, poiLatLng);

      // Add some padding to the bounds so markers aren't right at the edge
      map.value.fitBounds(bounds.pad(0.15), { // Adjust padding as needed (0.1 = 10%)
        animate: true,
        duration: 0.5 // Optional animation
      });
      console.log("Fitted map bounds to user and POI:", poi.name);
    }

    // Watch for POI changes
    watch(() => props.pois, () => {
      if (map.value) scheduleViewportUpdate();
    }, { deep: true, immediate: false });

    watch(() => props.showPois, (visible) => {
      if (!markerClusterGroup.value || !map.value) return;
      if (visible) {
        // re-add and re-populate on show
        scheduleViewportUpdate();
      } else {
        map.value.removeLayer(markerClusterGroup.value as unknown as L.Layer);
      }
    }, { immediate: true });

    watch(() => props.showCrisis, (visible) => {
      if (visible) {
        updateCrisisEvents(props.crisisEvents, false);
      } else {
        clearCrisisEvents();
      }
    }, { immediate: true });

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
        // redraw crisis‐layers but never auto‐fit on a prop swap
          if (props.showCrisis) updateCrisisEvents(newEvents, /* fit = */ false);
      }, { deep: true, immediate: false });

    // Watch for map container resize events
    watch(() => document.getElementById(mapContainerId)?.clientWidth, () => {
      nextTick(() => {
        forceMapRefresh();
      });
    });

    // Watch for map container resize events
    watch(() => document.getElementById(mapContainerId)?.clientHeight, () => {
      nextTick(() => {
        forceMapRefresh();
      });
    });

    watch(() => props.showMeetingPlaces, show => {
      if (!meetingLayer.value) return;
      if (show) updateMeetingPlaces(props.meetingPlaces);
      else      meetingLayer.value.clearLayers();
    });

// react to data changes
    watch(() => props.meetingPlaces, list => {
      if (props.showMeetingPlaces) updateMeetingPlaces(list);
    }, { deep:true });

    // Cleanup on component unmount
    onBeforeUnmount(() => {

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
      fitBoundsToUserAndPoi,
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
  filter: hue-rotate(90deg);
}

:deep(.user-location-icon) {
  filter: hue-rotate(0deg); /* Makes the marker blue */
}

:deep(.household-location-icon) {
  filter: hue-rotate(300deg);
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

:deep(.marker-cluster-small div),
:deep(.marker-cluster-medium div),
:deep(.marker-cluster-large div) {
  /* Set the background of the inner circle to grey */
  /* Adjust the alpha (0.7) for transparency if desired */
  background-color: rgba(100, 100, 100, 0.7); /* Medium grey */
}

/* Optional: Style the outer ring/border if needed */
:deep(.marker-cluster-small),
:deep(.marker-cluster-medium),
:deep(.marker-cluster-large) {
  /* The default CSS uses the outer element's background as a border */
  background-color: rgba(150, 150, 150, 0.5); /* Lighter grey for the 'border' */
}

/* Ensure text color is readable on grey */
:deep(.marker-cluster div) {
  color: #fff; /* White text */
  text-align: center;
  border-radius: 50%;
  font-weight: bold;
}

:deep(.crisis-level-box) {
  /* ensure the 24×24 div is always perfectly centered on the lat/lng point */
  transform: translate(-50%, -50%);
  will-change: transform;
}

:deep(.user-location-icon),
:deep(.household-location-icon),
:deep(.admin-marker-icon) {
  will-change: transform;
}
/* make all marker icons pixel-perfectly bottom-centered */
:deep(.leaflet-marker-icon) {
  transform: translate(-50%, -100%);
  will-change: transform;
}

/* do the same for your custom CSS-class icons */
:deep(.user-location-icon),
:deep(.household-location-icon),
:deep(.admin-marker-icon),
:deep(.poi-svg-icon) {
  transform-origin: bottom center;
  will-change: transform;
}

/* shadows don’t need to jump around on zoom either */
:deep(.leaflet-marker-shadow) {
  will-change: opacity, transform;
}
:deep(.leaflet-overlay-pane canvas) {
  /* hint GPU-acceleration and keep the canvas pixel-sharp */
  will-change: transform;
}
</style>
