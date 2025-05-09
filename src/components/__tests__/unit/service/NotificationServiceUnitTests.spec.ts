/**
 * NotificationService Unit Tests
 *
 * This file contains comprehensive unit tests for the NotificationService, which is responsible
 * for notification-related operations including fetching notifications, marking notifications as read,
 * and checking for unread notifications.
 *
 * The tests verify the service's functionality including:
 * - Fetching paginated notifications
 * - Marking all notifications as read
 * - Checking if there are any unread notifications
 * - Proper date conversion for notification objects
 *
 * @file NotificationServiceUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { AxiosResponse } from 'axios'
import * as notificationService from '@/services/NotificationService.ts'
import type { NotificationMessage } from '@/models/NotificationMessage.ts'
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
 * Helper function to create a mock NotificationMessage
 *
 * @param id - The unique identifier for the notification
 * @returns A NotificationMessage object with default test values
 */
const createMockNotification = (id: number): NotificationMessage => ({
  id,
  userId: 1,
  preferenceType: 'expiration_reminder',
  targetType: 'inventory',
  targetId: id * 10,
  description: `Test notification ${id}`,
  notifyAt: new Date(),
  sentAt: new Date(),
  readAt: id % 2 === 0 ? new Date() : undefined, // Even IDs are read, odd are unread
  createdAt: new Date()
})

/**
 * Helper function to create a mock Page of notifications
 *
 * @param items - The notifications to include in the page
 * @param page - The page number
 * @param size - The page size
 * @param total - The total number of elements
 * @returns A Page object containing the provided notifications
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
 * Main test suite for the NotificationService
 *
 * This suite contains all tests related to the NotificationService functionality.
 * Each nested describe block focuses on a specific aspect of the service's behavior.
 */
describe('NotificationService', () => {
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
   * getNotifications Tests
   *
   * These tests verify the behavior of the getNotifications function.
   */
  describe('getNotifications', () => {
    /**
     * Test: Successful Notifications Fetch
     *
     * Verifies that the getNotifications function correctly fetches notifications
     * and returns the paginated notification data with dates properly converted.
     */
    it('should fetch notifications successfully', async () => {
      const page = 1
      const size = 20

      // Create mock notifications with string dates (as they would come from API)
      const mockApiNotifications = [
        {
          id: 1,
          userId: 1,
          preferenceType: 'expiration_reminder',
          targetType: 'inventory',
          targetId: 10,
          description: 'Test notification 1',
          notifyAt: '2023-04-01T10:00:00Z',
          sentAt: '2023-04-01T10:01:00Z',
          readAt: null,
          createdAt: '2023-04-01T09:00:00Z'
        },
        {
          id: 2,
          userId: 1,
          preferenceType: 'crisis_alert',
          targetType: 'event',
          targetId: 20,
          description: 'Test notification 2',
          notifyAt: '2023-04-02T10:00:00Z',
          sentAt: '2023-04-02T10:01:00Z',
          readAt: '2023-04-02T10:02:00Z',
          createdAt: '2023-04-02T09:00:00Z'
        }
      ]

      // Expected result after date conversion
      const expectedNotifications = [
        {
          id: 1,
          userId: 1,
          preferenceType: 'expiration_reminder',
          targetType: 'inventory',
          targetId: 10,
          description: 'Test notification 1',
          notifyAt: new Date('2023-04-01T10:00:00Z'),
          sentAt: new Date('2023-04-01T10:01:00Z'),
          readAt: undefined,
          createdAt: new Date('2023-04-01T09:00:00Z')
        },
        {
          id: 2,
          userId: 1,
          preferenceType: 'crisis_alert',
          targetType: 'event',
          targetId: 20,
          description: 'Test notification 2',
          notifyAt: new Date('2023-04-02T10:00:00Z'),
          sentAt: new Date('2023-04-02T10:01:00Z'),
          readAt: new Date('2023-04-02T10:02:00Z'),
          createdAt: new Date('2023-04-02T09:00:00Z')
        }
      ]

      const mockPage = {
        content: mockApiNotifications,
        totalElements: 2,
        totalPages: 1,
        size,
        number: page - 1,
        first: true,
        last: true,
        empty: false
      }

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await notificationService.getNotifications(page, size)

      expect(api.get).toHaveBeenCalledWith(`/user/notifications?page=${page - 1}&size=${size}`)
      expect(result.content).toHaveLength(2)

      // Check that dates were properly converted
      expect(result.content[0].notifyAt).toBeInstanceOf(Date)
      expect(result.content[0].sentAt).toBeInstanceOf(Date)
      expect(result.content[0].readAt).toBeUndefined()
      expect(result.content[0].createdAt).toBeInstanceOf(Date)

      expect(result.content[1].notifyAt).toBeInstanceOf(Date)
      expect(result.content[1].sentAt).toBeInstanceOf(Date)
      expect(result.content[1].readAt).toBeInstanceOf(Date)
      expect(result.content[1].createdAt).toBeInstanceOf(Date)

      // Check that the content matches the expected result
      expect(result.content).toEqual(expectedNotifications)
    })

    /**
     * Test: Default Parameters
     *
     * Verifies that the getNotifications function correctly uses default parameters
     * when they are not provided.
     */
    it('should use default parameters when not provided', async () => {
      const defaultPage = 1
      const defaultSize = 20
      const mockApiNotifications = [createMockNotification(1)]
      const mockPage = {
        content: mockApiNotifications,
        totalElements: 1,
        totalPages: 1,
        size: defaultSize,
        number: defaultPage - 1,
        first: true,
        last: true,
        empty: false
      }

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      await notificationService.getNotifications()

      expect(api.get).toHaveBeenCalledWith(`/user/notifications?page=${defaultPage - 1}&size=${defaultSize}`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getNotifications function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching notifications', async () => {
      const page = 1
      const size = 20
      const errorMessage = 'Failed to fetch notifications'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(notificationService.getNotifications(page, size)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/user/notifications?page=${page - 1}&size=${size}`)
    })
  })

  /**
   * markAllNotificationsAsRead Tests
   *
   * These tests verify the behavior of the markAllNotificationsAsRead function.
   */
  describe('markAllNotificationsAsRead', () => {
    /**
     * Test: Successful Mark All as Read
     *
     * Verifies that the markAllNotificationsAsRead function correctly marks all notifications as read
     * and returns the count of notifications marked as read.
     */
    it('should mark all notifications as read successfully', async () => {
      const mockResponse = { count: 5 }

      vi.mocked(api.patch).mockResolvedValue(createAxiosResponse(mockResponse))

      const result = await notificationService.markAllNotificationsAsRead()

      expect(api.patch).toHaveBeenCalledWith('/user/notifications/read-all')
      expect(result).toEqual(mockResponse)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the markAllNotificationsAsRead function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when marking all notifications as read', async () => {
      const errorMessage = 'Failed to mark notifications as read'

      vi.mocked(api.patch).mockRejectedValue(new Error(errorMessage))

      await expect(notificationService.markAllNotificationsAsRead()).rejects.toThrow(errorMessage)
      expect(api.patch).toHaveBeenCalledWith('/user/notifications/read-all')
    })
  })

  /**
   * hasUnreadNotifications Tests
   *
   * These tests verify the behavior of the hasUnreadNotifications function.
   */
  describe('hasUnreadNotifications', () => {
    /**
     * Test: Has Unread Notifications
     *
     * Verifies that the hasUnreadNotifications function correctly returns true
     * when there are unread notifications.
     */
    it('should return true when there are unread notifications', async () => {
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(true))

      const result = await notificationService.hasUnreadNotifications()

      expect(api.get).toHaveBeenCalledWith('/user/notifications/any-unread')
      expect(result).toBe(true)
    })

    /**
     * Test: No Unread Notifications
     *
     * Verifies that the hasUnreadNotifications function correctly returns false
     * when there are no unread notifications.
     */
    it('should return false when there are no unread notifications', async () => {
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(false))

      const result = await notificationService.hasUnreadNotifications()

      expect(api.get).toHaveBeenCalledWith('/user/notifications/any-unread')
      expect(result).toBe(false)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the hasUnreadNotifications function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when checking for unread notifications', async () => {
      const errorMessage = 'Failed to check for unread notifications'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(notificationService.hasUnreadNotifications()).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith('/user/notifications/any-unread')
    })
  })

  /**
   * mapDatesToObjects Tests
   *
   * These tests verify the behavior of the mapDatesToObjects function by testing
   * it indirectly through the getNotifications function.
   */
  describe('mapDatesToObjects (tested indirectly)', () => {
    /**
     * Test: Date Conversion
     *
     * Verifies that the mapDatesToObjects function correctly converts date strings to Date objects.
     */
    it('should convert date strings to Date objects', async () => {
      const mockApiNotification = {
        id: 1,
        userId: 1,
        preferenceType: 'expiration_reminder',
        targetType: 'inventory',
        targetId: 10,
        description: 'Test notification',
        notifyAt: '2023-04-01T10:00:00Z',
        sentAt: '2023-04-01T10:01:00Z',
        readAt: '2023-04-01T10:02:00Z',
        createdAt: '2023-04-01T09:00:00Z'
      }

      const mockPage = {
        content: [mockApiNotification],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true,
        empty: false
      }

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await notificationService.getNotifications()
      const notification = result.content[0]

      expect(notification.notifyAt).toBeInstanceOf(Date)
      expect(notification.notifyAt.toISOString()).toBe('2023-04-01T10:00:00.000Z')

      expect(notification.sentAt).toBeInstanceOf(Date)
      expect(notification.sentAt.toISOString()).toBe('2023-04-01T10:01:00.000Z')

      expect(notification.readAt).toBeInstanceOf(Date)
      expect(notification.readAt.toISOString()).toBe('2023-04-01T10:02:00.000Z')

      expect(notification.createdAt).toBeInstanceOf(Date)
      expect(notification.createdAt.toISOString()).toBe('2023-04-01T09:00:00.000Z')
    })

    /**
     * Test: Handling Null Dates
     *
     * Verifies that the mapDatesToObjects function correctly handles null date values.
     */
    it('should handle null date values', async () => {
      const mockApiNotification = {
        id: 1,
        userId: 1,
        preferenceType: 'expiration_reminder',
        targetType: 'inventory',
        targetId: 10,
        description: 'Test notification',
        notifyAt: '2023-04-01T10:00:00Z',
        sentAt: null,
        readAt: null,
        createdAt: '2023-04-01T09:00:00Z'
      }

      const mockPage = {
        content: [mockApiNotification],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true,
        empty: false
      }

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await notificationService.getNotifications()
      const notification = result.content[0]

      expect(notification.notifyAt).toBeInstanceOf(Date)
      expect(notification.sentAt).toBeUndefined()
      expect(notification.readAt).toBeUndefined()
      expect(notification.createdAt).toBeInstanceOf(Date)
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the NotificationService functions in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Empty Page Handling
     *
     * Verifies that the service correctly handles empty pages of notifications.
     */
    it('should handle empty pages of notifications', async () => {
      const page = 10 // A page number that would be beyond available data
      const size = 20
      const mockEmptyPage = createMockPage([], page - 1, size, 0) // 0 total items

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockEmptyPage))

      const result = await notificationService.getNotifications(page, size)

      expect(api.get).toHaveBeenCalledWith(`/user/notifications?page=${page - 1}&size=${size}`)
      expect(result.content).toHaveLength(0)
      expect(result.empty).toBe(true)
    })

    /**
     * Test: Partial Page Handling
     *
     * Verifies that the service correctly handles partially filled pages of notifications.
     */
    it('should handle partially filled pages of notifications', async () => {
      const page = 3
      const size = 20
      const total = 45 // This will result in a partial page for page 3

      // Create 5 notifications for the last page
      const mockNotifications = Array.from({ length: 5 }, (_, i) => ({
        id: 40 + i + 1,
        userId: 1,
        preferenceType: 'expiration_reminder' as const,
        targetType: 'inventory' as const,
        targetId: (40 + i + 1) * 10,
        description: `Test notification ${40 + i + 1}`,
        notifyAt: '2023-04-01T10:00:00Z',
        sentAt: '2023-04-01T10:01:00Z',
        readAt: null,
        createdAt: '2023-04-01T09:00:00Z'
      }))

      const mockPartialPage = {
        content: mockNotifications,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size,
        number: page - 1,
        first: false,
        last: true,
        empty: false
      }

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPartialPage))

      const result = await notificationService.getNotifications(page, size)

      expect(api.get).toHaveBeenCalledWith(`/user/notifications?page=${page - 1}&size=${size}`)
      expect(result.content).toHaveLength(5) // 45 total items, page 3 with size 20 should have 5 items
      expect(result.last).toBe(true)
    })
  })
})
