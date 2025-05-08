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
  createdById: number;
  createdByName: string;
  crisisEventId: number;
  crisisEventName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  status: 'draft' | 'published' | 'archived';
}

/**
 * Data transfer object for creating a news article.
 *
 * @interface CreateNewsDto
 */
export interface CreateNewsDto {
  title: string;
  content: string;
  crisisEventId: number;
  status: 'draft' | 'published' | 'archived';
}

/**
 * Data transfer object for updating a news article.
 * Allows updating title, content, and status.
 *
 * @interface UpdateNewsArticleDTO
 */
export interface UpdateNewsArticleDTO {
  title?: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived';
}
