/**
 * Invitation service module.
 *
 * This service provides methods for invitation-related operations including
 * fetching pending invitations, accepting invitations, and declining invitations.
 *
 * @module InvitationService
 */
import api from '@/services/api/AxiosInstance.ts'
import type { Invitation, GroupInvitation } from '@/models/Invitation'
import type { Household, HouseholdJoinRequestDto } from '@/models/Household'

/**
 * Fetches pending invitations for the currently authenticated user.
 *
 * @returns {Promise<Invitation[]>} Promise resolving to an array of pending invitations
 * @throws {Error} If the request fails
 */
export async function fetchPendingInvitations(): Promise<Invitation[]> {
  try {
    const response = await api.get<Invitation[]>('/user/invitations/pending');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pending invitations:', error);
    throw error;
  }
}

/**
 * Accept a household invitation.
 *
 * @param {string} token - The invitation token
 * @returns {Promise<Household>} Promise resolving to the joined household
 * @throws {Error} If the user already has a household, the token is invalid or expired
 */
export async function acceptInvitation(token: string): Promise<Household> {
  const payload: HouseholdJoinRequestDto = { token };
  try {
    const response = await api.post<Household>('/user/invitations/accept', payload);
    return response.data;
  } catch (error: any) {
    console.error('Failed to accept invitation:', error);
    if (error.response && error.response.data) {
      // If the error is that the user already has a household, provide a more helpful message
      if (error.response.data.includes('already has a household')) {
        throw new Error('You already have a household. Please leave your current household before accepting this invitation.');
      }
    }
    throw error;
  }
}

/**
 * Decline a household invitation.
 *
 * @param {string} token - The invitation token
 * @returns {Promise<void>} Promise that resolves when the invitation is declined
 * @throws {Error} If the request fails
 */
export async function declineInvitation(token: string): Promise<void> {
  const payload: HouseholdJoinRequestDto = { token };
  await api.post('/user/invitations/decline', payload);
}

/**
 * Send a group invitation to a household
 * @param householdName The name of the household to invite
 * @param groupId The ID of the group to invite the household to
 * @returns Promise that resolves when operation is successful
 * @throws Error if the household doesn't exist or cannot be invited
 */
export async function sendGroupInvitation(householdName: string, groupId: number): Promise<void> {
  try {
    const payload = {
      householdName,
      groupId
    };
    await api.post('/user/groups/invitations', payload);
  } catch (error) {
    console.error('Error sending group invitation:', error);
    throw error;
  }
}

/**
 * Get all pending group invitations for the current user
 * @returns List of pending group invitations
 */
export async function getPendingGroupInvitations(): Promise<GroupInvitation[]> {
  try {
    const response = await api.get('/user/groups/invitations');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending group invitations:', error);
    throw error;
  }
}

/**
 * Accept a group invitation
 * @param invitationId The ID of the invitation to accept
 * @returns Promise that resolves when operation is successful
 * @throws Error if the user is not a member of the invited household or the invitation doesn't exist
 */
export async function acceptGroupInvitation(invitationId: number): Promise<void> {
  try {
    await api.patch(`/user/groups/invitations/${invitationId}/accept`);
  } catch (error) {
    console.error('Error accepting group invitation:', error);
    throw error;
  }
}

/**
 * Reject a group invitation
 * @param invitationId The ID of the invitation to reject
 * @returns Promise that resolves when operation is successful
 * @throws Error if the user is not a member of the invited household or the invitation doesn't exist
 */
export async function rejectGroupInvitation(invitationId: number): Promise<void> {
  try {
    await api.patch(`/user/groups/invitations/${invitationId}/reject`);
  } catch (error) {
    console.error('Error rejecting group invitation:', error);
    throw error;
  }
}
