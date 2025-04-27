/**
 * Household service module.
 *
 * This service provides methods for household-related operations including
 * creating, joining, and managing households.
 *
 * @module HouseholdService
 */
import api from '@/services/api/AxiosInstance.ts'
import type { CreateHouseholdDto, Household, EmailInvitationDto } from '@/models/Household'
import type { Member } from '@/models/Household.ts';

/**
 * Fetches the current user's household
 * @returns The current user's household or null if not in a household
 */
export async function getCurrentHousehold(): Promise<Household | null> {
  try {
    const response = await api.get('/households/current');
    return response.data;
  } catch (error: Error | unknown) {
    // If status is 404, it means user is not in a household
    if (error && typeof error === 'object' && 'response' in error && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Join a household using an invitation token
 * @param token The invitation token
 * @returns The joined household data
 */
export async function joinWithToken(token: string): Promise<Household> {
  const response = await api.post('/households/join', { token });
  return response.data;
}

/**
 * Create a new household
 * @param householdData The household data
 * @returns The created household
 */
export async function createHousehold(householdData: CreateHouseholdDto): Promise<Household> {
  const response = await api.post('/households', householdData);
  return response.data;
}

/**
 * Leave the current household
 * @returns Promise that resolves when operation is successful
 */
export async function leaveHousehold(): Promise<void> {
  await api.post('/households/leave');
}

/**
 * Generate an invitation token for the household
 * @returns The generated invitation token
 */
export async function generateInvitationToken(): Promise<string> {
  const response = await api.post('/households/invitations/generate');
  return response.data.token;
}

/**
 * Update household information
 * @param householdId The household ID
 * @param householdData The updated household data
 * @returns The updated household
 */
export async function updateHousehold(
  householdId: number,
  householdData: Partial<Household>
): Promise<Household> {
  const response = await api.put(`/households/${householdId}`, householdData);
  return response.data;
}

/**
 * Get all members of a household
 * @param householdId The household ID
 * @returns Array of household members
 */
export async function getHouseholdMembers(householdId: number): Promise<Member[]> {
  const response = await api.get(`/households/${householdId}/members`);
  return response.data;
}

/**
 * Send an invitation to join the household by email
 * @param invitationData The invitation data including email and optional message
 * @returns Promise that resolves when the invitation is sent
 */
export async function inviteUserByEmail(invitationData: EmailInvitationDto): Promise<void> {
  await api.post('/households/invitations/email', invitationData);
}
