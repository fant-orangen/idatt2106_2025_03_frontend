/**
 * An interface representing a news article.
 *
 * @interface News
 */
export interface News {
  id: number;
  title: string;
  content: string;
  publishedAt: string | Date;
  createdByUserId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Data transfer object for creating a news article.
 *
 * @interface CreateNewsDto
 */
export interface CreateNewsDto {
  title: string;
  content: string;
  createdByUserId: number;
}

