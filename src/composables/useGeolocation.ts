// src/composables/useGeolocation.ts
import { ref, onUnmounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore' // Import UserStore
import type { UserLocation } from '@/types/map'

const GEOLOCATION_TIMEOUT = 10000 // 10 seconds timeout
const GEOLOCATION_MAX_AGE = 60000 // Use cached position up to 1 minute old
const GEOLOCATION_HIGH_ACCURACY = true // Request high accuracy

export function useGeolocation() {
  const userStore = useUserStore() // Use the Pinia store

  // --- Local state for the composable ---
  const isWatching = ref(false)
  let watchId: number | null = null

  // --- Computed Refs reading from Store ---
  const coords = computed(() => userStore.currentUserLocation)
  const error = computed(() => userStore.locationError)
  const isLoading = computed(() => userStore.isLocationLoading)
  const status = computed(() => userStore.locationStatus)
  // Assuming locationSharingEnabled is part of the user profile or settings in UserStore
  // If not, you'll need to add it to UserStore first.
  // For this example, let's assume it's available like this:
  const canShareLocation = computed(() => userStore.profile?.locationSharingEnabled ?? false)

  // --- Geolocation Options ---
  const options: PositionOptions = {
    enableHighAccuracy: GEOLOCATION_HIGH_ACCURACY,
    timeout: GEOLOCATION_TIMEOUT,
    maximumAge: GEOLOCATION_MAX_AGE
  }

  // --- Callbacks ---
  function successCallback(position: GeolocationPosition) {
    console.log('Geolocation success:', position)
    const newLocation: UserLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }
    // Update the central store
    userStore.setLocation({ location: newLocation, status: 'Success', isLoading: false })

    // TODO: If needed, implement logic to send location updates to the backend here
    // Example: sendLocationUpdate(newLocation);
  }

  function errorCallback(err: GeolocationPositionError) {
    console.error('Geolocation error:', err)
    let statusMessage = 'Error'
    switch (err.code) {
      case err.PERMISSION_DENIED:
        statusMessage = 'Permission Denied'
        break
      case err.POSITION_UNAVAILABLE:
        statusMessage = 'Position Unavailable'
        break
      case err.TIMEOUT:
        statusMessage = 'Timeout'
        break
      default:
        statusMessage = 'Unknown Error'
        break
    }
    // Update the central store
    userStore.setLocationError({ error: err, status: statusMessage, isLoading: false })

    // Stop watching if permission is denied permanently
    if (err.code === err.PERMISSION_DENIED) {
      stopWatching()
    }
  }

  // --- Control Functions ---
  function startWatching() {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation is not supported by this browser.')
      userStore.setLocationError({
        error: null,
        status: 'Not Supported',
        isLoading: false
      })
      return
    }

    if (!canShareLocation.value) {
      console.log('Location sharing not enabled by user.')
      userStore.setLocationError({ error: null, status: 'Disabled by User', isLoading: false })
      // Optionally clear location if sharing is turned off
      // userStore.setLocation({ location: null, status: 'Disabled by User', isLoading: false });
      return
    }

    if (watchId !== null) {
      console.log('Already watching location.')
      return
    }

    console.log('Starting location watch...')
    userStore.setLocationLoading(true) // Set loading state in store
    watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options)
    isWatching.value = true
  }

  function stopWatching() {
    if (watchId !== null) {
      console.log('Stopping location watch...')
      navigator.geolocation.clearWatch(watchId)
      watchId = null
      isWatching.value = false
      userStore.setLocationLoading(false) // Clear loading state
      // Decide if you want to clear the location or keep the last known
      // userStore.setLocation({ location: null, status: 'Stopped', isLoading: false });
    }
  }

  async function getCurrentLocation(): Promise<UserLocation | null> {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        console.error('Geolocation is not supported.')
        userStore.setLocationError({ error: null, status: 'Not Supported', isLoading: false })
        resolve(null)
        return
      }

      if (!canShareLocation.value) {
        console.log('Location sharing not enabled.')
        userStore.setLocationError({ error: null, status: 'Disabled by User', isLoading: false })
        resolve(null)
        return
      }

      console.log('Requesting current location...')
      userStore.setLocationLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          successCallback(position) // Updates store via successCallback
          resolve(userStore.currentUserLocation) // Resolve with location from store
        },
        (error) => {
          errorCallback(error) // Updates store via errorCallback
          resolve(null)
        },
        // Use slightly different options for one-time fetch? Maybe shorter timeout?
        { ...options, timeout: 8000 }
      )
    })
  }

  // --- Watcher for enabling/disabling ---
  watch(canShareLocation, (enabled) => {
    if (enabled && !isWatching.value) {
      // Optionally auto-start watching when enabled, or require manual start
      // startWatching();
      console.log("Location sharing enabled, watching can now be started.")
    } else if (!enabled && isWatching.value) {
      stopWatching()
      // Optionally clear location when disabled
      userStore.setLocation({ location: null, status: 'Disabled by User', isLoading: false });
    }
  })

  // --- Cleanup ---
  onUnmounted(() => {
    stopWatching()
  })

  // --- Return reactive state and methods ---
  return {
    coords, // Read-only computed ref from store
    error, // Read-only computed ref from store
    isLoading, // Read-only computed ref from store
    status, // Read-only computed ref from store
    isWatching, // Local state indicating if watch is active
    canShareLocation, // Read-only computed ref from store
    startWatching, // Method to start the watch
    stopWatching, // Method to stop the watch
    getCurrentLocation // Method for one-time fetch
  }
}
