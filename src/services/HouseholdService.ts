/**
 * Household service module.
 *
 * This service provides methods for household-related operations including
 * creating, joining, and managing households.
 *
 * @module HouseholdService
 */
import api from '@/services/api/AxiosInstance.ts'
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
 * Create a new household
 * @param householdData The household data
 * @returns The created household
 */
export async function createHousehold(householdData: HouseholdCreateRequestDto): Promise<Household> {
  const response = await api.post('/user/households', householdData);
  return response.data;
}

/**
 * Update an existing household (admin only)
 * @param updateData The updated household data
 * @returns The updated household
 * @throws Error if the user is not an admin or the update fails
 */
export async function updateHousehold(updateData: HouseholdUpdateRequestDto): Promise<Household> {
  try {
    const response = await api.put('/user/households/update', updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating household:', error);
    throw error;
  }
}

/**
 * Invite a user to join the household by email (admin only)
 * @param email The email address of the user to invite
 * @returns The invitation response containing the token and expiry
 * @throws Error if the user is not an admin, the invitee already has a household,
 *         the invitee is the same as the inviter, or there's already a pending invitation for this user
 */
export async function inviteUserToHousehold(email: string): Promise<HouseholdInviteResponseDto> {
  const payload: HouseholdInviteRequestDto = { email };
  try {
    console.log('Sending invitation to:', email);
    const response = await api.post('/user/households/invite', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Invitation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error inviting user to household:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Join a household using an invitation token
 * @param token The invitation token
 * @returns The joined household data
 * @throws Error if the user already has a household, the token is invalid or expired
 */
export async function joinWithToken(token: string): Promise<Household> {
  const payload: HouseholdJoinRequestDto = { token };
  const response = await api.post('/user/households/join', payload);
  return response.data;
}

/**
 * Leave the current household
 * @returns Promise that resolves when operation is successful
 * @throws Error if the user is the last household admin or doesn't have a household
 */
export async function leaveHousehold(): Promise<void> {
  await api.post('/user/households/leave');
}

/**
 * Get all members of the current household
 * @returns Array of household members
 */
export async function getHouseholdMembers(): Promise<HouseholdMember[]> {
  console.log("trying to get household members");
  const response = await api.get('/user/households/members');
  return response.data;
}

/**
 * Get all non-admin members of the current household
 * @returns Array of non-admin household members
 */
export async function getNonAdminHouseholdMembers(): Promise<HouseholdMember[]> {
  const response = await api.get('/user/households/members/non-admin');
  return response.data;
}

/**
 * Get all members of the current household
 * @returns Array of household members
 */
export async function getHouseholdNotAdminMembers(): Promise<HouseholdMember[]> {
  const response = await api.get('/user/households/members/non-admin');
  return response.data;
}

/**
 * Get all empty members of the current household
 * @returns Array of empty household members
 */
export async function getEmptyHouseholdMembers(): Promise<EmptyHouseholdMemberDto[]> {
  const response = await api.get('/user/households/members/empty');
  return response.data;
}

/**
 * Add an empty (placeholder) member to the household (admin only)
 * @param memberData The member data
 * @returns The created member
 * @throws Error if the user is not an admin
 */
export async function addEmptyMember(
  memberData: EmptyHouseholdMemberCreateDto
): Promise<EmptyHouseholdMemberDto> {
  const response = await api.post('/user/households/members/empty', memberData);
  return response.data;
}

/**
 * Remove an empty household member (admin only)
 * @param memberId The empty member ID to remove
 * @returns Promise that resolves when the member is removed
 * @throws Error if the user is not an admin
 */
export async function removeEmptyMemberFromHousehold(memberId: number): Promise<void> {
  await api.delete(`/user/households/members/empty/${memberId}`);
}

/**
 * Remove a household member (admin only)
 * @param memberId The member ID to remove
 * @returns Promise that resolves when the member is removed
 * @throws Error if the user is not an admin, the member is the last admin, or the operation fails
 */
export async function removeMemberFromHousehold(memberId: number): Promise<void> {
  await api.delete(`/user/households/members/${memberId}`);
}

/**
 * Cancel a household invitation that was sent to another user
 * @param token The invitation token
 * @returns Promise that resolves when operation is successful
 */
export async function cancelHouseholdInvitation(token: string): Promise<void> {
  try {
    await api.delete(`/user/households/invitations/${token}`);
  } catch (error) {
    console.error('Error canceling invitation:', error);
    throw error;
  }
}

/**
 * Get pending invitations sent from the user's household
 * @returns List of pending invitations
 */
export async function getPendingHouseholdInvitations(): Promise<Invitation[]> {
  const response = await api.get('/user/households/pending-invitations');
  return response.data;
}

/**
 * Promote a user to household admin (admin only)
 * @param email The email of the user to promote
 * @returns Promise that resolves when operation is successful
 * @throws Error if the user is not an admin or the operation fails
 */
export async function promoteUserToAdmin(email: string): Promise<void> {
  await api.post(`/user/households/promote-admin/${email}`);
}

/**
 * Switch to a different household
 * @param householdId The household ID to switch to
 * @returns The switched household
 * @throws Error if the user is the last admin of their current household
 */
export async function switchHousehold(householdId: number): Promise<Household> {
  const payload: HouseholdSwitchRequestDto = { householdId };
  const response = await api.put('/user/households/switch', payload);
  return response.data;
}

/**
 * Check if the current user is an admin of their household
 * @returns Promise that resolves to true if the user is an admin, false otherwise
 */
export async function isCurrentUserHouseholdAdmin(): Promise<boolean> {
  try {
    const response = await api.get('/user/households/is-admin');
    return response.data.isAdmin;
  } catch (error) {
    console.error('Error checking if user is household admin:', error);
    return false;
  }
}

/**
 * Deletes the current user's household. This operation can only be performed by household admins.
 * The backend will validate if the user is an admin and if they are allowed to delete the household.
 *
 * @returns Promise that resolves when the household is successfully deleted
 * @throws Error if the user is not an admin or if there's another issue preventing deletion
 */
export async function deleteHousehold(): Promise<void> {
  try {
    console.log('Sending request to delete household');
    await api.delete('/user/households/delete');
  } catch (error) {
    console.error('Error deleting household:', error);
    throw error;
  }
}

/**
 * Sends a safety check to all household members
 * This will mark the sender as safe automatically
 *
 * @returns Promise that resolves when the safety check is sent
 */
export async function askIfSafe(): Promise<void> {
  try {
    await api.post('/user/confirm-safety/requests');
  } catch (error: unknown) {
    console.error('Error sending safety check:', error);
    throw error;
  }
}

/**
 * Checks if a user is marked as safe
 *
 * @param userId The ID of the user to check
 * @returns Promise that resolves to true if the user is safe, false otherwise
 * @throws Error if the user doesn't exist or there's another issue
 */
export async function isUserSafe(userId: number): Promise<boolean> {
  try {
    const response = await api.get('/user/confirm-safety/is-safe', {
      params: { userId }
    })
    return response.data === true || (typeof response.data === 'object' && response.data.isSafe === true);
  } catch (error: unknown) {
    return false;
  }
}
