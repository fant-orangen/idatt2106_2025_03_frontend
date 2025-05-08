/**
 * ReflectionService Unit Tests
 *
 * This file contains comprehensive unit tests for the ReflectionService, which is responsible
 * for reflection-related operations including fetching user reflections, creating new reflections,
 * updating existing reflections, and fetching shared reflections from household or group.
 *
 * The tests verify the service's functionality including:
 * - Fetching user's own reflections
 * - Fetching shared reflections
 * - Fetching household reflections
 * - Fetching group reflections
 * - Creating new reflections
 * - Updating existing reflections
 * - Deleting reflections
 *
 * @file ReflectionServiceUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { AxiosResponse } from 'axios'
import {
  getMyReflections,
  getSharedReflections,
  getHouseholdReflections,
  getGroupReflections,
  createReflection,
  updateReflection,
  deleteReflection
} from '@/services/ReflectionService.ts'
import type {
  ReflectionResponseDto,
  CreateReflectionDto,
  UpdateReflectionDto
} from '@/models/Reflection'
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
    delete: vi.fn()
  }
}))
import api from '@/services/api/AxiosInstance.ts'

/**
 * Helper function to create a mock ReflectionResponseDto
 *
 * @param id - The unique identifier for the reflection
 * @returns A ReflectionResponseDto object with default test values
 */
const createMockReflectionResponseDto = (id: number): ReflectionResponseDto => ({
  id,
  userId: 1,
  userFirstName: 'Test',
  userLastName: 'User',
  content: `Reflection content ${id}`,
  shared: true,
  deleted: false,
  createdAt: new Date().toISOString(),
  crisisEventId: id % 2 === 0 ? id : undefined,
  crisisEventName: id % 2 === 0 ? `Crisis Event ${id}` : undefined
})

/**
 * Helper function to create a mock CreateReflectionDto
 *
 * @param id - Optional identifier to create unique content
 * @returns A CreateReflectionDto object with default test values
 */
const createMockCreateReflectionDto = (id: number = 1): CreateReflectionDto => ({
  content: `New reflection content ${id}`,
  shared: true,
  crisisEventId: id % 2 === 0 ? id : undefined
})

/**
 * Helper function to create a mock UpdateReflectionDto
 *
 * @param id - Optional identifier to create unique content
 * @returns An UpdateReflectionDto object with default test values
 */
const createMockUpdateReflectionDto = (id: number = 1): UpdateReflectionDto => ({
  content: `Updated reflection content ${id}`,
  shared: false
})

/**
 * Helper function to create a mock Page of ReflectionResponseDto
 *
 * @param page - The page number
 * @param size - The page size
 * @param total - The total number of elements
 * @returns A Page object containing ReflectionResponseDto items
 */
const createMockReflectionPage = (page: number = 0, size: number = 10, total: number = 30): Page<ReflectionResponseDto> => {
  const content: ReflectionResponseDto[] = []
  const startId = page * size + 1
  const itemCount = Math.min(size, total - page * size)

  for (let i = 0; i < itemCount; i++) {
    content.push(createMockReflectionResponseDto(startId + i))
  }

  return {
    content,
    totalElements: total,
    totalPages: Math.ceil(total / size),
    size,
    number: page,
    first: page === 0,
    last: (page + 1) * size >= total,
    empty: content.length === 0
  }
}

/**
 * Main test suite for the ReflectionService
 *
 * This suite contains all tests related to the ReflectionService functionality.
 * Each nested describe block focuses on a specific aspect of the service's behavior.
 */
describe('ReflectionService', () => {
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
   * getMyReflections Tests
   *
   * These tests verify the behavior of the getMyReflections function.
   */
  describe('getMyReflections', () => {
    /**
     * Test: Successful Reflections Fetch
     *
     * Verifies that the getMyReflections function correctly fetches a user's reflections
     * and returns the paginated reflection data.
     */
    it('should fetch user reflections successfully', async () => {
      const page = 0
      const size = 10
      const mockPage = createMockReflectionPage(page, size)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await getMyReflections(page, size)

      expect(api.get).toHaveBeenCalledWith('/user/reflections/my', { params: { page, size } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Default Parameters
     *
     * Verifies that the getMyReflections function correctly uses default parameters
     * when they are not provided.
     */
    it('should use default parameters when not provided', async () => {
      const defaultPage = 0
      const defaultSize = 10
      const mockPage = createMockReflectionPage(defaultPage, defaultSize)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await getMyReflections()

      expect(api.get).toHaveBeenCalledWith('/user/reflections/my', { params: { page: defaultPage, size: defaultSize } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getMyReflections function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching user reflections', async () => {
      const page = 0
      const size = 10
      const errorMessage = 'Failed to fetch reflections'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(getMyReflections(page, size)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith('/user/reflections/my', { params: { page, size } })
    })
  })

  /**
   * getSharedReflections Tests
   *
   * These tests verify the behavior of the getSharedReflections function.
   */
  describe('getSharedReflections', () => {
    /**
     * Test: Successful Shared Reflections Fetch
     *
     * Verifies that the getSharedReflections function correctly fetches shared reflections
     * and returns the paginated reflection data.
     */
    it('should fetch shared reflections successfully', async () => {
      const page = 0
      const size = 5
      const mockPage = createMockReflectionPage(page, size)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await getSharedReflections(page, size)

      expect(api.get).toHaveBeenCalledWith('/user/reflections/shared', { params: { page, size } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Default Parameters
     *
     * Verifies that the getSharedReflections function correctly uses default parameters
     * when they are not provided.
     */
    it('should use default parameters when not provided', async () => {
      const defaultPage = 0
      const defaultSize = 5
      const mockPage = createMockReflectionPage(defaultPage, defaultSize)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await getSharedReflections()

      expect(api.get).toHaveBeenCalledWith('/user/reflections/shared', { params: { page: defaultPage, size: defaultSize } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getSharedReflections function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching shared reflections', async () => {
      const page = 0
      const size = 5
      const errorMessage = 'Failed to fetch shared reflections'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(getSharedReflections(page, size)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith('/user/reflections/shared', { params: { page, size } })
    })
  })

  /**
   * getHouseholdReflections Tests
   *
   * These tests verify the behavior of the getHouseholdReflections function.
   */
  describe('getHouseholdReflections', () => {
    /**
     * Test: Successful Household Reflections Fetch
     *
     * Verifies that the getHouseholdReflections function correctly fetches household reflections
     * and returns the paginated reflection data.
     */
    it('should fetch household reflections successfully', async () => {
      const page = 0
      const size = 5
      const mockPage = createMockReflectionPage(page, size)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await getHouseholdReflections(page, size)

      expect(api.get).toHaveBeenCalledWith('/user/reflections/household', { params: { page, size } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Default Parameters
     *
     * Verifies that the getHouseholdReflections function correctly uses default parameters
     * when they are not provided.
     */
    it('should use default parameters when not provided', async () => {
      const defaultPage = 0
      const defaultSize = 5
      const mockPage = createMockReflectionPage(defaultPage, defaultSize)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await getHouseholdReflections()

      expect(api.get).toHaveBeenCalledWith('/user/reflections/household', { params: { page: defaultPage, size: defaultSize } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getHouseholdReflections function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching household reflections', async () => {
      const page = 0
      const size = 5
      const errorMessage = 'Failed to fetch household reflections'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(getHouseholdReflections(page, size)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith('/user/reflections/household', { params: { page, size } })
    })
  })

  /**
   * getGroupReflections Tests
   *
   * These tests verify the behavior of the getGroupReflections function.
   */
  describe('getGroupReflections', () => {
    /**
     * Test: Successful Group Reflections Fetch
     *
     * Verifies that the getGroupReflections function correctly fetches group reflections
     * and returns the paginated reflection data.
     */
    it('should fetch group reflections successfully', async () => {
      const page = 0
      const size = 5
      const mockPage = createMockReflectionPage(page, size)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await getGroupReflections(page, size)

      expect(api.get).toHaveBeenCalledWith('/user/reflections/groups', { params: { page, size } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Default Parameters
     *
     * Verifies that the getGroupReflections function correctly uses default parameters
     * when they are not provided.
     */
    it('should use default parameters when not provided', async () => {
      const defaultPage = 0
      const defaultSize = 5
      const mockPage = createMockReflectionPage(defaultPage, defaultSize)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await getGroupReflections()

      expect(api.get).toHaveBeenCalledWith('/user/reflections/groups', { params: { page: defaultPage, size: defaultSize } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getGroupReflections function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching group reflections', async () => {
      const page = 0
      const size = 5
      const errorMessage = 'Failed to fetch group reflections'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(getGroupReflections(page, size)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith('/user/reflections/groups', { params: { page, size } })
    })
  })

  /**
   * createReflection Tests
   *
   * These tests verify the behavior of the createReflection function.
   */
  describe('createReflection', () => {
    /**
     * Test: Successful Reflection Creation
     *
     * Verifies that the createReflection function correctly creates a new reflection
     * and returns the created reflection data.
     */
    it('should create a reflection successfully', async () => {
      const reflectionData = createMockCreateReflectionDto()
      const mockReflection = createMockReflectionResponseDto(1)

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockReflection))

      const result = await createReflection(reflectionData)

      expect(api.post).toHaveBeenCalledWith('/user/reflections', reflectionData)
      expect(result).toEqual(mockReflection)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the createReflection function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when creating a reflection', async () => {
      const reflectionData = createMockCreateReflectionDto()
      const errorMessage = 'Failed to create reflection'

      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      await expect(createReflection(reflectionData)).rejects.toThrow(errorMessage)
      expect(api.post).toHaveBeenCalledWith('/user/reflections', reflectionData)
    })
  })

  /**
   * updateReflection Tests
   *
   * These tests verify the behavior of the updateReflection function.
   */
  describe('updateReflection', () => {
    /**
     * Test: Successful Reflection Update
     *
     * Verifies that the updateReflection function correctly updates an existing reflection
     * and returns the updated reflection data.
     */
    it('should update a reflection successfully', async () => {
      const reflectionId = 1
      const reflectionData = createMockUpdateReflectionDto()
      const mockReflection = createMockReflectionResponseDto(reflectionId)

      vi.mocked(api.put).mockResolvedValue(createAxiosResponse(mockReflection))

      const result = await updateReflection(reflectionId, reflectionData)

      expect(api.put).toHaveBeenCalledWith(`/user/reflections/${reflectionId}`, reflectionData)
      expect(result).toEqual(mockReflection)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the updateReflection function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when updating a reflection', async () => {
      const reflectionId = 1
      const reflectionData = createMockUpdateReflectionDto()
      const errorMessage = 'Failed to update reflection'

      vi.mocked(api.put).mockRejectedValue(new Error(errorMessage))

      await expect(updateReflection(reflectionId, reflectionData)).rejects.toThrow(errorMessage)
      expect(api.put).toHaveBeenCalledWith(`/user/reflections/${reflectionId}`, reflectionData)
    })
  })

  /**
   * deleteReflection Tests
   *
   * These tests verify the behavior of the deleteReflection function.
   */
  describe('deleteReflection', () => {
    /**
     * Test: Successful Reflection Deletion
     *
     * Verifies that the deleteReflection function correctly deletes a reflection.
     */
    it('should delete a reflection successfully', async () => {
      const reflectionId = 1

      vi.mocked(api.delete).mockResolvedValue(createAxiosResponse({}))

      await deleteReflection(reflectionId)

      expect(api.delete).toHaveBeenCalledWith(`/user/reflections/${reflectionId}`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the deleteReflection function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when deleting a reflection', async () => {
      const reflectionId = 1
      const errorMessage = 'Failed to delete reflection'

      vi.mocked(api.delete).mockRejectedValue(new Error(errorMessage))

      await expect(deleteReflection(reflectionId)).rejects.toThrow(errorMessage)
      expect(api.delete).toHaveBeenCalledWith(`/user/reflections/${reflectionId}`)
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the ReflectionService functions in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Empty Page Handling
     *
     * Verifies that the service correctly handles empty pages of reflections.
     */
    it('should handle empty pages of reflections', async () => {
      const page = 10 // A page number that would be beyond available data
      const size = 10
      const mockEmptyPage = createMockReflectionPage(page, size, 0) // 0 total items

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockEmptyPage))

      const result = await getMyReflections(page, size)

      expect(api.get).toHaveBeenCalledWith('/user/reflections/my', { params: { page, size } })
      expect(result.content).toHaveLength(0)
      expect(result.empty).toBe(true)
    })

    /**
     * Test: Partial Page Handling
     *
     * Verifies that the service correctly handles partially filled pages of reflections.
     */
    it('should handle partially filled pages of reflections', async () => {
      const page = 2
      const size = 10
      const total = 25 // This will result in a partial page for page 2
      const mockPartialPage = createMockReflectionPage(page, size, total)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPartialPage))

      const result = await getMyReflections(page, size)

      expect(api.get).toHaveBeenCalledWith('/user/reflections/my', { params: { page, size } })
      expect(result.content).toHaveLength(5) // 25 total items, page 2 with size 10 should have 5 items
      expect(result.last).toBe(true)
    })

    /**
     * Test: Reflection with Crisis Event
     *
     * Verifies that the service correctly handles reflections with crisis event data.
     */
    it('should handle reflections with crisis event data', async () => {
      const reflectionId = 2 // Even IDs have crisis event data in our mock
      const mockReflection = createMockReflectionResponseDto(reflectionId)

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockReflection))

      const reflectionData = createMockCreateReflectionDto(reflectionId)
      const result = await createReflection(reflectionData)

      expect(api.post).toHaveBeenCalledWith('/user/reflections', reflectionData)
      expect(result.crisisEventId).toBeDefined()
      expect(result.crisisEventName).toBeDefined()
    })

    /**
     * Test: Reflection without Crisis Event
     *
     * Verifies that the service correctly handles reflections without crisis event data.
     */
    it('should handle reflections without crisis event data', async () => {
      const reflectionId = 1 // Odd IDs don't have crisis event data in our mock
      const mockReflection = createMockReflectionResponseDto(reflectionId)

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockReflection))

      const reflectionData = createMockCreateReflectionDto(reflectionId)
      const result = await createReflection(reflectionData)

      expect(api.post).toHaveBeenCalledWith('/user/reflections', reflectionData)
      expect(result.crisisEventId).toBeUndefined()
      expect(result.crisisEventName).toBeUndefined()
    })
  })
})
