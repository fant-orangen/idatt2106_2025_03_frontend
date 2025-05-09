<template>
  <div id="mapContainer" class="h-full w-full relative not-dark">
    <div :id="mapContainerId" class="w-full h-full"></div>
  </div>
</template>

<script lang="ts">
/**
 * @component MapComponent
 * @description An interactive map component built with Leaflet.js that displays various geographic data:
 * - Points of Interest (POIs) with custom icons based on type
 * - User and household locations
 * - Crisis events with different severity levels
 * - Meeting places
 * - Routing functionality between locations
 *
 * The component supports clustering for better performance with large numbers of markers,
 * responsive design for different screen sizes, and an optional admin mode for marker management.
 *
 * @example
 * <MapComponent
 *   :pois="poiList"
 *   :userLocation="currentUserLocation"
 *   :householdLocation="householdAddress"
 *   :crisisEvents="activeCrisisEvents"
 *   :showPois="true"
 *   :showCrisis="true"
 *   :showMeetingPlaces="false"
 *   :adminMode="false"
 *   @map-clicked="handleMapClick"
 * />
 */
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

// Import Leaflet icon assets
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Import POI type-specific SVG icons
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

/**
 * Interface for translated UI strings used in the map component
 * These strings are loaded from i18n translations with fallbacks
 */
interface TranslatedStrings {
  /** Label for address information in POI popups */
  address: string;
  /** Label for opening hours information in POI popups */
  openingHours: string;
  /** Label for contact information in POI popups */
  contact: string;
  /** Label for directions information in POI popups */
  directions: string;
  /** Label for user's current location marker */
  yourLocation: string;
  /** Label for household location marker */
  householdLocation: string;
  /** Text for button to show directions to a POI */
  showDirections: string;
  /** Text for button to close directions panel */
  closeDirections: string;
}

/**
 * Declare global functions added to the window object
 * These functions enable interaction with the map from popup HTML content
 */
declare global {
  interface Window {
    /**
     * Shows routing directions from user's location to a specified point
     * @param lat - Destination latitude
     * @param lng - Destination longitude
     * @param poiName - Name of the destination POI for display in the directions panel
     */
    showRouteFor: (lat: number, lng: number, poiName: string) => void;

    /**
     * Closes the active routing directions panel
     */
    closeRouting: () => void;
  }
}

export default defineComponent({
  name: 'MapComponent',
  props: {
    /**
     * Array of Points of Interest to display on the map
     * Each POI should have id, name, latitude, longitude, and poiTypeName properties
     * Optional properties: description, address, openingHours, contactInfo
     */
    pois: {
      type: Array as () => POI[],
      default: () => []
    },

    /**
     * Initial center latitude of the map
     * Defaults to Trondheim, Norway coordinates
     */
    centerLat: {
      type: Number,
      default: 63.4305
    },

    /**
     * Initial center longitude of the map
     * Defaults to Trondheim, Norway coordinates
     */
    centerLon: {
      type: Number,
      default: 10.3951
    },

    /**
     * Initial zoom level of the map (1-19)
     * Higher values = more zoomed in
     */
    initialZoom: {
      type: Number,
      default: 6
    },

    /**
     * Current user's location to display on the map
     * Should contain latitude and longitude properties
     */
    userLocation: {
      type: Object as () => UserLocation | null,
      default: null
    },

    /**
     * User's household location to display on the map
     * Should contain latitude and longitude properties
     */
    householdLocation: {
      type: Object as () => UserLocation | null,
      default: null
    },

    /**
     * Array of crisis events to display on the map
     * Each event should have id, name, latitude, longitude, level, and radius properties
     * Optional properties: description, startTime, isActive
     */
    crisisEvents: {
      type: Array as () => CrisisEvent[],
      default: () => []
    },

    /**
     * Enables admin mode which allows adding, moving, and removing markers
     * When true, map clicks will emit 'map-clicked' events
     */
    adminMode: {
      type: Boolean,
      default: false
    },

    /**
     * Controls visibility of POI markers on the map
     */
    showPois: {
      type: Boolean,
      default: true
    },

    /**
     * Controls visibility of crisis events on the map
     */
    showCrisis: {
      type: Boolean,
      default: true
    },

    /**
     * Array of meeting places to display on the map
     * Each meeting place should have id, name, latitude, longitude properties
     * Optional properties: description
     */
    meetingPlaces: {
      type: Array as () => MeetingPlaceDto[],
      default: () => []
    },

    /**
     * Controls visibility of meeting places on the map
     */
    showMeetingPlaces: {
      type: Boolean,
      default: false
    },
  },

  /**
   * Events emitted by the component
   * - map-clicked: Emitted when the map is clicked in admin mode, with click coordinates
   * - marker-added: Emitted when a marker is added in admin mode
   * - marker-removed: Emitted when a marker is removed in admin mode
   * - marker-moved: Emitted when a marker is moved in admin mode
   */
  emits: ['map-clicked', 'marker-added', 'marker-removed', 'marker-moved'],
  /**
   * Component setup function
   * @param props - Component props
   * @param emit - Function to emit events
   * @returns Exposed methods and properties
   */
  setup(props, { emit }) {
    const { t } = useI18n(); // Translation function

    // Core map references
    /** Main Leaflet map instance */
    const map = ref<L.Map | null>(null);
    /** Cluster group for POI markers to improve performance */
    const markerClusterGroup = ref<L.MarkerClusterGroup | null>(null);
    /** Marker for user's current location */
    const userMarker = ref<L.Marker | null>(null);
    /** Marker for user's household location */
    const householdMarker = ref<L.Marker | null>(null);
    /** Collection of markers created in admin mode */
    const adminMarkers = ref<L.Marker[]>([]);
    /** Unique ID for the map container element */
    const mapContainerId: string = 'map-' + Math.random().toString(36).substring(2, 9);
    /** Control for displaying routing directions */
    const routingControl = ref<L.Routing.Control | null>(null);
    /** Marker highlighting the active route destination */
    const activeRouteMarker = ref<L.Marker | null>(null);
    /** Temporary marker used during admin operations */
    const tempMarker = ref<L.Marker | null>(null);
    /** Map of POI IDs to their marker instances for efficient updates */
    const markersMap = ref<Map<string | number, POIMarker>>(new Map());
    /** Collection of crisis event layers for management */
    const crisisLayers = ref<L.Layer[]>([]);
    /** Shared canvas renderer for crisis circles to improve performance */
    const crisisRenderer = L.canvas({ padding: 0.5 });
    /** Cluster group for meeting place markers */
    const meetingLayer = ref<L.MarkerClusterGroup|null>(null);
    /** Map of meeting place IDs to their marker instances */
    const meetingMarkers = ref<Map<string | number, L.Marker>>(new Map());

    /** Minimum zoom level required to display POIs (for performance) */
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

    /**
     * Mapping of POI type names to their corresponding SVG icon URLs
     * Keys should be lowercase to match normalized poiTypeName values
     */
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
    };

    /** Default icon URL to use when a POI type doesn't have a specific icon */
    const defaultIconUrlForPoi = defaultPoiIconUrl;

    /**
     * Creates a Leaflet DivIcon for a POI based on its type
     * @param poiTypeName - The type name of the POI
     * @returns A Leaflet DivIcon with the appropriate SVG icon
     */
    function getPoiIcon(poiTypeName: string): L.DivIcon {
      const typeKey = poiTypeName ? poiTypeName.toLowerCase() : 'default';
      const iconUrlToUse = poiIconUrls[typeKey] || defaultIconUrlForPoi;

      const iconWidth = 32;
      const iconHeight = 32;
      const iconAnchorX = iconWidth / 2; // Center horizontally
      const iconAnchorY = iconHeight;    // Bottom vertically (typical for pins)

      return L.divIcon({
        html: `<img src="${iconUrlToUse}" alt="${poiTypeName}" style="width: ${iconWidth}px; height: ${iconHeight}px; display: block;">`,
        iconSize: [iconWidth, iconHeight],
        iconAnchor: [iconAnchorX, iconAnchorY],
        popupAnchor: [0, -iconAnchorY + 5],
        className: 'poi-svg-icon'
      });
    }

    /**
     * Filters the POIs array to return only those currently visible in the map viewport
     * Includes a 50% padding around the visible area for smoother user experience
     * @returns Array of POIs that are within the current map bounds
     */
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

    /**
     * Creates a Leaflet DivIcon for meeting place markers
     * @returns A Leaflet DivIcon with the meeting point SVG icon
     */
    function getMeetingIcon(): L.DivIcon {
      return L.divIcon({
        html: `<img src="${meetingpointIconUrl}" style="width:32px;height:32px" />`,
        iconSize: [32,32],
        iconAnchor: [16,32],
        className: 'meetingpoint-icon'
      })
    }

    /**
     * Updates the meeting places displayed on the map
     * Clears existing markers and adds new ones based on the provided list
     * @param list - Array of meeting places to display
     */
    function updateMeetingPlaces(list: MeetingPlaceDto[]) {
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

    /** Timeout ID for debounced viewport updates */
    let updateTimeout: number | null = null;

    /**
     * Schedules an update of visible POIs with debouncing for better performance
     * Waits 200ms after the last zoom/pan before re-clustering markers
     * Hides POI markers when zoomed out too far (below MIN_ZOOM_FOR_POIS)
     */
    function scheduleViewportUpdate() {
      if (!map.value || !markerClusterGroup.value) return;

      const zoom = map.value.getZoom();
      const tooFar = zoom < MIN_ZOOM_FOR_POIS;

      // If zoomed out too far, hide markers and cancel pending updates
      if (tooFar) {
        // Cancel any pending update
        if (updateTimeout) {
          clearTimeout(updateTimeout);
          updateTimeout = null;
        }

        // Hide the marker cluster layer
        if (map.value.hasLayer(markerClusterGroup.value as unknown as L.Layer)) {
          map.value.removeLayer(markerClusterGroup.value as unknown as L.Layer);
        }

        return;
      }

      // Zoom level is acceptable, show markers and schedule update
      if (!map.value.hasLayer(markerClusterGroup.value as unknown as L.Layer)) {
        map.value.addLayer(markerClusterGroup.value as unknown as L.Layer);
      }

      // Debounce the update to avoid excessive processing during rapid interactions
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = window.setTimeout(() => {
        updatePOIs(getVisiblePois());
        updateTimeout = null;
      }, 200);
    }

    /**
     * Initializes the map and sets up event listeners when the component is mounted
     */
    onMounted(() => {
      // Fix Leaflet default icon paths globally
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
            zoomAnimation: true
          }).setView([props.centerLat, props.centerLon], props.initialZoom);

          // Add tile layer (CartoDB light style)
          L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            {
              maxZoom: 19,
              attribution: '© OSM © CartoDB',
              noWrap: false
            }
          ).addTo(map.value as L.Map);

          // Create marker cluster with performance optimizations
          const clusterOptions: L.MarkerClusterGroupOptions = {
            spiderfyOnMaxZoom: true,
            disableClusteringAtZoom: 45,
            maxClusterRadius: 50,
            removeOutsideVisibleBounds: true,
            animate: false,
            animateAddingMarkers: false,
            chunkedLoading: true,
            chunkInterval: 50,
            chunkDelay: 10,
            chunkProgress: undefined,
          };
          markerClusterGroup.value = L.markerClusterGroup(clusterOptions);
          if (map.value) {
            map.value.addLayer(markerClusterGroup.value as unknown as L.Layer);
          }

          // Create meeting places cluster group
          meetingLayer.value = L.markerClusterGroup({ chunkedLoading: true });
          map.value!.addLayer(meetingLayer.value as unknown as L.Layer);

          // Set up map event listeners for viewport changes
          map.value.on('zoomend moveend', scheduleViewportUpdate);

          // Add click listener for admin mode only
          if (props.adminMode) {
            map.value.on('click', (e: L.LeafletMouseEvent) => {
              emit('map-clicked', { latlng: e.latlng });
            });
          }

          // Set up global functions for routing from popup HTML content
          window.showRouteFor = (lat: number, lng: number, poiName: string) => {
            showRouteFor(lat, lng, poiName);
          };

          window.closeRouting = () => {
            clearRouting();
          };

          // Initial map refresh
          nextTick(() => {
            forceMapRefresh();
          });

          // Initialize map with data from props
          if (props.pois && props.pois.length > 0) {
            nextTick(() => scheduleViewportUpdate());
          }

          if (props.userLocation) {
            updateUserLocation(props.userLocation);
          }

          if (props.householdLocation) {
            updateHouseholdLocation(props.householdLocation);
          }

          if (props.crisisEvents && props.crisisEvents.length > 0) {
            updateCrisisEvents(props.crisisEvents);
          }
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      });
    });

    /**
     * Forces a refresh of the map and all its markers
     * Ensures proper positioning after container size changes or data updates
     */
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

        // Update active route marker position if it exists
        if (activeRouteMarker.value) {
          // Access the coordinates stored on the marker itself
          const destLat = (activeRouteMarker.value as any).destinationLat;
          const destLng = (activeRouteMarker.value as any).destinationLng;

          // Check if the stored coordinates are valid numbers
          if (typeof destLat === 'number' && typeof destLng === 'number' && isFinite(destLat) && isFinite(destLng)) {
            const correctLatLng = L.latLng(destLat, destLng);
            activeRouteMarker.value.setLatLng(correctLatLng);
          } else {
            // Fallback to routing control waypoints if available
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

    /**
     * Refreshes all marker positions and forces a map refresh
     * Useful after data changes that affect multiple markers
     */
    function refreshMarkerPositions(): void {
      if (!map.value || !markerClusterGroup.value) return;
      markerClusterGroup.value.refreshClusters();
      forceMapRefresh();
    }

    /**
     * Adds a marker to the map at the specified coordinates
     * In admin mode, the marker will be draggable and emit events when moved
     *
     * @param lat - Latitude for the marker
     * @param lng - Longitude for the marker
     * @param title - Title/tooltip for the marker
     * @returns The created marker or null if the map is not initialized
     */
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

      // If in admin mode, make the marker draggable and set up event handlers
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

    /**
     * Removes a marker from the map
     * If the marker is in the adminMarkers list, it will also emit a marker-removed event
     *
     * @param marker - The marker to remove
     */
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

    /**
     * Centers the map on the specified coordinates with optional zoom level
     *
     * @param lat - Latitude to center on
     * @param lng - Longitude to center on
     * @param zoom - Zoom level (1-19, higher = more zoomed in)
     */
    function centerMap(lat: number, lng: number, zoom: number = 15): void {
      if (!map.value) {
        console.warn("Cannot center map: map not initialized");
        return;
      }

      map.value.setView([lat, lng], zoom);
    }

    /**
     * Shows routing directions from user's location to a specified point
     * Creates a routing control and adds it to the map
     *
     * @param lat - Destination latitude
     * @param lng - Destination longitude
     * @param poiName - Name of the destination POI for display in the directions panel
     */
    function showRouteFor(lat: number, lng: number, poiName: string): void {
      if (!map.value || !props.userLocation) {
        console.warn("Cannot show route: map or user location is not available");
        alert(t('map.need-location') || 'Du må dele din posisjon for å vise veibeskrivelse');
        return;
      }

      clearRouting(); // Clear any existing route

      // Create the routing control with configuration options
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
          container.classList.add('custom-directions-panel');

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

      // Highlight the destination marker with a pulsing effect
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

    /**
     * Clears any active routing directions from the map
     * Removes both the routing control and the destination marker
     */
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

    /**
     * Creates HTML content for POI popups
     * Includes name, type, description, address, opening hours, contact info,
     * and a button to show directions
     *
     * @param poi - The POI object to create popup content for
     * @returns HTML string for the popup content
     */
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

    /**
     * Updates the POI markers on the map based on the provided list
     * Efficiently handles adding new markers, updating existing ones, and removing old ones
     * Optimized for performance with large numbers of markers
     *
     * @param newPois - Array of POIs to display on the map
     */
    function updatePOIs(newPois: POI[]): void {
      // Skip update if map is not ready or zoom level is too low for POIs
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
      const bounds = L.latLngBounds([]);

      // Process the list of POIs provided
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

          // Check if a marker for this POI already exists in our map
          const existingMarker = markersMap.value.get(poi.id) as POIMarker | undefined;

          if (existingMarker) {
            // Update existing marker if needed
            if (existingMarker.poiLat !== lat || existingMarker.poiLng !== lon) {
              existingMarker.setLatLng([lat, lon]);
              existingMarker.poiLat = lat;
              existingMarker.poiLng = lon;
            }

            // Always update content in case details changed
            existingMarker.setPopupContent(createPopupContent(poi));
            existingMarker.setTooltipContent(poi.name);

            // Update icon only if the POI type changed
            if (existingMarker.poiTypeName !== currentPoiTypeName) {
              existingMarker.setIcon(getPoiIcon(currentPoiTypeName));
              existingMarker.poiTypeName = currentPoiTypeName;
            }
          } else {
            // Create new marker
            const marker = L.marker([lat, lon], {
              icon: getPoiIcon(currentPoiTypeName),
              riseOnHover: true,
              bubblingMouseEvents: false,
              zIndexOffset: 100 // Ensure POIs are below user/household markers
            });

            // Bind popup and tooltip
            marker.bindPopup(createPopupContent(poi));
            marker.bindTooltip(poi.name, { permanent: false, direction: 'top', className: 'poi-label' });

            // Store custom properties on the marker for future updates
            const poiMarker = marker as POIMarker;
            poiMarker.poiLat = lat;
            poiMarker.poiLng = lon;
            poiMarker.poiTypeName = currentPoiTypeName;

            // Add to internal tracking and the list to be added to the cluster group
            markersMap.value.set(poi.id, poiMarker);
            markersToAdd.push(poiMarker);
          }

          // Extend bounds for potential manual centering
          bounds.extend([lat, lon]);
        });

        // Remove markers that are no longer in the POI list
        const markersToRemove: L.Marker[] = [];
        markersMap.value.forEach((marker, id) => {
          if (!newPoiIds.has(id)) {
            markersToRemove.push(marker as unknown as L.Marker);
            markersMap.value.delete(id);
          }
        });

        // Perform bulk operations for better performance
        if (markersToRemove.length > 0) {
          markerClusterGroup.value.removeLayers(markersToRemove);
        }
        if (markersToAdd.length > 0) {
          markerClusterGroup.value.addLayers(markersToAdd);
        }
      } else {
        // If the POI list is empty, clear all markers
        markerClusterGroup.value.clearLayers();
        markersMap.value.clear();
      }

      // Include user and household locations in bounds
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
      forceMapRefresh();
    }

    /**
     * Updates the crisis events displayed on the map
     * Creates circles with radius based on event radius and color based on severity level
     * Also adds level badges at the center of each crisis event
     *
     * @param events - Array of crisis events to display
     * @param fit - Whether to fit the map bounds to include all crisis events (default: true)
     */
    function updateCrisisEvents(events: CrisisEvent[], fit: boolean = true): void {
      if (!map.value) {
        console.warn("Cannot update crisis events: map not initialized");
        return;
      }

      // Clear existing crisis events
      clearCrisisEvents();

      // Define styles for different crisis severity levels
      const LEVEL_STYLES: Record<number, { base: string; border: string }> = {
        1: { base: '#81c784', border: '#333333' }, // Low severity (green)
        2: { base: '#ffd54f', border: '#333333' }, // Medium severity (orange)
        3: { base: '#ff5c5c', border: '#333333' }  // High severity (red)
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

    /**
     * Updates the user's current location marker on the map
     * Removes any existing marker and adds a new one at the specified location
     * Also updates any active routing directions to use the new location
     *
     * @param location - The user's location with latitude and longitude
     */
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

    /**
     * Updates the household location marker on the map
     * Removes any existing marker and adds a new one at the specified location
     * Includes a popup with a link to the household page
     *
     * @param location - The household location with latitude and longitude
     */
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

    /**
     * Clears all crisis events from the map
     * Safely removes each layer and resets the crisis layers array
     */
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

    /**
     * Adjusts the map view to fit both the user's location and a POI
     * Useful for showing the relationship between the user and a specific POI
     * Adds padding to ensure markers aren't at the edge of the viewport
     */
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

      // Add 15% padding to the bounds so markers aren't right at the edge
      map.value.fitBounds(bounds.pad(0.15), {
        animate: true,
        duration: 0.5 // Animation duration in seconds
      });
    }

    /**
     * Watch handlers for reactive updates
     * These watchers respond to changes in props and DOM to keep the map in sync
     */

    // Watch for POI data changes to update markers
    watch(() => props.pois, () => {
      if (map.value) scheduleViewportUpdate();
    }, { deep: true, immediate: false });

    // Watch for POI visibility toggle
    watch(() => props.showPois, (visible) => {
      if (!markerClusterGroup.value || !map.value) return;
      if (visible) {
        scheduleViewportUpdate();
      } else {
        map.value.removeLayer(markerClusterGroup.value as unknown as L.Layer);
      }
    }, { immediate: true });

    // Watch for crisis events visibility toggle
    watch(() => props.showCrisis, (visible) => {
      if (visible) {
        updateCrisisEvents(props.crisisEvents, false);
      } else {
        clearCrisisEvents();
      }
    }, { immediate: true });

    // Watch for user location changes to update marker
    watch(() => props.userLocation, (newLocation: UserLocation | null) => {
      if (newLocation) {
        updateUserLocation(newLocation);
      }
    }, { deep: true, immediate: false });

    // Watch for household location changes to update marker
    watch(() => props.householdLocation, (newLocation: UserLocation | null) => {
      if (newLocation) {
        updateHouseholdLocation(newLocation);
      }
    }, { deep: true, immediate: false });

    // Watch for crisis events data changes
    watch(() => props.crisisEvents, (newEvents: CrisisEvent[]) => {
      // Update crisis events without auto-fitting the map
      if (props.showCrisis) updateCrisisEvents(newEvents, false);
    }, { deep: true, immediate: false });

    // Watch for map container width changes to refresh the map
    watch(() => document.getElementById(mapContainerId)?.clientWidth, () => {
      nextTick(() => {
        forceMapRefresh();
      });
    });

    // Watch for map container height changes to refresh the map
    watch(() => document.getElementById(mapContainerId)?.clientHeight, () => {
      nextTick(() => {
        forceMapRefresh();
      });
    });

    // Watch for meeting places visibility toggle
    watch(() => props.showMeetingPlaces, show => {
      if (!meetingLayer.value) return;
      if (show) updateMeetingPlaces(props.meetingPlaces);
      else      meetingLayer.value.clearLayers();
    });

    // Watch for meeting places data changes
    watch(() => props.meetingPlaces, list => {
      if (props.showMeetingPlaces) updateMeetingPlaces(list);
    }, { deep:true });

    /**
     * Cleanup function that runs when the component is unmounted
     * Removes all markers, layers, event listeners, and global functions
     * Prevents memory leaks and ensures proper cleanup
     */
    onBeforeUnmount(() => {
      // Remove global functions from window object
      if ('showRouteFor' in window) {
        (window as any).showRouteFor = undefined;
      }
      if ('closeRouting' in window) {
        (window as any).closeRouting = undefined;
      }

      // Clear active routing
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
        map.value.removeLayer(markerClusterGroup.value as unknown as L.Layer);
        markerClusterGroup.value = null;
      }

      // Remove map instance and event listeners
      if (map.value) {
        map.value.off();
        map.value.remove();
        map.value = null;
      }
    });

    /**
     * Return public properties and methods that can be accessed by the parent component
     */
    return {
      /** Unique ID for the map container element */
      mapContainerId,
      /** Adds a marker to the map at the specified coordinates */
      addMarker,
      /** Removes a marker from the map */
      removeMarker,
      /** Centers the map on the specified coordinates */
      centerMap,
      /** Forces a refresh of the map and all its markers */
      forceMapRefresh,
      /** Adjusts the map view to fit both the user's location and a POI */
      fitBoundsToUserAndPoi,
      /** Reference to the temporary marker (used in admin mode) */
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

/* Ensure the component is not affected by dark mode */
:deep(.not-dark) {
  background-color: white !important; /* Set a light background */
  color: black !important; /* Set text color to black */
}

/* Override any dark mode-specific styles */
:deep(.not-dark .leaflet-container) {
  background-color: white !important;
  color: black !important;
}

:deep(.custom-directions-panel) {
  background-color: #f9f9f9; /* Light background */
  color: #333; /* Dark text */
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

</style>
