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
              {{ item.edit ? 'Lagre' : 'Rediger' }}
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
            <Input
              v-model="batch.amount"
              type="number"
              placeholder="Mengde"
              class="text-center w-full"
            />
            <div class="text-sm text-center sm:text-left">{{ item.unit }}</div>
            <template v-if="batch.isNew">
              <Input
                v-model="batch.expires"
                placeholder="Utløp"
                class="text-center w-full"
                :readonly="item.category === 'water'"
              />
            </template>
            <template v-else>
              <div class="text-sm text-center sm:text-left w-full">{{ batch.expires }}</div>
            </template>
            <Button
              v-if="batch.isNew"
              variant="link"
              @click="saveBatch(index, bIndex)"
              class="text-sm text-primary w-full sm:w-auto"
            >
              Lagre
            </Button>
            <Button
              variant="destructive"
              @click="removeBatch(index, bIndex)"
              class="text-sm w-full sm:w-auto"
            >
              Slett
            </Button>
          </div>

          <!-- Add New Batch -->
          <div class="flex flex-col sm:flex-row justify-between items-center mt-2 gap-2">
            <Button
              variant="link"
              @click="addBatch(index)"
              class="text-sm text-primary hover:underline"
            >
              + Legg til
            </Button>
            <Button
              v-if="item.edit"
              variant="destructive"
              @click="deleteProductType(index)"
              class="text-sm"
            >
              Slett produkttype
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
import { Input } from '@/components/ui/input';
import type { ProductType } from '@/models/Product';
import type { Page } from '@/types/Page';

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

const fetchAllProductTypes = async () => {
  try {
    isLoading.value = true;
    const categories: ('food' | 'water' | 'medicine')[] = ['food', 'water', 'medicine'];

    const results = await Promise.allSettled(
      categories.map(category =>
        groupService.getContributedProductTypes({
          groupId: props.groupId,
          category
        })
      )
    );

    const allProducts = results
      .filter((result): result is PromiseFulfilledResult<Page<ProductType>> => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(response => response?.content)
      .flatMap(response => response.content);

    items.value = allProducts.map(product => ({
      ...product,
      edit: false,
      batches: [],
      totalUnits: 0
    }));

    if (items.value.length > 0) {
      groupStore.addProductTypeIds(items.value);
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
  if (val && val.trim() !== '') {
    // TODO: Implement search functionality when backend supports it
    console.log('Search not yet implemented for group inventory');
  } else {
    fetchAllProductTypes();
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
    } catch {
      item.batches = [];
    }
  } else {
    const productId = groupStore.getProductTypeId(item.name);
    if (productId) {
      groupStore.clearBatchIds();
    }
  }
};

const addBatch = (productIndex: number) => {
  const product = items.value[productIndex];
  if (product.category === 'water') {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 2);
    const formattedDate = format(today, 'yyyy-MM-dd');
    product.batches.push({
      id: 0,
      amount: '',
      expires: formattedDate,
      isNew: true
    });
  } else {
    product.batches.push({
      id: 0,
      amount: '',
      expires: '',
      isNew: true
    });
  }
};

const validateAndFormatDate = (dateStr: string): string | false => {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  if (dateStr.length === 7) {
    return `${dateStr}-01`;
  }
  return dateStr;
};

const saveBatch = async (productIndex: number, batchIndex: number) => {
  const product = items.value[productIndex];
  const batch = product.batches[batchIndex];
  const productId = groupStore.getProductTypeId(product.name);
  if (!productId) return;
  if (!batch.amount || isNaN(Number(batch.amount))) return;
  if (batch.expires) {
    const formattedDate = validateAndFormatDate(batch.expires);
    if (formattedDate === false) {
      alert('Ugyldig dato. Forventet format: YYYY-MM-DD eller YYYY-MM.');
      return;
    }
    batch.expires = formattedDate;
  }
  await groupService.addBatchToGroup({
    batchId: batch.id,
    groupId: props.groupId
  });
  batch.isNew = false;
  await fetchAllProductTypes();
};

const removeBatch = async (productIndex: number, batchIndex: number) => {
  const product = items.value[productIndex];
  const batch = product.batches[batchIndex];
  if (batch.isNew) {
    product.batches.splice(batchIndex, 1);
    return;
  }
  const batchId = groupStore.getBatchId(product.name, batch.amount, batch.expires);
  if (!batchId) return;
  await groupService.removeContributedBatch(batchId);
  product.batches.splice(batchIndex, 1);
  await fetchAllProductTypes();
};

const getTotalAmount = (item: GroupInventoryItem): string => {
  if (item.totalUnits === undefined) return "-";
  return `${item.totalUnits} ${item.unit}`;
};

const deleteProductType = async (index: number) => {
  const item = items.value[index];
  const confirmDelete = confirm(`Er du sikker på at du vil slette produkttypen ${item.name}?`);
  if (!confirmDelete) return;
  // Remove all batches first
  for (const batch of item.batches) {
    const batchId = groupStore.getBatchId(item.name, batch.amount, batch.expires);
    if (batchId) {
      await groupService.removeContributedBatch(batchId);
    }
  }
  items.value.splice(index, 1);
  groupStore.clearProductTypeIds();
  groupStore.clearBatchIds();
};
</script>
