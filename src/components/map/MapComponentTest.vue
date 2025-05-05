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

// Import shared types
// Ensure POIMarker includes poiTypeName: string; in src/types/map.ts
import type { POI, UserLocation, CrisisEvent, MarkerMovedEvent, MarkerAddedEvent, MarkerRemovedEvent, POIMarker } from '@/types/map';

// --- Default Leaflet Icon Fix (Using PNGs for non-POI icons) ---
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// --- SVG Icon Imports for POIs (Matching your screenshot) ---
import firestationIconUrl from '@/assets/mapicons/firestation.svg';
import gasstationIconUrl from '@/assets/mapicons/gasstation.svg';
import grocerystoreIconUrl from '@/assets/mapicons/grocerystore.svg';
import hospitalIconUrl from '@/assets/mapicons/hospital.svg';
import meetingpointIconUrl from '@/assets/mapicons/meetingpoint.svg';
import pharmacyIconUrl from '@/assets/mapicons/pharmacy.svg';
import policestationIconUrl from '@/assets/mapicons/policestation.svg';
import shelterIconUrl from '@/assets/mapicons/shelter.svg';
import waterpointIconUrl from '@/assets/mapicons/waterpoint.svg';
// Import home.svg if needed for a specific POI type or as default
import defaultPoiIconUrl from '@/assets/mapicons/home.svg';
// import defaultPoiIconUrl from '@/assets/mapicons/default.svg'; // <<<--- Ensure you have a default.svg or change this

// ----------------------------------------

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

declare global {
  interface Window {
    showRouteFor: (lat: number, lng: number, poiName: string) => void;
    closeRouting: () => void;
  }
}

export default defineComponent({
  name: 'MapComponent',
  props: {
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
    const markersMap = ref<Map<string | number, POIMarker>>(new Map());
    const crisisLayers = ref<L.Layer[]>([]);

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
      'meeting point': meetingpointIconUrl, // Example key, adjust if needed
      'pharmacy': pharmacyIconUrl,
      'police station': policestationIconUrl,
      'shelter': shelterIconUrl,
      'water point': waterpointIconUrl, // Example key, adjust if needed
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

    function getVisiblePois(): POI[] {
      if (!map.value) return [];
      const bounds = map.value.getBounds().pad(0.5);
      return props.pois.filter(poi => {
        const lat = typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude;
        const lng = typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude;
        // Add check for valid numbers before returning
        return isFinite(lat) && isFinite(lng) && bounds.contains([lat, lng]);
      });
    }


    let updateTimeout: number | null = null;
    function scheduleViewportUpdate() {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = window.setTimeout(() => {
        updatePOIs(getVisiblePois());
        updateTimeout = null;
      }, 200);
    }

    onMounted(() => {
      const defaultIconPrototype = L.Icon.Default.prototype as any;
      if (defaultIconPrototype._getIconUrl) delete defaultIconPrototype._getIconUrl;
      L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

      nextTick(() => {
        try {
          const container = document.getElementById(mapContainerId);
          if (!container) { console.error("Map container not found:", mapContainerId); return; }

          map.value = L.map(mapContainerId, { preferCanvas: true, fadeAnimation: false, markerZoomAnimation: false, zoomAnimation: true })
          .setView([props.centerLat, props.centerLon], props.initialZoom);

          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            { maxZoom: 19, attribution: '© OSM © CartoDB', noWrap: false })
          .addTo(map.value);

          const clusterOptions: L.MarkerClusterGroupOptions = {
            spiderfyOnMaxZoom: true, disableClusteringAtZoom: 45, maxClusterRadius: 50,
            removeOutsideVisibleBounds: true, animate: false, animateAddingMarkers: false,
            chunkedLoading: true, chunkInterval: 50, chunkDelay: 10, chunkProgress: undefined,
          };
          markerClusterGroup.value = L.markerClusterGroup(clusterOptions);
          map.value.addLayer(markerClusterGroup.value);

          map.value.on('zoomend moveend', scheduleViewportUpdate);

          if (props.adminMode) map.value.on('click', (e: L.LeafletMouseEvent) => emit('map-clicked', { latlng: e.latlng }));

          window.showRouteFor = (lat: number, lng: number, poiName: string) => showRouteFor(lat, lng, poiName);
          window.closeRouting = () => clearRouting();

          nextTick(() => forceMapRefresh());

          if (props.pois && props.pois.length > 0) nextTick(() => scheduleViewportUpdate());
          if (props.userLocation) updateUserLocation(props.userLocation);
          if (props.householdLocation) updateHouseholdLocation(props.householdLocation);
          if (props.crisisEvents && props.crisisEvents.length > 0) updateCrisisEvents(props.crisisEvents);

        } catch (error) { console.error("Error initializing map:", error); }
      });
    });

    const forceMapRefresh = (): void => {
      if (!map.value) return;
      map.value.invalidateSize({ animate: false });
      if (userMarker.value && props.userLocation) userMarker.value.setLatLng([props.userLocation.latitude, props.userLocation.longitude]);
      if (householdMarker.value && props.householdLocation) householdMarker.value.setLatLng([props.householdLocation.latitude, props.householdLocation.longitude]);
      if (activeRouteMarker.value && routingControl.value) {
        const waypoints = routingControl.value.getWaypoints();
        if (waypoints && waypoints.length >= 2 && waypoints[1].latLng) {
          activeRouteMarker.value.setLatLng(waypoints[1].latLng);
        }
      }
      crisisLayers.value.forEach(layer => {
        if (layer instanceof L.Circle) layer.setLatLng(layer.getLatLng());
        else if (layer instanceof L.Marker) layer.setLatLng(layer.getLatLng());
      });
      if (markerClusterGroup.value) markerClusterGroup.value.refreshClusters();
    };

    function refreshMarkerPositions(): void {
      if (!map.value || !markerClusterGroup.value) return;
      markerClusterGroup.value.refreshClusters();
      forceMapRefresh();
    }

    function addMarker(lat: number, lng: number, title: string = 'New Marker'): L.Marker | null {
      if (!map.value) return null;
      const marker = L.marker([lat, lng], { icon: adminIcon, draggable: props.adminMode, title }).addTo(map.value);
      if (props.adminMode) {
        marker.on('dragend', function(event) {
          const position = event.target.getLatLng();
          emit('marker-moved', { marker: event.target, latlng: { lat: position.lat, lng: position.lng } });
        });
        adminMarkers.value.push(marker);
        emit('marker-added', { marker, latlng: { lat, lng } });
      }
      tempMarker.value = marker;
      return marker;
    }

    function removeMarker(marker: L.Marker): void {
      if (!map.value || !marker) return;
      map.value.removeLayer(marker);
      const index = adminMarkers.value.indexOf(marker);
      if (index > -1) {
        adminMarkers.value.splice(index, 1);
        emit('marker-removed', { marker });
      }
    }

    function centerMap(lat: number, lng: number, zoom: number = 15): void {
      if (!map.value) return;
      map.value.setView([lat, lng], zoom);
    }

    function showRouteFor(lat: number, lng: number, poiName: string): void {
      if (!map.value || !props.userLocation) {
        alert(t('map.need-location') || 'Du må dele din posisjon for å vise veibeskrivelse');
        return;
      }
      clearRouting();
      routingControl.value = L.Routing.control({
        waypoints: [
          { latLng: L.latLng(props.userLocation.latitude, props.userLocation.longitude) },
          { latLng: L.latLng(lat, lng) }
        ],
        lineOptions: { styles: [{color: '#4a89dc', weight: 4}], extendToWaypoints: true, missingRouteTolerance: 0 },
        altLineOptions: { styles: [{color: '#4a89dc', weight: 2, opacity: 0.6}], extendToWaypoints: true, missingRouteTolerance: 0 },
        show: true, collapsible: false, collapsed: false, autoRoute: true, routeWhileDragging: false,
        addWaypoints: false, fitSelectedRoutes: true, showAlternatives: true, useZoomParameter: true,
        draggableWaypoints: false,
        createMarker: () => null,
      }).addTo(map.value);

      routingControl.value.on('routesfound', () => {
        if (!routingControl.value) return;
        const container = routingControl.value.getContainer();
        if (container && !container.querySelector('.routing-title')) {
          const existingBtns = container.querySelectorAll('.leaflet-routing-collapse-btn');
          existingBtns.forEach(btn => btn.remove());
          const titleDiv = document.createElement('div');
          titleDiv.className = 'routing-title';
          titleDiv.innerHTML = `<h3>Veibeskrivelse til ${poiName}</h3><button class="close-routing-btn" onclick="window.closeRouting()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>${translatedStrings.closeDirections}</button>`;
          container.prepend(titleDiv);
        }
      });

      activeRouteMarker.value = L.marker([lat, lng], {
        icon: L.divIcon({ className: 'destination-marker', html: '<div class="destination-marker-inner"></div>', iconSize: [20, 20], iconAnchor: [10, 10] }),
        zIndexOffset: 1000
      }).addTo(map.value);
      if (activeRouteMarker.value) { (activeRouteMarker.value as any).destinationLat = lat; (activeRouteMarker.value as any).destinationLng = lng; }
    }

    function clearRouting(): void {
      if (routingControl.value && map.value) map.value.removeControl(routingControl.value);
      routingControl.value = null;
      if (activeRouteMarker.value) activeRouteMarker.value.remove();
      activeRouteMarker.value = null;
    }

    function createPopupContent(poi: POI): string {
      let html = `<div class="poi-popup"><strong>${poi.name}</strong> (${poi.poiTypeName || 'N/A'})<br>`;
      if (poi.description) html += `${poi.description}<hr>`;
      if (poi.address) html += `<strong>${translatedStrings.address}:</strong> ${poi.address}<br>`;
      if (poi.openingHours) html += `<strong>${translatedStrings.openingHours}:</strong> ${poi.openingHours}<br>`;
      if (poi.contactInfo) html += `<strong>${translatedStrings.contact}:</strong> ${poi.contactInfo}<br>`;
      html += `<button class="directions-btn" onclick="window.showRouteFor(${poi.latitude}, ${poi.longitude}, '${poi.name.replace(/'/g, "\\'").replace(/"/g, '\\"')}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg> ${translatedStrings.showDirections}</button></div>`;
      return html;
    }

    // --- updatePOIs using SVG Icons ---
    function updatePOIs(newPois: POI[]): void {
      if (!map.value || !markerClusterGroup.value) return;
      clearRouting();

      const newPoiIds = new Set<string | number>();
      const markersToAdd: L.Marker[] = [];
      const bounds = L.latLngBounds([]);

      if (newPois && newPois.length > 0) {
        newPois.forEach(poi => {
          if (!poi.latitude || !poi.longitude || !poi.id) return;
          newPoiIds.add(poi.id);

          const lat = typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude;
          const lon = typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude;

          if (!isFinite(lat) || !isFinite(lon)) {
            console.warn(`Invalid coordinates for POI: ${poi.name}`, lat, lon); return;
          }

          const currentPoiTypeName = poi.poiTypeName || 'default'; // Use 'default' if poiTypeName is missing
          if (!poi.poiTypeName) console.warn(`POI ${poi.id || poi.name} is missing poiTypeName. Using default icon.`);

          const existingMarker = markersMap.value.get(poi.id);

          if (existingMarker) {
            if (existingMarker.poiLat !== lat || existingMarker.poiLng !== lon) {
              existingMarker.setLatLng([lat, lon]);
              existingMarker.poiLat = lat; existingMarker.poiLng = lon;
            }
            existingMarker.setPopupContent(createPopupContent(poi));
            existingMarker.setTooltipContent(poi.name);
            if (existingMarker.poiTypeName !== currentPoiTypeName) { // Check if type changed
              existingMarker.setIcon(getPoiIcon(currentPoiTypeName));
              existingMarker.poiTypeName = currentPoiTypeName; // Update stored type
            }
          } else {
            const marker = L.marker([lat, lon], {
              icon: getPoiIcon(currentPoiTypeName), // Use SVG icon function
              riseOnHover: true, bubblingMouseEvents: false, zIndexOffset: 100
            });
            marker.bindPopup(createPopupContent(poi));
            marker.bindTooltip(poi.name, { permanent: false, direction: 'top', className: 'poi-label' });

            const poiMarker = marker as POIMarker;
            poiMarker.poiLat = lat; poiMarker.poiLng = lon;
            poiMarker.poiTypeName = currentPoiTypeName; // Store type name

            markersMap.value.set(poi.id, poiMarker);
            markersToAdd.push(marker);
          }
          bounds.extend([lat, lon]);
        });

        const markersToRemove: L.Marker[] = [];
        markersMap.value.forEach((marker, id) => {
          if (!newPoiIds.has(id)) {
            markersToRemove.push(marker as unknown as L.Marker);
            markersMap.value.delete(id);
          }
        });
        if (markersToRemove.length > 0) markerClusterGroup.value.removeLayers(markersToRemove);
        if (markersToAdd.length > 0) markerClusterGroup.value.addLayers(markersToAdd);

      } else {
        markerClusterGroup.value.clearLayers();
        markersMap.value.clear();
      }

      if (props.userLocation) bounds.extend([props.userLocation.latitude, props.userLocation.longitude]);
      if (props.householdLocation) bounds.extend([props.householdLocation.latitude, props.householdLocation.longitude]);

      forceMapRefresh();

      const hasAnyPoi = markersMap.value.size > 0;
      if (bounds.isValid() && (hasAnyPoi || props.userLocation || props.householdLocation)) {
        nextTick(() => {
          if(map.value) map.value.fitBounds(bounds.pad(0.2), { animate: false, maxZoom: 15 });
          forceMapRefresh();
        });
      } else if (!hasAnyPoi && (props.userLocation || props.householdLocation)) {
        const loc = props.userLocation || props.householdLocation!;
        if(map.value) map.value.setView([loc.latitude, loc.longitude], 13);
      } else if (!hasAnyPoi && map.value) {
        map.value.setView([props.centerLat, props.centerLon], props.initialZoom);
      }
    }

    function updateCrisisEvents(events: CrisisEvent[]): void {
      if (!map.value) return;
      clearCrisisEvents();
      const LEVEL_STYLES: Record<number, { base: string; border: string }> = { 1: { base: '#a6d96a', border: '#333333' }, 2: { base: '#fdae61', border: '#333333' }, 3: { base: '#f46d43', border: '#333333' } };
      const bounds = L.latLngBounds([]);
      const crisisLayerGroup = L.layerGroup();

      events.forEach(event => {
        if (event.isActive === false || event.latitude === undefined || event.longitude === undefined || event.level === undefined) return;
        const lat = typeof event.latitude === 'string' ? parseFloat(event.latitude) : event.latitude;
        const lon = typeof event.longitude === 'string' ? parseFloat(event.longitude) : event.longitude;
        if (!isFinite(lat) || !isFinite(lon)) return;

        const lvl = LEVEL_STYLES[event.level] ? event.level : 3;
        const { base, border } = LEVEL_STYLES[lvl];
        const radiusMeters = event.radius || (lvl * 1); // Default radius based on level if not provided
        //const radiusMeters = radiusKm * 1000; // Convert km to meters for Leaflet circle
        const fillOpacity = 0.4;



        try {
          let popupContent = `<div class="crisis-popup"><h3>${event.name || 'Crisis Event'}</h3>${event.description ? `<p>${event.description}</p>` : ''}<p class="crisis-level level-${lvl}">${t('crisis.level', { lvl })}</p>${event.startTime ? `<p class="crisis-time">${t('crisis.started')}: ${new Date(event.startTime).toLocaleString()}</p>` : ''}<button onclick="window.location.href='/crisis-event?id=${event.id}'" class="crisis-details-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>${t('crisis.view_details') || 'View Crisis Details'}</button></div>`;
          const circle = L.circle([lat, lon], { radius: radiusMeters, fillColor: base, fillOpacity: fillOpacity, color: border, weight: 3, pane: 'overlayPane', bubblingMouseEvents: false });
          circle.bindPopup(popupContent);
          circle.addTo(crisisLayerGroup);
          crisisLayers.value.push(circle);
          const badge = L.marker([lat, lon], { interactive: true, icon: L.divIcon({ className: 'crisis-level-box', html: `<span>${lvl}</span>`, iconSize: [24, 24], iconAnchor: [12, 12] }), pane: 'markerPane', zIndexOffset: 1000 });
          badge.bindPopup(popupContent);
          badge.addTo(crisisLayerGroup);
          crisisLayers.value.push(badge);
          bounds.extend([lat, lon]);
        } catch (error) { console.error("Error adding crisis event:", error); }
      });

      if (map.value && crisisLayerGroup) crisisLayerGroup.addTo(map.value);

      nextTick(() => {
        if (map.value) {
          map.value.invalidateSize({ animate: false });
          if (bounds.isValid() && bounds.getNorthEast().distanceTo(bounds.getSouthWest()) > 0) {
            try { map.value.fitBounds(bounds.pad(0.2), { animate: false, maxZoom: 15, duration: 0 }); }
            catch (error) { console.error("Error fitting bounds:", error); }
          }
          forceMapRefresh();
        }
      });
    }

    function updateUserLocation(location: UserLocation): void {
      if (!map.value) return;
      if (userMarker.value) userMarker.value.remove();
      if (location) {
        userMarker.value = L.marker([location.latitude, location.longitude], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map.value)
        .bindPopup(`<strong>${translatedStrings.yourLocation}</strong>`)
        .bindTooltip(translatedStrings.yourLocation, { permanent: false, direction: 'top', className: 'user-location-label', offset: [0, -30] });
        if (routingControl.value) {
          const waypoints = routingControl.value.getWaypoints();
          if (waypoints && waypoints.length >= 2) {
            waypoints[0].latLng = L.latLng(location.latitude, location.longitude);
            routingControl.value.setWaypoints(waypoints);
          }
        }
      }
    }

    function updateHouseholdLocation(location: UserLocation): void {
      if (!map.value) return;
      if (householdMarker.value) householdMarker.value.remove();
      if (location) {
        const lat = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude;
        const lon = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude;
        if (!isFinite(lat) || !isFinite(lon)) { console.warn('Invalid household coordinates:', location); return; }
        const popupContent = `<div class="household-popup"><strong>${translatedStrings.householdLocation}</strong><hr><button onclick="window.location.href='/household'" class="household-link-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>${t('map.view-household') || 'Go to Household'}</button></div>`;
        householdMarker.value = L.marker([lat, lon], { icon: householdIcon, zIndexOffset: 900 })
        .addTo(map.value)
        .bindPopup(popupContent)
        .bindTooltip(translatedStrings.householdLocation, { permanent: false, direction: 'top', className: 'household-location-label', offset: [0, -30] });
      }
    }

    function clearCrisisEvents(): void {
      if (!map.value) return;
      crisisLayers.value.forEach(layer => {
        try { if (map.value && layer && map.value.hasLayer(layer)) map.value.removeLayer(layer); }
        catch (error) { console.error("Error removing crisis layer:", error); }
      });
      crisisLayers.value = [];
    }

    watch(() => props.pois, () => { if (map.value) scheduleViewportUpdate(); }, { deep: true, immediate: false });
    watch(() => props.userLocation, (newLocation) => { if (newLocation) updateUserLocation(newLocation); }, { deep: true, immediate: false });
    watch(() => props.householdLocation, (newLocation) => { if (newLocation) updateHouseholdLocation(newLocation); }, { deep: true, immediate: false });
    watch(() => props.crisisEvents, (newEvents) => updateCrisisEvents(newEvents), { deep: true, immediate: false });
    watch(() => document.getElementById(mapContainerId)?.clientWidth, () => nextTick(forceMapRefresh));
    watch(() => document.getElementById(mapContainerId)?.clientHeight, () => nextTick(forceMapRefresh));

    onBeforeUnmount(() => {
      if ('showRouteFor' in window) (window as any).showRouteFor = undefined;
      if ('closeRouting' in window) (window as any).closeRouting = undefined;
      clearRouting();
      clearCrisisEvents();
      if (userMarker.value) userMarker.value.remove(); userMarker.value = null;
      if (householdMarker.value) householdMarker.value.remove(); householdMarker.value = null;
      adminMarkers.value.forEach(marker => { if (marker) marker.remove(); }); adminMarkers.value = [];
      if (markerClusterGroup.value && map.value) {
        markerClusterGroup.value.clearLayers();
        map.value.removeLayer(markerClusterGroup.value as unknown as L.Layer);
        markerClusterGroup.value = null;
      }
      if (map.value) { map.value.off(); map.value.remove(); map.value = null; }
    });

    return { mapContainerId, addMarker, removeMarker, centerMap, forceMapRefresh, tempMarker };
  }
});
</script>

<style scoped>
#mapContainer { height: 100%; width: 100%; position: relative; }

/* Style for non-POI default icons */
:deep(.admin-marker-icon) { filter: hue-rotate(90deg); }
:deep(.user-location-icon) { filter: hue-rotate(210deg); }
:deep(.household-location-icon) { filter: hue-rotate(300deg); }

/* Style for SVG POI Icons */
:deep(.poi-svg-icon) {
  background: none; /* Remove default divIcon background */
  border: none; /* Remove default divIcon border */
  /* Add any other base styling for the container div if needed */
}
:deep(.poi-svg-icon img) {
  display: block; /* Prevents potential extra space below image */
  width: 100%;    /* Ensure image fills the container */
  height: 100%;   /* Ensure image fills the container */
}

/* Destination Marker Animation */
:deep(.destination-marker) { background: transparent; }
:deep(.destination-marker-inner) {
  width: 20px; height: 20px; border-radius: 50%; background-color: #4a89dc;
  border: 2px solid white; box-shadow: 0 0 0 2px rgba(74, 137, 220, 0.5), 0 0 10px rgba(0, 0, 0, 0.3);
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(74, 137, 220, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(74, 137, 220, 0); }
  100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(74, 137, 220, 0); }
}

/* Mobile Map Height */
@media (max-width: 768px) { #mapContainer { height: 50vh; } }

/* Popups and Buttons */
:deep(.poi-popup), :deep(.household-popup), :deep(.crisis-popup) { max-width: 280px; }
:deep(.directions-btn), :deep(.household-link-btn), :deep(.crisis-details-btn) {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  color: white; padding: 6px 12px; border-radius: 4px; border: none;
  margin-top: 8px; cursor: pointer; width: 100%;
}
:deep(.directions-btn) { background-color: #4a89dc; }
:deep(.directions-btn:hover) { background-color: #3a79cc; }
:deep(.household-link-btn) { background-color: #6366f1; }
:deep(.household-link-btn:hover) { background-color: #4f46e5; }
:deep(.crisis-details-btn) { background-color: #ef4444; }
:deep(.crisis-details-btn:hover) { background-color: #dc2626; }

/* Routing Panel */
:deep(.routing-title) {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; background-color: #4a89dc; color: white;
  border-top-left-radius: 4px; border-top-right-radius: 4px;
}
:deep(.close-routing-btn) {
  display: flex; align-items: center; gap: 4px; background: none; color: white;
  border: none; cursor: pointer; font-size: 12px; padding: 4px 8px; border-radius: 4px;
}
:deep(.close-routing-btn:hover) { background-color: rgba(255, 255, 255, 0.2); }
:deep(.leaflet-routing-container) { z-index: 999 !important; }

/* Crisis Level Badge */
:deep(.crisis-level-box span) {
  display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;
  background: rgba(0, 0, 0, 0.7); color: #fff; border: 2px solid #fff; border-radius: 4px;
  font-weight: bold; font-size: 0.9rem; text-shadow: 0 0 1px black; pointer-events: none;
}

/* Crisis Popup Styling */
:deep(.crisis-popup h3) { margin-top: 0; font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem; }
:deep(.crisis-popup p) { margin: 0.5rem 0; }
:deep(.crisis-level) { font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-block; }
:deep(.level-1) { background-color: #a6d96a; color: #333; }
:deep(.level-2) { background-color: #fdae61; color: #333; }
:deep(.level-3) { background-color: #f46d43; color: white; }
:deep(.crisis-time) { font-size: 0.9rem; color: #555; }
</style>
