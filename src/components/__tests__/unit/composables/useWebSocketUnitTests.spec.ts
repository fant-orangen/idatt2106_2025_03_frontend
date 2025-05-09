/**
 * Unit Tests for useWebSocket Composable
 *
 * This file contains comprehensive unit tests for the useWebSocket composable,
 * which provides WebSocket functionality for real-time notifications in the application.
 * The tests verify the composable's ability to connect to WebSocket, handle disconnections,
 * and manage the connection state based on user authentication.
 *
 * The useWebSocket composable handles:
 * - Establishing WebSocket connections using SockJS and STOMP
 * - Subscribing to user-specific notification topics
 * - Processing incoming notifications
 * - Managing connection state
 * - Automatic connection/disconnection based on user authentication
 *
 * @file useWebSocketUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWebSocket } from '@/composables/useWebSocket'
import { useUserStore } from '@/stores/UserStore'
import { useNotificationStore } from '@/stores/NotificationStore'
import SockJS from 'sockjs-client'
import { Client, over, Frame } from 'stompjs'
import { toast } from 'vue-sonner'

// Mock Vue composition API
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    ref: vi.fn((val) => ({
      value: val,
    })),
    watch: vi.fn(),
  }
})

// Mock the stores
vi.mock('@/stores/UserStore', () => {
  return {
    useUserStore: vi.fn()
  }
})

vi.mock('@/stores/NotificationStore', () => {
  return {
    useNotificationStore: vi.fn()
  }
})

// Mock SockJS
vi.mock('sockjs-client', () => {
  return {
    default: vi.fn()
  }
})

// Mock STOMP
vi.mock('stompjs', () => {
  return {
    Client: vi.fn(),
    over: vi.fn(),
    Frame: vi.fn()
  }
})

// Mock toast
vi.mock('vue-sonner', () => {
  return {
    toast: {
      warning: vi.fn(),
      info: vi.fn(),
      error: vi.fn()
    }
  }
})

describe('useWebSocket', () => {
  // Mock STOMP client
  const mockStompClient = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribe: vi.fn(),
    connected: false
  }

  // Mock SockJS instance
  const mockSockJS = {}

  // Store mocks
  const mockUserStore = {
    loggedIn: true,
    userId: '123',
    token: 'mock-token',
    isAuthenticated: true
  }

  const mockNotificationStore = {
    addNotification: vi.fn()
  }

  beforeEach(() => {
    // Set up Pinia
    setActivePinia(createPinia())

    // Reset all mocks
    vi.resetAllMocks()

    // Set up store mocks
    vi.mocked(useUserStore).mockReturnValue(mockUserStore)
    vi.mocked(useNotificationStore).mockReturnValue(mockNotificationStore)

    // Set up SockJS mock
    vi.mocked(SockJS).mockImplementation(() => mockSockJS)

    // Set up STOMP over mock
    vi.mocked(over).mockReturnValue(mockStompClient)

    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks()
  })

  /**
   * Test: Initial state
   *
   * This test verifies that the composable initializes with the correct state.
   */
  it('should initialize with correct state', () => {
    const { isConnected } = useWebSocket()

    expect(isConnected.value).toBe(false)
  })

  /**
   * Test: tryConnect function when user is logged in
   *
   * This test verifies that the tryConnect function correctly
   * establishes a WebSocket connection when the user is logged in.
   */
  it('should establish connection when user is logged in', () => {
    // Set up user as logged in
    mockUserStore.loggedIn = true
    mockUserStore.userId = '123'
    mockUserStore.token = 'mock-token'

    // Call the composable
    const { tryConnect, isConnected } = useWebSocket()

    // Execute the function
    tryConnect()

    // Verify SockJS was created with correct URL
    expect(SockJS).toHaveBeenCalledWith('http://localhost:8080/ws')

    // Verify STOMP client was created
    expect(over).toHaveBeenCalledWith(mockSockJS)

    // Verify connect was called with correct headers
    expect(mockStompClient.connect).toHaveBeenCalledWith(
      { Authorization: 'Bearer mock-token' },
      expect.any(Function),
      expect.any(Function)
    )
  })

  /**
   * Test: tryConnect function when user is not logged in
   *
   * This test verifies that the tryConnect function does not
   * establish a connection when the user is not logged in.
   */
  it('should not connect when user is not logged in', () => {
    // Set up user as not logged in
    mockUserStore.loggedIn = false
    mockUserStore.userId = null
    mockUserStore.token = null

    // Call the composable
    const { tryConnect } = useWebSocket()

    // Execute the function
    tryConnect()

    // Verify SockJS was not created
    expect(SockJS).not.toHaveBeenCalled()

    // Verify STOMP client was not created
    expect(over).not.toHaveBeenCalled()

    // Verify connect was not called
    expect(mockStompClient.connect).not.toHaveBeenCalled()
  })

  /**
   * Test: tryConnect function when already connected
   *
   * This test verifies that the tryConnect function does not
   * establish a new connection when already connected.
   */
  it('should not connect when already connected', () => {
    // Call the composable
    const { tryConnect, isConnected } = useWebSocket()

    // Set as already connected
    isConnected.value = true

    // Execute the function
    tryConnect()

    // Verify SockJS was not created
    expect(SockJS).not.toHaveBeenCalled()

    // Verify STOMP client was not created
    expect(over).not.toHaveBeenCalled()

    // Verify connect was not called
    expect(mockStompClient.connect).not.toHaveBeenCalled()
  })

  /**
   * Test: tryDisconnect function when not connected
   *
   * This test verifies that the tryDisconnect function correctly
   * handles the case when there is no active connection.
   */
  it('should handle disconnect when not connected', () => {
    // Set up client as not connected
    mockStompClient.connected = false

    // Call the composable
    const { tryDisconnect, isConnected } = useWebSocket()

    // Set as not connected
    isConnected.value = false

    // Execute the function
    tryDisconnect()

    // Verify disconnect was not called
    expect(mockStompClient.disconnect).not.toHaveBeenCalled()
  })

})
