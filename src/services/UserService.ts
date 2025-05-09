/**
 * User management service module.
 *
 * This service provides methods for user-related operations including authentication,
 * registration, profile management, and administrative user management functions.
 *
 * @module UserService
 */
import api from '@/services/api/AxiosInstance.ts'
import type {
  UserResponseDto,
  UserPreferencesDto,
  ExtendedUserProfile,
  UpdateExtendedUserProfile,
  UserBasicInfoDto,
} from '@/models/User'

/**
 * Fetches public user information by user ID.
 * Uses the backend endpoint GET /api/users/{id}.
 *
 * @param {string | number} userId - The ID of the user to fetch.
 * @returns {Promise<UserResponseDto>} Promise resolving to the public user data.
 * @throws {Error} If the request fails (e.g., user not found).
 */
export async function fetchUserById(userId: string | number): Promise<UserResponseDto> {
  try {
    const response = await api.get<UserResponseDto>(`/public/users/${userId}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch user profile for ID ${userId}:`, error)
    throw error // Re-throw to be handled by the component
  }
}

/**
 * Updates a single or multiple user preferences for a specific user.
 *
 * Makes a PATCH request to the backend to update preferences.
 *
 * @param {number} userId - The ID of the user whose preferences are being updated
 * @param {Partial<UserPreferencesDto>} preferencesDto - The partial preferences data to update
 * @returns {Promise<void>} Promise that resolves when the update is successful
 * @throws {Error} If the request fails due to validation or network issues
 */
export async function updateUserPreference(
  userId: number,
  settingKey: keyof UserPreferencesDto,
  settingValue: boolean,
): Promise<void> {
  try {
    const payload = { [settingKey]: settingValue }
    const response = await api.patch(`/user/me/preferences`, payload)
    console.log('Preference updated successfully:', response.data)
  } catch (error) {
    console.error('Error updating preference:', error)
    throw error
  }
}

/**
 * Fetches the current user's preferences.
 *
 * This function makes a GET request to the backend API to retrieve the user's preferences.
 *
 * @returns {Promise<UserPreferencesDto>} Promise resolving to the user's preferences
 */
export async function getUserPreferences(): Promise<UserPreferencesDto> {
  try {
    const response = await api.get<UserPreferencesDto>('/user/me/preferences')
    return response.data
  } catch (error: any) {
    console.error(
      'Failed to fetch user preferences. Please check the API or network connection.',
      error,
    )
    throw new Error(
      error.response?.data?.message ||
        'An unexpected error occurred while fetching user preferences.',
    )
  }
}

/**
 * Resets the user's password using a token and a new password.
 *
 * Makes a POST request to the reset-password endpoint.
 *
 * @param {string} token - The reset token provided to the user
 * @param {string} newPassword - The new password to set
 * @returns {Promise<void>} Promise that resolves when the password reset is successful
 * @throws {Error} If the request fails due to validation or network issues
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    const payload = {
      token,
      newPassword,
    }
    await api.post('/auth/reset-password', payload)
    console.log('Password reset successfully')
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
}
/**
 * Sends a password reset email to the user.
 *
 * Makes a POST request to the forgot-password endpoint.
 *
 * @param {string} email - The user's email address
 * @returns {Promise<void>} Promise that resolves when the email is sent successfully
 * @throws {Error} If the request fails due to validation or network issues
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    const payload = {
      email,
    }
    await api.post('/auth/forgot-password', payload)
    console.log('Password reset email sent successfully')
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}

/**
 * Fetches the current user's profile
 * @returns The user profile data
 */
export async function getUserProfile(): Promise<ExtendedUserProfile> {
  const response = await api.get('/user/me')
  return response.data
}

/**
 * Updates the user's profile information
 * @param profileData The updated profile data
 * @returns The updated user profile
 */
export async function updateUserProfile(
  profileData: Partial<UpdateExtendedUserProfile>,
): Promise<ExtendedUserProfile> {
  const response = await api.put('/user/me', profileData)
  return response.data
}

/**
 * Fetches basic information about another user
 * @param userId The ID of the user to fetch
 * @returns Basic user information including name, email, and household
 */
export async function getUserBasicInfo(userId: number): Promise<UserBasicInfoDto> {
  try {
    const response = await api.get(`/user/${userId}/basic-info`)
    console.log('Basic info fetched successfully:', response.data)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch basic info for user ID ${userId}:`, error)
    throw error
  }
}
