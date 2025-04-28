/**
 * Invitation service module.
 *
 * This service provides methods for invitation-related operations including
 * fetching pending invitations, accepting invitations, and declining invitations.
 *
 * @module InvitationService
 */
import api from '@/services/api/AxiosInstance.ts'
import type { Invitation, InvitationResponseDto, InvitationStatus } from '@/models/Invitation'

/**
 * Fetches pending invitations for the currently authenticated user.
 *
 * @returns {Promise<Invitation[]>} Promise resolving to an array of pending invitations
 * @throws {Error} If the request fails
 */
export async function fetchPendingInvitations(): Promise<Invitation[]> {
  try {
    const response = await api.get<Invitation[]>('/invitations/pending');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pending invitations:', error);
    throw error;
  }
}

/**
 * Responds to an invitation (accept or decline).
 *
 * @param {number} invitationId - The ID of the invitation to respond to
 * @param {InvitationStatus} status - The response status (ACCEPTED or DECLINED)
 * @param {string} [message] - Optional message to include with the response
 * @returns {Promise<Invitation>} Promise resolving to the updated invitation
 * @throws {Error} If the request fails
 */
export async function respondToInvitation(
  id: number,
  status: InvitationStatus,
): Promise<Invitation> {

  const payload: InvitationResponseDto = {
    id,
    status,
  };

  const response = await api.post<Invitation>('/invitations/respond', payload);
  return response.data;

}
