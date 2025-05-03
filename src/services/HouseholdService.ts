/**
 * Household service module.
 *
 * This service provides methods for household-related operations including
 * creating, joining, and managing households.
 *
 * @module HouseholdService
 */
import api from '@/services/api/AxiosInstance.ts'
import type { CreateHousehold, Household, EmailInvitation, HouseholdMember, EmptyHouseholdMember } from '@/models/Household'

/**
 * Fetches the current user's household
 * @returns The current user's household or null if not in a household
 * @throws Error if there's an error other than 404
 */
export async function getCurrentHousehold(): Promise<Household | null> {
  try {
    const response = await api.get('/user/households/me');
    return response.data;
  } catch (error) {
    // Check if it's a 404 error (no household)
    if (error instanceof Error && 'response' in error &&
      error.response && typeof error.response === 'object' &&
      'status' in error.response && error.response.status === 404) {
      return null;
    }
    // For any other error, throw it
    throw error;
  }
}

/**
 * Join a household using an invitation token
 * @param token The invitation token
 * @returns The joined household data
 */
export async function joinWithToken(token: string): Promise<Household> {
  const response = await api.post('/user/households/join', { token });
  return response.data;
}

/**
 * Create a new household
 * @param householdData The household data
 * @returns The created household
 */
export async function createHousehold(householdData: CreateHousehold): Promise<Household> {
  const response = await api.post('/user/households', householdData);
  return response.data;
}

/**
 * Leave the current household
 * @returns Promise that resolves when operation is successful
 * @throws Error if the user is a household admin or doesn't have a household
 */
export async function leaveHousehold(): Promise<void> {
  await api.post('/user/households/leave');
}

/**
 * Transfer admin role to another household member
 * @param memberId The ID of the member to make admin
 * @returns Promise that resolves when operation is successful
 * @throws Error if the user is not an admin or the operation fails
 */
export async function transferAdminRole(memberId: number): Promise<void> {
  await api.post(`/user/households/transfer-admin/${memberId}`);
}

/**
 * Check if the current user is an admin of their household
 * @returns Promise that resolves to true if the user is an admin, false otherwise
 */
export async function isCurrentUserHouseholdAdmin(): Promise<boolean> {
  try {
    const response = await api.get('/user/households/is-admin');
    return response.data.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Invite a user to join the household by email
 * @param email The email address of the user to invite
 * @returns The invitation response containing the token and expiry
 */
export async function inviteUserToHousehold(email: string): Promise<{ token: string }> {
  const response = await api.post('/user/households/invite', { email });
  return response.data;
}

/**
 * Switch to a different household
 * @param householdId The household ID to switch to
 * @returns The switched household
 */
export async function switchHousehold(householdId: number): Promise<Household> {
  const response = await api.put('/user/households/switch', { householdId });
  return response.data;
}

/**
 * Get all members of the current household
 * @returns Array of household members
 */
export async function getHouseholdMembers(): Promise<HouseholdMember[]> {
  const response = await api.get('/user/households/members');
  return response.data;
}

/**
 * Get all empty members of the current household
 * @returns Array of empty household members
 */
export async function getEmptyHouseholdMembers(): Promise<EmptyHouseholdMember[]> {
  const response = await api.get('/user/households/members/empty');
  return response.data;
}

/**
 * Remove a member from the household
 * @param memberId The member ID to remove
 * @returns Promise that resolves when the member is removed
 * @throws Error if the endpoint is not implemented on the backend
 */
export async function removeEmptyMemberFromHousehold(memberId: number): Promise<void> {
  // Note: This endpoint is not yet implemented in the backend (marked as TODO)
  // This is a placeholder for when the backend implements it
  throw new Error('This functionality is not yet implemented on the backend');
}

/**
 * Add an empty (placeholder) member to the household
 * @param memberData The member data
 * @returns The created member
 */
export async function addEmptyMember(
  memberData: Omit<EmptyHouseholdMember, 'id'>
): Promise<EmptyHouseholdMember> {
  const response = await api.post('/user/households/members/empty', memberData);
  return response.data;
}

/**
 * Send an invitation to join the household by email
 * @param invitationData The invitation data including email and optional message
 * @returns Promise that resolves with the invitation response
 */
export async function inviteUserByEmail(invitationData: EmailInvitation): Promise<{ token: string }> {
  const response = await api.post('/user/households/invite', { email: invitationData.email });
  return response.data;
}
