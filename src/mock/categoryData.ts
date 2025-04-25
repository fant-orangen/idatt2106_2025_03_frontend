/**
 * Mock data to simulate backend API responses for categories
 */

// Import categories from JSON file
import categoriesData from './categories.json';

export interface Category {
  id: number;
  name: string;
  description: string;
  icon?: string; // Optional icon identifier
}

/**
 * Mock categories for the shelter store
 * Data is imported from categories.json
 */
export const categories: Category[] = categoriesData.categories;

/**
 * Function to simulate fetching categories from an API
 * @returns Promise that resolves to the categories array
 */
export const fetchCategories = (): Promise<Category[]> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve(categories);
    }, 500);
  });
};
