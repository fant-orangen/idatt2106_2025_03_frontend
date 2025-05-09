/**
 * MeetingPlaceService Unit Tests
 *
 * This file contains comprehensive unit tests for the MeetingPlaceService, which is responsible
 * for meeting place-related operations including creating, archiving, activating, and retrieving
 * meeting places.
 *
 * The tests verify the service's functionality including:
 * - Creating new meeting places (admin only)
 * - Archiving meeting places (admin only)
 * - Activating meeting places (admin only)
 * - Retrieving nearby meeting places based on location and distance
 * - Retrieving paginated meeting place previews
 * - Retrieving a specific meeting place by ID
 *
 * @file MeetingPlaceServiceUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { AxiosResponse } from 'axios'
import { meetingPlaceService } from '@/services/MeetingPlaceService.ts'
import type { MeetingPlace, CreateMeetingPlaceDto, MeetingPlacePreviewDto } from '@/models/MeetingPlace.ts'
import type { Page } from '@/types/Page'

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
 * Helper function to create a mock MeetingPlace
 *
 * @param id - The unique identifier for the meeting place
 * @returns A MeetingPlace object with default test values
 */
const createMockMeetingPlace = (id: number): MeetingPlace => ({
  id,
  name: `Meeting Place ${id}`,
  address: `Address ${id}`,
  latitude: 10.0 + id * 0.1,
  longitude: 20.0 + id * 0.1,
  isArchived: false,
  createdAt: new Date().toISOString(),
  createdBy: {
    id: 1,
    email: 'admin@example.com'
  }
})

/**
 * Helper function to create a mock MeetingPlacePreviewDto
 *
 * @param id - The unique identifier for the meeting place preview
 * @returns A MeetingPlacePreviewDto object with default test values
 */
const createMockMeetingPlacePreview = (id: number): MeetingPlacePreviewDto => ({
  id,
  name: `Meeting Place ${id}`,
  status: id % 2 === 0 ? 'ACTIVE' : 'ARCHIVED'
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
const createMockPage = <T>(items: T[], page: number = 0, size: number = 10, total: number = items.length): Page<T> => ({
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
 * Main test suite for the MeetingPlaceService
 *
 * This suite contains all tests related to the MeetingPlaceService functionality.
 * Each nested describe block focuses on a specific aspect of the service's behavior.
 */
describe('MeetingPlaceService', () => {
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
   * createMeetingPlace Tests
   *
   * These tests verify the behavior of the createMeetingPlace function.
   */
  describe('createMeetingPlace', () => {
    /**
     * Test: Successful Meeting Place Creation
     *
     * Verifies that the createMeetingPlace function correctly creates a meeting place
     * and returns the created meeting place data.
     */
    it('should create a meeting place successfully', async () => {
      // Create mock data
      const createDto: CreateMeetingPlaceDto = {
        name: 'New Meeting Place',
        latitude: 10.5,
        longitude: 20.5,
        address: '123 Test Street'
      }

      const mockResponse: MeetingPlace = {
        id: 1,
        name: createDto.name,
        address: createDto.address || '',
        latitude: createDto.latitude,
        longitude: createDto.longitude,
        isArchived: false,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 1,
          email: 'admin@example.com'
        }
      }

      // Mock the API response
      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await meetingPlaceService.createMeetingPlace(createDto)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/admin/meeting-places', createDto)

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the createMeetingPlace function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when creating a meeting place', async () => {
      // Create mock data
      const createDto: CreateMeetingPlaceDto = {
        name: 'New Meeting Place',
        latitude: 10.5,
        longitude: 20.5
      }

      const errorMessage = 'Failed to create meeting place'

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(meetingPlaceService.createMeetingPlace(createDto)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/admin/meeting-places', createDto)
    })
  })

  /**
   * archiveMeetingPlace Tests
   *
   * These tests verify the behavior of the archiveMeetingPlace function.
   */
  describe('archiveMeetingPlace', () => {
    /**
     * Test: Successful Meeting Place Archiving
     *
     * Verifies that the archiveMeetingPlace function correctly archives a meeting place
     * and returns the archived meeting place data.
     */
    it('should archive a meeting place successfully', async () => {
      // Create mock data
      const meetingPlaceId = 1
      const mockResponse: MeetingPlace = {
        ...createMockMeetingPlace(meetingPlaceId),
        isArchived: true
      }

      // Mock the API response
      vi.mocked(api.patch).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await meetingPlaceService.archiveMeetingPlace(meetingPlaceId)

      // Verify the API was called correctly
      expect(api.patch).toHaveBeenCalledWith(`/admin/meeting-places/${meetingPlaceId}/archive`)

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
      expect(result.isArchived).toBe(true)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the archiveMeetingPlace function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when archiving a meeting place', async () => {
      // Create mock data
      const meetingPlaceId = 1
      const errorMessage = 'Failed to archive meeting place'

      // Mock the API to throw an error
      vi.mocked(api.patch).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(meetingPlaceService.archiveMeetingPlace(meetingPlaceId)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.patch).toHaveBeenCalledWith(`/admin/meeting-places/${meetingPlaceId}/archive`)
    })
  })

  /**
   * activateMeetingPlace Tests
   *
   * These tests verify the behavior of the activateMeetingPlace function.
   */
  describe('activateMeetingPlace', () => {
    /**
     * Test: Successful Meeting Place Activation
     *
     * Verifies that the activateMeetingPlace function correctly activates a meeting place
     * and returns the activated meeting place data.
     */
    it('should activate a meeting place successfully', async () => {
      // Create mock data
      const meetingPlaceId = 1
      const mockResponse: MeetingPlace = {
        ...createMockMeetingPlace(meetingPlaceId),
        isArchived: false
      }

      // Mock the API response
      vi.mocked(api.patch).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await meetingPlaceService.activateMeetingPlace(meetingPlaceId)

      // Verify the API was called correctly
      expect(api.patch).toHaveBeenCalledWith(`/admin/meeting-places/${meetingPlaceId}/activate`)

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
      expect(result.isArchived).toBe(false)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the activateMeetingPlace function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when activating a meeting place', async () => {
      // Create mock data
      const meetingPlaceId = 1
      const errorMessage = 'Failed to activate meeting place'

      // Mock the API to throw an error
      vi.mocked(api.patch).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(meetingPlaceService.activateMeetingPlace(meetingPlaceId)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.patch).toHaveBeenCalledWith(`/admin/meeting-places/${meetingPlaceId}/activate`)
    })
  })

  /**
   * getNearbyMeetingPlaces Tests
   *
   * These tests verify the behavior of the getNearbyMeetingPlaces function.
   */
  describe('getNearbyMeetingPlaces', () => {
    /**
     * Test: Successful Nearby Meeting Places Retrieval with Default Distance
     *
     * Verifies that the getNearbyMeetingPlaces function correctly retrieves nearby meeting places
     * using the default distance parameter.
     */
    it('should retrieve nearby meeting places with default distance', async () => {
      // Create mock data
      const latitude = 10.5
      const longitude = 20.5
      const defaultDistance = 10 // Default value in the service
      const mockResponse: MeetingPlace[] = [
        createMockMeetingPlace(1),
        createMockMeetingPlace(2),
        createMockMeetingPlace(3)
      ]

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await meetingPlaceService.getNearbyMeetingPlaces(latitude, longitude)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/meeting-places/nearby', {
        params: {
          latitude,
          longitude,
          distanceKm: defaultDistance
        }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
      expect(result.length).toBe(3)
    })

    /**
     * Test: Successful Nearby Meeting Places Retrieval with Custom Distance
     *
     * Verifies that the getNearbyMeetingPlaces function correctly retrieves nearby meeting places
     * using a custom distance parameter.
     */
    it('should retrieve nearby meeting places with custom distance', async () => {
      // Create mock data
      const latitude = 10.5
      const longitude = 20.5
      const customDistance = 5
      const mockResponse: MeetingPlace[] = [
        createMockMeetingPlace(1),
        createMockMeetingPlace(2)
      ]

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await meetingPlaceService.getNearbyMeetingPlaces(latitude, longitude, customDistance)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/meeting-places/nearby', {
        params: {
          latitude,
          longitude,
          distanceKm: customDistance
        }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
      expect(result.length).toBe(2)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getNearbyMeetingPlaces function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving nearby meeting places', async () => {
      // Create mock data
      const latitude = 10.5
      const longitude = 20.5
      const errorMessage = 'Failed to retrieve nearby meeting places'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(meetingPlaceService.getNearbyMeetingPlaces(latitude, longitude)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/meeting-places/nearby', {
        params: {
          latitude,
          longitude,
          distanceKm: 10
        }
      })
    })
  })

  /**
   * getPreviewMeetingPlaces Tests
   *
   * These tests verify the behavior of the getPreviewMeetingPlaces function.
   */
  describe('getPreviewMeetingPlaces', () => {
    /**
     * Test: Successful Meeting Place Previews Retrieval with Default Pagination
     *
     * Verifies that the getPreviewMeetingPlaces function correctly retrieves meeting place previews
     * using the default pagination parameters.
     */
    it('should retrieve meeting place previews with default pagination', async () => {
      // Create mock data
      const defaultPage = 0
      const defaultSize = 10
      const mockPreviews: MeetingPlacePreviewDto[] = [
        createMockMeetingPlacePreview(1),
        createMockMeetingPlacePreview(2),
        createMockMeetingPlacePreview(3)
      ]
      const mockPage = createMockPage(mockPreviews, defaultPage, defaultSize)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await meetingPlaceService.getPreviewMeetingPlaces()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/meeting-places/all/previews', {
        params: { page: defaultPage, size: defaultSize }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.content.length).toBe(3)
    })

    /**
     * Test: Successful Meeting Place Previews Retrieval with Custom Pagination
     *
     * Verifies that the getPreviewMeetingPlaces function correctly retrieves meeting place previews
     * using custom pagination parameters.
     */
    it('should retrieve meeting place previews with custom pagination', async () => {
      // Create mock data
      const customPage = 2
      const customSize = 5
      const mockPreviews: MeetingPlacePreviewDto[] = [
        createMockMeetingPlacePreview(11),
        createMockMeetingPlacePreview(12),
        createMockMeetingPlacePreview(13),
        createMockMeetingPlacePreview(14),
        createMockMeetingPlacePreview(15)
      ]
      const mockPage = createMockPage(mockPreviews, customPage, customSize, 20)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      // Call the service method
      const result = await meetingPlaceService.getPreviewMeetingPlaces(customPage, customSize)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/meeting-places/all/previews', {
        params: { page: customPage, size: customSize }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockPage)
      expect(result.content).toEqual(mockPreviews)
      expect(result.content.length).toBe(5)
      expect(result.number).toBe(customPage)
      expect(result.size).toBe(customSize)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getPreviewMeetingPlaces function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving meeting place previews', async () => {
      // Create mock data
      const errorMessage = 'Failed to retrieve meeting place previews'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(meetingPlaceService.getPreviewMeetingPlaces()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/meeting-places/all/previews', {
        params: { page: 0, size: 10 }
      })
    })
  })

  /**
   * getAMeetingPlace Tests
   *
   * These tests verify the behavior of the getAMeetingPlace function.
   */
  describe('getAMeetingPlace', () => {
    /**
     * Test: Successful Meeting Place Retrieval
     *
     * Verifies that the getAMeetingPlace function correctly retrieves a specific meeting place
     * by ID.
     */
    it('should retrieve a specific meeting place by ID', async () => {
      // Create mock data
      const meetingPlaceId = 1
      const mockResponse: MeetingPlacePreviewDto = createMockMeetingPlacePreview(meetingPlaceId)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await meetingPlaceService.getAMeetingPlace(meetingPlaceId)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith(`/public/meeting-places/${meetingPlaceId}`)

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
      expect(result.id).toBe(meetingPlaceId)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getAMeetingPlace function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving a specific meeting place', async () => {
      // Create mock data
      const meetingPlaceId = 1
      const errorMessage = 'Failed to retrieve meeting place'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(meetingPlaceService.getAMeetingPlace(meetingPlaceId)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith(`/public/meeting-places/${meetingPlaceId}`)
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the MeetingPlaceService functions in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Empty Response Handling
     *
     * Verifies that the service correctly handles empty responses.
     */
    it('should handle empty responses when retrieving nearby meeting places', async () => {
      // Create mock data
      const latitude = 10.5
      const longitude = 20.5
      const mockResponse: MeetingPlace[] = []

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await meetingPlaceService.getNearbyMeetingPlaces(latitude, longitude)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/meeting-places/nearby', {
        params: {
          latitude,
          longitude,
          distanceKm: 10
        }
      })

      // Verify the result is an empty array
      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })

    /**
     * Test: Empty Page Handling
     *
     * Verifies that the service correctly handles empty pages of meeting place previews.
     */
    it('should handle empty pages when retrieving meeting place previews', async () => {
      // Create mock data
      const page = 10 // A page number that would be beyond available data
      const size = 10
      const mockEmptyPage = createMockPage([], page, size, 0) // 0 total items

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockEmptyPage))

      // Call the service method
      const result = await meetingPlaceService.getPreviewMeetingPlaces(page, size)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/public/meeting-places/all/previews', {
        params: { page, size }
      })

      // Verify the result is an empty page
      expect(result.content).toHaveLength(0)
      expect(result.empty).toBe(true)
    })
  })
})
