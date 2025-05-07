import * as L from 'leaflet';
import type { PoiData } from '@/models/PoiData';

export interface POI {
  id?: string | number;
  name: string;
  poiTypeName: string;
  poiTypeId?: number;
  description?: string;
  address?: string;
  openingHours?: string;
  contactInfo?: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface CrisisEvent {
  id?: number | string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  level: number;
  radius: number;
  startTime: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkerMovedEvent {
  marker: L.Marker;
  latlng: { lat: number; lng: number };
}

export interface MarkerAddedEvent {
  marker: L.Marker;
  latlng: { lat: number; lng: number };
}

export interface MarkerRemovedEvent {
  marker: L.Marker;
}

// Custom marker with POI coordinates
export interface POIMarker extends L.Marker {
  poiLat: number;
  poiLng: number;
}

// Make TypeScript recognize these Leaflet extensions
declare global {
  namespace L {
    // MarkerClusterGroup options
    interface MarkerClusterGroupOptions {
      spiderfyOnMaxZoom?: boolean;
      disableClusteringAtZoom?: number;
      maxClusterRadius?: number;
      removeOutsideVisibleBounds?: boolean;
      animate?: boolean;
      animateAddingMarkers?: boolean;
      chunkedLoading?: boolean;
      zoomToBoundsOnClick?: boolean;
      showCoverageOnHover?: boolean;
      iconCreateFunction?: (cluster: any) => L.DivIcon;
    }

    // MarkerClusterGroup
    interface MarkerClusterGroup extends L.FeatureGroup {
      addLayer(layer: L.Layer): this;
      addLayers(layers: L.Layer[]): this;
      removeLayers(layers: L.Layer[]): this;
      clearLayers(): this;
      refreshClusters(): this;
      hasLayer(layer: L.Layer): boolean;
      getVisibleParent(marker: L.Layer): L.Layer;
      spiderfy(): this;
      unspiderfy(): this;
    }

    function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;

    // Routing namespace
    namespace Routing {
      interface LineOptions {
        styles?: Array<{
          color?: string;
          weight?: number;
          opacity?: number;
        }>;
        extendToWaypoints: boolean;
        missingRouteTolerance: number;
      }

      interface Waypoint {
        latLng: L.LatLng;
        name?: string;
        options?: any;
      }

      interface RoutingControlOptions {
        /** now optional, matching the original DT type */
        waypoints?: Waypoint[] | L.LatLng[];
        lineOptions?: LineOptions;
        altLineOptions?: LineOptions;
        show?: boolean;
        collapsible?: boolean;
        collapsed?: boolean;
        autoRoute?: boolean;
        routeWhileDragging?: boolean;
        addWaypoints?: boolean;
        fitSelectedRoutes?: boolean;
        showAlternatives?: boolean;
        useZoomParameter?: boolean;
        draggableWaypoints?: boolean;
        createMarker?: (i: number, waypoint: Waypoint, n: number) => L.Marker | null;
      }

      interface Control {
        new(options: RoutingControlOptions): Control;
        addTo(map: L.Map): this;
        on(event: string, fn: (e: any) => void): this;
        getContainer(): HTMLElement;
        getWaypoints(): Waypoint[];
        setWaypoints(waypoints: Waypoint[]): this;
        spliceWaypoints(index: number, waypointsToRemove: number, ...waypoints: Waypoint[]): this;
      }
    }

    // Fix for Default icon
    namespace Icon {
      interface Default {
        prototype: {
          _getIconUrl?: string;
          [key: string]: any;
        };
      }
    }
  }
}

// Export a compatibility helper to convert PoiData to POI
export function convertPoiData(poiData: PoiData): POI {
  return {
    id: poiData.id,
    name: poiData.name,
    poiTypeName: poiData.poiTypeName,
    poiTypeId: poiData.poiTypeId,
    description: poiData.description || undefined,
    address: poiData.address || undefined,
    //openingHours: poiData.openingHours || undefined,
    contactInfo: poiData.contactInfo || undefined,
    latitude: typeof poiData.latitude === 'string'
      ? parseFloat(poiData.latitude)
      : poiData.latitude,
    longitude: typeof poiData.longitude === 'string'
      ? parseFloat(poiData.longitude)
      : poiData.longitude,
    createdAt: poiData.createdAt,
    updatedAt: poiData.updatedAt
  };
}
