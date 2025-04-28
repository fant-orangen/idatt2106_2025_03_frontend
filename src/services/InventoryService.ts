import type { Page } from '../types/Page';
import api from './api/AxiosInstance';

export interface ProductTypeDto {
  id: number;
  name: string;
  unit: string;
  caloriesPerUnit: number;
  isWater: boolean;
}

class InventoryService {
  /**
   * Get all product types for the current household
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of product types
   */
  async getProductTypes(page: number = 0, size: number = 20): Promise<Page<ProductTypeDto>> {
    try {
      const response = await api.get('/inventory/product-types', {
        params: {
          page,
          size
        }
      });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
