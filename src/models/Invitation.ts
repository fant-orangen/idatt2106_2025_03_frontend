/**
 * Interface representing a household invitation.
 *
 * Contains information about the invitation, including the sender,
 * recipient, household, and status.
 *
 * @interface Invitation
 */
export interface Invitation {
  id: number;
  householdId: number;
  householdName: string;
  senderId: number;
  senderName: string;
  recipientId: number;
  message?: string;
  createdAt: string;
  status: InvitationStatus;
}

/**
 * Enum representing the possible statuses of an invitation.
 *
 * @enum InvitationStatus
 */
export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

/**
 * Interface for the response when accepting or declining an invitation.
 *
 * @interface InvitationResponseDto
 */
export interface InvitationResponseDto {
  id: number;
  status: InvitationStatus;
}
