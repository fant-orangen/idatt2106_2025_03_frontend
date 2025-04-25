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
 * @param {string} credentials.username - User's email address used as username
 * @param {string} credentials.password - User's password
 * @returns {Promise<AxiosResponse>} Promise resolving to the server response
 * @throws {Error} When authentication fails or network issues occur
 */
export async function fetchToken({ username, password }: { username: string; password: string }) {
  return await api.post(
    '/auth/login',
    JSON.stringify({
      email: username,
      password: password,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
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
