/**
 * NotificationStore Unit Tests
 *
 * This file contains comprehensive unit tests for the NotificationStore, which is responsible
 * for managing notification state in the application. The tests verify the store's functionality
 * including initialization, data fetching, notification management, and state persistence.
 *
 * The NotificationStore handles:
 * - Loading and saving notification data to localStorage
 * - Fetching notifications from the backend API
 * - Managing notification read/unread status
 * - Tracking pagination for notification lists
 * - Providing computed properties for notification display
 *
 * @file NotificationStoreUnitTests.spec.ts
 * @author Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '@/stores/NotificationStore'
import {
  getNotifications,
  markAllNotificationsAsRead,
  hasUnreadNotifications,
} from '@/services/NotificationService'
import type { NotificationMessage } from '@/models/NotificationMessage'
import type { Page } from '@/types/Page'

/**
 * Mock Setup
 *
 * We mock the NotificationService module to isolate the store from actual API calls.
 * This allows us to control the behavior of service methods and test the store's
 * response to different scenarios (success, error, etc.).
 */
vi.mock('@/services/NotificationService.ts', () => {
  return {
    getNotifications: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
    hasUnreadNotifications: vi.fn(),
  }
})

/**
 * Main test suite for the NotificationStore
 *
 * This suite contains all tests related to the NotificationStore functionality.
 * Each nested describe block focuses on a specific aspect of the store's behavior.
 */
describe('NotificationStore', () => {
  /**
   * Test Setup
   *
   * Before each test:
   * 1. Create a fresh Pinia instance to ensure tests are isolated
   * 2. Reset all mocks to clear any previous mock calls or implementations
   * 3. Clear localStorage to prevent test interference
   */
  beforeEach(() => {
    // Create a fresh Pinia instance and make it active
    setActivePinia(createPinia())

    // Reset all mocks before each test
    vi.resetAllMocks()
    localStorage.clear()
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
   * Helper function to create a mock NotificationMessage
   *
   * This function generates a notification object with default values
   * that can be used across multiple tests for consistency.
   *
   * @param id - The unique identifier for the notification
   * @returns A NotificationMessage object with default test values
   */
  const createMockNotification = (id: number): NotificationMessage => ({
    id,
    userId: 1,
    preferenceType: 'system',
    targetType: 'event',
    targetId: 1,
    description: `Notification ${id}`,
    notifyAt: new Date(),
    createdAt: new Date(),
  })

  /**
   * Initialization Tests
   *
   * These tests verify the initial state of the store and its behavior when loading from localStorage.
   * The store should initialize with default values and be able to restore its state from localStorage
   * when available, or gracefully handle errors during the loading process.
   */
  describe('Initialization', () => {
    /**
     * Test: Default State Initialization
     *
     * Verifies that the store initializes with the expected default values for all state properties.
     * This ensures that the store has a consistent starting point when first created.
     */
    it('should initialize with default state', () => {
      const store = useNotificationStore()
      expect(store.notifications).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.hasFetchedInitial).toBe(false)
      expect(store.currentPage).toBe(0)
      expect(store.totalPages).toBe(0)
      expect(store.pageSize).toBe(20)
      expect(store.hasUnread).toBe(false)
    })

    /**
     * Test: Loading State from localStorage
     *
     * Verifies that the store can correctly load its state from localStorage.
     * This is important for persisting the user's notification state across page refreshes.
     *
     * The test:
     * 1. Creates mock data for notifications and pagination state
     * 2. Mocks localStorage.getItem to return the mock data
     * 3. Calls loadFromLocalStorage() to load the state
     * 4. Verifies that all state properties are correctly restored
     */
    it('should load state from localStorage', () => {
      const store = useNotificationStore()
      const mockNotifications = [createMockNotification(1), createMockNotification(2)]
      const mockPageSize = 10;
      const mockCurrentPage = 1;
      const mockTotalPages = 2;

      // Mock localStorage.getItem to return our test data
      vi.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'notifications') {
          return JSON.stringify(mockNotifications)
        }
        if (key === 'hasFetchedInitial') {
          return JSON.stringify(true)
        }
        if (key === 'notificationsCurrentPage') {
          return JSON.stringify(mockCurrentPage)
        }
        if (key === 'notificationsTotalPages') {
          return JSON.stringify(mockTotalPages)
        }
        if (key === 'notificationsPageSize') {
          return JSON.stringify(mockPageSize)
        }
        return null
      })

      store.loadFromLocalStorage()

      expect(store.notifications).toEqual(mockNotifications)
      expect(store.hasFetchedInitial).toBe(true)
      expect(store.currentPage).toBe(mockCurrentPage)
      expect(store.totalPages).toBe(mockTotalPages)
      expect(store.pageSize).toBe(mockPageSize)
      expect(store.hasUnread).toBe(false) // Assuming mockNotifications are all read
    })

    /**
     * Test: Error Handling During localStorage Load
     *
     * Verifies that the store gracefully handles errors when loading from localStorage.
     * If localStorage access fails, the store should reset to default values rather than
     * remaining in an inconsistent state.
     *
     * The test:
     * 1. Mocks localStorage.getItem to throw an error
     * 2. Calls loadFromLocalStorage()
     * 3. Verifies that all state properties are reset to their default values
     */
    it('should reset state if localStorage load fails', () => {
      const store = useNotificationStore()
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })

      store.loadFromLocalStorage()

      expect(store.notifications).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.hasFetchedInitial).toBe(false)
      expect(store.currentPage).toBe(0)
      expect(store.totalPages).toBe(0)
      expect(store.pageSize).toBe(20)
      expect(store.hasUnread).toBe(false)
    })
  })

  /**
   * Fetching Notifications Tests
   *
   * These tests verify the behavior of the fetchNotifications action and related pagination functionality.
   * The store should be able to fetch notifications from the backend, handle pagination correctly,
   * and gracefully manage error scenarios.
   */
  describe('Fetching Notifications', () => {
    /**
     * Test: Successful Notification Fetching
     *
     * Verifies that the store can successfully fetch notifications from the backend
     * and update its state accordingly. This is a core functionality of the store.
     *
     * The test:
     * 1. Mocks a successful API response with notification data
     * 2. Calls fetchNotifications()
     * 3. Verifies that the API was called with correct parameters
     * 4. Checks that all state properties are updated correctly
     */
    it('should fetch notifications successfully', async () => {
      const store = useNotificationStore()
      const mockPage: Page<NotificationMessage> = {
        content: [createMockNotification(1), createMockNotification(2)],
        totalElements: 2,
        totalPages: 1,
        size: 20,
        number: 0,
      }
      vi.spyOn(getNotifications, 'mockResolvedValue').mockResolvedValue(mockPage)

      await store.fetchNotifications()

      expect(getNotifications).toHaveBeenCalledWith(1, 20) // Adjust page number to 1-based
      expect(store.notifications).toEqual(mockPage.content)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.hasFetchedInitial).toBe(true)
      expect(store.currentPage).toBe(0)
      expect(store.totalPages).toBe(1)
      expect(store.pageSize).toBe(20)
    })

    /**
     * Test: Error Handling During Notification Fetching
     *
     * Verifies that the store properly handles errors when fetching notifications fails.
     * The store should update its error state and maintain other state properties appropriately.
     *
     * The test:
     * 1. Mocks an API error response
     * 2. Calls fetchNotifications()
     * 3. Verifies that the error state is updated correctly
     * 4. Checks that other state properties are maintained appropriately
     */
    it('should handle fetch notifications error', async () => {
      const store = useNotificationStore()
      const errorMessage = 'Failed to fetch notifications'
      vi.spyOn(getNotifications, 'mockRejectedValue').mockRejectedValue(new Error(errorMessage))

      await store.fetchNotifications()

      expect(store.notifications).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(errorMessage)
      expect(store.hasFetchedInitial).toBe(true) // Still marked as fetched to prevent infinite retries
    })

    /**
     * Test: Pagination - Fetching Next Page
     *
     * Verifies that the store can fetch subsequent pages of notifications and
     * correctly append them to the existing notifications list.
     *
     * The test:
     * 1. Sets up the store with initial pagination state
     * 2. Mocks sequential API responses for first and second pages
     * 3. Calls fetchNotifications() followed by fetchNextPage()
     * 4. Verifies that both API calls were made correctly
     * 5. Checks that notifications from both pages are combined correctly
     * 6. Confirms that pagination state is updated properly
     */
    it('should fetch next page of notifications', async () => {
      const store = useNotificationStore()
      store.currentPage = 0
      store.totalPages = 2

      const mockPage1: Page<NotificationMessage> = {
        content: [createMockNotification(1)],
        totalElements: 2,
        totalPages: 2,
        size: 1,
        number: 0,
      }
      const mockPage2: Page<NotificationMessage> = {
        content: [createMockNotification(2)],
        totalElements: 2,
        totalPages: 2,
        size: 1,
        number: 1,
      }
      vi.spyOn(getNotifications, 'mockResolvedValue').mockResolvedValueOnce(mockPage1).mockResolvedValueOnce(mockPage2)

      await store.fetchNotifications()
      await store.fetchNextPage()

      expect(getNotifications).toHaveBeenCalledTimes(2)
      expect(store.notifications).toEqual([createMockNotification(1), createMockNotification(2)])
      expect(store.currentPage).toBe(1)
    })

    /**
     * Test: Pagination - Loading State Protection
     *
     * Verifies that the store prevents concurrent fetch operations by checking
     * the loading state before initiating a new fetch.
     *
     * The test:
     * 1. Sets the store's isLoading state to true
     * 2. Attempts to fetch the next page
     * 3. Verifies that no API call was made
     */
    it('should not fetch next page if already loading', async () => {
      const store = useNotificationStore()
      store.isLoading = true

      await store.fetchNextPage()

      expect(getNotifications).not.toHaveBeenCalled()
    })

    /**
     * Test: Pagination - End of Pages Protection
     *
     * Verifies that the store prevents fetching beyond the available pages
     * by checking the current page against total pages.
     *
     * The test:
     * 1. Sets the store's pagination state to indicate we're at the last page
     * 2. Attempts to fetch the next page
     * 3. Verifies that no API call was made
     */
    it('should not fetch next page if no more pages', async () => {
      const store = useNotificationStore()
      store.currentPage = 1
      store.totalPages = 2 // Assuming 0-based indexing

      await store.fetchNextPage()

      expect(getNotifications).not.toHaveBeenCalled()
    })

    /**
     * Test: Force Refresh Functionality
     *
     * Verifies that the store can force a refresh of notifications, replacing
     * existing data with fresh data from the backend.
     *
     * The test:
     * 1. Sets up the store with existing notifications and state
     * 2. Mocks an API response with different notification data
     * 3. Calls fetchNotifications with forceRefresh=true
     * 4. Verifies that the API was called correctly
     * 5. Checks that the store's notifications were completely replaced
     */
    it('should force refresh notifications', async () => {
      const store = useNotificationStore()
      store.hasFetchedInitial = true
      store.notifications = [createMockNotification(3)]
      const mockPage: Page<NotificationMessage> = {
        content: [createMockNotification(1), createMockNotification(2)],
        totalElements: 2,
        totalPages: 1,
        size: 20,
        number: 0,
      }
      vi.spyOn(getNotifications, 'mockResolvedValue').mockResolvedValue(mockPage)

      await store.fetchNotifications(0, true)

      expect(getNotifications).toHaveBeenCalledWith(1, 20)
      expect(store.notifications).toEqual(mockPage.content)
      expect(store.hasFetchedInitial).toBe(true)
    })
  })

  /**
   * Adding Notifications Tests
   *
   * These tests verify the behavior of the addNotification action, which is responsible
   * for adding new notifications to the store. The tests cover various scenarios including
   * adding new notifications, handling duplicates, updating the unread status, and
   * persisting changes to localStorage.
   */
  describe('Adding Notifications', () => {
    /**
     * Test: Basic Notification Addition
     *
     * Verifies that a new notification can be added to the store.
     * This is the most basic functionality of the addNotification action.
     *
     * The test:
     * 1. Creates a new notification
     * 2. Adds it to the store
     * 3. Verifies that the notification is present in the store's notifications array
     */
    it('should add a new notification', () => {
      const store = useNotificationStore()
      const newNotification = createMockNotification(1)

      store.addNotification(newNotification)

      expect(store.notifications).toContainEqual(newNotification)
    })

    /**
     * Test: Unread Status Update
     *
     * Verifies that adding a new notification updates the hasUnread flag.
     * This is important for UI indicators that show when new notifications are available.
     *
     * The test:
     * 1. Sets up the store with existing notifications and hasUnread=false
     * 2. Adds a new notification
     * 3. Verifies that the notification is added and hasUnread is updated to true
     */
    it('should add a new notification and update hasUnread', () => {
      const store = useNotificationStore()
      store.notifications = [createMockNotification(2)]
      store.hasUnread = false

      const newNotification = createMockNotification(1)

      store.addNotification(newNotification)

      expect(store.notifications).toContainEqual(newNotification)
      expect(store.hasUnread).toBe(true)
    })

    /**
     * Test: Duplicate Prevention
     *
     * Verifies that the store prevents duplicate notifications from being added.
     * This is important to avoid showing the same notification multiple times.
     *
     * The test:
     * 1. Sets up the store with an existing notification
     * 2. Attempts to add the same notification again
     * 3. Verifies that only one instance of the notification exists in the store
     */
    it('should not add a duplicate notification', () => {
      const store = useNotificationStore()
      const existingNotification = createMockNotification(1)
      store.notifications = [existingNotification]

      store.addNotification(existingNotification)

      expect(store.notifications.filter(n => n.id === 1).length).toBe(1)
    })

    /**
     * Test: Persistence to localStorage
     *
     * Verifies that adding a notification persists the updated notifications array to localStorage.
     * This is important for maintaining the notification state across page refreshes.
     *
     * The test:
     * 1. Spies on localStorage.setItem
     * 2. Adds a new notification
     * 3. Verifies that localStorage.setItem was called with the correct key and value
     */
    it('should save notifications to localStorage', () => {
      const store = useNotificationStore()
      const newNotification = createMockNotification(1)
      vi.spyOn(localStorage, 'setItem')

      store.addNotification(newNotification)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'notifications',
        JSON.stringify(store.notifications)
      )
    })
  })

  /**
   * Marking Notifications as Read Tests
   *
   * These tests verify the behavior of the markAllAsRead action, which is responsible
   * for marking all notifications as read both in the store and on the backend.
   * The tests cover successful marking of notifications and error handling.
   */
  describe('Marking Notifications as Read', () => {
    /**
     * Test: Successfully Marking All Notifications as Read
     *
     * Verifies that the store can mark all notifications as read, update the hasUnread flag,
     * persist changes to localStorage, and call the backend service.
     *
     * The test:
     * 1. Sets up the store with unread notifications
     * 2. Mocks a successful API response
     * 3. Calls markAllAsRead()
     * 4. Verifies that:
     *    - All notifications have a readAt timestamp
     *    - The hasUnread flag is set to false
     *    - The backend service was called
     *    - The changes were persisted to localStorage
     */
    it('should mark all notifications as read', async () => {
      const store = useNotificationStore()
      store.notifications = [
        { ...createMockNotification(1), readAt: undefined },
        { ...createMockNotification(2), readAt: undefined },
      ]
      store.hasUnread = true
      vi.spyOn(markAllNotificationsAsRead, 'mockResolvedValue').mockResolvedValue(undefined)
      vi.spyOn(localStorage, 'setItem')

      await store.markAllAsRead()

      expect(store.notifications.every(n => n.readAt !== undefined)).toBe(true)
      expect(store.hasUnread).toBe(false)
      expect(markAllNotificationsAsRead).toHaveBeenCalledTimes(1)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'notifications',
        JSON.stringify(store.notifications)
      )
    })

    /**
     * Test: Error Handling When Marking Notifications as Read
     *
     * Verifies that the store properly handles errors when the backend service
     * fails to mark notifications as read.
     *
     * The test:
     * 1. Mocks an API error response
     * 2. Calls markAllAsRead()
     * 3. Verifies that the error state is updated correctly
     */
    it('should handle mark all as read error', async () => {
      const store = useNotificationStore()
      const errorMessage = 'Failed to mark all as read'
      vi.spyOn(markAllNotificationsAsRead, 'mockRejectedValue').mockRejectedValue(new Error(errorMessage))

      await store.markAllAsRead()

      expect(store.error).toBe(errorMessage)
    })
  })

  /**
   * Checking for Unread Notifications Tests
   *
   * These tests verify the behavior of the checkUnreadNotifications action, which is responsible
   * for querying the backend to determine if the user has any unread notifications.
   * This is important for UI indicators that show when new notifications are available.
   */
  describe('Checking for Unread Notifications', () => {
    /**
     * Test: Successfully Checking for Unread Notifications
     *
     * Verifies that the store can successfully query the backend for unread notifications
     * and update its state accordingly.
     *
     * The test:
     * 1. Mocks a successful API response indicating unread notifications exist
     * 2. Calls checkUnreadNotifications()
     * 3. Verifies that:
     *    - The backend service was called
     *    - The hasUnread flag is updated to match the API response
     */
    it('should check for unread notifications successfully', async () => {
      const store = useNotificationStore()
      vi.spyOn(hasUnreadNotifications, 'mockResolvedValue').mockResolvedValue(true)

      await store.checkUnreadNotifications()

      expect(hasUnreadNotifications).toHaveBeenCalledTimes(1)
      expect(store.hasUnread).toBe(true)
    })

    /**
     * Test: Error Handling When Checking for Unread Notifications
     *
     * Verifies that the store properly handles errors when the backend service
     * fails to check for unread notifications.
     *
     * The test:
     * 1. Mocks an API error response
     * 2. Calls checkUnreadNotifications()
     * 3. Verifies that:
     *    - The error state is updated correctly
     *    - The hasUnread flag defaults to false when an error occurs
     *      (preventing false positives in the UI)
     */
    it('should handle check unread notifications error', async () => {
      const store = useNotificationStore()
      const errorMessage = 'Failed to check for unread notifications'
      vi.spyOn(hasUnreadNotifications, 'mockRejectedValue').mockRejectedValue(new Error(errorMessage))

      await store.checkUnreadNotifications()

      expect(store.error).toBe(errorMessage)
      expect(store.hasUnread).toBe(false) // Default value when error occurs
    })
  })

  /**
   * Resetting the Store Tests
   *
   * These tests verify the behavior of the resetStore action, which is responsible
   * for completely resetting the store's state to its default values and clearing
   * any persisted data from localStorage. This is important for scenarios like
   * user logout or application reset.
   */
  describe('Resetting the Store', () => {
    /**
     * Test: Complete Store Reset
     *
     * Verifies that the resetStore action properly resets all state properties
     * to their default values and clears all related data from localStorage.
     *
     * The test:
     * 1. Sets up the store with non-default values for all state properties
     * 2. Spies on localStorage.removeItem
     * 3. Calls resetStore()
     * 4. Verifies that:
     *    - All state properties are reset to their default values
     *    - localStorage.removeItem is called for each persisted property
     *
     * This ensures that no stale data remains after a reset, which could
     * cause unexpected behavior if the store is reinitialized.
     */
    it('should reset the store and clear localStorage', () => {
      const store = useNotificationStore()
      store.notifications = [createMockNotification(1)]
      store.isLoading = true
      store.error = 'Some error'
      store.hasFetchedInitial = true
      store.currentPage = 1
      store.totalPages = 2
      store.pageSize = 10
      store.hasUnread = true
      vi.spyOn(localStorage, 'removeItem')

      store.resetStore()

      expect(store.notifications).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.hasFetchedInitial).toBe(false)
      expect(store.currentPage).toBe(0)
      expect(store.totalPages).toBe(0)
      expect(store.pageSize).toBe(20)
      expect(store.hasUnread).toBe(false)
      expect(localStorage.removeItem).toHaveBeenCalledTimes(5)
    })
  })

  /**
   * Computed Getters Tests
   *
   * These tests verify the behavior of the computed getters in the NotificationStore.
   * Computed getters derive values from the store's state and are important for
   * providing derived data to components without duplicating logic.
   */
  describe('Computed Getters', () => {
    /**
     * Test: Unread Count Computation
     *
     * Verifies that the unreadCount getter correctly calculates the number of
     * unread notifications in the store. This is important for UI indicators
     * that show the number of unread notifications.
     *
     * The test:
     * 1. Sets up the store with a mix of read and unread notifications
     * 2. Checks that unreadCount returns the correct number of unread notifications
     */
    it('should correctly compute unreadCount', () => {
      const store = useNotificationStore()
      store.notifications = [
        { ...createMockNotification(1), readAt: new Date() },      // Read
        { ...createMockNotification(2), readAt: undefined },       // Unread
        { ...createMockNotification(3), readAt: new Date() },      // Read
        { ...createMockNotification(4), readAt: undefined },       // Unread
      ]

      expect(store.unreadCount).toBe(2)
    })

    /**
     * Test: Latest Notifications Computation
     *
     * Verifies that the latestNotifications getter correctly returns the most
     * recent notifications sorted by creation date. This is important for UI
     * components that display a limited number of the most recent notifications.
     *
     * The test:
     * 1. Sets up the store with notifications having different creation dates
     * 2. Defines the expected result (3 most recent notifications sorted by date)
     * 3. Checks that latestNotifications returns the correct notifications in the correct order
     */
    it('should correctly compute latestNotifications', () => {
      const store = useNotificationStore()
      store.notifications = [
        { ...createMockNotification(1), createdAt: new Date(2024, 0, 1) },  // Jan 1, 2024
        { ...createMockNotification(2), createdAt: new Date(2024, 0, 3) },  // Jan 3, 2024
        { ...createMockNotification(3), createdAt: new Date(2024, 0, 2) },  // Jan 2, 2024
        { ...createMockNotification(4), createdAt: new Date(2024, 0, 4) },  // Jan 4, 2024
        { ...createMockNotification(5), createdAt: new Date(2024, 0, 0) },  // Dec 31, 2023
      ]

      // Expected: 3 most recent notifications in descending date order
      const expectedLatest = [
        { ...createMockNotification(4), createdAt: new Date(2024, 0, 4) },  // Most recent
        { ...createMockNotification(2), createdAt: new Date(2024, 0, 3) },  // Second most recent
        { ...createMockNotification(3), createdAt: new Date(2024, 0, 2) },  // Third most recent
      ]

      expect(store.latestNotifications).toEqual(expectedLatest)
    })
  })
})
