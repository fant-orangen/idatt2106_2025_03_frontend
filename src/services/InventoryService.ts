import type { Page } from '../types/Page';
import api from './api/AxiosInstance';
import { useProductStore } from '@/stores/ProductStore';
import type { ProductType, ProductBatch } from '@/models/Product';

class InventoryService {
  private productStore = useProductStore();

  /**
   * Get all product types for the current household
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of product types
   */
  async getProductTypes(page: number = 0, size: number = 20): Promise<Page<ProductType>> {
    try {
      const response = await api.get('/inventory/product-types', {
        params: {
          page,
          size
        }
      });
      console.log('API Response:', response.data);

      // Store the product IDs from this page
      this.productStore.addProductIdsFromPage(response.data.content);

      return response.data;
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  }

  /**
   * Get all batches for a specific product type
   * @param productTypeId The ID of the product type
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of product batches
   */
  async getProductBatches(productTypeId: number, page: number = 0, size: number = 20): Promise<Page<ProductBatch>> {
    try {
      const response = await api.get(`/inventory/product-types/${productTypeId}/batches`, {
        params: {
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product batches:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
