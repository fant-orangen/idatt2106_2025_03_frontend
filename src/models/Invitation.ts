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
  inviterUser: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  inviteeEmail: string;
  household: {
    id: number;
    name: string;
  };
  token: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
}
