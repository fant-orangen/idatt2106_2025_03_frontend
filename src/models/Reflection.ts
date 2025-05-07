/**
 * Interface representing a reflection response from the backend.
 * Maps to ReflectionResponseDto.java in the backend.
 *
 * @interface ReflectionResponseDto
 */
export interface ReflectionResponseDto {
  id: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  content: string;
  shared: boolean;
  deleted: boolean;
  createdAt: string;
  crisisEventId?: number;
  crisisEventName?: string;
}

/**
 * Interface representing the data required to create a new reflection.
 * Maps to CreateReflectionDto.java in the backend.
 *
 * @interface CreateReflectionDto
 */
export interface CreateReflectionDto {
  content: string;
  shared: boolean;
  crisisEventId?: number;
}

/**
 * Interface representing the data required to update an existing reflection.
 * Maps to UpdateReflectionDto.java in the backend.
 *
 * @interface UpdateReflectionDto
 */
export interface UpdateReflectionDto {
  content: string;
  shared: boolean;
}

/**
 * Type for reflection sharing scope
 */
export type ReflectionScope = 'private' | 'household' | 'group';
