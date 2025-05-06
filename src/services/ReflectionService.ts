/**
 * Reflection service module.
 *
 * This service provides methods for reflection-related operations including
 * fetching user reflections, creating new reflections, updating existing reflections,
 * and fetching shared reflections from household or group.
 *
 * @module ReflectionService
 */
import api from '@/services/api/AxiosInstance.ts'
import type { ReflectionResponseDto, CreateReflectionDto, UpdateReflectionDto } from '@/models/Reflection'
import type { Page } from '@/types/Page'

/**
 * Fetches the current user's reflections with pagination.
 *
 * @param {number} page - The page number (0-based)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<ReflectionResponseDto>>} Promise resolving to a page of reflections
 */
export async function getMyReflections(page: number = 0, size: number = 10): Promise<Page<ReflectionResponseDto>> {
  try {
    const response = await api.get<Page<ReflectionResponseDto>>(`/user/reflections/my`, {
      params: { page, size }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching user reflections:', error)
    throw error
  }
}

/**
 * Fetches shared reflections visible to the current user (from household and groups).
 *
 * @param {number} page - The page number (0-based)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<ReflectionResponseDto>>} Promise resolving to a page of shared reflections
 */
export async function getSharedReflections(page: number = 0, size: number = 10): Promise<Page<ReflectionResponseDto>> {
  try {
    const response = await api.get<Page<ReflectionResponseDto>>(`/user/reflections/shared`, {
      params: { page, size }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching shared reflections:', error)
    throw error
  }
}

/**
 * Fetches shared reflections for a specific household.
 *
 * @param {number} householdId - The ID of the household
 * @param {number} page - The page number (0-based)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<ReflectionResponseDto>>} Promise resolving to a page of household reflections
 */
export async function getHouseholdReflections(
  householdId: number,
  page: number = 0,
  size: number = 10
): Promise<Page<ReflectionResponseDto>> {
  try {
    const response = await api.get<Page<ReflectionResponseDto>>(`/user/reflections/household`, {
      params: { page, size }
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching household reflections for household ${householdId}:`, error)
    throw error
  }
}

/**
 * Fetches shared reflections for a specific group.
 *
 * @param {number} groupId - The ID of the group
 * @param {number} page - The page number (0-based)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<ReflectionResponseDto>>} Promise resolving to a page of group reflections
 */
export async function getGroupReflections(
  groupId: number,
  page: number = 0,
  size: number = 10
): Promise<Page<ReflectionResponseDto>> {
  try {
    const response = await api.get<Page<ReflectionResponseDto>>(`/user/reflections/group/${groupId}`, {
      params: { page, size }
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching group reflections for group ${groupId}:`, error)
    throw error
  }
}

/**
 * Creates a new reflection.
 *
 * @param {CreateReflectionDto} reflectionData - The reflection data to create
 * @returns {Promise<ReflectionResponseDto>} Promise resolving to the created reflection
 */
export async function createReflection(reflectionData: CreateReflectionDto): Promise<ReflectionResponseDto> {
  try {
    console.log('Reflection data:', reflectionData);
    const response = await api.post<ReflectionResponseDto>('/user/reflections', reflectionData)
    console.log('Reflection created:', response.data);
    return response.data
  } catch (error) {
    console.error('Error creating reflection:', error)
    throw error
  }
}

/**
 * Updates an existing reflection.
 *
 * @param {number} reflectionId - The ID of the reflection to update
 * @param {UpdateReflectionDto} reflectionData - The updated reflection data
 * @returns {Promise<ReflectionResponseDto>} Promise resolving to the updated reflection
 */
export async function updateReflection(
  reflectionId: number,
  reflectionData: UpdateReflectionDto
): Promise<ReflectionResponseDto> {
  try {
    const response = await api.put<ReflectionResponseDto>(`/user/reflections/${reflectionId}`, reflectionData)
    return response.data
  } catch (error) {
    console.error(`Error updating reflection ${reflectionId}:`, error)
    throw error
  }
}

/**
 * Deletes a reflection.
 *
 * @param {number} reflectionId - The ID of the reflection to delete
 * @returns {Promise<void>} Promise that resolves when the reflection is deleted
 */
export async function deleteReflection(reflectionId: number): Promise<void> {
  try {
    await api.delete(`/user/reflections/${reflectionId}`)
  } catch (error) {
    console.error(`Error deleting reflection ${reflectionId}:`, error)
    throw error
  }
}
