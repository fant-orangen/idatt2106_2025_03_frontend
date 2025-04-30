/**
 * An interface representing a news article.
 *
 * @interface News
 */
export interface News {
  id: number;
  title: string;
  content: string;
  published_at: string | Date;
  created_by_user_id: number;
  created_at: string | Date;
  updated_at: string | Date;
}

/**
 * Data transfer object for creating a news article.
 *
 * @interface CreateNewsDto
 */
export interface CreateNewsDto {
  title: string;
  content: string;
  created_by_user_id: number;
}

