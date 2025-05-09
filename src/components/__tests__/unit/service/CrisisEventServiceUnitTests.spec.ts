/**
 * CrisisEventService Unit Tests
 *
 * This file contains comprehensive unit tests for the CrisisEventService, which is responsible
 * for crisis event-related operations including:
 * - Fetching all crisis events
 * - Fetching active crisis events
 * - Fetching crisis event previews
 * - Searching for crisis events
 * - Fetching crisis event details and changes
 * - Converting between backend and frontend data models
 *
 * The tests verify the service's functionality including:
 * - Retrieving crisis events with proper filtering and mapping
 * - Handling pagination for crisis event lists
 * - Searching for crisis events by name
 * - Fetching crisis event details and changes
 * - Error handling for various scenarios
 *
 * @file CrisisEventServiceUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { AxiosResponse } from 'axios'
import * as crisisEventService from '@/services/CrisisEventService.ts'
import type { CrisisEvent } from '@/types/map'
import type { Page } from '@/types/Page'
import type { BackendCrisisEvent } from '@/models/BackendCrisisEvent'
import type { CrisisEventDto, CrisisEventPreviewDto, CrisisEventChange } from '@/models/CrisisEvent.ts'

// Helper function to create a proper AxiosResponse object
function createAxiosResponse<T = any>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: { headers: {} } as any
  }
}

// Mock the AxiosInstance
vi.mock('@/services/api/AxiosInstance.ts', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))
import api from '@/services/api/AxiosInstance.ts'

/**
 * Helper function to create a mock BackendCrisisEvent
 *
 * @param id - The unique identifier for the crisis event
 * @param isActive - Whether the crisis event is active
 * @returns A BackendCrisisEvent object with default test values
 */
const createMockBackendCrisisEvent = (id: number, isActive: boolean = true): BackendCrisisEvent => ({
  id,
  name: `Crisis Event ${id}`,
  description: `Description for crisis event ${id}`,
  epicenterLatitude: 63.4305 + (id * 0.01),
  epicenterLongitude: 10.3951 + (id * 0.01),
  radius: 5000 + (id * 100),
  severity: id % 3 === 0 ? 'red' : (id % 3 === 1 ? 'yellow' : 'green'),
  startTime: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  active: isActive,
  createdByUser: {
    id: 100 + id,
    email: `user${id}@example.com`
  }
})

/**
 * Helper function to create a mock CrisisEvent (frontend model)
 *
 * @param id - The unique identifier for the crisis event
 * @param isActive - Whether the crisis event is active
 * @returns A CrisisEvent object with default test values
 */
const createMockCrisisEvent = (id: number, isActive: boolean = true): CrisisEvent => {
  const level = id % 3 === 0 ? 3 : (id % 3 === 1 ? 2 : 1);
  return {
    id,
    name: `Crisis Event ${id}`,
    description: `Description for crisis event ${id}`,
    latitude: 63.4305 + (id * 0.01),
    longitude: 10.3951 + (id * 0.01),
    radius: 5000 + (id * 100),
    level,
    startTime: new Date().toISOString(),
    isActive,
    createdBy: `User ${100 + id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Helper function to create a mock CrisisEventPreviewDto
 *
 * @param id - The unique identifier for the crisis event preview
 * @param isActive - Whether the crisis event is active
 * @returns A CrisisEventPreviewDto object with default test values
 */
const createMockCrisisEventPreviewDto = (id: number, isActive: boolean = true): CrisisEventPreviewDto => ({
  id,
  name: `Crisis Event ${id}`,
  description: `Description for crisis event ${id}`,
  severity: id % 3 === 0 ? 'red' : (id % 3 === 1 ? 'yellow' : 'green'),
  startTime: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive
})

/**
 * Helper function to create a mock CrisisEventDto
 *
 * @param id - The unique identifier for the crisis event
 * @param isActive - Whether the crisis event is active
 * @returns A CrisisEventDto object with default test values
 */
const createMockCrisisEventDto = (id: number, isActive: boolean = true): CrisisEventDto => ({
  id,
  name: `Crisis Event ${id}`,
  description: `Description for crisis event ${id}`,
  epicenterLatitude: 63.4305 + (id * 0.01),
  epicenterLongitude: 10.3951 + (id * 0.01),
  radius: 5000 + (id * 100),
  severity: id % 3 === 0 ? 'red' : (id % 3 === 1 ? 'yellow' : 'green'),
  startTime: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive,
  createdByUser: {
    id: 100 + id,
    email: `user${id}@example.com`
  }
})

/**
 * Helper function to create a mock CrisisEventChange
 *
 * @param id - The unique identifier for the crisis event change
 * @param crisisEventId - The ID of the associated crisis event
 * @returns A CrisisEventChange object with default test values
 */
const createMockCrisisEventChange = (id: number, crisisEventId: number): CrisisEventChange => ({
  id,
  crisisEventId,
  changeTime: new Date().toISOString(),
  changedBy: {
    id: 200 + id,
    email: `admin${id}@example.com`
  },
  changeType: id % 2 === 0 ? 'UPDATE' : 'CREATE',
  fieldName: id % 3 === 0 ? 'description' : (id % 3 === 1 ? 'radius' : 'severity'),
  oldValue: `Old value ${id}`,
  newValue: `New value ${id}`
})

/**
 * Helper function to create a mock Page of items
 *
 * @param items - The items to include in the page
 * @param page - The page number
 * @param size - The page size
 * @param total - The total number of elements
 * @returns A Page object containing the provided items
 */
const createMockPage = <T>(items: T[], page: number = 0, size: number = 20, total: number = items.length): Page<T> => ({
  content: items,
  totalElements: total,
  totalPages: Math.ceil(total / size),
  size,
  number: page,
  first: page === 0,
  last: (page + 1) * size >= total,
  empty: items.length === 0
})

/**
 * Main test suite for the CrisisEventService
 *
 * This suite contains all tests related to the CrisisEventService functionality.
 * Each nested describe block focuses on a specific aspect of the service's behavior.
 */
describe('CrisisEventService', () => {
  /**
   * Test Setup
   *
   * Before each test:
   * 1. Reset all mocks to clear any previous mock calls or implementations
   */
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
  })

  /**
   * Test Teardown
   *
   * After each test, reset all mocks to ensure a clean state for the next test.
   */
  afterEach(() => {
    vi.resetAllMocks()
  })

  /**
   * fetchAllCrisisEvents Tests
   *
   * These tests verify the behavior of the fetchAllCrisisEvents function.
   */
  describe('fetchAllCrisisEvents', () => {
    /**
     * Test: Successful Crisis Events Retrieval with Default Pagination
     *
     * Verifies that the fetchAllCrisisEvents function correctly retrieves crisis events
     * using the default pagination parameters and maps them to the frontend model.
     */
    it('should retrieve all crisis events with default pagination', async () => {
      // Create mock data
      const mockBackendEvents: BackendCrisisEvent[] = [
        createMockBackendCrisisEvent(1, true),
        createMockBackendCrisisEvent(2, false),
        createMockBackendCrisisEvent(3, true)
      ]
      const mockPage = createMockPage(mockBackendEvents)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchAllCrisisEvents()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/all', {
        params: undefined,
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result is properly mapped
      expect(result.content.length).toBe(3)
      expect(result.content[0].id).toBe(1)
      expect(result.content[0].isActive).toBe(true)
      expect(result.content[1].id).toBe(2)
      expect(result.content[1].isActive).toBe(false)
    })

    /**
     * Test: Successful Crisis Events Retrieval with Custom Pagination
     *
     * Verifies that the fetchAllCrisisEvents function correctly retrieves crisis events
     * using custom pagination parameters.
     */
    it('should retrieve all crisis events with custom pagination', async () => {
      // Create mock data
      const customPage = 2
      const customSize = 5
      const mockBackendEvents: BackendCrisisEvent[] = [
        createMockBackendCrisisEvent(11, true),
        createMockBackendCrisisEvent(12, false)
      ]
      const mockPage = createMockPage(mockBackendEvents, customPage, customSize, 15)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchAllCrisisEvents({ page: customPage, size: customSize })

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/all', {
        params: { page: customPage, size: customSize },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result is properly mapped and pagination is preserved
      expect(result.content.length).toBe(2)
      expect(result.number).toBe(customPage)
      expect(result.size).toBe(customSize)
      expect(result.totalElements).toBe(15)
    })

    /**
     * Test: Filtering Invalid Coordinates
     *
     * Verifies that the fetchAllCrisisEvents function correctly filters out events
     * with invalid coordinates.
     */
    it('should filter out events with invalid coordinates', async () => {
      // Create mock data with one invalid event
      const validEvent1 = createMockBackendCrisisEvent(1, true)
      const validEvent2 = createMockBackendCrisisEvent(2, true)

      const invalidEvent = createMockBackendCrisisEvent(3, true)
      invalidEvent.epicenterLatitude = NaN

      const mockBackendEvents = [validEvent1, invalidEvent, validEvent2]
      const mockPage = createMockPage(mockBackendEvents)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchAllCrisisEvents()

      // Verify only valid events are included
      expect(result.content.length).toBe(2)
      expect(result.content[0].id).toBe(1)
      expect(result.content[1].id).toBe(2)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchAllCrisisEvents function correctly handles errors
     * from the API and returns an empty page.
     */
    it('should handle errors when retrieving all crisis events', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch crisis events'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Call the service method
      const result = await crisisEventService.fetchAllCrisisEvents()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/all', {
        params: undefined,
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result is an empty page
      expect(result.content).toEqual([])
      expect(result.empty).toBe(true)
    })
  })

  /**
   * fetchActiveCrisisEvents Tests
   *
   * These tests verify the behavior of the fetchActiveCrisisEvents function.
   */
  describe('fetchActiveCrisisEvents', () => {
    /**
     * Test: Successful Active Crisis Events Retrieval
     *
     * Verifies that the fetchActiveCrisisEvents function correctly retrieves
     * only active crisis events.
     */
    it('should retrieve only active crisis events', async () => {
      // Create mock data with both active and inactive events
      const mockBackendEvents: BackendCrisisEvent[] = [
        createMockBackendCrisisEvent(1, true),
        createMockBackendCrisisEvent(2, false),
        createMockBackendCrisisEvent(3, true)
      ]
      const mockPage = createMockPage(mockBackendEvents)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchActiveCrisisEvents()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/all', {
        params: { size: 200 },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify only active events are returned
      expect(result.length).toBe(2)
      expect(result[0].id).toBe(1)
      expect(result[0].isActive).toBe(true)
      expect(result[1].id).toBe(3)
      expect(result[1].isActive).toBe(true)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchActiveCrisisEvents function correctly handles errors
     * from the API and returns an empty array.
     */
    it('should handle errors when retrieving active crisis events', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch active crisis events'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Call the service method
      const result = await crisisEventService.fetchActiveCrisisEvents()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/all', {
        params: { size: 200 },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result is an empty array
      expect(result).toEqual([])
    })
  })

  /**
   * fetchAllPreviewCrisisEvents Tests
   *
   * These tests verify the behavior of the fetchAllPreviewCrisisEvents function.
   */
  describe('fetchAllPreviewCrisisEvents', () => {
    /**
     * Test: Successful Crisis Event Previews Retrieval with Default Pagination
     *
     * Verifies that the fetchAllPreviewCrisisEvents function correctly retrieves
     * crisis event previews using the default pagination parameters.
     */
    it('should retrieve all crisis event previews with default pagination', async () => {
      // Create mock data
      const mockPreviews: CrisisEventPreviewDto[] = [
        createMockCrisisEventPreviewDto(1, true),
        createMockCrisisEventPreviewDto(2, false),
        createMockCrisisEventPreviewDto(3, true)
      ]
      const mockPage = createMockPage(mockPreviews)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchAllPreviewCrisisEvents()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/all/previews', {
        params: { page: 0, size: 10 },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.content.length).toBe(3)
    })

    /**
     * Test: Successful Crisis Event Previews Retrieval with Custom Pagination
     *
     * Verifies that the fetchAllPreviewCrisisEvents function correctly retrieves
     * crisis event previews using custom pagination parameters.
     */
    it('should retrieve all crisis event previews with custom pagination', async () => {
      // Create mock data
      const customPage = 2
      const customSize = 5
      const mockPreviews: CrisisEventPreviewDto[] = [
        createMockCrisisEventPreviewDto(11, true),
        createMockCrisisEventPreviewDto(12, false)
      ]
      const mockPage = createMockPage(mockPreviews, customPage, customSize, 15)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchAllPreviewCrisisEvents(customPage, customSize)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/all/previews', {
        params: { page: customPage, size: customSize },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.number).toBe(customPage)
      expect(result.size).toBe(customSize)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchAllPreviewCrisisEvents function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving all crisis event previews', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch paginated crisis events'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(crisisEventService.fetchAllPreviewCrisisEvents()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/all/previews', {
        params: { page: 0, size: 10 },
        headers: { 'Content-Type': 'application/json' }
      })
    })
  })

  /**
   * fetchInactivePreviewCrisisEvents Tests
   *
   * These tests verify the behavior of the fetchInactivePreviewCrisisEvents function.
   */
  describe('fetchInactivePreviewCrisisEvents', () => {
    /**
     * Test: Successful Inactive Crisis Event Previews Retrieval with Default Pagination
     *
     * Verifies that the fetchInactivePreviewCrisisEvents function correctly retrieves
     * inactive crisis event previews using the default pagination parameters.
     */
    it('should retrieve inactive crisis event previews with default pagination', async () => {
      // Create mock data
      const mockPreviews: CrisisEventPreviewDto[] = [
        createMockCrisisEventPreviewDto(1, false),
        createMockCrisisEventPreviewDto(2, false)
      ]
      const mockPage = createMockPage(mockPreviews)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchInactivePreviewCrisisEvents()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/inactive/previews', {
        params: { page: 0, size: 10 },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.content.length).toBe(2)
    })

    /**
     * Test: Successful Inactive Crisis Event Previews Retrieval with Custom Pagination
     *
     * Verifies that the fetchInactivePreviewCrisisEvents function correctly retrieves
     * inactive crisis event previews using custom pagination parameters.
     */
    it('should retrieve inactive crisis event previews with custom pagination', async () => {
      // Create mock data
      const customPage = 2
      const customSize = 5
      const mockPreviews: CrisisEventPreviewDto[] = [
        createMockCrisisEventPreviewDto(11, false),
        createMockCrisisEventPreviewDto(12, false)
      ]
      const mockPage = createMockPage(mockPreviews, customPage, customSize, 15)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchInactivePreviewCrisisEvents(customPage, customSize)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/inactive/previews', {
        params: { page: customPage, size: customSize },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.number).toBe(customPage)
      expect(result.size).toBe(customSize)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchInactivePreviewCrisisEvents function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving inactive crisis event previews', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch paginated crisis events'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(crisisEventService.fetchInactivePreviewCrisisEvents()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/inactive/previews', {
        params: { page: 0, size: 10 },
        headers: { 'Content-Type': 'application/json' }
      })
    })
  })

  /**
   * fetchCrisisEventsInRadius Tests
   *
   * These tests verify the behavior of the fetchCrisisEventsInRadius function.
   */
  describe('fetchCrisisEventsInRadius', () => {
    /**
     * Test: Successful Crisis Events in Radius Retrieval with Default Pagination
     *
     * Verifies that the fetchCrisisEventsInRadius function correctly retrieves
     * crisis events within the user's radius using the default pagination parameters.
     */
    it('should retrieve crisis events in radius with default pagination', async () => {
      // Create mock data
      const mockPreviews: CrisisEventPreviewDto[] = [
        createMockCrisisEventPreviewDto(1, true),
        createMockCrisisEventPreviewDto(2, true)
      ]
      const mockPage = createMockPage(mockPreviews)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchCrisisEventsInRadius()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/crisis-events/all/current-user', {
        params: { page: 0, size: 5 },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.content.length).toBe(2)
    })

    /**
     * Test: Successful Crisis Events in Radius Retrieval with Custom Pagination
     *
     * Verifies that the fetchCrisisEventsInRadius function correctly retrieves
     * crisis events within the user's radius using custom pagination parameters.
     */
    it('should retrieve crisis events in radius with custom pagination', async () => {
      // Create mock data
      const customPage = 2
      const customSize = 10
      const mockPreviews: CrisisEventPreviewDto[] = [
        createMockCrisisEventPreviewDto(11, true),
        createMockCrisisEventPreviewDto(12, true)
      ]
      const mockPage = createMockPage(mockPreviews, customPage, customSize, 25)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchCrisisEventsInRadius(customPage, customSize)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/crisis-events/all/current-user', {
        params: { page: customPage, size: customSize },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.number).toBe(customPage)
      expect(result.size).toBe(customSize)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchCrisisEventsInRadius function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving crisis events in radius', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch paginated crisis events'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(crisisEventService.fetchCrisisEventsInRadius()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/crisis-events/all/current-user', {
        params: { page: 0, size: 5 },
        headers: { 'Content-Type': 'application/json' }
      })
    })
  })

  /**
   * fetchCrisisEventById Tests
   *
   * These tests verify the behavior of the fetchCrisisEventById function.
   */
  describe('fetchCrisisEventById', () => {
    /**
     * Test: Successful Crisis Event Retrieval by ID
     *
     * Verifies that the fetchCrisisEventById function correctly retrieves
     * a crisis event by its ID.
     */
    it('should retrieve a crisis event by ID successfully', async () => {
      // Create mock data
      const eventId = 1
      const mockEvent = createMockCrisisEventDto(eventId, true)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockEvent))

      // Call the service method
      const result = await crisisEventService.fetchCrisisEventById(eventId)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith(`/public/crisis-events/${eventId}`)

      // Verify the result matches the mock response
      expect(result).toEqual(mockEvent)
      expect(result?.id).toBe(eventId)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchCrisisEventById function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving a crisis event by ID', async () => {
      // Create mock data
      const eventId = 1
      const errorMessage = `Failed to fetch crisis event ID ${eventId}`

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(crisisEventService.fetchCrisisEventById(eventId)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith(`/public/crisis-events/${eventId}`)
    })
  })

  /**
   * searchCrisisEvents Tests
   *
   * These tests verify the behavior of the searchCrisisEvents function.
   */
  describe('searchCrisisEvents', () => {
    /**
     * Test: Successful Crisis Events Search with Default Parameters
     *
     * Verifies that the searchCrisisEvents function correctly searches for crisis events
     * using the default parameters.
     */
    it('should search for crisis events with default parameters', async () => {
      // Create mock data
      const query = 'flood'
      const mockPreviews: CrisisEventPreviewDto[] = [
        createMockCrisisEventPreviewDto(1, true),
        createMockCrisisEventPreviewDto(2, true)
      ]
      const mockPage = createMockPage(mockPreviews)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.searchCrisisEvents(query)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/search', {
        params: {
          nameSearch: query,
          isActive: true,
          page: 0,
          size: 10
        },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.content.length).toBe(2)
    })

    /**
     * Test: Successful Crisis Events Search with Custom Parameters
     *
     * Verifies that the searchCrisisEvents function correctly searches for crisis events
     * using custom parameters.
     */
    it('should search for crisis events with custom parameters', async () => {
      // Create mock data
      const query = 'earthquake'
      const customPage = 2
      const customSize = 5
      const isActive = false
      const mockPreviews: CrisisEventPreviewDto[] = [
        createMockCrisisEventPreviewDto(11, false),
        createMockCrisisEventPreviewDto(12, false)
      ]
      const mockPage = createMockPage(mockPreviews, customPage, customSize, 15)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.searchCrisisEvents(query, customPage, customSize, isActive)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/search', {
        params: {
          nameSearch: query,
          isActive,
          page: customPage,
          size: customSize
        },
        headers: { 'Content-Type': 'application/json' }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.number).toBe(customPage)
      expect(result.size).toBe(customSize)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the searchCrisisEvents function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when searching for crisis events', async () => {
      // Create mock data
      const query = 'tsunami'
      const errorMessage = 'Failed to search crisis events'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(crisisEventService.searchCrisisEvents(query)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/crisis-events/search', {
        params: {
          nameSearch: query,
          isActive: true,
          page: 0,
          size: 10
        },
        headers: { 'Content-Type': 'application/json' }
      })
    })
  })

  /**
   * fetchCrisisEventChanges Tests
   *
   * These tests verify the behavior of the fetchCrisisEventChanges function.
   */
  describe('fetchCrisisEventChanges', () => {
    /**
     * Test: Successful Crisis Event Changes Retrieval
     *
     * Verifies that the fetchCrisisEventChanges function correctly retrieves
     * changes for a crisis event.
     */
    it('should retrieve crisis event changes successfully', async () => {
      // Create mock data
      const crisisEventId = 1
      const page = 0
      const mockChanges: CrisisEventChange[] = [
        createMockCrisisEventChange(1, crisisEventId),
        createMockCrisisEventChange(2, crisisEventId)
      ]
      const mockPage = createMockPage(mockChanges)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchCrisisEventChanges(crisisEventId, page)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith(`/public/crisis-events/${crisisEventId}/changes`, {
        params: { page, size: 5 }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockChanges)
      expect(result.content.length).toBe(2)
    })

    /**
     * Test: Successful Crisis Event Changes Retrieval with Custom Size
     *
     * Verifies that the fetchCrisisEventChanges function correctly retrieves
     * changes for a crisis event with a custom page size.
     */
    it('should retrieve crisis event changes with custom size', async () => {
      // Create mock data
      const crisisEventId = 1
      const page = 2
      const size = 10
      const mockChanges: CrisisEventChange[] = [
        createMockCrisisEventChange(11, crisisEventId),
        createMockCrisisEventChange(12, crisisEventId)
      ]
      const mockPage = createMockPage(mockChanges, page, size, 25)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchCrisisEventChanges(crisisEventId, page, size)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith(`/public/crisis-events/${crisisEventId}/changes`, {
        params: { page, size }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockChanges)
      expect(result.number).toBe(page)
      expect(result.size).toBe(size)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchCrisisEventChanges function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving crisis event changes', async () => {
      // Create mock data
      const crisisEventId = 1
      const page = 0
      const errorMessage = `Failed to fetch changes for crisis ${crisisEventId}`

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(crisisEventService.fetchCrisisEventChanges(crisisEventId, page)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith(`/public/crisis-events/${crisisEventId}/changes`, {
        params: { page, size: 5 }
      })
    })
  })

  /**
   * fetchCrisisEventsByScenarioTheme Tests
   *
   * These tests verify the behavior of the fetchCrisisEventsByScenarioTheme function.
   */
  describe('fetchCrisisEventsByScenarioTheme', () => {
    /**
     * Test: Successful Crisis Events Retrieval by Scenario Theme
     *
     * Verifies that the fetchCrisisEventsByScenarioTheme function correctly retrieves
     * crisis events associated with a specific scenario theme.
     */
    it('should retrieve crisis events by scenario theme successfully', async () => {
      // Create mock data
      const scenarioThemeId = 1
      const mockEvents: CrisisEventDto[] = [
        createMockCrisisEventDto(1, true),
        createMockCrisisEventDto(2, false)
      ]

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockEvents))

      // Call the service method
      const result = await crisisEventService.fetchCrisisEventsByScenarioTheme(scenarioThemeId)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith(`/crisis-events/by-theme/${scenarioThemeId}`)

      // Verify the result matches the mock response
      expect(result).toEqual(mockEvents)
      expect(result.length).toBe(2)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchCrisisEventsByScenarioTheme function correctly handles errors
     * from the API and returns an empty array.
     */
    it('should handle errors when retrieving crisis events by scenario theme', async () => {
      // Create mock data
      const scenarioThemeId = 1
      const errorMessage = `Failed to fetch crisis events for scenario theme ${scenarioThemeId}`

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Call the service method
      const result = await crisisEventService.fetchCrisisEventsByScenarioTheme(scenarioThemeId)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith(`/crisis-events/by-theme/${scenarioThemeId}`)

      // Verify the result is an empty array
      expect(result).toEqual([])
    })
  })

  /**
   * Edge Cases and Private Functions Tests
   *
   * These tests verify the behavior of the CrisisEventService in edge cases
   * and test the private utility functions indirectly.
   */
  describe('Edge Cases and Private Functions', () => {
    /**
     * Test: Mapping Backend to Frontend Event with Invalid Coordinates
     *
     * Verifies that the mapBackendToFrontendEvent function (tested indirectly through
     * fetchAllCrisisEvents) correctly handles events with invalid coordinates.
     */
    it('should handle events with invalid coordinates when mapping', async () => {
      // Create mock data with various invalid coordinates
      const validEvent = createMockBackendCrisisEvent(1, true)

      const invalidLatEvent = createMockBackendCrisisEvent(2, true)
      invalidLatEvent.epicenterLatitude = NaN

      const invalidLongEvent = createMockBackendCrisisEvent(3, true)
      invalidLongEvent.epicenterLongitude = NaN

      const invalidRadiusEvent = createMockBackendCrisisEvent(4, true)
      invalidRadiusEvent.radius = NaN

      const mockBackendEvents = [validEvent, invalidLatEvent, invalidLongEvent, invalidRadiusEvent]
      const mockPage = createMockPage(mockBackendEvents)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchAllCrisisEvents()

      // Verify only the valid event is included
      expect(result.content.length).toBe(1)
      expect(result.content[0].id).toBe(1)
    })

    /**
     * Test: Mapping Backend to Frontend Event with Different Severity Levels
     *
     * Verifies that the mapBackendToFrontendEvent function (tested indirectly through
     * fetchAllCrisisEvents) correctly maps severity strings to numeric levels.
     */
    it('should correctly map severity strings to numeric levels', async () => {
      // Create mock data with different severity levels
      const redEvent = createMockBackendCrisisEvent(1, true)
      redEvent.severity = 'red'

      const yellowEvent = createMockBackendCrisisEvent(2, true)
      yellowEvent.severity = 'yellow'

      const greenEvent = createMockBackendCrisisEvent(3, true)
      greenEvent.severity = 'green'

      const unknownEvent = createMockBackendCrisisEvent(4, true)
      unknownEvent.severity = 'unknown' as any

      const mockBackendEvents = [redEvent, yellowEvent, greenEvent, unknownEvent]
      const mockPage = createMockPage(mockBackendEvents)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchAllCrisisEvents()

      // Verify the severity levels are correctly mapped
      expect(result.content.length).toBe(4)
      expect(result.content[0].level).toBe(3) // red -> 3
      expect(result.content[1].level).toBe(2) // yellow -> 2
      expect(result.content[2].level).toBe(1) // green -> 1
      expect(result.content[3].level).toBe(1) // unknown -> default 1
    })

    /**
     * Test: Handling String Coordinates in Backend Events
     *
     * Verifies that the mapBackendToFrontendEvent function (tested indirectly through
     * fetchAllCrisisEvents) correctly handles string coordinates by parsing them.
     */
    it('should handle string coordinates by parsing them to numbers', async () => {
      // Create mock data with string coordinates
      const event = createMockBackendCrisisEvent(1, true)
      // Override the coordinates with string values (simulating API inconsistency)
      event.epicenterLatitude = '63.4305' as any
      event.epicenterLongitude = '10.3951' as any
      event.radius = '5000' as any

      const mockBackendEvents = [event]
      const mockPage = createMockPage(mockBackendEvents)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await crisisEventService.fetchAllCrisisEvents()

      // Verify the coordinates are correctly parsed
      expect(result.content.length).toBe(1)
      expect(result.content[0].latitude).toBe(63.4305)
      expect(result.content[0].longitude).toBe(10.3951)
      expect(result.content[0].radius).toBe(5000)
    })
  })
})
