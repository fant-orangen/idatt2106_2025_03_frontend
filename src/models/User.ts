/**
 * Interface representing the data required for user registration.
 * Corresponds to UserCreateDto in the backend.
 *
 * @interface RegistrationData
 */
export interface RegistrationData {
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone: string;
}

/**
 * Alias for RegistrationData, representing the payload structure required for user registration.
 *
 * @type UserCreatePayload
 */
export type UserCreatePayload = RegistrationData;

/**
 * Public-facing data transfer object for user information.
 * Matches backend UserResponseDto.java
 */
export interface UserResponseDto {
  displayName: string;
  createdAt: string;
  email?: string;
}

/**
 * Backend user model representing a user entity from the server.
 * Maps to the User.java entity in the backend.
 *
 * @interface BackendUser
 */
export interface BackendUser {
  id: number | string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generic interface for Spring Boot paginated responses.
 *
 * Represents the structure of a Spring Data Page object when serialized to JSON.
 * Used for endpoints that return paginated data.
 *
 * @interface SpringPage
 * @template T - The type of objects contained in the content array
 */
export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;         // True if this is the first page
  last: boolean;          // True if this is the last page
  empty: boolean;         // True if the content list is empty
}

/**
 * Type alias for a paginated response containing user objects.
 * Used for admin user listing endpoints.
 *
 * @typedef {SpringPage<BackendUser>} PaginatedUserResponse
 */
export type PaginatedUserResponse = SpringPage<BackendUser>;

/**
 * Interface for user filter parameters
 */
export interface UserFilterParams {
  search?: string;
  role?: 'USER' | 'ADMIN';
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  [key: string]: string | undefined;
}

/**
 * Payload structure for updating user information via admin endpoints.
 * Maps to UserCreateDto.java in the backend.
 *
 * @interface AdminUserUpdatePayload
 */
export interface AdminUserUpdatePayload {
  email: string;
  password?: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role?: 'USER' | 'ADMIN';
}
