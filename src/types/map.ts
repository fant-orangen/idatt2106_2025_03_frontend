import * as L from 'leaflet';
import type { PoiData } from '@/models/PoiData';

/**
 * A generalized representation of a point of interest on the map.
 */
export interface POI {
  /** Unique identifier for the POI */
  id?: string | number;
  /** Name of the POI */
  name: string;
  /** Human-readable type name (e.g. "Hospital", "Grocery Store") */
  poiTypeName: string;
  /** Numeric type identifier (matches backend poi_types.id) */
  poiTypeId?: number;
  /** Detailed description of the POI */
  description?: string;
  /** Street address or description of the location */
  address?: string;
  /** Opening hours as a single formatted string (e.g. "08:00 – 17:00") */
  openingHours?: string;
  /** Raw opening time (from backend open_from) */
  openingFrom?: string;
  /** Raw closing time (from backend open_to) */
  openingTo?: string;
  /** Contact information (phone, email, etc.) */
  contactInfo?: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Timestamp when the POI was created */
  createdAt?: string;
  /** Timestamp when the POI was last updated */
  updatedAt?: string;
}

/**
 * Represents the user's location on the map.
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * Representation of a crisis event to display on the map.
 */
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

/** Emitted when an admin marker is moved */
export interface MarkerMovedEvent {
  marker: L.Marker;
  latlng: { lat: number; lng: number };
}

/** Emitted when an admin marker is added */
export interface MarkerAddedEvent {
  marker: L.Marker;
  latlng: { lat: number; lng: number };
}

/** Emitted when an admin marker is removed */
export interface MarkerRemovedEvent {
  marker: L.Marker;
}

/**
 * Extension of Leaflet's Marker to hold POI-specific metadata.
 */
export interface POIMarker extends L.Marker {
  poiLat: number;
  poiLng: number;
  poiTypeName: string;
}

// Make TypeScript recognize Leaflet MarkerCluster and Routing extensions
declare global {
  namespace L {
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

    namespace Routing {
      interface LineOptions {
        styles?: Array<{ color?: string; weight?: number; opacity?: number }>;
        extendToWaypoints: boolean;
        missingRouteTolerance: number;
      }

      interface Waypoint {
        latLng: L.LatLng;
        name?: string;
        options?: any;
      }

      interface RoutingControlOptions {
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
        new (options: RoutingControlOptions): Control;
        addTo(map: L.Map): this;
        on(event: string, fn: (e: any) => void): this;
        getContainer(): HTMLElement;
        getWaypoints(): Waypoint[];
        setWaypoints(waypoints: Waypoint[]): this;
        spliceWaypoints(index: number, waypointsToRemove: number, ...waypoints: Waypoint[]): this;
      }
    }

    namespace Icon {
      interface Default {
        prototype: { _getIconUrl?: string; [key: string]: any };
      }
    }
  }
}

/**
 * Converts a backend PoiData object into our POI interface.
 *
 * This will populate both the raw openingFrom/openingTo fields and
 * a human-readable openingHours string when available.
 */
export function convertPoiData(poiData: PoiData): POI {
  // Extract raw time windows (snake_case or camelCase)
  const from = poiData.openFrom ?? (poiData as any).openFrom;
  const to   = poiData.openTo   ?? (poiData as any).openTo;

  // Build a display string if we have any information
  const openingHours = from && to
    ? `${from} – ${to}`
    : from
      ? `From ${from}`
      : to
        ? `Until ${to}`
        : undefined;

  return {
    id: poiData.id,
    name: poiData.name,
    poiTypeName: poiData.poiTypeName,
    poiTypeId: poiData.poiTypeId,
    description: poiData.description || undefined,
    address: poiData.address || undefined,
    openingFrom: from,
    openingTo: to,
    openingHours,
    contactInfo: poiData.contactInfo || (poiData as any).contactInfo,
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
