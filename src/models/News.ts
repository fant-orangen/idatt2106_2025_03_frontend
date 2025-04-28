/**
 * An interface collection for news items.
 *
 * @interface News
 */
export interface News {
  id: number;
  title: string;
  time: string;
  message: string;
  position: string;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Data transfer object for creating a news item.
 *
 * @interface CreateNewsDto
 */
export interface CreateNewsDto {
  title: string;
  message: string;
  position: string;
}
