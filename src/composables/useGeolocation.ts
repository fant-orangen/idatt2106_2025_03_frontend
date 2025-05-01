// src/composables/useGeolocation.ts
import { ref, onUnmounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore' // Import UserStore
import type { UserLocation } from '@/types/map'

// Check if Permissions API is supported
const hasPermissionsAPI = typeof navigator !== 'undefined' && 'permissions' in navigator

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

  // Track browser permission state
  const browserPermissionState = ref<PermissionState | null>(null)

  // Function to check browser's geolocation permission status
  async function checkBrowserPermission(): Promise<PermissionState | null> {
    if (!hasPermissionsAPI) return null

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      console.log('Geolocation permission status:', permissionStatus.state)
      browserPermissionState.value = permissionStatus.state

      // Set up listener for permission changes
      permissionStatus.addEventListener('change', () => {
        console.log('Geolocation permission changed to:', permissionStatus.state)
        browserPermissionState.value = permissionStatus.state
      })

      return permissionStatus.state
    } catch (err) {
      console.error('Error checking geolocation permission:', err)
      return null
    }
  }

  // Check permission on initialization
  checkBrowserPermission()

  // Computed property that considers both user preference and browser permission
  const canShareLocation = computed(() => {
    // If browser explicitly granted permission, allow regardless of user preference
    if (browserPermissionState.value === 'granted') return true

    // If browser explicitly denied permission, disallow regardless of user preference
    if (browserPermissionState.value === 'denied') return false

    // For Chrome, when permission is "prompt", we'll be more permissive
    // and allow the actual geolocation API call to determine if permission is granted
    if (browserPermissionState.value === 'prompt') {
      // If user has explicitly enabled location sharing, return true
      if (userStore.profile?.locationSharingEnabled) return true

      // Otherwise, we'll still return false, but our modified functions will
      // attempt to get location anyway when permission state is "prompt"
      return false
    }

    // Otherwise, fall back to user preference
    return userStore.profile?.locationSharingEnabled ?? false
  })

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

    // If we successfully got location but permission state was "prompt",
    // update it to "granted" for future reference
    if (browserPermissionState.value === 'prompt') {
      console.log('Updating browser permission state to granted based on successful geolocation')
      browserPermissionState.value = 'granted'
    }

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
  async function startWatching() {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation is not supported by this browser.')
      userStore.setLocationError({
        error: null,
        status: 'Not Supported',
        isLoading: false
      })
      return
    }

    // Re-check browser permission before proceeding
    if (hasPermissionsAPI) {
      await checkBrowserPermission()
    }

    // For Chrome, we need to handle the case where permission is manually set but still shows as "prompt"
    // Only return early if permission is explicitly denied or user has disabled location sharing
    if (!canShareLocation.value) {
      console.log('Location sharing not enabled.')

      // If browser permission is "prompt", we'll try to watch location anyway
      // This handles Chrome's behavior where manually set permissions still show as "prompt"
      if (browserPermissionState.value === 'prompt') {
        console.log('Browser permission is prompt, attempting to watch location anyway...')
        // Continue with location watching - don't return early
      } else {
        // Provide more specific error message based on browser permission state
        let statusMessage = 'Disabled by User'
        if (browserPermissionState.value === 'denied') {
          statusMessage = 'Permission Denied'
        } else if (browserPermissionState.value === 'prompt') {
          statusMessage = 'Permission Required'
        }

        userStore.setLocationError({ error: null, status: statusMessage, isLoading: false })
        return
      }
    }

    if (watchId !== null) {
      console.log('Already watching location.')
      return
    }

    console.log('Starting location watch...')
    userStore.setLocationLoading(true) // Set loading state in store

    try {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          console.log('Watch position update received')
          successCallback(position)
        },
        (error) => {
          console.error('Geolocation error in watchPosition:', error)

          // Check if we need to update browser permission state based on error
          if (error.code === error.PERMISSION_DENIED && browserPermissionState.value !== 'denied') {
            console.log('Updating browser permission state to denied based on error')
            browserPermissionState.value = 'denied'
          }

          errorCallback(error)
        },
        options
      )
      isWatching.value = true
    } catch (err) {
      console.error('Unexpected error starting location watch:', err)
      userStore.setLocationError({
        error: { code: 0, message: 'Unexpected error starting location watch' },
        status: 'Error',
        isLoading: false
      })
    }
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
    return new Promise(async (resolve) => {
      if (!('geolocation' in navigator)) {
        console.error('Geolocation is not supported.')
        userStore.setLocationError({ error: null, status: 'Not Supported', isLoading: false })
        resolve(null)
        return
      }

      // Re-check browser permission before proceeding
      if (hasPermissionsAPI) {
        await checkBrowserPermission()
      }

      // For Chrome, we need to handle the case where permission is manually set but still shows as "prompt"
      // Only return early if permission is explicitly denied or user has disabled location sharing
      if (!canShareLocation.value) {
        console.log('Location sharing not enabled.')

        // If browser permission is "prompt", we'll try to get location anyway
        // This handles Chrome's behavior where manually set permissions still show as "prompt"
        if (browserPermissionState.value === 'prompt') {
          console.log('Browser permission is prompt, attempting to get location anyway...')
          // Continue with location request - don't return early
        } else {
          // Provide more specific error message based on browser permission state
          let statusMessage = 'Disabled by User'
          if (browserPermissionState.value === 'denied') {
            statusMessage = 'Permission Denied'
          } else if (browserPermissionState.value === 'prompt') {
            statusMessage = 'Permission Required'
          }

          userStore.setLocationError({ error: null, status: statusMessage, isLoading: false })
          resolve(null)
          return
        }
      }

      console.log('Requesting current location...')
      userStore.setLocationLoading(true)

      // Try to get location with a more robust approach
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Position obtained successfully')
            successCallback(position) // Updates store via successCallback
            resolve(userStore.currentUserLocation) // Resolve with location from store
          },
          (error) => {
            console.error('Geolocation error in getCurrentPosition:', error)

            // Check if we need to update browser permission state based on error
            if (error.code === error.PERMISSION_DENIED && browserPermissionState.value !== 'denied') {
              console.log('Updating browser permission state to denied based on error')
              browserPermissionState.value = 'denied'
            }

            errorCallback(error) // Updates store via errorCallback
            resolve(null)
          },
          // Use slightly different options for one-time fetch? Maybe shorter timeout?
          { ...options, timeout: 8000 }
        )
      } catch (err) {
        console.error('Unexpected error requesting geolocation:', err)
        userStore.setLocationError({
          error: { code: 0, message: 'Unexpected error requesting geolocation' },
          status: 'Error',
          isLoading: false
        })
        resolve(null)
      }
    })
  }

  // --- Watcher for enabling/disabling ---
  watch(canShareLocation, (enabled) => {
    if (enabled && !isWatching.value) {
      // Optionally auto-start watching when enabled, or require manual start
      startWatching();
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
