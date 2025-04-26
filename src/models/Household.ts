/**
 * Represents a household in the system
 */
export interface Household {

  id: number;
  name: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * Represents a member of a household
 */
export interface Member {
  id: number;
  name: string;
  email?: string;
  householdId: number;
}

/**
 * Data required to create a new household
 */
export interface CreateHouseholdDto {
  name: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * Represents an invitation token response
 */
export interface InvitationTokenResponse {
  token: string;
  expiresAt: string;
}
