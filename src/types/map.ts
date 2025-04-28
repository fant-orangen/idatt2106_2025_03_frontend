// src/types/map.ts
import * as L from 'leaflet';

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
  latitude: number;
  longitude: number;
  level: number;
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

// Make TypeScript recognize these Leaflet extensions
declare global {
  namespace L {
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

    function markerClusterGroup(options?: any): MarkerClusterGroup;

    // Routing namespace
    namespace Routing {
      interface RoutingControlOptions {
        waypoints: L.LatLng[];
        lineOptions?: {
          styles?: any[];
          extendToWaypoints?: boolean;
          missingRouteTolerance?: number;
        };
        altLineOptions?: {
          styles?: any[];
          extendToWaypoints?: boolean;
          missingRouteTolerance?: number;
        };
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
        createMarker?: Function;
      }

      interface Control {
        new(options: RoutingControlOptions): Control;
        addTo(map: L.Map): Control;
        on(event: string, fn: Function): Control;
        getContainer(): HTMLElement;
        getWaypoints(): any[];
        setWaypoints(waypoints: any[]): Control;
        spliceWaypoints(index: number, waypointsToRemove: number, ...wayPoints: any[]): Control;
      }
    }

    // Fix for Default icon
    namespace Icon {
      interface Default {
        prototype: any;
      }
    }
  }
}

// Export a compatibility helper to convert PoiData to POI
export function convertPoiData(poiData: any): POI {
  return {
    id: poiData.id,
    name: poiData.name,
    poiTypeName: poiData.poiTypeName,
    poiTypeId: poiData.poiTypeId,
    description: poiData.description || undefined,
    address: poiData.address || undefined,
    openingHours: poiData.openingHours || undefined,
    contactInfo: poiData.contactInfo || undefined,
    latitude: typeof poiData.latitude === 'string' ? parseFloat(poiData.latitude) : poiData.latitude,
    longitude: typeof poiData.longitude === 'string' ? parseFloat(poiData.longitude) : poiData.longitude,
    createdAt: poiData.createdAt,
    updatedAt: poiData.updatedAt
  };
}
