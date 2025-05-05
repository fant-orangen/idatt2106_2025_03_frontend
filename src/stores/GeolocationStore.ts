// src/stores/GeolocationStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserLocation } from '@/types/map';

/**
 * Defines and exports the geolocation store for global location state management.
 * This store manages the current user location, loading status, and errors
 * related to fetching geolocation data. It's primarily updated by the
 * `useGeolocation` composable.
 */
export const useGeolocationStore = defineStore('geolocation', () => {
  // --- Geolocation State ---

  /**
   * Stores the latest successfully retrieved user location coordinates.
   * Updated by the `useGeolocation` composable via the `setLocation` action.
   */
  const currentUserLocation = ref<UserLocation | null>(null);

  /**
   * Stores the last geolocation error encountered. Simplified to code and message.
   * Updated by the `useGeolocation` composable via the `setLocationError` action.
   */
  const locationError = ref<{ code: number; message: string } | null>(null);

  /**
   * Boolean flag indicating if a geolocation request is currently in progress.
   * Managed by the `setLocationLoading`, `setLocation`, and `setLocationError` actions.
   */
  const isLocationLoading = ref(false);

  /**
   * User-friendly string indicating the current status of geolocation attempts.
   * (e.g., 'Loading', 'Success', 'Permission Denied', 'Disabled by User', 'Not Supported', 'Error').
   * Managed by the `setLocationLoading`, `setLocation`, and `setLocationError` actions.
   */
  const locationStatus = ref<string | null>(null);

  // --- Geolocation State Actions (intended to be called by useGeolocation composable) ---

  /**
   * Updates the store with a successfully retrieved location.
   * @param payload - Object containing the location, status message, and loading state.
   */
  function setLocation(payload: {
    location: UserLocation | null;
    status: string | null;
    isLoading: boolean;
  }) {
    console.log('GeolocationStore: Setting location', payload);
    currentUserLocation.value = payload.location;
    locationStatus.value = payload.status;
    isLocationLoading.value = payload.isLoading;
    locationError.value = null; // Clear error on success/status update
  }

  /**
   * Updates the store when a geolocation error occurs.
   * @param payload - Object containing the error, status message, and loading state.
   */
  function setLocationError(payload: {
    error: GeolocationPositionError | { code: number; message: string } | null;
    status: string | null;
    isLoading: boolean;
  }) {
    console.log('GeolocationStore: Setting location error', payload);
    // Store a simplified version of the error for easier handling
    locationError.value = payload.error
      ? { code: payload.error.code, message: payload.error.message }
      : null;
    locationStatus.value = payload.status;
    isLocationLoading.value = payload.isLoading;
    currentUserLocation.value = null; // Clear location on error
  }

  /**
   * Sets the loading state for geolocation requests.
   * @param loading - Boolean indicating if loading is active.
   */
  function setLocationLoading(loading: boolean) {
    console.log('GeolocationStore: Setting loading state', loading);
    isLocationLoading.value = loading;
    if (loading) {
      locationStatus.value = 'Loading'; // Set status when loading starts
      locationError.value = null; // Clear previous errors
    }
  }

  /**
   * Clears all geolocation state. Called usually on logout.
   */
  function clearLocationState() {
    console.log('GeolocationStore: Clearing location state');
    currentUserLocation.value = null;
    locationError.value = null;
    isLocationLoading.value = false;
    locationStatus.value = null;
  }


  // --- Store Interface ---
  return {
    // State
    currentUserLocation,
    locationError,
    isLocationLoading,
    locationStatus,

    // Actions
    setLocation,
    setLocationError,
    setLocationLoading,
    clearLocationState,
  };
});
