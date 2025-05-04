/**
 * Represents a household in the system (HouseholdDto)
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
 * Represents a member of a household (HouseholdMemberDto)
 */
export interface HouseholdMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

/**
 * Data required to create a new household (HouseholdCreateRequestDto)
 */
export interface HouseholdCreateRequestDto {
  name: string;
  address: string;
  populationCount: number;
  latitude?: number;
  longitude?: number;
}

/**
 * Data required to join a household (HouseholdJoinRequestDto)
 */
export interface HouseholdJoinRequestDto {
  token: string;
}

/**
 * Data required to switch households (HouseholdSwitchRequestDto)
 */
export interface HouseholdSwitchRequestDto {
  householdId: number;
}

/**
 * Data required to invite a user to a household (HouseholdInviteRequestDto)
 */
export interface HouseholdInviteRequestDto {
  email: string;
}

/**
 * Response when inviting a user to a household (HouseholdInviteResponseDto)
 */
export interface HouseholdInviteResponseDto {
  invitationId: string;
  invitedEmail: string;
  status: string;
  createdAt: string;
}

/**
 * Represents an empty household member (EmptyHouseholdMemberDto)
 */
export interface EmptyHouseholdMemberDto {
  id: number;
  name: string;
  type: string;
  description: string;
}

/**
 * Data required to create an empty household member (EmptyHouseholdMemberCreateDto)
 */
export interface EmptyHouseholdMemberCreateDto {
  name: string;
  type: string;
  description: string;
}

/**
 * Type alias for convenience
 */
export type Member = HouseholdMember | EmptyHouseholdMemberDto;
