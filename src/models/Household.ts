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
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
  name?: string;
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
 * Data required to join a household
 */
export interface HouseholdJoinRequestDto {
  token: string;
}

/**
 * Data required to switch households
 */
export interface HouseholdSwitchRequestDto {
  householdId: number;
}

/**
 * Represents an invitation token response
 */
export interface HouseholdInviteResponseDto {
  token: string;
}

/**
 * Data required to send an email invitation to a user
 */
export interface EmailInvitation {
  email: string;
}

export type Member = HouseholdMember | EmptyHouseholdMember;

export interface EmptyHouseholdMember {
  id?: number;
  name: string;
  type: string;
  description?: string;
}
