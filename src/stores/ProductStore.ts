import { defineStore } from 'pinia';
//import { inventoryService } from '@/services/InventoryService';

// Define allowed inventory types
export type InventoryType = 'food' | 'water' | 'medicine';
const inventoryTypes: InventoryType[] = ['food', 'water', 'medicine'];

export const useProductStore = defineStore('product', {
  state: () => ({
    currentType: 'food' as InventoryType,
    productIds: {
      food: new Set<number>(),
      water: new Set<number>(),
      medicine: new Set<number>(),
    } as Record<InventoryType, Set<number>>,
    productMap: {
      food: new Map<string, number>(),
      water: new Map<string, number>(),
      medicine: new Map<string, number>(),
    } as Record<InventoryType, Map<string, number>>,
    batchMap: {
      food: new Map<string, number>(),
      water: new Map<string, number>(),
      medicine: new Map<string, number>(),
    } as Record<InventoryType, Map<string, number>>,
  }),

  actions: {
    setType(type: InventoryType) {
      if (inventoryTypes.includes(type)) {
        this.currentType = type;
      }
    },
    /**
     * Add product IDs from a page of products to the store
     * @param products Page of products from the API
     */
    addProductIdsFromPage(products: { id: number; name: string }[]) {
      const type = this.currentType;
      products.forEach(product => {
        this.productIds[type].add(product.id);
        this.productMap[type].set(product.name.toLowerCase(), product.id);
      });
    },

    /**
     * Add batch IDs for a product
     * @param productName Product name
     * @param batches Array of batches with IDs
     */
    addBatchIds(productName: string, batches: { id: number; amount: string; expires: string }[]) {
      const type = this.currentType;
      const productId = this.getProductId(productName);
      if (!productId) return;

      batches.forEach(batch => {
        const batchKey = `${productId}-${batch.amount}-${batch.expires}`;
        this.batchMap[type].set(batchKey, batch.id);
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
      const type = this.currentType;
      const productId = this.getProductId(productName);
      if (!productId) return undefined;

      const batchKey = `${productId}-${amount}-${expires}`;
      return this.batchMap[type].get(batchKey);
    },

    /**
     * Get product ID by name
     * @param name Product name
     * @returns Product ID or undefined if not found
     */
    getProductId(name: string): number | undefined {
      const type = this.currentType;
      return this.productMap[type].get(name.toLowerCase());
    },

    /**
     * Clear all stored product IDs and batch IDs
     */
    clearProductIds() {
      inventoryTypes.forEach(type => {
        this.productIds[type].clear();
        this.productMap[type].clear();
        this.batchMap[type].clear();
      });
    }
  }
});
