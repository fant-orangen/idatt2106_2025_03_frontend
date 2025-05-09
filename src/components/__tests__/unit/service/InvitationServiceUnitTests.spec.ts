/**
 * InvitationService Unit Tests
 *
 * This file contains comprehensive unit tests for the InvitationService, which is responsible
 * for invitation-related operations including fetching pending invitations, accepting invitations,
 * and declining invitations.
 *
 * The tests verify the service's functionality including:
 * - Fetching pending invitations for the current user
 * - Accepting household invitations
 * - Declining household invitations
 * - Handling various error scenarios
 *
 * @file InvitationServiceUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { AxiosResponse } from 'axios'
import * as invitationService from '@/services/InvitationService.ts'
import type { Invitation } from '@/models/Invitation'
import type { Household, HouseholdJoinRequestDto } from '@/models/Household'

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
 * Helper function to create a mock Invitation
 *
 * @param id - The unique identifier for the invitation
 * @returns An Invitation object with default test values
 */
const createMockInvitation = (id: number): Invitation => ({
  id,
  inviterUser: {
    id: 1,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User'
  },
  inviteeEmail: `user${id}@example.com`,
  household: {
    id: 1,
    name: 'Test Household'
  },
  token: `token-${id}`,
  expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
  createdAt: new Date().toISOString(),
  acceptedAt: null,
  declinedAt: null
})

/**
 * Helper function to create a mock Household
 *
 * @param id - The unique identifier for the household
 * @returns A Household object with default test values
 */
const createMockHousehold = (id: number): Household => ({
  id,
  name: `Household ${id}`,
  address: `Address ${id}`,
  populationCount: 3,
  latitude: 10.0 + id * 0.1,
  longitude: 20.0 + id * 0.1,
  members: [
    {
      id: 1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    },
    {
      id: 2,
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      isAdmin: false
    }
  ]
})

/**
 * Main test suite for the InvitationService
 *
 * This suite contains all tests related to the InvitationService functionality.
 * Each nested describe block focuses on a specific aspect of the service's behavior.
 */
describe('InvitationService', () => {
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
   * fetchPendingInvitations Tests
   *
   * These tests verify the behavior of the fetchPendingInvitations function.
   */
  describe('fetchPendingInvitations', () => {
    /**
     * Test: Successful Pending Invitations Retrieval
     *
     * Verifies that the fetchPendingInvitations function correctly retrieves
     * pending invitations for the current user.
     */
    it('should fetch pending invitations successfully', async () => {
      // Create mock data
      const mockInvitations: Invitation[] = [
        createMockInvitation(1),
        createMockInvitation(2),
        createMockInvitation(3)
      ]

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockInvitations))

      // Call the service method
      const result = await invitationService.fetchPendingInvitations()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/invitations/pending')

      // Verify the result matches the mock response
      expect(result).toEqual(mockInvitations)
      expect(result.length).toBe(3)
    })

    /**
     * Test: Empty Invitations List
     *
     * Verifies that the fetchPendingInvitations function correctly handles
     * the case when there are no pending invitations.
     */
    it('should handle empty invitations list', async () => {
      // Create mock data - empty array
      const mockInvitations: Invitation[] = []

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockInvitations))

      // Call the service method
      const result = await invitationService.fetchPendingInvitations()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/invitations/pending')

      // Verify the result is an empty array
      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchPendingInvitations function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching pending invitations', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch pending invitations'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(invitationService.fetchPendingInvitations()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/invitations/pending')
    })
  })

  /**
   * acceptInvitation Tests
   *
   * These tests verify the behavior of the acceptInvitation function.
   */
  describe('acceptInvitation', () => {
    /**
     * Test: Successful Invitation Acceptance
     *
     * Verifies that the acceptInvitation function correctly accepts an invitation
     * and returns the joined household data.
     */
    it('should accept an invitation successfully', async () => {
      // Create mock data
      const token = 'valid-token'
      const payload: HouseholdJoinRequestDto = { token }
      const mockHousehold = createMockHousehold(1)

      // Mock the API response
      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockHousehold))

      // Call the service method
      const result = await invitationService.acceptInvitation(token)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/invitations/accept', payload)

      // Verify the result matches the mock response
      expect(result).toEqual(mockHousehold)
      expect(result.id).toBe(mockHousehold.id)
      expect(result.name).toBe(mockHousehold.name)
    })

    /**
     * Test: User Already Has Household Error
     *
     * Verifies that the acceptInvitation function correctly handles the specific error
     * when a user already has a household.
     */
    it('should handle error when user already has a household', async () => {
      // Create mock data
      const token = 'valid-token'
      const payload: HouseholdJoinRequestDto = { token }

      // Create a mock error with response data indicating user already has a household
      const error = new Error('Failed to accept invitation') as any
      error.response = {
        data: 'User already has a household'
      }

      // Mock the API to throw the error
      vi.mocked(api.post).mockRejectedValue(error)

      // Verify that the service method throws the specific error message
      await expect(invitationService.acceptInvitation(token)).rejects.toThrow(
        'You already have a household. Please leave your current household before accepting this invitation.'
      )

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/invitations/accept', payload)
    })

    /**
     * Test: General Error Handling
     *
     * Verifies that the acceptInvitation function correctly handles general errors
     * from the API and re-throws them.
     */
    it('should handle general errors when accepting an invitation', async () => {
      // Create mock data
      const token = 'invalid-token'
      const payload: HouseholdJoinRequestDto = { token }
      const errorMessage = 'Invalid or expired token'

      // Create a mock error without specific response data
      const error = new Error(errorMessage) as any
      error.response = {
        data: 'Invalid token'
      }

      // Mock the API to throw the error
      vi.mocked(api.post).mockRejectedValue(error)

      // Verify that the service method re-throws the error
      await expect(invitationService.acceptInvitation(token)).rejects.toThrow()

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/invitations/accept', payload)
    })
  })

  /**
   * declineInvitation Tests
   *
   * These tests verify the behavior of the declineInvitation function.
   */
  describe('declineInvitation', () => {
    /**
     * Test: Successful Invitation Decline
     *
     * Verifies that the declineInvitation function correctly declines an invitation.
     */
    it('should decline an invitation successfully', async () => {
      // Create mock data
      const token = 'valid-token'
      const payload: HouseholdJoinRequestDto = { token }

      // Mock the API response (void response)
      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(null))

      // Call the service method
      await invitationService.declineInvitation(token)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/invitations/decline', payload)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the declineInvitation function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when declining an invitation', async () => {
      // Create mock data
      const token = 'invalid-token'
      const payload: HouseholdJoinRequestDto = { token }
      const errorMessage = 'Failed to decline invitation'

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(invitationService.declineInvitation(token)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/invitations/decline', payload)
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the InvitationService functions in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Empty Token Handling
     *
     * Verifies that the service correctly handles empty tokens.
     */
    it('should handle empty token when accepting an invitation', async () => {
      // Create mock data
      const token = ''
      const payload: HouseholdJoinRequestDto = { token }
      const errorMessage = 'Invalid token'

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(invitationService.acceptInvitation(token)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/invitations/accept', payload)
    })

    /**
     * Test: Empty Token Handling for Decline
     *
     * Verifies that the service correctly handles empty tokens when declining.
     */
    it('should handle empty token when declining an invitation', async () => {
      // Create mock data
      const token = ''
      const payload: HouseholdJoinRequestDto = { token }
      const errorMessage = 'Invalid token'

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(invitationService.declineInvitation(token)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/invitations/decline', payload)
    })
  })
})
