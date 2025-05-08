/**
 * GeolocationStore Unit Tests
 *
 * This file contains comprehensive unit tests for the GeolocationStore, which is responsible
 * for managing geolocation state in the application. The tests verify the store's functionality
 * including initialization, location updates, error handling, and status management.
 *
 * The GeolocationStore handles:
 * - Storing the current user location coordinates
 * - Managing geolocation errors
 * - Tracking loading state during geolocation requests
 * - Providing user-friendly status message
 *
 * @file GeolocationStoreUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGeolocationStore } from '@/stores/GeolocationStore.ts'
import type { UserLocation } from '@/types/map'

/**
 * Main test suite for the GeolocationStore
 *
 * This suite contains all tests related to the GeolocationStore functionality.
 * Each nested describe block focuses on a specific aspect of the store's behavior.
 */
describe('GeolocationStore', () => {
  /**
   * Test Setup
   *
   * Before each test:
   * 1. Create a fresh Pinia instance to ensure tests are isolated
   */
  beforeEach(() => {
    // Create a fresh Pinia instance and make it active
    setActivePinia(createPinia())
  })

  /**
   * Test Teardown
   *
   * After each test, ensure a clean state for the next test.
   */
  afterEach(() => {
    // Clean up after each test
  })

  /**
   * Helper function to create a mock UserLocation
   *
   * This function generates a user location object with default values
   * that can be used across multiple tests for consistency.
   *
   * @param latitude - The latitude coordinate
   * @param longitude - The longitude coordinate
   * @returns A UserLocation object with the specified coordinates
   */
  const createMockLocation = (latitude: number, longitude: number): UserLocation => ({
    latitude,
    longitude
  })

  /**
   * Initialization Tests
   *
   * These tests verify the initial state of the store.
   * The store should initialize with default values for all state properties.
   */
  describe('Initialization', () => {
    /**
     * Test: Default State Initialization
     *
     * Verifies that the store initializes with the expected default values for all state properties.
     * This ensures that the store has a consistent starting point when first created.
     */
    it('should initialize with default state', () => {
      const store = useGeolocationStore()
      expect(store.currentUserLocation).toBeNull()
      expect(store.locationError).toBeNull()
      expect(store.isLocationLoading).toBe(false)
      expect(store.locationStatus).toBeNull()
    })
  })

  /**
   * Location Management Tests
   *
   * These tests verify the behavior of the location management functions.
   * The store should correctly update location data and related state.
   */
  describe('Location Management', () => {
    /**
     * Test: Setting Location
     *
     * Verifies that the setLocation function correctly updates the location state.
     */
    it('should set location', () => {
      const store = useGeolocationStore()
      const mockLocation = createMockLocation(37.7749, -122.4194)

      store.setLocation({
        location: mockLocation,
        status: 'Success',
        isLoading: false
      })

      expect(store.currentUserLocation).toEqual(mockLocation)
      expect(store.locationStatus).toBe('Success')
      expect(store.isLocationLoading).toBe(false)
      expect(store.locationError).toBeNull()
    })

    /**
     * Test: Setting Location Status
     *
     * Verifies that the setLocationStatus function correctly updates the status state.
     */
    it('should set location status', () => {
      const store = useGeolocationStore()
      const status = 'Acquiring location...'

      store.setLocationStatus(status)

      expect(store.locationStatus).toBe(status)
    })

    /**
     * Test: Setting Location Error
     *
     * Verifies that the setLocationError function correctly updates the error state.
     */
    it('should set location error', () => {
      const store = useGeolocationStore()
      const mockError = {
        code: 1,
        message: 'Permission denied'
      }

      store.setLocationError({
        error: mockError,
        status: 'Permission Denied',
        isLoading: false
      })

      expect(store.locationError).toEqual(mockError)
      expect(store.locationStatus).toBe('Permission Denied')
      expect(store.isLocationLoading).toBe(false)
      expect(store.currentUserLocation).toBeNull()
    })

    /**
     * Test: Setting Location Loading
     *
     * Verifies that the setLocationLoading function correctly updates the loading state.
     */
    it('should set location loading', () => {
      const store = useGeolocationStore()

      store.setLocationLoading(true)

      expect(store.isLocationLoading).toBe(true)
      expect(store.locationStatus).toBe('Loading')
      expect(store.locationError).toBeNull()

      store.setLocationLoading(false)

      expect(store.isLocationLoading).toBe(false)
      // Note: setLocationLoading doesn't change locationStatus when setting to false
    })

    /**
     * Test: Clearing Location State
     *
     * Verifies that the clearLocationState function correctly resets all location state.
     */
    it('should clear location state', () => {
      const store = useGeolocationStore()
      const mockLocation = createMockLocation(37.7749, -122.4194)

      // First set some state
      store.setLocation({
        location: mockLocation,
        status: 'Success',
        isLoading: false
      })

      // Then clear it
      store.clearLocationState()

      expect(store.currentUserLocation).toBeNull()
      expect(store.locationError).toBeNull()
      expect(store.isLocationLoading).toBe(false)
      expect(store.locationStatus).toBeNull()
    })
  })

  /**
   * Error Handling Tests
   *
   * These tests verify the behavior of the error handling functions.
   * The store should correctly handle different types of geolocation errors.
   */
  describe('Error Handling', () => {
    /**
     * Test: Handling GeolocationPositionError
     *
     * Verifies that the setLocationError function correctly handles GeolocationPositionError objects.
     */
    it('should handle GeolocationPositionError', () => {
      const store = useGeolocationStore()
      const mockGeolocationError = {
        code: 1,
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      } as GeolocationPositionError

      store.setLocationError({
        error: mockGeolocationError,
        status: 'Permission Denied',
        isLoading: false
      })

      expect(store.locationError).toEqual({
        code: 1,
        message: 'User denied geolocation'
      })
      expect(store.locationStatus).toBe('Permission Denied')
      expect(store.isLocationLoading).toBe(false)
      expect(store.currentUserLocation).toBeNull()
    })

    /**
     * Test: Handling Simplified Error Object
     *
     * Verifies that the setLocationError function correctly handles simplified error objects.
     */
    it('should handle simplified error object', () => {
      const store = useGeolocationStore()
      const mockError = {
        code: 2,
        message: 'Position unavailable'
      }

      store.setLocationError({
        error: mockError,
        status: 'Position Unavailable',
        isLoading: false
      })

      expect(store.locationError).toEqual(mockError)
      expect(store.locationStatus).toBe('Position Unavailable')
      expect(store.isLocationLoading).toBe(false)
      expect(store.currentUserLocation).toBeNull()
    })

    /**
     * Test: Clearing Error on Success
     *
     * Verifies that the setLocation function correctly clears any existing error.
     */
    it('should clear error when setting location', () => {
      const store = useGeolocationStore()
      const mockError = {
        code: 1,
        message: 'Permission denied'
      }
      const mockLocation = createMockLocation(37.7749, -122.4194)

      // First set an error
      store.setLocationError({
        error: mockError,
        status: 'Permission Denied',
        isLoading: false
      })

      // Then set a location
      store.setLocation({
        location: mockLocation,
        status: 'Success',
        isLoading: false
      })

      expect(store.locationError).toBeNull()
      expect(store.currentUserLocation).toEqual(mockLocation)
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the store in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Setting Null Location
     *
     * Verifies that the setLocation function correctly handles null location values.
     */
    it('should handle null location', () => {
      const store = useGeolocationStore()

      store.setLocation({
        location: null,
        status: 'Location Cleared',
        isLoading: false
      })

      expect(store.currentUserLocation).toBeNull()
      expect(store.locationStatus).toBe('Location Cleared')
      expect(store.isLocationLoading).toBe(false)
    })

    /**
     * Test: Setting Null Error
     *
     * Verifies that the setLocationError function correctly handles null error values.
     */
    it('should handle null error', () => {
      const store = useGeolocationStore()

      store.setLocationError({
        error: null,
        status: 'Error Cleared',
        isLoading: false
      })

      expect(store.locationError).toBeNull()
      expect(store.locationStatus).toBe('Error Cleared')
      expect(store.isLocationLoading).toBe(false)
    })

    /**
     * Test: Setting Null Status
     *
     * Verifies that the setLocationStatus function correctly handles null status values.
     */
    it('should handle null status', () => {
      const store = useGeolocationStore()

      store.setLocationStatus(null)

      expect(store.locationStatus).toBeNull()
    })
  })

  /**
   * Console Logging Tests
   *
   * These tests verify that the store's actions log appropriate messages to the console.
   */
  describe('Console Logging', () => {
    /**
     * Test: Logging When Setting Location
     *
     * Verifies that the setLocation function logs appropriate messages to the console.
     */
    it('should log when setting location', () => {
      const store = useGeolocationStore()
      const mockLocation = createMockLocation(37.7749, -122.4194)
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.setLocation({
        location: mockLocation,
        status: 'Success',
        isLoading: false
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'GeolocationStore: Setting location',
        expect.objectContaining({
          location: mockLocation,
          status: 'Success',
          isLoading: false
        })
      )

      consoleSpy.mockRestore()
    })

    /**
     * Test: Logging When Setting Location Status
     *
     * Verifies that the setLocationStatus function logs appropriate messages to the console.
     */
    it('should log when setting location status', () => {
      const store = useGeolocationStore()
      const status = 'Acquiring location...'
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.setLocationStatus(status)

      expect(consoleSpy).toHaveBeenCalledWith(
        'GeolocationStore: Setting location status',
        status
      )

      consoleSpy.mockRestore()
    })

    /**
     * Test: Logging When Setting Location Error
     *
     * Verifies that the setLocationError function logs appropriate messages to the console.
     */
    it('should log when setting location error', () => {
      const store = useGeolocationStore()
      const mockError = {
        code: 1,
        message: 'Permission denied'
      }
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.setLocationError({
        error: mockError,
        status: 'Permission Denied',
        isLoading: false
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'GeolocationStore: Setting location error',
        expect.objectContaining({
          error: mockError,
          status: 'Permission Denied',
          isLoading: false
        })
      )

      consoleSpy.mockRestore()
    })

    /**
     * Test: Logging When Setting Location Loading
     *
     * Verifies that the setLocationLoading function logs appropriate messages to the console.
     */
    it('should log when setting location loading', () => {
      const store = useGeolocationStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.setLocationLoading(true)

      expect(consoleSpy).toHaveBeenCalledWith(
        'GeolocationStore: Setting loading state',
        true
      )

      consoleSpy.mockRestore()
    })

    /**
     * Test: Logging When Clearing Location State
     *
     * Verifies that the clearLocationState function logs appropriate messages to the console.
     */
    it('should log when clearing location state', () => {
      const store = useGeolocationStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.clearLocationState()

      expect(consoleSpy).toHaveBeenCalledWith(
        'GeolocationStore: Clearing location state'
      )

      consoleSpy.mockRestore()
    })
  })
})
