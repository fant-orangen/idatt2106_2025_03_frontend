import { defineStore } from 'pinia';

interface GroupState {
  currentGroupId: number | null;
  productTypeMap: Map<string, number>;
  batchMap: Map<string, number>;
}

export const useGroupStore = defineStore('group', {
  state: (): GroupState => ({
    currentGroupId: null,
    productTypeMap: new Map(),
    batchMap: new Map()
  }),

  actions: {
    setCurrentGroup(groupId: number) {
      this.currentGroupId = groupId;
    },

    clearCurrentGroup() {
      this.currentGroupId = null;
    },

    addProductTypeIds(productTypes: { name: string; id: number }[]) {
      productTypes.forEach(type => {
        this.productTypeMap.set(type.name, type.id);
      });
    },

    addBatchIds(productName: string, batches: { amount: string; expires: string; id: number }[]) {
      batches.forEach(batch => {
        const key = `${productName}-${batch.amount}-${batch.expires}`;
        this.batchMap.set(key, batch.id);
      });
    },

    getProductTypeId(name: string): number | undefined {
      return this.productTypeMap.get(name);
    },

    getBatchId(productName: string, amount: string, expires: string): number | undefined {
      const key = `${productName}-${amount}-${expires}`;
      return this.batchMap.get(key);
    },

    clearProductTypeIds() {
      this.productTypeMap.clear();
    },

    clearBatchIds() {
      this.batchMap.clear();
    },

    clearAll() {
      this.clearCurrentGroup();
      this.clearProductTypeIds();
      this.clearBatchIds();
    }
  }
});
