/**
 * Unit Tests for useGeolocation Composable
 *
 * This file contains comprehensive unit tests for the useGeolocation composable,
 * which provides geolocation functionality to the application. The tests verify
 * the composable's ability to track user location, handle permissions, and manage
 * geolocation errors.
 *
 * The useGeolocation composable handles:
 * - Checking browser permissions for geolocation
 * - Starting and stopping location watching
 * - Getting current location
 * - Resetting geolocation state
 * - Managing browser permission state
 *
 * @file useGeolocationUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGeolocation } from '@/composables/useGeolocation'
import { useGeolocationStore } from '@/stores/GeolocationStore'
import { useUserStore } from '@/stores/UserStore'
import type { UserLocation } from '@/types/map'

// Mock Vue composition API
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onUnmounted: vi.fn(),
    ref: vi.fn((val) => ({
      value: val,
    })),
    computed: vi.fn((fn) => ({
      value: fn(),
    })),
    watch: vi.fn(),
  }
})

// Mock the stores
vi.mock('@/stores/GeolocationStore', () => {
  return {
    useGeolocationStore: vi.fn()
  }
})

vi.mock('@/stores/UserStore', () => {
  return {
    useUserStore: vi.fn()
  }
})

// Do not mock useGeolocation - we want to test the real implementation
// Instead, we'll mock its dependencies (navigator.geolocation, navigator.permissions)
// and control the environment

describe('useGeolocation', () => {
  // Mock navigator.geolocation
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  }

  // Mock navigator.permissions
  const mockPermissions = {
    query: vi.fn()
  }

  // Mock permission status
  const mockPermissionStatus = {
    state: 'prompt',
    addEventListener: vi.fn()
  }

  // Store mocks
  const mockGeolocationStore = {
    currentUserLocation: null,
    locationError: null,
    isLocationLoading: false,
    locationStatus: null,
    setLocation: vi.fn(),
    setLocationError: vi.fn(),
    setLocationLoading: vi.fn(),
    clearLocationState: vi.fn(),
    setLocationStatus: vi.fn()
  }

  const mockUserStore = {
    loggedIn: true,
    profile: {
      locationSharingEnabled: true
    }
  }

  beforeEach(() => {
    // Set up Pinia
    setActivePinia(createPinia())

    // Set up fake timers
    vi.useFakeTimers()

    // Reset all mocks
    vi.resetAllMocks()

    // Mock navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    })

    // Mock navigator.permissions
    Object.defineProperty(global.navigator, 'permissions', {
      value: mockPermissions,
      writable: true
    })

    // Set up store mocks
    vi.mocked(useGeolocationStore).mockReturnValue(mockGeolocationStore)
    vi.mocked(useUserStore).mockReturnValue(mockUserStore)

    // Mock permissions query to return a permission status
    mockPermissions.query.mockResolvedValue(mockPermissionStatus)

    // Set up mock implementations for geolocation methods
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      if (mockPermissionStatus.state === 'denied') {
        error?.({
          code: 1,
          message: 'Permission denied',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        } as GeolocationPositionError);
      } else {
        success?.({
          coords: {
            latitude: 10,
            longitude: 20,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        } as GeolocationPosition);
      }
    });

    mockGeolocation.watchPosition.mockImplementation((success, error) => {
      if (mockPermissionStatus.state === 'denied') {
        error?.({
          code: 1,
          message: 'Permission denied',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        } as GeolocationPositionError);
        return 0;
      } else {
        success?.({
          coords: {
            latitude: 10,
            longitude: 20,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        } as GeolocationPosition);
        return 123; // Mock watch ID
      }
    });

    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks()

    // Clean up fake timers
    vi.useRealTimers()
  })


  /**
   * Test: startWatching function when not allowed
   *
   * This test verifies that the startWatching function correctly
   * handles the case when location sharing is not allowed.
   */
  it('should not start watching when location sharing is disabled', async () => {
    // Set up user preference to disable location sharing
    mockUserStore.profile.locationSharingEnabled = false

    // Call the composable
    const { startWatching, isWatching } = useGeolocation()

    // Execute the function
    await startWatching()

    // Verify watchPosition was not called
    expect(mockGeolocation.watchPosition).not.toHaveBeenCalled()

    // Verify error was set
    expect(mockGeolocationStore.setLocationError).toHaveBeenCalled()

    // Verify isWatching remains false
    expect(isWatching.value).toBe(false)
  })


  /**
   * Test: resetGeolocationState function
   *
   * This test verifies that the resetGeolocationState function correctly
   * resets all geolocation state.
   */
  it('should reset geolocation state', async () => {
    // Call the composable
    const { resetGeolocationState } = useGeolocation()

    // Execute the function
    resetGeolocationState()

    // Verify store state was cleared
    expect(mockGeolocationStore.clearLocationState).toHaveBeenCalled()
  })


  /**
   * Test: getCurrentLocation function when not allowed
   *
   * This test verifies that the getCurrentLocation function correctly
   * handles the case when location sharing is not allowed.
   */
  it('should not get location when browser permission is denied', async () => {
    // Set up permission as denied
    mockPermissionStatus.state = 'denied'
    mockPermissions.query.mockResolvedValue(mockPermissionStatus)

    // Call the composable
    const { getCurrentLocation } = useGeolocation()

    // Execute the function with a shorter timeout
    const location = await getCurrentLocation()

    // Advance timers to resolve any pending promises
    vi.runAllTimers()

    // In the real implementation, getCurrentPosition is called to check permission
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()

    // Verify error was set
    expect(mockGeolocationStore.setLocationError).toHaveBeenCalled()

    // Verify null was returned
    expect(location).toBeNull()
  }, 10000)

})
