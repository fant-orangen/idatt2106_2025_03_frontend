/**
 * UserService Unit Tests
 *
 * This file contains comprehensive unit tests for the UserService, which is responsible
 * for user-related operations including authentication, registration, profile management,
 * and administrative user management functions.
 *
 * The tests verify the service's functionality including:
 * - Fetching user information
 * - Updating user preferences
 * - Password reset functionality
 * - Profile management
 *
 * @file UserServiceUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { AxiosResponse } from 'axios'
import {
  fetchUserById,
  updateUserPreference,
  getUserPreferences,
  resetPassword,
  sendPasswordResetEmail,
  getUserProfile,
  updateUserProfile,
  getUserBasicInfo
} from '@/services/UserService.ts'
import type {
  UserResponseDto,
  UserPreferencesDto,
  ExtendedUserProfile,
  UpdateExtendedUserProfile,
  UserBasicInfoDto
} from '@/models/User'

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
    patch: vi.fn()
  }
}))
import api from '@/services/api/AxiosInstance.ts'

/**
 * Helper function to create a mock UserResponseDto
 *
 * @param id - The unique identifier for the user
 * @returns A UserResponseDto object with default test values
 */
const createMockUserResponseDto = (id: number): UserResponseDto => ({
  displayName: `User ${id}`,
  createdAt: new Date().toISOString(),
  email: `user${id}@example.com`
})

/**
 * Helper function to create a mock UserPreferencesDto
 *
 * @returns A UserPreferencesDto object with default test values
 */
const createMockUserPreferencesDto = (): UserPreferencesDto => ({
  locationSharingEnabled: true,
  notificationsEnabled: true,
  twoFactorAuthenticationEnabled: false
})

/**
 * Helper function to create a mock ExtendedUserProfile
 *
 * @param id - The unique identifier for the user
 * @returns An ExtendedUserProfile object with default test values
 */
const createMockExtendedUserProfile = (id: number): ExtendedUserProfile => ({
  id,
  email: `user${id}@example.com`,
  firstName: `First${id}`,
  lastName: `Last${id}`,
  homeAddress: `Address ${id}`,
  homeLatitude: 10.0 + id,
  homeLongitude: 20.0 + id,
  locationSharingEnabled: true,
  emailVerified: true,
  householdId: id,
  householdName: `Household ${id}`
})

/**
 * Helper function to create a mock UpdateExtendedUserProfile
 *
 * @param id - The unique identifier for the user
 * @returns An UpdateExtendedUserProfile object with default test values
 */
const createMockUpdateExtendedUserProfile = (id: number): UpdateExtendedUserProfile => ({
  firstName: `First${id}`,
  lastName: `Last${id}`,
  homeAddress: `Address ${id}`,
  homeLatitude: 10.0 + id,
  homeLongitude: 20.0 + id
})

/**
 * Helper function to create a mock UserBasicInfoDto
 *
 * @param id - The unique identifier for the user
 * @returns A UserBasicInfoDto object with default test values
 */
const createMockUserBasicInfoDto = (id: number): UserBasicInfoDto => ({
  firstName: `First${id}`,
  lastName: `Last${id}`,
  email: `user${id}@example.com`,
  householdName: `Household ${id}`,
  emailVerified: true
})

/**
 * Main test suite for the UserService
 *
 * This suite contains all tests related to the UserService functionality.
 * Each nested describe block focuses on a specific aspect of the service's behavior.
 */
describe('UserService', () => {
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
   * fetchUserById Tests
   *
   * These tests verify the behavior of the fetchUserById function.
   */
  describe('fetchUserById', () => {
    /**
     * Test: Successful User Fetch
     *
     * Verifies that the fetchUserById function correctly fetches a user by ID
     * and returns the user data.
     */
    it('should fetch a user by ID successfully', async () => {
      const userId = 1
      const mockUser = createMockUserResponseDto(userId)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockUser))

      const result = await fetchUserById(userId)

      expect(api.get).toHaveBeenCalledWith(`/public/users/${userId}`)
      expect(result).toEqual(mockUser)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the fetchUserById function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching a user by ID', async () => {
      const userId = 1
      const errorMessage = 'User not found'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(fetchUserById(userId)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/public/users/${userId}`)
    })
  })

  /**
   * updateUserPreference Tests
   *
   * These tests verify the behavior of the updateUserPreference function.
   */
  describe('updateUserPreference', () => {
    /**
     * Test: Successful Preference Update
     *
     * Verifies that the updateUserPreference function correctly updates a user preference
     * and returns successfully.
     */
    it('should update a user preference successfully', async () => {
      const userId = 1
      const settingKey: keyof UserPreferencesDto = 'locationSharingEnabled'
      const settingValue = true

      vi.mocked(api.patch).mockResolvedValue(createAxiosResponse({ success: true }))

      await updateUserPreference(userId, settingKey, settingValue)

      expect(api.patch).toHaveBeenCalledWith('/user/me/preferences', { [settingKey]: settingValue })
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the updateUserPreference function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when updating a user preference', async () => {
      const userId = 1
      const settingKey: keyof UserPreferencesDto = 'locationSharingEnabled'
      const settingValue = true
      const errorMessage = 'Failed to update preference'

      vi.mocked(api.patch).mockRejectedValue(new Error(errorMessage))

      await expect(updateUserPreference(userId, settingKey, settingValue)).rejects.toThrow(errorMessage)
      expect(api.patch).toHaveBeenCalledWith('/user/me/preferences', { [settingKey]: settingValue })
    })
  })

  /**
   * getUserPreferences Tests
   *
   * These tests verify the behavior of the getUserPreferences function.
   */
  describe('getUserPreferences', () => {
    /**
     * Test: Successful Preferences Fetch
     *
     * Verifies that the getUserPreferences function correctly fetches user preferences
     * and returns the preferences data.
     */
    it('should fetch user preferences successfully', async () => {
      const mockPreferences = createMockUserPreferencesDto()

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPreferences))

      const result = await getUserPreferences()

      expect(api.get).toHaveBeenCalledWith('/user/me/preferences')
      expect(result).toEqual(mockPreferences)
    })


  })

  /**
   * resetPassword Tests
   *
   * These tests verify the behavior of the resetPassword function.
   */
  describe('resetPassword', () => {
    /**
     * Test: Successful Password Reset
     *
     * Verifies that the resetPassword function correctly resets a user's password
     * and returns successfully.
     */
    it('should reset a password successfully', async () => {
      const token = 'reset-token'
      const newPassword = 'NewPassword123!'

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse({ success: true }))

      await resetPassword(token, newPassword)

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', { token, newPassword })
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the resetPassword function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when resetting a password', async () => {
      const token = 'reset-token'
      const newPassword = 'NewPassword123!'
      const errorMessage = 'Failed to reset password'

      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      await expect(resetPassword(token, newPassword)).rejects.toThrow(errorMessage)
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', { token, newPassword })
    })
  })

  /**
   * sendPasswordResetEmail Tests
   *
   * These tests verify the behavior of the sendPasswordResetEmail function.
   */
  describe('sendPasswordResetEmail', () => {
    /**
     * Test: Successful Password Reset Email
     *
     * Verifies that the sendPasswordResetEmail function correctly sends a password reset email
     * and returns successfully.
     */
    it('should send a password reset email successfully', async () => {
      const email = 'user@example.com'

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse({ success: true }))

      await sendPasswordResetEmail(email)

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email })
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the sendPasswordResetEmail function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when sending a password reset email', async () => {
      const email = 'user@example.com'
      const errorMessage = 'Failed to send password reset email'

      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      await expect(sendPasswordResetEmail(email)).rejects.toThrow(errorMessage)
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email })
    })
  })

  /**
   * getUserProfile Tests
   *
   * These tests verify the behavior of the getUserProfile function.
   */
  describe('getUserProfile', () => {
    /**
     * Test: Successful Profile Fetch
     *
     * Verifies that the getUserProfile function correctly fetches a user's profile
     * and returns the profile data.
     */
    it('should fetch a user profile successfully', async () => {
      const userId = 1
      const mockProfile = createMockExtendedUserProfile(userId)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockProfile))

      const result = await getUserProfile()

      expect(api.get).toHaveBeenCalledWith('/user/me')
      expect(result).toEqual(mockProfile)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getUserProfile function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching a user profile', async () => {
      const errorMessage = 'Failed to fetch profile'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(getUserProfile()).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith('/user/me')
    })
  })

  /**
   * updateUserProfile Tests
   *
   * These tests verify the behavior of the updateUserProfile function.
   */
  describe('updateUserProfile', () => {
    /**
     * Test: Successful Profile Update
     *
     * Verifies that the updateUserProfile function correctly updates a user's profile
     * and returns the updated profile data.
     */
    it('should update a user profile successfully', async () => {
      const userId = 1
      const mockProfile = createMockExtendedUserProfile(userId)
      const updateData = createMockUpdateExtendedUserProfile(userId)

      vi.mocked(api.put).mockResolvedValue(createAxiosResponse(mockProfile))

      const result = await updateUserProfile(updateData)

      expect(api.put).toHaveBeenCalledWith('/user/me', updateData)
      expect(result).toEqual(mockProfile)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the updateUserProfile function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when updating a user profile', async () => {
      const userId = 1
      const updateData = createMockUpdateExtendedUserProfile(userId)
      const errorMessage = 'Failed to update profile'

      vi.mocked(api.put).mockRejectedValue(new Error(errorMessage))

      await expect(updateUserProfile(updateData)).rejects.toThrow(errorMessage)
      expect(api.put).toHaveBeenCalledWith('/user/me', updateData)
    })

    /**
     * Test: Partial Profile Update
     *
     * Verifies that the updateUserProfile function correctly handles partial updates
     * to a user's profile.
     */
    it('should handle partial profile updates', async () => {
      const userId = 1
      const mockProfile = createMockExtendedUserProfile(userId)
      const partialUpdateData: Partial<UpdateExtendedUserProfile> = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast'
      }

      vi.mocked(api.put).mockResolvedValue(createAxiosResponse(mockProfile))

      const result = await updateUserProfile(partialUpdateData)

      expect(api.put).toHaveBeenCalledWith('/user/me', partialUpdateData)
      expect(result).toEqual(mockProfile)
    })
  })

  /**
   * getUserBasicInfo Tests
   *
   * These tests verify the behavior of the getUserBasicInfo function.
   */
  describe('getUserBasicInfo', () => {
    /**
     * Test: Successful Basic Info Fetch
     *
     * Verifies that the getUserBasicInfo function correctly fetches a user's basic info
     * and returns the basic info data.
     */
    it('should fetch a user\'s basic info successfully', async () => {
      const userId = 1
      const mockBasicInfo = createMockUserBasicInfoDto(userId)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockBasicInfo))

      const result = await getUserBasicInfo(userId)

      expect(api.get).toHaveBeenCalledWith(`/user/${userId}/basic-info`)
      expect(result).toEqual(mockBasicInfo)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getUserBasicInfo function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching a user\'s basic info', async () => {
      const userId = 1
      const errorMessage = 'Failed to fetch basic info'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(getUserBasicInfo(userId)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/user/${userId}/basic-info`)
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the UserService functions in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Handling Non-Numeric User IDs
     *
     * Verifies that the fetchUserById function correctly handles non-numeric user IDs.
     */
    it('should handle non-numeric user IDs in fetchUserById', async () => {
      const userId = 'user-1'
      const mockUser = createMockUserResponseDto(1)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockUser))

      const result = await fetchUserById(userId)

      expect(api.get).toHaveBeenCalledWith(`/public/users/${userId}`)
      expect(result).toEqual(mockUser)
    })

    /**
     * Test: Handling Empty Responses
     *
     * Verifies that the UserService functions correctly handle empty responses from the API.
     */
    it('should handle empty responses', async () => {
      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(null))

      const result = await getUserPreferences()

      expect(api.get).toHaveBeenCalledWith('/user/me/preferences')
      expect(result).toBeNull()
    })
  })
})
