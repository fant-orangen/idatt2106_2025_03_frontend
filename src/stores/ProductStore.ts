import { defineStore } from 'pinia';
//import { inventoryService } from '@/services/InventoryService';

export const useProductStore = defineStore('product', {
  state: () => ({
    productIds: new Set<number>(),
    productMap: new Map<string, number>(), // Map of product names to IDs
    batchMap: new Map<string, number>(), // Map of batch keys to IDs
  }),

  actions: {
    /**
     * Add product IDs from a page of products to the store
     * @param products Page of products from the API
     */
    addProductIdsFromPage(products: { id: number; name: string }[]) {
      products.forEach(product => {
        this.productIds.add(product.id);
        this.productMap.set(product.name.toLowerCase(), product.id);
      });
    },

    /**
     * Add batch IDs for a product
     * @param productName Product name
     * @param batches Array of batches with IDs
     */
    addBatchIds(productName: string, batches: { id: number; amount: string; expires: string }[]) {
      const productId = this.getProductId(productName);
      if (!productId) return;

      batches.forEach(batch => {
        const batchKey = `${productId}-${batch.amount}-${batch.expires}`;
        this.batchMap.set(batchKey, batch.id);
      });
    },

    /**
     * Get batch ID by product and batch details
     * @param productName Product name
     * @param amount Batch amount
     * @param expires Batch expiration date
     * @returns Batch ID or undefined if not found
     */
    getBatchId(productName: string, amount: string, expires: string): number | undefined {
      const productId = this.getProductId(productName);
      if (!productId) return undefined;

      const batchKey = `${productId}-${amount}-${expires}`;
      return this.batchMap.get(batchKey);
    },

    /**
     * Get product ID by name
     * @param name Product name
     * @returns Product ID or undefined if not found
     */
    getProductId(name: string): number | undefined {
      return this.productMap.get(name.toLowerCase());
    },

    /**
     * Clear all stored product IDs and batch IDs
     */
    clearProductIds() {
      this.productIds.clear();
      this.productMap.clear();
      this.batchMap.clear();
    }
  }
});
