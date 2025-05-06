/**
 * Invitation service module.
 *
 * This service provides methods for invitation-related operations including
 * fetching pending invitations, accepting invitations, and declining invitations.
 *
 * @module InvitationService
 */
import api from '@/services/api/AxiosInstance.ts'
import type { Invitation } from '@/models/Invitation'
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
