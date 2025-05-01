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
  BackendUser,
  PaginatedUserResponse,
  UserFilterParams,
  AdminUserUpdatePayload,
  UserPreferencesDto,
} from '@/models/User'

/**
 * Fetches the currently authenticated user's ID from the server.
 * This ID comes from the JWT token on the backend.
 *
 * @returns A promise resolving to the user's ID
 * @throws Error if the request fails
 */
export async function fetchCurrentUserId(): Promise<number> {
  try {
    const response = await api.get<number>('/users/id')
    return response.data
  } catch (error) {
    console.error('Failed to fetch current user ID:', error)
    throw error
  }
}

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
    const response = await api.get<UserResponseDto>(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch user profile for ID ${userId}:`, error)
    throw error // Re-throw to be handled by the component
  }
}

/**
 * Fetches a paginated list of users for administrative purposes.
 *
 * Makes a GET request to retrieve users with pagination and optional filtering.
 * Requires administrative privileges.
 *
 * @param {number} page - Page index (0-based)
 * @param {number} size - Number of users per page
 * @param {UserFilterParams} [params={}] - Optional filter/search parameters
 * @returns {Promise<PaginatedUserResponse>} Promise resolving to paginated user data
 * @throws {Error} If the request fails due to authorization issues or network errors
 */
export async function fetchAdminUsers(
  page: number,
  size: number,
  params: UserFilterParams = {},
): Promise<PaginatedUserResponse> {
  try {
    // Make the GET request to the admin endpoint
    const response = await api.get<PaginatedUserResponse>('/admin/users', {
      params: { page, size, ...params },
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    throw error
  }
}

/**
 * Updates a user's details via the administrative API.
 *
 * Makes a PUT request to modify user information. Requires administrative privileges.
 *
 * @param {number|string} id - The ID of the user to update
 * @param {AdminUserUpdatePayload} userData - The updated user data
 * @returns {Promise<BackendUser>} Promise resolving to the updated user data
 * @throws {Error} If the update fails due to validation or authorization issues
 */
export async function updateAdminUser(
  id: number | string,
  userData: AdminUserUpdatePayload,
): Promise<BackendUser> {
  try {
    // Make the PUT request to the admin endpoint
    const response = await api.put<BackendUser>(`/admin/users/${id}`, userData)
    return response.data
  } catch (error) {
    console.error(`Failed to update user with ID ${id}:`, error)
    throw error
  }
}

/**
 * Deletes a user account via the administrative API.
 *
 * Makes a DELETE request to remove a user. Requires administrative privileges.
 *
 * @param {number|string} id - The ID of the user to delete
 * @returns {Promise<void>} Promise that resolves when deletion is successful
 * @throws {Error} If deletion fails due to authorization issues or network errors
 */
export async function deleteAdminUser(id: number | string): Promise<void> {
  try {
    await api.delete(`/admin/users/${id}`)
  } catch (error) {
    console.error(`Failed to delete user with ID ${id}:`, error)
    throw error
  }
}

/**
 * Fetches detailed information for a specific user by ID.
 *
 * Makes a GET request to retrieve a user's profile information.
 * Requires administrative privileges.
 *
 * @param {number|string} id - The ID of the user to fetch
 * @returns {Promise<BackendUser>} Promise resolving to the user's profile data
 * @throws {Error} If the fetch fails due to authorization issues or network errors
 */
export async function fetchAdminUserById(id: number | string): Promise<BackendUser> {
  try {
    const response = await api.get<BackendUser>(`/admin/users/${id}`)

    const user: BackendUser = {
      id: response.data.id ?? id,
      email: response.data.email ?? '',
      displayName: response.data.displayName,
      role: response.data.role ?? 'USER',
      firstName: response.data.firstName ?? null,
      lastName: response.data.lastName ?? null,
      phone: response.data.phone ?? null,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt || '',
    }
    return user
  } catch (error) {
    console.error(`Failed to fetch user with ID ${id}:`, error)
    throw error
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
    const response = await api.patch(`/users/me/preferences/update`, payload)
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
    const response = await api.get<UserPreferencesDto>('/users/me/preferences/get')
    return response.data
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    throw error
  }
}
