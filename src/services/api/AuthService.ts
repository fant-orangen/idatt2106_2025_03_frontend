/**
 * Authentication service module for handling user authentication operations.
 *
 * This service provides methods for authenticating users against the backend API,
 * including login functionality with token retrieval.
 *
 * @module AuthService
 */
import api from '@/services/api/AxiosInstance.ts'
import type { RegistrationData } from '@/models/User'

/**
 * Authenticates a user and retrieves an access token.
 *
 * Makes a POST request to the authentication endpoint with user credentials
 * and returns the server response containing authentication tokens and user info.
 *
 * @param {Object} credentials - The user credentials
 * @param {string} credentials.email - User's email address used as username
 * @param {string} credentials.password - User's password
 * @returns {Promise<AxiosResponse>} Promise resolving to the server response
 * @throws {Error} When authentication fails or network issues occur
 */
export async function fetchToken(data: {
  email: string
  password: string
  recaptchaToken: string
}) {
  try {
    console.log('Payload being sent to backend:', data) // Log the payload
    const response = await api.post('/auth/login', data)
    return response
  } catch (error) {
    console.error('Error fetching token:', error)
    throw error
  }
}

/**
 * Registers a new user with the system.
 *
 * Makes a POST request to the registration endpoint with the user's registration data
 * and returns the server response.
 *
 * @param {RegistrationData} userData - The user's registration information
 * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the server response
 * @throws {Error} When registration fails or network issues occur
 */
export async function register(userData: RegistrationData) {
  console.log('User data:' + userData)
  return await api.post('/auth/register', userData)
}

/**
 * Sends a 2FA code to the user's email address.
 *
 * This function makes a POST request to the backend API to send a 2FA code
 * to the specified email address. It is typically used during the login process
 * to enhance security by requiring a second factor of authentication.
 *
 * @param userEmail - The email address to which the 2FA code will be sent
 * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the server response
 */
export async function send2FACode(userEmail: string) {
  console.log('Sending 2FA code to email:', userEmail)
  return await api.post('/auth/send-2fa', { email: userEmail })
}

/**
 * Verifies the provided 2FA code.
 *
 * This function makes a POST request to the backend API to verify the
 * 2FA code entered by the user. It is typically used after the user
 * receives the code via email and enters it into the application.
 *
 * @param code - The 2FA code to verify
 * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the server response
 */
export async function verify2FACode(userEmail: string, code: number) {
  console.log('Verifying 2FA code:', code)
  return await api.post('/auth/verify-2fa', { email: userEmail, code: code })
}

/**
 * Changes the password for a user.
 *
 * This function makes a POST request to the backend API to change the user's password.
 *
 * @param {string} userEmail - The email address of the user whose password is to be changed
 * @param {string} oldPassword - The current password of the user
 * @param {string} newPassword - The new password to set for the user
 * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the server response
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string,
  confirmNewPassword: string,
) {
  return await api.patch('/auth/change-password', {
    oldPassword: oldPassword,
    newPassword: newPassword,
    confirmNewPassword: confirmNewPassword,
  })
}
