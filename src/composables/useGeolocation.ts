// src/composables/useGeolocation.ts
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
  const locationSharingUserPref = computed(() => userStore); // Read preference from UserStore

  // Track browser permission state
  const browserPermissionState = ref<PermissionState | null>(null);

  // Function to check browser's geolocation permission status
  async function checkBrowserPermission(): Promise<PermissionState | null> {
    if (!hasPermissionsAPI) return null;

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      console.log('Geolocation permission status:', permissionStatus.state);
      browserPermissionState.value = permissionStatus.state;

      // Set up listener for permission changes
      permissionStatus.addEventListener('change', () => {
        console.log('Geolocation permission changed to:', permissionStatus.state);
        browserPermissionState.value = permissionStatus.state;
        // Optionally re-evaluate watching state if permission changes
        // if (isWatching.value && browserPermissionState.value !== 'granted') {
        //   stopWatching();
        // } else if (!isWatching.value && canShareLocation.value) {
        //   startWatching(); // Or prompt user
        // }
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
    console.log('Geolocation success:', position);
    const newLocation: UserLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    // Update the GEOLOCATION store
    geolocationStore.setLocation({ location: newLocation, status: 'Success', isLoading: false });

    if (browserPermissionState.value === 'prompt') {
      console.log('Updating browser permission state to granted based on successful geolocation');
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
      console.log(`Cannot start watching: ${statusMessage}`);
      geolocationStore.setLocationError({ error: null, status: statusMessage, isLoading: false });
      return; // Prevent starting the watch if conditions aren't met
    }


    if (watchId !== null) {
      console.log('Already watching location.');
      return;
    }

    console.log('Starting location watch...');
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
      console.log('Stopping location watch...');
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      isWatching.value = false;
      geolocationStore.setLocationLoading(false); // Clear loading state
      // Optional: Clear location state when stopping? Or keep last known?
      // geolocationStore.clearLocationState(); // Uncomment to clear on stop
    }
  }

  async function getCurrentLocation(): Promise<UserLocation | null> {
    return new Promise(async (resolve) => {
      if (!('geolocation' in navigator)) {
        console.error('Geolocation is not supported.');
        geolocationStore.setLocationError({ error: null, status: 'Not Supported', isLoading: false });
        resolve(null);
        return;
      }

      await checkBrowserPermission(); // Check permission state

      if (!canShareLocation.value) {
        let statusMessage = 'Disabled by User';
        if (browserPermissionState.value === 'denied') {
          statusMessage = 'Permission Denied';
        } else if (!locationSharingUserPref.value) {
          statusMessage = 'Disabled by User';
        } else if (browserPermissionState.value === 'prompt') {
          statusMessage = 'Permission Required';
        }
        console.log(`Cannot get current location: ${statusMessage}`);
        geolocationStore.setLocationError({ error: null, status: statusMessage, isLoading: false });
        resolve(null); // Cannot get location if not allowed
        return;
      }


      console.log('Requesting current location...');
      geolocationStore.setLocationLoading(true);

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            successCallback(position); // Updates store
            resolve(geolocationStore.currentUserLocation); // Resolve with location from store
          },
          (error) => {
            errorCallback(error); // Updates store
            resolve(null);
          },
          // Use slightly different options for one-time fetch? Maybe shorter timeout?
          { ...options, timeout: 8000 }
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
    console.log(`Effective location sharing capability changed: ${previouslyEnabled} -> ${enabled}`);
    if (enabled && !isWatching.value) {
      // Optional: Automatically start watching when enabled?
      // Consider if you want this behavior or require manual start.
      // startWatching();
      console.log("Location sharing possible, watching can now be started/resumed.");
    } else if (!enabled && isWatching.value) {
      console.log("Location sharing no longer possible, stopping watch.");
      stopWatching();
      // Optionally clear location state when disabled
      // geolocationStore.clearLocationState();
    }
  }, { immediate: true }); // immediate: true to check on component mount


  // --- Cleanup ---
  onUnmounted(() => {
    stopWatching();
  });

  // --- Return reactive state and methods ---
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
  };
}
