import { ref, onUnmounted, watch, computed } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import { useGeolocationStore } from '@/stores/GeolocationStore'; // Import the new store
import type { UserLocation } from '@/types/map';

// Check if Permissions API is supported
const hasPermissionsAPI = typeof navigator !== 'undefined' && 'permissions' in navigator;

const GEOLOCATION_TIMEOUT = 10000; // 10 seconds timeout
const GEOLOCATION_MAX_AGE = 60000; // Use cached position up to 1 minute old
const GEOLOCATION_HIGH_ACCURACY = true; // Request high accuracy

export function useGeolocation() {
  // --- Instantiate Stores ---
  const userStore = useUserStore();
  const geolocationStore = useGeolocationStore(); // Use the new store

  // --- Local state for the composable ---
  const isWatching = ref(false);
  let watchId: number | null = null;

  // --- Computed Refs reading from Stores ---
  const coords = computed(() => geolocationStore.currentUserLocation); // Read from GeolocationStore
  const error = computed(() => geolocationStore.locationError);       // Read from GeolocationStore
  const isLoading = computed(() => geolocationStore.isLocationLoading); // Read from GeolocationStore
  const status = computed(() => geolocationStore.locationStatus);     // Read from GeolocationStore
  const locationSharingUserPref = computed(() =>
    userStore.profile?.locationSharingEnabled !== false
  );

  // Track browser permission state
  const browserPermissionState = ref<PermissionState | null>(null);

  // Function to check browser's geolocation permission status
  async function checkBrowserPermission(): Promise<PermissionState | null> {
    // If Permissions API isn't supported, use fallback method
    if (!hasPermissionsAPI) {
      // We can't directly check, so try a test location request with minimal timeout
      return new Promise((resolve) => {
        const testTimeout = setTimeout(() => {
          resolve('prompt');
        }, 200);

        try {
          navigator.geolocation.getCurrentPosition(
            () => {
              clearTimeout(testTimeout);
              browserPermissionState.value = 'granted';
              resolve('granted');
            },
            (error) => {
              clearTimeout(testTimeout);
              if (error.code === error.PERMISSION_DENIED) {
                browserPermissionState.value = 'denied';
                resolve('denied');
              } else {
                browserPermissionState.value = 'prompt';
                resolve('prompt');
              }
            },
            { timeout: 100, maximumAge: 0 }
          );
        } catch (e) {
          clearTimeout(testTimeout);
          browserPermissionState.value = null;
          resolve(null);
        }
      });
    }

    // If Permissions API is supported, use it
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      browserPermissionState.value = permissionStatus.state;

      // Set up listener for permission changes
      permissionStatus.addEventListener('change', () => {
        browserPermissionState.value = permissionStatus.state;
      });

      return permissionStatus.state;
    } catch (err) {
      console.error('Error checking geolocation permission:', err);
      return null;
    }
  }

  // Check permission on initialization
  checkBrowserPermission();

  // Computed property that considers both user preference and browser permission
  const canShareLocation = computed(() => {
    // User must be logged in to potentially share location
    if (!userStore.loggedIn) return false;

    const browserState = browserPermissionState.value;
    const userPref = locationSharingUserPref.value; // Use the computed ref for user preference

    if (browserState === 'denied') return false; // Browser blocked
    if (browserState === 'granted') return userPref; // Browser allowed, respect user pref
    if (browserState === 'prompt') return userPref; // Browser will ask, respect user pref for now

    // If permission API not supported or state is unknown, rely solely on user preference
    return userPref;
  });

  // --- Geolocation Options ---
  const options: PositionOptions = {
    enableHighAccuracy: GEOLOCATION_HIGH_ACCURACY,
    timeout: GEOLOCATION_TIMEOUT,
    maximumAge: GEOLOCATION_MAX_AGE,
  };

  // --- Callbacks ---
  function successCallback(position: GeolocationPosition) {
    const newLocation: UserLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    // Update the GEOLOCATION store
    geolocationStore.setLocation({ location: newLocation, status: 'Success', isLoading: false });

    if (browserPermissionState.value === 'prompt') {
      browserPermissionState.value = 'granted';
    }
    // TODO: Send location updates to backend if needed
  }

  function errorCallback(err: GeolocationPositionError) {
    console.error('Geolocation error:', err);
    let statusMessage = 'Error';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        statusMessage = 'Permission Denied';
        browserPermissionState.value = 'denied'; // Update browser permission state
        break;
      case err.POSITION_UNAVAILABLE:
        statusMessage = 'Position Unavailable';
        break;
      case err.TIMEOUT:
        statusMessage = 'Timeout';
        break;
      default:
        statusMessage = 'Unknown Error';
        break;
    }
    // Update the GEOLOCATION store
    geolocationStore.setLocationError({ error: err, status: statusMessage, isLoading: false });

    // Stop watching if permission is permanently denied
    if (err.code === err.PERMISSION_DENIED) {
      stopWatching();
    }
  }

  // --- Control Functions ---
  async function startWatching() {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation is not supported by this browser.');
      geolocationStore.setLocationError({ error: null, status: 'Not Supported', isLoading: false });
      return;
    }

    // Re-check permission if needed (though watcher should handle changes)
    await checkBrowserPermission();

    if (!canShareLocation.value) {
      // Determine specific reason based on browser permission and user pref
      let statusMessage = 'Disabled by User';
      if (browserPermissionState.value === 'denied') {
        statusMessage = 'Permission Denied';
      } else if (!locationSharingUserPref.value) {
        statusMessage = 'Disabled by User'; // Explicitly user pref
      } else if (browserPermissionState.value === 'prompt') {
        statusMessage = 'Permission Required';
      }
      geolocationStore.setLocationError({ error: null, status: statusMessage, isLoading: false });
      return; // Prevent starting the watch if conditions aren't met
    }


    geolocationStore.setLocationLoading(true); // Set loading state in GeolocationStore

    try {
      watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
      isWatching.value = true;
    } catch (err) {
      console.error('Unexpected error starting location watch:', err);
      geolocationStore.setLocationError({
        error: { code: 0, message: 'Unexpected error starting location watch' },
        status: 'Error',
        isLoading: false
      });
    }
  }

  function stopWatching() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      isWatching.value = false;
      geolocationStore.setLocationLoading(false); // Clear loading state
      // Optional: Clear location state when stopping? Or keep last known?
      // geolocationStore.clearLocationState(); // Uncomment to clear on stop
    }
  }

  function resetBrowserPermissionState() {
    browserPermissionState.value = null;

    // Force a fresh check with browser - key change!
    return new Promise((resolve) => {
      // Use a very short-lived request to test real permission state
      navigator.geolocation.getCurrentPosition(
        () => {
          browserPermissionState.value = 'granted';
          resolve('granted');
        },
        (error) => {
          if (error.code === 1) { // PERMISSION_DENIED
            browserPermissionState.value = 'denied';
            resolve('denied');
          } else {
            browserPermissionState.value = 'prompt';
            resolve('prompt');
          }
        },
        { timeout: 1000, maximumAge: 0 } // Force fresh permission check
      );
    });
  }

  function resetGeolocationState() {
    stopWatching();

    // Reset the geolocation store
    geolocationStore.clearLocationState();

    // Re-check permissions to get fresh state
    checkBrowserPermission();
  }



  async function getCurrentLocation(): Promise<UserLocation | null> {
    return new Promise(async (resolve) => {
      // First, clear all state and force a fresh permission check
      await resetBrowserPermissionState();
      if (!('geolocation' in navigator)) {
        console.error('Geolocation is not supported.');
        geolocationStore.setLocationError({ error: null, status: 'Not Supported', isLoading: false });
        resolve(null);
        return;
      }

      // Use the forced check result instead of canShareLocation computed
      const currentPermission = browserPermissionState.value;

      if (currentPermission === 'denied') {
        geolocationStore.setLocationError({
          error: { code: 1, message: 'Permission denied by browser' },
          status: 'Permission Denied',
          isLoading: false
        });
        resolve(null);
        return;
      }

      // We've confirmed browser permission is either granted or prompt
      // Now check user settings only if logged in
      if (userStore.loggedIn && userStore.profile?.locationSharingEnabled === false) {
        geolocationStore.setLocationError({
          error: { code: 1, message: 'Disabled in user settings' },
          status: 'Disabled by User',
          isLoading: false
        });
        resolve(null);
        return;
      }

      // At this point, we've confirmed:
      // 1. Browser permission is not denied
      // 2. If user is logged in, they haven't disabled location
      geolocationStore.setLocationLoading(true);

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            successCallback(position);
            resolve(geolocationStore.currentUserLocation);
          },
          (error) => {
            console.error('Location request failed:', error);
            errorCallback(error);
            resolve(null);
          },
          {
            enableHighAccuracy: GEOLOCATION_HIGH_ACCURACY,
            timeout: GEOLOCATION_TIMEOUT,
            maximumAge: 0 // Force fresh location
          }
        );
      } catch (err) {
        console.error('Unexpected error requesting geolocation:', err);
        geolocationStore.setLocationError({
          error: { code: 0, message: 'Unexpected error requesting geolocation' },
          status: 'Error',
          isLoading: false
        });
        resolve(null);
      }
    });
  }

  // --- Watcher for enabling/disabling based on combined condition ---
  watch(canShareLocation, (enabled, previouslyEnabled) => {
    if (enabled && !isWatching.value) {
    } else if (!enabled && isWatching.value) {
      stopWatching();
      // Optionally clear location state when disabled
      // geolocationStore.clearLocationState();
    }
  }, { immediate: true }); // immediate: true to check on component mount

  onUnmounted(() => {
    stopWatching();
  });

  return {
    coords,             // Computed ref to geolocationStore.currentUserLocation
    error,              // Computed ref to geolocationStore.locationError
    isLoading,          // Computed ref to geolocationStore.isLocationLoading
    status,             // Computed ref to geolocationStore.locationStatus
    isWatching,         // Local ref indicating if watch is active
    canShareLocation,   // Computed ref based on user pref and browser permission
    browserPermissionState, // Expose browser permission state for debugging/UI
    startWatching,      // Method to start the watch
    stopWatching,       // Method to stop the watch
    getCurrentLocation, // Method for one-time fetch
    resetGeolocationState, // Method for reseting geolocation state
    resetBrowserPermissionState
  };
}
