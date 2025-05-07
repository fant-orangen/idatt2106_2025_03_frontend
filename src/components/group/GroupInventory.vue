<!-- Group Inventory Component -->
<template>
  <div class="min-h-screen p-4 sm:p-6 bg-background text-foreground">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-4">
        Loading group inventory...
      </div>

      <!-- Empty State -->
      <div v-else-if="items.length === 0" class="text-center py-4">
        No items have been contributed to this group yet.
      </div>

      <!-- Product List -->
      <div
        v-else
        v-for="(item, index) in items"
        :key="item.id"
        class="border border-border rounded-lg bg-card p-4 space-y-4 shadow-md mb-3"
      >
        <!-- Product Overview -->
        <div class="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2">
          <div class="font-medium">
            <span v-if="item.category === 'water'" class="mr-2">💧</span>
            <span v-else-if="item.category === 'medicine'" class="mr-2">💊</span>
            <span v-else class="mr-2">🍽️</span>
            {{ item.name }}
          </div>
          <div class="text-left sm:text-left">{{ getTotalAmount(item) }}</div>
          <div class="left-center sm:text-left">
            <span v-if="item.category === 'food'">{{ item.caloriesPerUnit }} kcal per {{ item.unit }}</span>
            <span v-else>{{ item.unit }}</span>
          </div>
          <div class="text-right sm:text-center">
            <Button
              variant="link"
              @click="toggleEdit(index)"
              class="text-sm"
            >
              {{ item.edit ? t('inventory.save') : t('inventory.edit') }}
            </Button>
          </div>
        </div>

        <!-- Batch Editing -->
        <div v-if="item.edit" class="space-y-4 mt-4">
          <div
            v-for="(batch, bIndex) in item.batches"
            :key="bIndex"
            class="flex flex-col sm:grid sm:grid-cols-5 gap-3 items-center"
          >
            <div class="text-sm text-center sm:text-left">{{ batch.amount }}</div>
            <div class="text-sm text-center sm:text-left">{{ item.unit }}</div>
            <div class="text-sm text-center sm:text-left">{{ batch.expires }}</div>
            <Button
              variant="destructive"
              @click="removeBatch(index, bIndex)"
              class="text-sm w-full sm:w-auto"
            >
              {{ t('inventory.remove-from-group') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { format } from 'date-fns';
import { groupService } from '@/services/api/GroupService';
import { useGroupStore } from '@/stores/GroupStore';
import { Button } from '@/components/ui/button';
import type { ProductType } from '@/models/Product';
import type { Page } from '@/types/Page';
import { useI18n } from 'vue-i18n';

interface GroupInventoryItem extends ProductType {
  edit: boolean;
  batches: GroupBatch[];
  totalUnits: number;
}

interface GroupBatch {
  id: number;
  amount: string;
  expires: string;
  isNew?: boolean;
}

const props = defineProps({
  searchText: {
    type: String,
    default: ''
  },
  groupId: {
    type: Number,
    required: true
  }
});

const groupStore = useGroupStore();
const items = ref<GroupInventoryItem[]>([]);
const isLoading = ref(true);
const { t } = useI18n();

const fetchAllProductTypes = async () => {
  try {
    isLoading.value = true;
    const response: Page<ProductType> = await groupService.getContributedProductTypes({
      groupId: props.groupId
    });

    if (response?.content) {
      items.value = response.content.map(product => ({
        ...product,
        edit: false,
        batches: [],
        totalUnits: 0
      }));

      if (items.value.length > 0) {
        groupStore.addProductTypeIds(items.value);
      }
    }

    console.log('Loaded group inventory items:', items.value.length);
  } catch (error) {
    console.error('Error fetching group inventory:', error);
  } finally {
    isLoading.value = false;
  }
};

// Immediately fetch product types when component is mounted
onMounted(() => {
  console.log('GroupInventory mounted, fetching products for group:', props.groupId);
  groupStore.setCurrentGroup(props.groupId);
  fetchAllProductTypes();
});

// Watch for group ID changes
watch(() => props.groupId, (newGroupId) => {
  if (newGroupId) {
    console.log('Group ID changed, fetching new products:', newGroupId);
    groupStore.setCurrentGroup(newGroupId);
    fetchAllProductTypes();
  }
}, { immediate: true });

// Watch for search text changes
watch(() => props.searchText, async (val) => {
  try {
    isLoading.value = true;
    if (val && val.trim() !== '') {
      const response: Page<ProductType> = await groupService.searchContributedProductTypes(
        props.groupId,
        val.trim()
      );
      if (response?.content) {
        items.value = response.content.map(product => ({
          ...product,
          edit: false,
          batches: [],
          totalUnits: 0
        }));
        if (items.value.length > 0) {
          groupStore.addProductTypeIds(items.value);
        }
      }
    } else {
      await fetchAllProductTypes();
    }
  } catch (error) {
    console.error('Error searching group inventory:', error);
  } finally {
    isLoading.value = false;
  }
});

const toggleEdit = async (index: number) => {
  const item = items.value[index];
  item.edit = !item.edit;
  if (item.edit) {
    try {
      const response = await groupService.getContributedProductBatches({
        groupId: props.groupId,
        productTypeId: item.id
      });
      if (response && response.content) {
        item.batches = response.content.map(batch => ({
          id: batch.id,
          amount: batch.number.toString(),
          expires: batch.expirationTime ? format(new Date(batch.expirationTime), 'yyyy-MM-dd') : ''
        }));
        groupStore.addBatchIds(item.name, item.batches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      item.batches = [];
    }
  }
};

const removeBatch = async (productIndex: number, batchIndex: number) => {
  const product = items.value[productIndex];
  const batch = product.batches[batchIndex];

  try {
    await groupService.removeContributedBatch(batch.id);
    // Remove the batch from the list
    product.batches.splice(batchIndex, 1);
    // If no more batches, close the edit view
    if (product.batches.length === 0) {
      product.edit = false;
    }
    // Refresh the product types to update totals
    await fetchAllProductTypes();
  } catch (error) {
    console.error('Error removing batch from group:', error);
    alert('Det oppstod en feil ved fjerning av batch fra gruppen');
  }
};

const getTotalAmount = (item: GroupInventoryItem): string => {
  if (item.totalUnits === undefined) return "-";
  return `${item.totalUnits} ${item.unit}`;
};
</script>
