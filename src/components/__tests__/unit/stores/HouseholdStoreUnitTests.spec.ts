/**
 * HouseholdStore Unit Tests
 *
 * This file contains comprehensive unit tests for the HouseholdStore, which is responsible
 * for managing household state in the application. The tests verify the store's functionality
 * including initialization, data fetching, household member management, and error handling.
 *
 * The HouseholdStore handles:
 * - Managing the current household data
 * - Fetching household information from the backend API
 * - Managing household members
 * - Joining households with invitation tokens
 * - Tracking loading and error states
 *
 * @file HouseholdStoreUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHouseholdStore } from '@/stores/HouseholdStore.ts'
import { useUserStore } from '@/stores/UserStore.ts'
import {
  getCurrentHousehold,
  getHouseholdMembers,
  getEmptyHouseholdMembers,
  joinWithToken
} from '@/services/HouseholdService.ts'
import type { Household, HouseholdMember, EmptyHouseholdMemberDto } from '@/models/Household'

/**
 * Mock Setup
 *
 * We mock the HouseholdService module to isolate the store from actual API calls.
 * This allows us to control the behavior of service methods and test the store's
 * response to different scenarios (success, error, etc.).
 */
vi.mock('@/services/HouseholdService.ts', () => {
  return {
    getCurrentHousehold: vi.fn(),
    getHouseholdMembers: vi.fn(),
    getEmptyHouseholdMembers: vi.fn(),
    joinWithToken: vi.fn()
  }
})

// Mock the UserStore
vi.mock('@/stores/UserStore.ts', () => {
  return {
    useUserStore: vi.fn(() => ({
      loggedIn: true
    }))
  }
})

/**
 * Helper function to create a mock Household
 *
 * This function generates a household object with default values
 * that can be used across multiple tests for consistency.
 *
 * @param id - The unique identifier for the household
 * @returns A Household object with default test values
 */
const createMockHousehold = (id: number): Household => ({
  id,
  name: `Household ${id}`,
  address: `Address ${id}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

/**
 * Helper function to create a mock HouseholdMember
 *
 * This function generates a household member object with default values
 * that can be used across multiple tests for consistency.
 *
 * @param id - The unique identifier for the member
 * @returns A HouseholdMember object with default test values
 */
const createMockHouseholdMember = (id: number): HouseholdMember => ({
  id,
  userId: id * 10,
  householdId: 1,
  firstName: `First${id}`,
  lastName: `Last${id}`,
  email: `user${id}@example.com`,
  role: 'MEMBER',
  joinedAt: new Date().toISOString()
})

/**
 * Helper function to create a mock EmptyHouseholdMemberDto
 *
 * This function generates an empty household member object with default values
 * that can be used across multiple tests for consistency.
 *
 * @param id - The unique identifier for the empty member
 * @returns An EmptyHouseholdMemberDto object with default test values
 */
const createMockEmptyHouseholdMember = (id: number): EmptyHouseholdMemberDto => ({
  id,
  householdId: 1,
  invitationToken: `token-${id}`,
  email: `invited${id}@example.com`,
  createdAt: new Date().toISOString()
})

/**
 * Main test suite for the HouseholdStore
 *
 * This suite contains all tests related to the HouseholdStore functionality.
 * Each nested describe block focuses on a specific aspect of the store's behavior.
 */
describe('HouseholdStore', () => {
  /**
   * Test Setup
   *
   * Before each test:
   * 1. Create a fresh Pinia instance to ensure tests are isolated
   * 2. Reset all mocks to clear any previous mock calls or implementations
   */
  beforeEach(() => {
    // Create a fresh Pinia instance and make it active
    setActivePinia(createPinia())

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
      const store = useHouseholdStore()
      expect(store.currentHousehold).toBeNull()
      expect(store.members).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.isMemberOfHousehold).toBe(false)
    })
  })

  /**
   * State Manipulation Tests
   *
   * These tests verify the behavior of the state manipulation functions.
   * The store should correctly update its state when these functions are called.
   */
  describe('State Manipulation', () => {
    /**
     * Test: Setting Current Household
     *
     * Verifies that the setCurrentHousehold function correctly updates the currentHousehold state.
     */
    it('should set current household', () => {
      const store = useHouseholdStore()
      const mockHousehold = createMockHousehold(1)

      store.setCurrentHousehold(mockHousehold)

      expect(store.currentHousehold).toEqual(mockHousehold)
    })

    /**
     * Test: Setting Members
     *
     * Verifies that the setMembers function correctly updates the members state.
     */
    it('should set members', () => {
      const store = useHouseholdStore()
      const mockMembers = [
        createMockHouseholdMember(1),
        createMockHouseholdMember(2),
        createMockEmptyHouseholdMember(3)
      ]

      store.setMembers(mockMembers)

      expect(store.members).toEqual(mockMembers)
    })

    /**
     * Test: Adding a Member
     *
     * Verifies that the addMember function correctly adds a member to the members array.
     */
    it('should add a member', () => {
      const store = useHouseholdStore()
      const mockMember = createMockHouseholdMember(1)

      store.addMember(mockMember)

      expect(store.members).toContainEqual(mockMember)
    })

    /**
     * Test: Removing a Member
     *
     * Verifies that the removeMember function correctly removes a member from the members array.
     */
    it('should remove a member', () => {
      const store = useHouseholdStore()
      const mockMember1 = createMockHouseholdMember(1)
      const mockMember2 = createMockHouseholdMember(2)

      store.setMembers([mockMember1, mockMember2])
      store.removeMember(mockMember1.id)

      expect(store.members).not.toContainEqual(mockMember1)
      expect(store.members).toContainEqual(mockMember2)
    })

    /**
     * Test: Setting Loading State
     *
     * Verifies that the setLoading function correctly updates the isLoading state.
     */
    it('should set loading state', () => {
      const store = useHouseholdStore()

      store.setLoading(true)
      expect(store.isLoading).toBe(true)

      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })

    /**
     * Test: Setting Error State
     *
     * Verifies that the setError function correctly updates the error state.
     */
    it('should set error state', () => {
      const store = useHouseholdStore()
      const errorMessage = 'Test error message'

      store.setError(errorMessage)
      expect(store.error).toBe(errorMessage)

      store.setError(null)
      expect(store.error).toBeNull()
    })
  })

  /**
   * Computed Properties Tests
   *
   * These tests verify the behavior of the computed properties in the HouseholdStore.
   */
  describe('Computed Properties', () => {
    /**
     * Test: isMemberOfHousehold Computation
     *
     * Verifies that the isMemberOfHousehold computed property correctly reflects
     * whether the user is a member of a household based on the currentHousehold state.
     */
    it('should correctly compute isMemberOfHousehold', () => {
      const store = useHouseholdStore()

      // Initially, currentHousehold is null, so isMemberOfHousehold should be false
      expect(store.isMemberOfHousehold).toBe(false)

      // Set a household
      store.setCurrentHousehold(createMockHousehold(1))

      // Now isMemberOfHousehold should be true
      expect(store.isMemberOfHousehold).toBe(true)

      // Clear the household
      store.setCurrentHousehold(null)

      // isMemberOfHousehold should be false again
      expect(store.isMemberOfHousehold).toBe(false)
    })
  })

  /**
   * API Interaction Tests
   *
   * These tests verify the behavior of the functions that interact with the API.
   * The store should correctly handle API responses and update its state accordingly.
   */
  describe('API Interactions', () => {
    /**
     * Test: Fetching Current Household
     *
     * Verifies that the fetchCurrentHousehold function correctly fetches the current household
     * from the API and updates the store's state.
     */
    it('should fetch current household successfully', async () => {
      const store = useHouseholdStore()
      const mockHousehold = createMockHousehold(1)

      vi.mocked(getCurrentHousehold).mockResolvedValue(mockHousehold)

      await store.fetchCurrentHousehold()

      expect(getCurrentHousehold).toHaveBeenCalled()
      expect(store.currentHousehold).toEqual(mockHousehold)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    /**
     * Test: Error Handling When Fetching Current Household
     *
     * Verifies that the fetchCurrentHousehold function correctly handles errors
     * from the API and updates the store's error state.
     */
    it('should handle errors when fetching current household', async () => {
      const store = useHouseholdStore()
      const errorMessage = 'Failed to fetch household'

      vi.mocked(getCurrentHousehold).mockRejectedValue(new Error(errorMessage))

      await store.fetchCurrentHousehold()

      expect(getCurrentHousehold).toHaveBeenCalled()
      expect(store.currentHousehold).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(errorMessage)
    })

    /**
     * Test: Not Fetching Current Household When Not Logged In
     *
     * Verifies that the fetchCurrentHousehold function does not fetch the current household
     * when the user is not logged in.
     */
    it('should not fetch current household when not logged in', async () => {
      // Mock the UserStore to return loggedIn as false
      vi.mocked(useUserStore).mockReturnValue({
        loggedIn: false
      } as any)

      const store = useHouseholdStore()

      await store.fetchCurrentHousehold()

      expect(getCurrentHousehold).not.toHaveBeenCalled()
    })

    /**
     * Test: Fetching Household Members
     *
     * Verifies that the fetchHouseholdMembers function correctly fetches household members
     * from the API and updates the store's state.
     */
    it('should fetch household members successfully', async () => {
      const store = useHouseholdStore()
      const mockHousehold = createMockHousehold(1)
      const mockRegularMembers = [createMockHouseholdMember(1), createMockHouseholdMember(2)]
      const mockEmptyMembers = [createMockEmptyHouseholdMember(3)]

      store.setCurrentHousehold(mockHousehold)
      vi.mocked(getHouseholdMembers).mockResolvedValue(mockRegularMembers)
      vi.mocked(getEmptyHouseholdMembers).mockResolvedValue(mockEmptyMembers)

      await store.fetchHouseholdMembers()

      expect(getHouseholdMembers).toHaveBeenCalled()
      expect(getEmptyHouseholdMembers).toHaveBeenCalled()
      expect(store.members).toEqual([...mockRegularMembers, ...mockEmptyMembers])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    /**
     * Test: Error Handling When Fetching Household Members
     *
     * Verifies that the fetchHouseholdMembers function correctly handles errors
     * from the API and updates the store's error state.
     */
    it('should handle errors when fetching household members', async () => {
      const store = useHouseholdStore()
      const mockHousehold = createMockHousehold(1)
      const errorMessage = 'Failed to fetch household members'

      store.setCurrentHousehold(mockHousehold)
      vi.mocked(getHouseholdMembers).mockRejectedValue(new Error(errorMessage))

      await store.fetchHouseholdMembers()

      expect(getHouseholdMembers).toHaveBeenCalled()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(errorMessage)
    })

    /**
     * Test: Not Fetching Household Members When No Current Household
     *
     * Verifies that the fetchHouseholdMembers function does not fetch household members
     * when there is no current household.
     */
    it('should not fetch household members when no current household', async () => {
      const store = useHouseholdStore()

      await store.fetchHouseholdMembers()

      expect(getHouseholdMembers).not.toHaveBeenCalled()
      expect(getEmptyHouseholdMembers).not.toHaveBeenCalled()
    })

    /**
     * Test: Joining Household with Token
     *
     * Verifies that the joinHouseholdWithToken function correctly joins a household
     * using a token and updates the store's state.
     */
    it('should join household with token successfully', async () => {
      const store = useHouseholdStore()
      const mockHousehold = createMockHousehold(1)
      const token = 'valid-token'

      vi.mocked(joinWithToken).mockResolvedValue(mockHousehold)

      await store.joinHouseholdWithToken(token)

      expect(joinWithToken).toHaveBeenCalledWith(token)
      expect(store.currentHousehold).toEqual(mockHousehold)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    /**
     * Test: Error Handling When Joining Household with Token
     *
     * Verifies that the joinHouseholdWithToken function correctly handles errors
     * from the API and updates the store's error state.
     */
    it('should handle errors when joining household with token', async () => {
      const store = useHouseholdStore()
      const token = 'invalid-token'
      const errorMessage = 'Failed to join household'

      vi.mocked(joinWithToken).mockRejectedValue(new Error(errorMessage))

      await expect(store.joinHouseholdWithToken(token)).rejects.toThrow(errorMessage)

      expect(joinWithToken).toHaveBeenCalledWith(token)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(errorMessage)
    })

    /**
     * Test: Validation When Joining Household with Empty Token
     *
     * Verifies that the joinHouseholdWithToken function validates the token
     * and throws an error if it's empty.
     */
    it('should validate token when joining household', async () => {
      const store = useHouseholdStore()

      await expect(store.joinHouseholdWithToken('')).rejects.toThrow('Token is required')
      await expect(store.joinHouseholdWithToken('  ')).rejects.toThrow('Token is required')

      expect(joinWithToken).not.toHaveBeenCalled()
    })
  })

  /**
   * Cleanup Tests
   *
   * These tests verify the behavior of the cleanHousehold function.
   * The store should correctly reset its state when this function is called.
   */
  describe('Cleanup', () => {
    /**
     * Test: Cleaning Household State
     *
     * Verifies that the cleanHousehold function correctly resets the store's state.
     */
    it('should clean household state', () => {
      const store = useHouseholdStore()

      // Set up some state
      store.setCurrentHousehold(createMockHousehold(1))
      store.setMembers([createMockHouseholdMember(1), createMockHouseholdMember(2)])
      store.setLoading(true)
      store.setError('Some error')

      // Verify state was set
      expect(store.currentHousehold).not.toBeNull()
      expect(store.members.length).toBe(2)
      expect(store.isLoading).toBe(true)
      expect(store.error).not.toBeNull()

      // Clean the state
      store.cleanHousehold()

      // Verify state was reset
      expect(store.currentHousehold).toBeNull()
      expect(store.members).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the store in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Adding a Member to an Empty Members Array
     *
     * Verifies that the addMember function correctly adds a member to an empty members array.
     */
    it('should add a member to an empty members array', () => {
      const store = useHouseholdStore()
      const mockMember = createMockHouseholdMember(1)

      expect(store.members).toEqual([])

      store.addMember(mockMember)

      expect(store.members).toEqual([mockMember])
    })

    /**
     * Test: Removing a Non-existent Member
     *
     * Verifies that the removeMember function correctly handles removing a member
     * that doesn't exist in the members array.
     */
    it('should handle removing a non-existent member', () => {
      const store = useHouseholdStore()
      const mockMember = createMockHouseholdMember(1)

      store.setMembers([mockMember])
      store.removeMember(999) // Non-existent ID

      expect(store.members).toEqual([mockMember])
    })
  })
})
