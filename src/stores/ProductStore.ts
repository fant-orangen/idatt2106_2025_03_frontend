import { defineStore } from 'pinia';
//import { inventoryService } from '@/services/InventoryService';

export const useProductStore = defineStore('product', {
  state: () => ({
    productIds: new Set<number>(),
  }),

  actions: {
    /**
     * Add product IDs from a page of products to the store
     * @param products Page of products from the API
     */
    addProductIdsFromPage(products: { id: number }[]) {
      products.forEach(product => {
        this.productIds.add(product.id);
      });
    },

    /**
     * Clear all stored product IDs
     */
    clearProductIds() {
      this.productIds.clear();
    }
  }
});
