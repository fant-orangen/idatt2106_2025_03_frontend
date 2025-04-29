import { defineStore } from 'pinia';
//import { inventoryService } from '@/services/InventoryService';

export const useProductStore = defineStore('product', {
  state: () => ({
    productIds: new Set<number>(),
    productMap: new Map<string, number>(), // Map of product names to IDs
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
     * Get product ID by name
     * @param name Product name
     * @returns Product ID or undefined if not found
     */
    getProductId(name: string): number | undefined {
      return this.productMap.get(name.toLowerCase());
    },

    /**
     * Clear all stored product IDs
     */
    clearProductIds() {
      this.productIds.clear();
      this.productMap.clear();
    }
  }
});
