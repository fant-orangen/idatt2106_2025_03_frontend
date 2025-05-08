/**
 * HouseholdService Unit Tests
 *
 * This file contains comprehensive unit tests for the HouseholdService, which is responsible
 * for household-related operations including:
 * - Creating, updating, and deleting households
 * - Managing household members
 * - Handling household invitations
 * - Switching between households
 * - Checking user permissions
 *
 * The tests verify the service's functionality including:
 * - Retrieving household information
 * - Creating and updating households
 * - Managing household members and invitations
 * - Handling administrative operations
 * - Error handling for various scenarios
 *
 * @file HouseholdServiceUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { AxiosResponse } from 'axios'
import * as householdService from '@/services/HouseholdService.ts'
import type {
  HouseholdCreateRequestDto,
  Household,
  HouseholdMember,
  EmptyHouseholdMemberDto,
  EmptyHouseholdMemberCreateDto,
  HouseholdInviteRequestDto,
  HouseholdInviteResponseDto,
  HouseholdJoinRequestDto,
  HouseholdSwitchRequestDto,
  HouseholdUpdateRequestDto
} from '@/models/Household'
import type { Invitation } from '@/models/Invitation'

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
 * Helper function to create a mock Household
 *
 * @param id - The unique identifier for the household
 * @returns A Household object with default test values
 */
const createMockHousehold = (id: number): Household => ({
  id,
  name: `Household ${id}`,
  address: `Address ${id}`,
  numberOfMembers: 3,
  numberOfAdmins: 1
})

/**
 * Helper function to create a mock HouseholdMember
 *
 * @param id - The unique identifier for the household member
 * @param isAdmin - Whether the member is an admin
 * @returns A HouseholdMember object with default test values
 */
const createMockHouseholdMember = (id: number, isAdmin: boolean = false): HouseholdMember => ({
  id,
  firstName: `First${id}`,
  lastName: `Last${id}`,
  email: `user${id}@example.com`,
  isAdmin
})

/**
 * Helper function to create a mock EmptyHouseholdMemberDto
 *
 * @param id - The unique identifier for the empty household member
 * @returns An EmptyHouseholdMemberDto object with default test values
 */
const createMockEmptyHouseholdMember = (id: number): EmptyHouseholdMemberDto => ({
  id,
  name: `Empty Member ${id}`
})

/**
 * Helper function to create a mock Invitation
 *
 * @param id - The unique identifier for the invitation
 * @param token - The invitation token
 * @returns An Invitation object with default test values
 */
const createMockInvitation = (id: number, token: string): Invitation => ({
  id,
  token,
  email: `invited${id}@example.com`,
  expiryTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
  householdName: `Household ${id}`
})

/**
 * Main test suite for the HouseholdService
 *
 * This suite contains all tests related to the HouseholdService functionality.
 * Each nested describe block focuses on a specific aspect of the service's behavior.
 */
describe('HouseholdService', () => {
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
   * getCurrentHousehold Tests
   *
   * These tests verify the behavior of the getCurrentHousehold function.
   */
  describe('getCurrentHousehold', () => {
    /**
     * Test: Successful Household Retrieval
     *
     * Verifies that the getCurrentHousehold function correctly retrieves the current user's household.
     */
    it('should retrieve the current household successfully', async () => {
      // Create mock data
      const mockHousehold = createMockHousehold(1)

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockHousehold))

      // Call the service method
      const result = await householdService.getCurrentHousehold()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/me')

      // Verify the result matches the mock response
      expect(result).toEqual(mockHousehold)
    })

    /**
     * Test: No Household Found
     *
     * Verifies that the getCurrentHousehold function correctly returns null when the user has no household.
     */
    it('should return null when user has no household (404 response)', async () => {
      // Create a 404 error response
      const error = new Error('Not Found')
      Object.defineProperty(error, 'response', {
        value: { status: 404 }
      })

      // Mock the API to throw a 404 error
      vi.mocked(api.get).mockRejectedValue(error)

      // Call the service method
      const result = await householdService.getCurrentHousehold()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/me')

      // Verify the result is null
      expect(result).toBeNull()
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getCurrentHousehold function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving the current household', async () => {
      // Create a non-404 error response
      const error = new Error('Server Error')
      Object.defineProperty(error, 'response', {
        value: { status: 500 }
      })

      // Mock the API to throw a non-404 error
      vi.mocked(api.get).mockRejectedValue(error)

      // Verify that the service method re-throws the error
      await expect(householdService.getCurrentHousehold()).rejects.toThrow('Server Error')

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/me')
    })
  })

  /**
   * createHousehold Tests
   *
   * These tests verify the behavior of the createHousehold function.
   */
  describe('createHousehold', () => {
    /**
     * Test: Successful Household Creation
     *
     * Verifies that the createHousehold function correctly creates a household
     * and returns the created household data.
     */
    it('should create a household successfully', async () => {
      // Create mock data
      const createDto: HouseholdCreateRequestDto = {
        name: 'New Household',
        address: '123 Main St'
      }

      const mockResponse: Household = {
        id: 1,
        name: createDto.name,
        address: createDto.address,
        numberOfMembers: 1,
        numberOfAdmins: 1
      }

      // Mock the API response
      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await householdService.createHousehold(createDto)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households', createDto)

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the createHousehold function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when creating a household', async () => {
      // Create mock data
      const createDto: HouseholdCreateRequestDto = {
        name: 'New Household',
        address: '123 Main St'
      }

      const errorMessage = 'Failed to create household'

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.createHousehold(createDto)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households', createDto)
    })
  })

  /**
   * updateHousehold Tests
   *
   * These tests verify the behavior of the updateHousehold function.
   */
  describe('updateHousehold', () => {
    /**
     * Test: Successful Household Update
     *
     * Verifies that the updateHousehold function correctly updates a household
     * and returns the updated household data.
     */
    it('should update a household successfully', async () => {
      // Create mock data
      const updateDto: HouseholdUpdateRequestDto = {
        name: 'Updated Household',
        address: '456 New St'
      }

      const mockResponse: Household = {
        id: 1,
        name: updateDto.name,
        address: updateDto.address,
        numberOfMembers: 3,
        numberOfAdmins: 1
      }

      // Mock the API response
      vi.mocked(api.put).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await householdService.updateHousehold(updateDto)

      // Verify the API was called correctly
      expect(api.put).toHaveBeenCalledWith('/user/households/update', updateDto)

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the updateHousehold function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when updating a household', async () => {
      // Create mock data
      const updateDto: HouseholdUpdateRequestDto = {
        name: 'Updated Household',
        address: '456 New St'
      }

      const errorMessage = 'Failed to update household'

      // Mock the API to throw an error
      vi.mocked(api.put).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.updateHousehold(updateDto)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.put).toHaveBeenCalledWith('/user/households/update', updateDto)
    })
  })

  /**
   * inviteUserToHousehold Tests
   *
   * These tests verify the behavior of the inviteUserToHousehold function.
   */
  describe('inviteUserToHousehold', () => {
    /**
     * Test: Successful User Invitation
     *
     * Verifies that the inviteUserToHousehold function correctly invites a user
     * and returns the invitation response.
     */
    it('should invite a user to household successfully', async () => {
      // Create mock data
      const email = 'newuser@example.com'
      const mockResponse: HouseholdInviteResponseDto = {
        token: 'invite-token-123',
        expiryTime: new Date(Date.now() + 86400000).toISOString() // 1 day from now
      }

      // Mock the API response
      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await householdService.inviteUserToHousehold(email)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households/invite', { email }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the inviteUserToHousehold function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when inviting a user', async () => {
      // Create mock data
      const email = 'newuser@example.com'
      const errorMessage = 'Failed to invite user'

      // Create a mock error with response data
      const error = new Error(errorMessage)
      Object.defineProperty(error, 'response', {
        value: {
          status: 400,
          data: { message: 'User already has a household' }
        }
      })

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(error)

      // Verify that the service method re-throws the error
      await expect(householdService.inviteUserToHousehold(email)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households/invite', { email }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })
  })

  /**
   * joinWithToken Tests
   *
   * These tests verify the behavior of the joinWithToken function.
   */
  describe('joinWithToken', () => {
    /**
     * Test: Successful Household Join
     *
     * Verifies that the joinWithToken function correctly joins a household
     * and returns the joined household data.
     */
    it('should join a household with token successfully', async () => {
      // Create mock data
      const token = 'valid-invite-token-123'
      const mockResponse = createMockHousehold(2)

      // Mock the API response
      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await householdService.joinWithToken(token)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households/join', { token })

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the joinWithToken function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when joining with token', async () => {
      // Create mock data
      const token = 'invalid-token'
      const errorMessage = 'Invalid or expired token'

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.joinWithToken(token)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households/join', { token })
    })
  })

  /**
   * leaveHousehold Tests
   *
   * These tests verify the behavior of the leaveHousehold function.
   */
  describe('leaveHousehold', () => {
    /**
     * Test: Successful Household Leave
     *
     * Verifies that the leaveHousehold function correctly processes a request to leave a household.
     */
    it('should leave a household successfully', async () => {
      // Mock the API response (void response)
      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(null))

      // Call the service method
      await householdService.leaveHousehold()

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households/leave')
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the leaveHousehold function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when leaving a household', async () => {
      // Create mock error
      const errorMessage = 'Cannot leave household as last admin'

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.leaveHousehold()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households/leave')
    })
  })

  /**
   * getHouseholdMembers Tests
   *
   * These tests verify the behavior of the getHouseholdMembers function.
   */
  describe('getHouseholdMembers', () => {
    /**
     * Test: Successful Household Members Retrieval
     *
     * Verifies that the getHouseholdMembers function correctly retrieves household members.
     */
    it('should retrieve household members successfully', async () => {
      // Create mock data
      const mockMembers: HouseholdMember[] = [
        createMockHouseholdMember(1, true),
        createMockHouseholdMember(2),
        createMockHouseholdMember(3)
      ]

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockMembers))

      // Call the service method
      const result = await householdService.getHouseholdMembers()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/members')

      // Verify the result matches the mock response
      expect(result).toEqual(mockMembers)
      expect(result.length).toBe(3)
      expect(result[0].isAdmin).toBe(true)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getHouseholdMembers function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving household members', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch household members'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.getHouseholdMembers()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/members')
    })
  })

  /**
   * getNonAdminHouseholdMembers Tests
   *
   * These tests verify the behavior of the getNonAdminHouseholdMembers function.
   */
  describe('getNonAdminHouseholdMembers', () => {
    /**
     * Test: Successful Non-Admin Household Members Retrieval
     *
     * Verifies that the getNonAdminHouseholdMembers function correctly retrieves non-admin household members.
     */
    it('should retrieve non-admin household members successfully', async () => {
      // Create mock data
      const mockMembers: HouseholdMember[] = [
        createMockHouseholdMember(2),
        createMockHouseholdMember(3)
      ]

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockMembers))

      // Call the service method
      const result = await householdService.getNonAdminHouseholdMembers()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/members/non-admin')

      // Verify the result matches the mock response
      expect(result).toEqual(mockMembers)
      expect(result.length).toBe(2)
      expect(result.every(member => !member.isAdmin)).toBe(true)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getNonAdminHouseholdMembers function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving non-admin household members', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch non-admin household members'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.getNonAdminHouseholdMembers()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/members/non-admin')
    })
  })

  /**
   * getHouseholdNotAdminMembers Tests
   *
   * These tests verify the behavior of the getHouseholdNotAdminMembers function.
   */
  describe('getHouseholdNotAdminMembers', () => {
    /**
     * Test: Successful Non-Admin Household Members Retrieval
     *
     * Verifies that the getHouseholdNotAdminMembers function correctly retrieves non-admin household members.
     */
    it('should retrieve non-admin household members successfully', async () => {
      // Create mock data
      const mockMembers: HouseholdMember[] = [
        createMockHouseholdMember(2),
        createMockHouseholdMember(3)
      ]

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockMembers))

      // Call the service method
      const result = await householdService.getHouseholdNotAdminMembers()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/members/non-admin')

      // Verify the result matches the mock response
      expect(result).toEqual(mockMembers)
      expect(result.length).toBe(2)
      expect(result.every(member => !member.isAdmin)).toBe(true)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getHouseholdNotAdminMembers function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving non-admin household members', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch non-admin household members'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.getHouseholdNotAdminMembers()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/members/non-admin')
    })
  })

  /**
   * getEmptyHouseholdMembers Tests
   *
   * These tests verify the behavior of the getEmptyHouseholdMembers function.
   */
  describe('getEmptyHouseholdMembers', () => {
    /**
     * Test: Successful Empty Household Members Retrieval
     *
     * Verifies that the getEmptyHouseholdMembers function correctly retrieves empty household members.
     */
    it('should retrieve empty household members successfully', async () => {
      // Create mock data
      const mockEmptyMembers: EmptyHouseholdMemberDto[] = [
        createMockEmptyHouseholdMember(1),
        createMockEmptyHouseholdMember(2)
      ]

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockEmptyMembers))

      // Call the service method
      const result = await householdService.getEmptyHouseholdMembers()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/members/empty')

      // Verify the result matches the mock response
      expect(result).toEqual(mockEmptyMembers)
      expect(result.length).toBe(2)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getEmptyHouseholdMembers function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving empty household members', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch empty household members'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.getEmptyHouseholdMembers()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/members/empty')
    })
  })

  /**
   * addEmptyMember Tests
   *
   * These tests verify the behavior of the addEmptyMember function.
   */
  describe('addEmptyMember', () => {
    /**
     * Test: Successful Empty Member Addition
     *
     * Verifies that the addEmptyMember function correctly adds an empty member
     * and returns the created member data.
     */
    it('should add an empty member successfully', async () => {
      // Create mock data
      const memberData: EmptyHouseholdMemberCreateDto = {
        name: 'Empty Member'
      }

      const mockResponse: EmptyHouseholdMemberDto = {
        id: 1,
        name: memberData.name
      }

      // Mock the API response
      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await householdService.addEmptyMember(memberData)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households/members/empty', memberData)

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the addEmptyMember function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when adding an empty member', async () => {
      // Create mock data
      const memberData: EmptyHouseholdMemberCreateDto = {
        name: 'Empty Member'
      }

      const errorMessage = 'Failed to add empty member'

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.addEmptyMember(memberData)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith('/user/households/members/empty', memberData)
    })
  })

  /**
   * removeEmptyMemberFromHousehold Tests
   *
   * These tests verify the behavior of the removeEmptyMemberFromHousehold function.
   */
  describe('removeEmptyMemberFromHousehold', () => {
    /**
     * Test: Successful Empty Member Removal
     *
     * Verifies that the removeEmptyMemberFromHousehold function correctly removes an empty member.
     */
    it('should remove an empty member successfully', async () => {
      // Create mock data
      const memberId = 1

      // Mock the API response (void response)
      vi.mocked(api.delete).mockResolvedValue(createAxiosResponse(null))

      // Call the service method
      await householdService.removeEmptyMemberFromHousehold(memberId)

      // Verify the API was called correctly
      expect(api.delete).toHaveBeenCalledWith(`/user/households/members/empty/${memberId}`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the removeEmptyMemberFromHousehold function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when removing an empty member', async () => {
      // Create mock data
      const memberId = 1
      const errorMessage = 'Failed to remove empty member'

      // Mock the API to throw an error
      vi.mocked(api.delete).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.removeEmptyMemberFromHousehold(memberId)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.delete).toHaveBeenCalledWith(`/user/households/members/empty/${memberId}`)
    })
  })

  /**
   * removeMemberFromHousehold Tests
   *
   * These tests verify the behavior of the removeMemberFromHousehold function.
   */
  describe('removeMemberFromHousehold', () => {
    /**
     * Test: Successful Member Removal
     *
     * Verifies that the removeMemberFromHousehold function correctly removes a member.
     */
    it('should remove a member successfully', async () => {
      // Create mock data
      const memberId = 1

      // Mock the API response (void response)
      vi.mocked(api.delete).mockResolvedValue(createAxiosResponse(null))

      // Call the service method
      await householdService.removeMemberFromHousehold(memberId)

      // Verify the API was called correctly
      expect(api.delete).toHaveBeenCalledWith(`/user/households/members/${memberId}`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the removeMemberFromHousehold function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when removing a member', async () => {
      // Create mock data
      const memberId = 1
      const errorMessage = 'Failed to remove member'

      // Mock the API to throw an error
      vi.mocked(api.delete).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.removeMemberFromHousehold(memberId)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.delete).toHaveBeenCalledWith(`/user/households/members/${memberId}`)
    })
  })

  /**
   * cancelHouseholdInvitation Tests
   *
   * These tests verify the behavior of the cancelHouseholdInvitation function.
   */
  describe('cancelHouseholdInvitation', () => {
    /**
     * Test: Successful Invitation Cancellation
     *
     * Verifies that the cancelHouseholdInvitation function correctly cancels an invitation.
     */
    it('should cancel an invitation successfully', async () => {
      // Create mock data
      const token = 'invitation-token-123'

      // Mock the API response (void response)
      vi.mocked(api.delete).mockResolvedValue(createAxiosResponse(null))

      // Call the service method
      await householdService.cancelHouseholdInvitation(token)

      // Verify the API was called correctly
      expect(api.delete).toHaveBeenCalledWith(`/user/households/invitations/${token}`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the cancelHouseholdInvitation function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when canceling an invitation', async () => {
      // Create mock data
      const token = 'invitation-token-123'
      const errorMessage = 'Failed to cancel invitation'

      // Mock the API to throw an error
      vi.mocked(api.delete).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.cancelHouseholdInvitation(token)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.delete).toHaveBeenCalledWith(`/user/households/invitations/${token}`)
    })
  })

  /**
   * getPendingHouseholdInvitations Tests
   *
   * These tests verify the behavior of the getPendingHouseholdInvitations function.
   */
  describe('getPendingHouseholdInvitations', () => {
    /**
     * Test: Successful Pending Invitations Retrieval
     *
     * Verifies that the getPendingHouseholdInvitations function correctly retrieves pending invitations.
     */
    it('should retrieve pending invitations successfully', async () => {
      // Create mock data
      const mockInvitations: Invitation[] = [
        createMockInvitation(1, 'token-1'),
        createMockInvitation(2, 'token-2')
      ]

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockInvitations))

      // Call the service method
      const result = await householdService.getPendingHouseholdInvitations()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/pending-invitations')

      // Verify the result matches the mock response
      expect(result).toEqual(mockInvitations)
      expect(result.length).toBe(2)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getPendingHouseholdInvitations function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when retrieving pending invitations', async () => {
      // Create mock error
      const errorMessage = 'Failed to fetch pending invitations'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.getPendingHouseholdInvitations()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/pending-invitations')
    })
  })

  /**
   * promoteUserToAdmin Tests
   *
   * These tests verify the behavior of the promoteUserToAdmin function.
   */
  describe('promoteUserToAdmin', () => {
    /**
     * Test: Successful User Promotion
     *
     * Verifies that the promoteUserToAdmin function correctly promotes a user to admin.
     */
    it('should promote a user to admin successfully', async () => {
      // Create mock data
      const email = 'user@example.com'

      // Mock the API response (void response)
      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(null))

      // Call the service method
      await householdService.promoteUserToAdmin(email)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith(`/user/households/promote-admin/${email}`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the promoteUserToAdmin function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when promoting a user to admin', async () => {
      // Create mock data
      const email = 'user@example.com'
      const errorMessage = 'Failed to promote user to admin'

      // Mock the API to throw an error
      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.promoteUserToAdmin(email)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith(`/user/households/promote-admin/${email}`)
    })
  })

  /**
   * switchHousehold Tests
   *
   * These tests verify the behavior of the switchHousehold function.
   */
  describe('switchHousehold', () => {
    /**
     * Test: Successful Household Switch
     *
     * Verifies that the switchHousehold function correctly switches to a different household
     * and returns the switched household data.
     */
    it('should switch to a different household successfully', async () => {
      // Create mock data
      const householdId = 2
      const mockResponse = createMockHousehold(householdId)

      // Mock the API response
      vi.mocked(api.put).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await householdService.switchHousehold(householdId)

      // Verify the API was called correctly
      expect(api.put).toHaveBeenCalledWith('/user/households/switch', { householdId })

      // Verify the result matches the mock response
      expect(result).toEqual(mockResponse)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the switchHousehold function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when switching households', async () => {
      // Create mock data
      const householdId = 2
      const errorMessage = 'Cannot switch household as last admin'

      // Mock the API to throw an error
      vi.mocked(api.put).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.switchHousehold(householdId)).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.put).toHaveBeenCalledWith('/user/households/switch', { householdId })
    })
  })

  /**
   * isCurrentUserHouseholdAdmin Tests
   *
   * These tests verify the behavior of the isCurrentUserHouseholdAdmin function.
   */
  describe('isCurrentUserHouseholdAdmin', () => {
    /**
     * Test: User Is Admin
     *
     * Verifies that the isCurrentUserHouseholdAdmin function correctly returns true when the user is an admin.
     */
    it('should return true when the user is an admin', async () => {
      // Create mock data
      const mockResponse = { isAdmin: true }

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await householdService.isCurrentUserHouseholdAdmin()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/is-admin')

      // Verify the result is true
      expect(result).toBe(true)
    })

    /**
     * Test: User Is Not Admin
     *
     * Verifies that the isCurrentUserHouseholdAdmin function correctly returns false when the user is not an admin.
     */
    it('should return false when the user is not an admin', async () => {
      // Create mock data
      const mockResponse = { isAdmin: false }

      // Mock the API response
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockResponse))

      // Call the service method
      const result = await householdService.isCurrentUserHouseholdAdmin()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/is-admin')

      // Verify the result is false
      expect(result).toBe(false)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the isCurrentUserHouseholdAdmin function correctly handles errors
     * from the API and returns false.
     */
    it('should handle errors and return false', async () => {
      // Create mock error
      const errorMessage = 'Failed to check if user is admin'

      // Mock the API to throw an error
      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      // Call the service method
      const result = await householdService.isCurrentUserHouseholdAdmin()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/is-admin')

      // Verify the result is false
      expect(result).toBe(false)
    })
  })

  /**
   * deleteHousehold Tests
   *
   * These tests verify the behavior of the deleteHousehold function.
   */
  describe('deleteHousehold', () => {
    /**
     * Test: Successful Household Deletion
     *
     * Verifies that the deleteHousehold function correctly deletes a household.
     */
    it('should delete a household successfully', async () => {
      // Mock the API response (void response)
      vi.mocked(api.delete).mockResolvedValue(createAxiosResponse(null))

      // Call the service method
      await householdService.deleteHousehold()

      // Verify the API was called correctly
      expect(api.delete).toHaveBeenCalledWith('/user/households/delete')
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the deleteHousehold function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when deleting a household', async () => {
      // Create mock error
      const errorMessage = 'Failed to delete household'

      // Mock the API to throw an error
      vi.mocked(api.delete).mockRejectedValue(new Error(errorMessage))

      // Verify that the service method re-throws the error
      await expect(householdService.deleteHousehold()).rejects.toThrow(errorMessage)

      // Verify the API was called correctly
      expect(api.delete).toHaveBeenCalledWith('/user/households/delete')
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the HouseholdService functions in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Empty Response Handling
     *
     * Verifies that the service correctly handles empty responses.
     */
    it('should handle empty arrays when retrieving household members', async () => {
      // Mock the API response with an empty array
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse([]))

      // Call the service method
      const result = await householdService.getHouseholdMembers()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/members')

      // Verify the result is an empty array
      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })

    /**
     * Test: Null Household Handling
     *
     * Verifies that the service correctly handles null household responses.
     */
    it('should handle null response when retrieving current household', async () => {
      // Mock the API response with null
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(null))

      // Call the service method
      const result = await householdService.getCurrentHousehold()

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith('/user/households/me')

      // Verify the result is null
      expect(result).toBeNull()
    })
  })
})
