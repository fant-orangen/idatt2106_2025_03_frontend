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
            <Droplet v-if="item.category === 'water'" class="mr-2 w-4 h-4" />
            <Pill v-else-if="item.category === 'medicine'" class="mr-2 w-4 h-4" />
            <Utensils v-else class="mr-2 w-4 h-4" />
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
              :disabled="!batch.isContributed"
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
import { Droplet, Pill, Utensils } from 'lucide-vue-next';

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
  isContributed: boolean;
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
    const response = await groupService.getContributedProductTypes({
      groupId: props.groupId
    });

    if (response?.content) {
      items.value = response.content.map(product => ({
        ...product,
        edit: false,
        batches: [],
        totalUnits: 0
      }));

      // Fetch total units for each product type
      await Promise.all(items.value.map(item => updateTotalUnits(item.id)));

      if (items.value.length > 0) {
        groupStore.addProductTypeIds(items.value);
      }
    }

  } catch (error) {
    console.error('Error fetching group inventory:', error);
  } finally {
    isLoading.value = false;
  }
};

// Immediately fetch product types when component is mounted
onMounted(() => {
  groupStore.setCurrentGroup(props.groupId);
  fetchAllProductTypes();
});

// Watch for group ID changes
watch(() => props.groupId, (newGroupId) => {
  if (newGroupId) {
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
        // First map the basic batch info
        item.batches = response.content.map(batch => ({
          id: batch.id,
          amount: batch.number.toString(),
          expires: batch.expirationTime ? format(new Date(batch.expirationTime), 'yyyy-MM-dd') : '',
          isContributed: false // Initialize as false
        }));

        // Then check each batch's contribution status
        await Promise.all(item.batches.map(async (batch) => {
          try {
            batch.isContributed = await groupService.isContributedToGroup(batch.id);
          } catch (error) {
            console.error('Error checking batch contribution status:', error);
            batch.isContributed = false;
          }
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
    // Update the total units for this product type
    await updateTotalUnits(product.id);
    // If no more batches, close the edit view
    if (product.batches.length === 0) {
      product.edit = false;
    }
  } catch (error) {
    console.error('Error removing batch from group:', error);
    alert('Det oppstod en feil ved fjerning av batch fra gruppen');
  }
};

const getTotalAmount = (item: GroupInventoryItem): string => {
  if (item.totalUnits === undefined) return "-";
  return `${item.totalUnits} ${item.unit}`;
};

// Add function to fetch total units for a product type
const updateTotalUnits = async (productId: number) => {
  try {
    const total = await groupService.getTotalUnitsForProductType(productId, props.groupId);
    const item = items.value.find(item => item.id === productId);
    if (item) {
      item.totalUnits = total;
    }
  } catch (error) {
    console.error('Error fetching total units:', error);
  }
};
</script>
