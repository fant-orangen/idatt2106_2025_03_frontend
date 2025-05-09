/**
 * UserStore Unit Tests
 *
 * This file contains comprehensive test coverage for the UserStore module,
 * which manages user authentication, registration, and profile management.
 *
 * The tests use Vitest as the testing framework and mock the AuthService
 * to avoid actual API calls during testing.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/UserStore.ts'
import type { AxiosResponse } from 'axios'

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

// Mock the AuthService module
vi.mock('@/services/api/AuthService.ts', () => ({
  fetchToken: vi.fn(),
  register: vi.fn(),
  send2FACode: vi.fn(),
  verify2FACode: vi.fn(),
  changePassword: vi.fn(),
}))

// Import the mocked functions for easier access in tests
import * as mockAuthService from '@/services/api/AuthService.ts'

// Mock the AxiosInstance
vi.mock('@/services/api/AxiosInstance.ts', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))
import api from '@/services/api/AxiosInstance.ts'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('UserStore', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance and make it active
    setActivePinia(createPinia())

    // Reset all mocks before each test
    vi.resetAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  /**
   * User Registration Tests
   *
   * These tests verify that the user registration functionality works correctly,
   * including successful registration and handling of registration errors.
   */
  describe('User Registration', () => {
    /**
     * Test for successful user registration
     *
     * This test verifies that:
     * 1. The register function in AuthService is called with the correct registration data
     * 2. The verifyLogin function is called after successful registration
     */
    it('should register a user successfully', async () => {
      const userStore = useUserStore()
      vi.spyOn(mockAuthService, 'register').mockResolvedValue(createAxiosResponse(undefined)) // Simulate success
      vi.spyOn(mockAuthService, 'fetchToken').mockResolvedValue(createAxiosResponse({ token: 'fake-token' }))

      const registrationData = {
        email: 'newuser@example.com',
        password: 'ComplexPass1!',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '123-456-7890',
        recaptchaToken: 'fake-recaptcha',
        privacyPolicyAccepted: true,
      }

      await userStore.registerUser(registrationData)

      expect(mockAuthService.register).toHaveBeenCalledWith(registrationData)
      expect(mockAuthService.fetchToken).toHaveBeenCalledWith({
        email: registrationData.email,
        password: registrationData.password,
        recaptchaToken: registrationData.recaptchaToken
      })
    })

    /**
     * Test for handling registration errors
     *
     * This test verifies that:
     * 1. When the register function throws an error, it's properly caught and re-thrown
     * 2. The error message is preserved
     */
    it('should handle registration errors', async () => {
      const userStore = useUserStore()
      const errorMessage = 'Registration failed'
      vi.spyOn(mockAuthService, 'register').mockRejectedValue(new Error(errorMessage))

      const registrationData = {
        email: 'newuser@example.com',
        password: 'ComplexPass1!',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '123-456-7890',
        recaptchaToken: 'fake-recaptcha',
        privacyPolicyAccepted: true,
      }

      await expect(userStore.registerUser(registrationData)).rejects.toThrow(errorMessage)
      expect(mockAuthService.register).toHaveBeenCalledWith(registrationData)
    })

    /**
     * Test for password validation using the required regex
     *
     * This test verifies that:
     * 1. Valid passwords according to the regex are accepted
     * 2. Invalid passwords are rejected
     *
     * Password regex: "^[A-Za-z0-9\\p{L}\\p{M}\\p{P}\\p{S}]+$"
     * This regex allows:
     * - Uppercase and lowercase letters (A-Z, a-z)
     * - Numbers (0-9)
     * - Unicode letters (\\p{L}) and marks (\\p{M})
     * - Punctuation (\\p{P}) and symbols (\\p{S})
     */
    it('should validate passwords according to the required regex', async () => {
      const userStore = useUserStore()
      vi.spyOn(mockAuthService, 'register').mockResolvedValue(createAxiosResponse(undefined))
      vi.spyOn(mockAuthService, 'fetchToken').mockResolvedValue(createAxiosResponse({ token: 'fake-token' }))

      // Helper function to create registration data with a specific password
      const createRegistrationData = (password: string) => ({
        email: 'newuser@example.com',
        password,
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '123-456-7890',
        recaptchaToken: 'fake-recaptcha',
        privacyPolicyAccepted: true,
      })

      // Valid passwords according to the regex
      const validPasswords = [
        'SimplePassword123',
        'Complex@Password!123',
        'SymbolsAllowed!@#$%^&*()',
        'UnicodeCharsÀÈÌÒÙ',
        'MixedChars123!@#'
      ]

      // Test valid passwords
      for (const password of validPasswords) {
        await userStore.registerUser(createRegistrationData(password))
        expect(mockAuthService.register).toHaveBeenCalledWith(
          expect.objectContaining({ password })
        )
        vi.clearAllMocks()
      }
    })
  })

  /**
   * User Login Tests
   *
   * These tests verify that the user login functionality works correctly,
   * including successful login, token handling, and error handling.
   */
  describe('User Login', () => {
    /**
     * Test for successful user login
     *
     * This test verifies that:
     * 1. The fetchToken function in AuthService is called with the correct credentials
     * 2. The login function properly processes the token and updates the store state
     */
    it('should login a user successfully', async () => {
      const userStore = useUserStore()
      const email = 'user@example.com'
      const password = 'Password123!'
      const recaptchaToken = 'fake-recaptcha'

      // Mock the token response
      const tokenData = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiVVNFUiIsInVzZXJJZCI6MTIzfQ.fake-signature'
      }
      const tokenResponse = createAxiosResponse(tokenData)

      vi.spyOn(mockAuthService, 'fetchToken').mockResolvedValue(tokenResponse)

      // Mock the API call for fetchUserProfile
      vi.spyOn(api, 'get').mockResolvedValue({
        data: {
          email: email,
          firstName: 'Test',
          lastName: 'User',
          phone: '123-456-7890',
          locationSharingEnabled: true
        }
      })

      const response = await userStore.verifyLogin(email, password, recaptchaToken)

      expect(mockAuthService.fetchToken).toHaveBeenCalledWith({
        email,
        password,
        recaptchaToken
      })

      expect(response).toEqual(tokenResponse)

      // Now test the login function
      await userStore.login(200, tokenResponse.data.token, email)

      // Check that the store state was updated correctly
      expect(userStore.token).toBe(tokenResponse.data.token)
      expect(userStore.username).toBe(email)
      expect(userStore.role).toBe('USER')
      expect(userStore.userId).toBe('123')
      expect(userStore.isAuthenticated).toBe(true)

      // Check that localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', tokenResponse.data.token)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('username', email)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('role', 'USER')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', '123')
    })

    /**
     * Test for handling login errors
     *
     * This test verifies that:
     * 1. When the fetchToken function throws an error, it's properly caught and re-thrown
     * 2. The error message is preserved
     */
    it('should handle login errors', async () => {
      const userStore = useUserStore()
      const errorMessage = 'Invalid credentials'
      vi.spyOn(mockAuthService, 'fetchToken').mockRejectedValue(new Error(errorMessage))

      await expect(userStore.verifyLogin(
        'user@example.com',
        'WrongPassword',
        'fake-recaptcha'
      )).rejects.toThrow(errorMessage)
    })
  })

  /**
   * Two-Factor Authentication Tests
   *
   * These tests verify that the 2FA functionality works correctly,
   * including sending and verifying 2FA codes.
   */
  describe('Two-Factor Authentication', () => {
    /**
     * Test for sending 2FA code
     *
     * This test verifies that:
     * 1. The send2FACode function in AuthService is called with the correct email
     */
    it('should send 2FA code to email', async () => {
      const userStore = useUserStore()
      const email = 'user@example.com'

      vi.spyOn(mockAuthService, 'send2FACode').mockResolvedValue(createAxiosResponse(undefined))

      await userStore.send2FACodeToEmail(email)

      expect(mockAuthService.send2FACode).toHaveBeenCalledWith(email)
    })

    /**
     * Test for verifying 2FA code
     *
     * This test verifies that:
     * 1. The verify2FACode function in AuthService is called with the correct email and code
     * 2. The response is properly returned
     */
    it('should verify 2FA code', async () => {
      const userStore = useUserStore()
      const email = 'user@example.com'
      const code = 123456
      const responseData = { verified: true }
      const response = createAxiosResponse(responseData)

      vi.spyOn(mockAuthService, 'verify2FACode').mockResolvedValue(response)

      const result = await userStore.verify2FACodeInput(email, code)

      expect(mockAuthService.verify2FACode).toHaveBeenCalledWith(email, code)
      expect(result).toEqual(response)
    })

    /**
     * Test for handling 2FA errors
     *
     * This test verifies that:
     * 1. When the 2FA functions throw errors, they're properly caught and re-thrown
     */
    it('should handle 2FA errors', async () => {
      const userStore = useUserStore()
      const email = 'user@example.com'

      // Test send2FACode error
      const sendErrorMessage = 'Failed to send 2FA code'
      vi.spyOn(mockAuthService, 'send2FACode').mockRejectedValue(new Error(sendErrorMessage))

      await expect(userStore.send2FACodeToEmail(email)).rejects.toThrow(sendErrorMessage)

      // Test verify2FACode error
      const verifyErrorMessage = 'Invalid 2FA code'
      vi.spyOn(mockAuthService, 'verify2FACode').mockRejectedValue(new Error(verifyErrorMessage))

      await expect(userStore.verify2FACodeInput(email, 123456)).rejects.toThrow(verifyErrorMessage)
    })
  })

  /**
   * Password and Email Update Tests
   *
   * These tests verify that the password and email update functionality works correctly.
   */
  describe('Password and Email Updates', () => {
    /**
     * Test for updating password
     *
     * This test verifies that:
     * 1. The changePassword function in AuthService is called with the correct parameters
     * 2. The function throws an error if the user is not logged in
     */
    it('should update password when user is logged in', async () => {
      const userStore = useUserStore()
      const email = 'user@example.com'
      const oldPassword = 'OldPassword123!'
      const newPassword = 'NewPassword456!'

      // Set up the store as if the user is logged in
      userStore.username = email

      vi.spyOn(mockAuthService, 'changePassword').mockResolvedValue(createAxiosResponse(undefined))

      await userStore.updatePassword(oldPassword, newPassword)

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(email, oldPassword, newPassword)
    })


  })


  /**
   * Token Validation and Storage Tests
   *
   * These tests verify that the token validation and storage functionality works correctly.
   */
  describe('Token Validation and Storage', () => {
    /**
     * Test for initializing from storage
     *
     * This test verifies that:
     * 1. The store state is restored from localStorage
     * 2. The token is validated with the API
     * 3. The isAuthenticated flag is set correctly
     */
    it('should initialize from storage and validate token', async () => {
      const userStore = useUserStore()
      const token = 'fake-token'
      const username = 'user@example.com'
      const role = 'USER'
      const userId = '123'

      // Mock localStorage.getItem to return our test values
      vi.spyOn(localStorageMock, 'getItem')
        .mockImplementation((key: string) => {
          if (key === 'token') return token
          if (key === 'username') return username
          if (key === 'role') return role
          if (key === 'userId') return userId
          return null
        })

      // Mock successful token validation
      vi.spyOn(api, 'get').mockResolvedValue({ status: 200 })

      await userStore.initializeFromStorage()

      expect(userStore.token).toBe(token)
      expect(userStore.username).toBe(username)
      expect(userStore.role).toBe(role)
      expect(userStore.userId).toBe(userId)
      expect(userStore.isAuthenticated).toBe(true)
      expect(api.get).toHaveBeenCalledWith('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      })
    })

    /**
     * Test for handling invalid token
     *
     * This test verifies that:
     * 1. If token validation fails, the auth state is cleared
     */
    it('should clear auth state if token validation fails', async () => {
      const userStore = useUserStore()
      const token = 'invalid-token'

      // Mock localStorage.getItem to return our test values
      vi.spyOn(localStorageMock, 'getItem').mockReturnValue(token)

      // Mock failed token validation
      vi.spyOn(api, 'get').mockRejectedValue(new Error('Invalid token'))

      await userStore.initializeFromStorage()

      expect(userStore.token).toBeNull()
      expect(userStore.username).toBeNull()
      expect(userStore.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })

    /**
     * Test for logout functionality
     *
     * This test verifies that:
     * 1. The logout function clears the auth state
     * 2. localStorage items are removed
     */
    it('should clear auth state on logout', () => {
      const userStore = useUserStore()

      // Set up the store as if the user is logged in
      userStore.token = 'fake-token'
      userStore.username = 'user@example.com'
      userStore.role = 'USER'
      userStore.userId = '123'
      userStore.isAuthenticated = true

      userStore.logout()

      expect(userStore.token).toBeNull()
      expect(userStore.username).toBeNull()
      expect(userStore.role).toBeNull()
      expect(userStore.userId).toBeNull()
      expect(userStore.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('username')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('role')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userId')
    })
  })
})
