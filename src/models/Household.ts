/**
 * Represents a household in the system
 */
export interface Household {
  id: number;
  name: string;
  address: string;
  populationCount: number;
  latitude?: number;
  longitude?: number;
  members: HouseholdMember[];
}

/**
 * Represents a member of a household
 */
export interface HouseholdMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Data required to create a new household
 */
export interface CreateHousehold {
  name: string;
  address: string;
  populationCount: number;
  latitude?: number;
  longitude?: number;
}

/**
 * Represents an invitation token response
 */
export interface InvitationToken {
  token: string;
  expiresAt: string;
}

/**
 * Data required to send an email invitation to a user
 */
export interface EmailInvitation {
  email: string;
  message?: string;
}
