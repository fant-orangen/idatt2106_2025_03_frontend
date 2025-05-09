import type { Page } from '../types/Page';
import api from './api/AxiosInstance';
import { useProductStore } from '@/stores/ProductStore';
import type { ProductType, ProductBatch, CreateProductTypeRequest } from '@/models/Product';

class InventoryService {
  private productStore = useProductStore();

  /**
   * Get all food product types for the current household
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of product types
   */
  async getFoodProductTypes(page: number = 0, size: number = 20): Promise<Page<ProductType>> {
    try {
      const response = await api.get('/user/inventory/product-types/food', {
        params: {
          page,
          size
        }
      });

      // Store the product IDs from this page
      this.productStore.addProductIdsFromPage(response.data.content);

      return response.data;
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  }

  /**
   * Create a new food product type
   * @param productData The product data to create
   * @returns Promise containing the created product
   */
  async createFoodProductType(productData: CreateProductTypeRequest): Promise<ProductType> {
    try {
      const response = await api.post('/user/inventory/product-types/food', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product type:', error);
      throw error;
    }
  }

  /**
   * Create a new water product type
   * @param productData The product data to create
   * @returns Promise containing the created product
   */
  async createWaterProductType(productData: CreateProductTypeRequest): Promise<ProductType> {
    try {
      const response = await api.post('/user/inventory/product-types/water', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating water product type:', error);
      throw error;
    }
  }

  /**
   * Create a new medicine product type
   * @param productData The product data to create
   * @returns Promise containing the created product
   */
  async createMedicineProductType(productData: CreateProductTypeRequest): Promise<ProductType> {
    try {
      const response = await api.post('/user/inventory/product-types/medicine', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating medicine product type:', error);
      throw error;
    }
  }

  /**
   * Get the total amount of water for the household
   * @returns Promise containing the total water amount
   */
  async getTotalWater(): Promise<number> {
    try {
      const response = await api.get('/user/inventory/water/sum');
      return response.data;
    } catch (error) {
      console.error('Error fetching total water:', error);
      throw error;
    }
  }

  /**
   * Get all water product types for the current household
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of water product types
   */
  async getWaterProductTypes(page: number = 0, size: number = 20): Promise<Page<ProductType>> {
    try {
      const response = await api.get('/user/inventory/product-types/water', {
        params: {
          page,
          size
        }
      });
      this.productStore.addProductIdsFromPage(response.data.content);
      return response.data;
    } catch (error) {
      console.error('Error fetching water product types:', error);
      throw error;
    }
  }

  /**
   * Get all medicine product types for the current household
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of medicine product types
   */
  async getMedicineProductTypes(page: number = 0, size: number = 20): Promise<Page<ProductType>> {
    try {
      const response = await api.get('/user/inventory/product-types/medicine', {
        params: {
          page,
          size
        }
      });
      this.productStore.addProductIdsFromPage(response.data.content);
      return response.data;
    } catch (error) {
      console.error('Error fetching medicine product types:', error);
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
      const response = await api.get(`/user/inventory/product-types/${productTypeId}/batches`, {
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

  /**
   * Create a new product batch
   * @param productTypeId The ID of the product type
   * @param number The number of units in the batch
   * @param expirationTime The expiration time of the batch (optional)
   * @returns Promise containing the created product batch
   */
  async createProductBatch(productTypeId: number, number: number, expirationTime?: string): Promise<ProductBatch> {
    try {
      const response = await api.post('/user/inventory/product-batches', {
        productTypeId,
        number,
        expirationTime: expirationTime ? new Date(expirationTime).toISOString() : null
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product batch:', error);
      throw error;
    }
  }


  /**
   * Get the total number of units for a product type
   * @param productTypeId The ID of the product type
   * @returns Promise containing the total number of units
   */
  async getTotalUnitsForProductType(productTypeId: number): Promise<number> {
    try {
      const response = await api.get(`/user/inventory/product-types/${productTypeId}/sum`);
      return response.data;
    } catch (error) {
      console.error('Error fetching total units:', error);
      throw error;
    }
  }

  /**
   * Delete a product batch
   * @param batchId The ID of the batch to delete
   */
  async deleteProductBatch(batchId: number): Promise<void> {
    try {
      await api.delete(`/user/inventory/product-batches/${batchId}`);
    } catch (error) {
      console.error('Error deleting product batch:', error);
      throw error;
    }
  }

  /**
   * Delete a product type and all its associated batches
   * @param productTypeId The ID of the product type to delete
   */
  async deleteProductType(productTypeId: number): Promise<void> {
    try {
      await api.delete(`/user/inventory/product-types/${productTypeId}`);
    } catch (error) {
      console.error('Error deleting product type:', error);
      throw error;
    }
  }

  /**
   * Get the number of days of food remaining in the household
   * @returns Promise containing the number of days of food remaining
   */
  async getFoodDaysRemaining(): Promise<number> {
    try {
      const response = await api.get('/user/inventory/food/days-remaining');
      return response.data;
    } catch (error) {
      console.error('Error fetching food days remaining:', error);
      throw error;
    }
  }

  /**
   * Get the number of days of water remaining in the household
   * @returns Promise containing the number of days of water remaining
   */
  async getWaterDaysRemaining(): Promise<number> {
    try {
      const response = await api.get('/user/inventory/water/days-remaining');
      return response.data;
    } catch (error) {
      console.error('Error fetching water days remaining:', error);
      throw error;
    }
  }

  /**
   * Search for product types by name and category
   * @param search The search string
   * @param category The category to filter by (food, water, medicine)
   * @param page Page number (0-based)
   * @param size Page size
   * @returns Promise containing a page of product types
   */
  async searchProductTypes(search: string, category: string, page: number = 0, size: number = 20): Promise<Page<ProductType>> {
    try {
      const response = await api.get('/user/inventory/product-types/search', {
        params: {
          search,
          category,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching product types:', error);
      throw error;
    }
  }

  /**
   * Update the number of units in a product batch
   * @param batchId The ID of the batch to update
   * @param newNumberOfUnits The new number of units to set for the batch
   * @returns Promise that resolves when the update is complete
   */
  async updateBatchUnits(batchId: number, newNumberOfUnits: number): Promise<void> {
    try {
      await api.put(`/user/inventory/product-batches/${batchId}`, JSON.stringify(newNumberOfUnits), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error updating product batch:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
