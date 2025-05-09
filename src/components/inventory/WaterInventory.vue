<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">{{ t('inventory.water.title') }}</h1>
    <div class="mb-4 text-lg font-medium text-primary">
      {{ t('inventory.water.total') }}: {{ totalWater }} {{ t('inventory.water.liters') }}
    </div>
    <!-- Product list -->
    <div
      v-for="(item, index) in items"
      :key="index"
      :class="[
        'border rounded-lg p-4 space-y-4',
        'border-border bg-card',
        'mb-3'
      ]"
    >
      <!-- Product overview -->
      <div class="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2">
        <div class="font-medium text-base">
          <span>💧</span> {{ item?.name }}
        </div>
        <div class="text-left sm:text-left text-sm text-muted-foreground">
          {{ getTotalAmount(item) }}
        </div>
        <div class="text-right sm:text-center">
          <Button
            variant="link"
            @click="toggleEdit(index)"
            class="text-sm text-primary hover:underline hover:cursor-pointer"
          >
            {{ item?.edit ? t('inventory.save') : t('inventory.edit') }}
          </Button>
        </div>
      </div>
      <!-- Batch editing -->
      <div v-if="item.edit" class="space-y-4 mt-4">
        <!-- Group selector -->
        <div class="border-b pb-4 mb-4">
          <h3 class="text-sm font-medium mb-2">{{ t('inventory.common.share-with-group') }}:</h3>
          <div class="flex gap-2 items-center">
            <Select v-model="selectedGroupId" class="w-full sm:w-64">
              <SelectTrigger>
                <SelectValue :placeholder="groups.length > 0 ? t('inventory.common.select-group') : t('inventory.common.no-groups')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="group in groups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          v-for="(batch, bIndex) in item.batches"
          :key="bIndex"
          class="flex flex-col sm:grid sm:grid-cols-6 gap-3 items-center"
        >
          <input
            v-model="batch.amount"
            type="number"
            :max="batch.originalAmount"
            @input="clampBatchAmount(batch)"
            class="bg-input text-foreground py-2 px-3 text-center rounded-md w-full"
            :placeholder="t('inventory.water.amount')"
          />
          <div class="text-sm text-center sm:text-left">{{ item.unit === 'l' ? t('inventory.water.liters') : item.unit }}</div>
          <template v-if="batch.isNew">
            <input
              v-model="batch.expires"
              class="bg-input text-foreground py-2 px-3 text-center rounded-md w-full"
              :placeholder="t('inventory.water.expiry')"
              :readonly="true"
            />
          </template>
          <template v-else>
            <div class="text-sm text-center sm:text-left w-full">{{ batch.expires }}</div>
          </template>
          <Button
            v-if="batch.isNew"
            variant="link"
            @click="() => { saveBatch(index, bIndex); }"
            class="text-sm text-primary w-full sm:w-auto"
          >
            {{ t('inventory.save') }}
          </Button>
          <Button
            variant="destructive"
            @click="() => { removeBatch(index, bIndex); }"
            class="text-sm w-full sm:w-auto"
          >
            {{ t('inventory.remove-from-group') }}
          </Button>

          <Button
            v-if="!batch.isNew"
            variant="secondary"
            size="sm"
            @click="addBatchToGroup(batch.id)"
            :disabled="!selectedGroupId || addingBatchToGroup || batch.isContributed"
            class="text-xs w-full sm:w-auto"
          >
            {{ batch.isContributed ? t('inventory.water.already-shared') : t('inventory.water.share') }}
          </Button>
        </div>
        <!-- Add new batch -->
        <div class="flex flex-col sm:flex-row justify-between items-center mt-2 gap-2">
          <Button
            variant="link"
            @click="addBatch(index)"
            class="text-sm text-primary"
          >
            + {{ t('inventory.water.add') }}
          </Button>
          <Button
            variant="destructive"
            v-if="item.edit"
            @click="deleteProductType(index)"
            class="text-sm"
          >
            {{ t('inventory.water.delete-type') }}
          </Button>
        </div>
      </div>
    </div>
    <!-- Add New Product -->
    <div class="pt-6 space-y-4">
      <h2 class="text-lg font-semibold">{{ t('inventory.water.add-new') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        <Input
          v-model="newProductName"
          :placeholder="t('inventory.water.product-name')"
        />
        <div class="bg-input text-foreground py-2 px-3 rounded-md text-center select-none">
          {{ t('inventory.water.liters') }}
        </div>
        <Button
          variant="link"
          @click="addProduct"
          class="text-sm text-primary hover:underline"
        >
          + {{ t('inventory.water.add') }}
        </Button>
      </div>
    </div>
    <!-- Error popup for duplicate item -->
    <div
      v-if="showExistsModal"
      class="fixed top-1/4 left-1/2 -translate-x-1/2 bg-card text-foreground border border-destructive p-6 rounded-lg shadow-xl"
    >
      <p class="text-center">
        <strong>{{ t('inventory.water.exists.title') }}</strong><br>
        {{ t('inventory.water.exists.message') }}<br>
        {{ t('inventory.water.exists.action') }}
      </p>
      <div class="text-right mt-4">
        <Button @click="showExistsModal = false" variant="link" class="text-sm text-primary">
          OK
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { format } from 'date-fns';
import { inventoryService } from '@/services/InventoryService';
import { groupService } from '@/services/api/GroupService';
import { useProductStore } from '@/stores/ProductStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  searchText: {
    type: String,
    default: ''
  }
});

const productStore = useProductStore();
productStore.setType('water');

const items = ref([]);
const newProductName = ref("");
const newProductUnit = ref("");
const showExistsModal = ref(false);
const isLoading = ref(true);
const totalWater = ref('-');

// Group-related state
const groups = ref([]);
const selectedGroupId = ref(null);
const addingBatchToGroup = ref(false);

const fetchGroups = async () => {
  try {
    const response = await groupService.getCurrentUserGroups();
    if (response?.content) {
      groups.value = response.content;
    }
  } catch (error) {
    console.error('Error fetching groups:', error);
  }
};

const fetchTotalWater = async () => {
  try {
    totalWater.value = await inventoryService.getTotalWater();
  } catch {
    totalWater.value = '-';
  }
};

const fetchProductTypes = async () => {
  try {
    isLoading.value = true;
    const response = await inventoryService.getWaterProductTypes();
    if (!response || !response.content) {
      throw new Error('Invalid response format from server');
    }
    items.value = response.content.map(product => ({
      id: product.id,
      name: product.name,
      unit: product.unit,
      edit: false,
      batches: [],
      totalUnits: 0
    }));
    await Promise.all(items.value.map(async (item) => {
      try {
        item.totalUnits = await inventoryService.getTotalUnitsForProductType(item.id);
      } catch {
        item.totalUnits = 0;
      }
    }));
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchProductTypes();
  fetchTotalWater();
  fetchGroups();
});

let searchTimeout;
watch(() => props.searchText, async (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (val && val.trim() !== '') {
      isLoading.value = true;
      try {
        const response = await inventoryService.searchProductTypes(val, 'water');
        if (response && response.content) {
          items.value = response.content.map(product => ({
            id: product.id,
            name: product.name,
            unit: product.unit,
            edit: false,
            batches: [],
            totalUnits: 0
          }));
          await Promise.all(items.value.map(async (item) => {
            try {
              item.totalUnits = await inventoryService.getTotalUnitsForProductType(item.id);
            } catch {
              item.totalUnits = 0;
            }
          }));
        }
      } finally {
        isLoading.value = false;
      }
    } else {
      fetchProductTypes();
    }
  }, 200);
});

const toggleEdit = async (index) => {
  const item = items.value[index];
  if (item.edit) {
    // We're saving changes
    try {
      // Save all modified batches
      await Promise.all(item.batches.map(async (batch) => {
        if (!batch.isNew && batch.amount) {
          const newAmount = parseInt(batch.amount);
          if (!isNaN(newAmount)) {
            await inventoryService.updateBatchUnits(batch.id, newAmount);
          }
        }
      }));

      // Refresh the batch states to get updated data
      await loadBatchStates(item);
      await updateTotalUnits(item.id);
      await fetchTotalWater(); // Special for water: update total water amount
    } catch (error) {
      console.error('Error saving batch updates:', error);
      toast('Error', {
        description: 'Failed to save changes to one or more batches.',
        duration: 3000
      });
      return; // Don't toggle edit mode if save failed
    }
  } else {
    // We're entering edit mode
    await loadBatchStates(item);
  }

  item.edit = !item.edit;

  if (!item.edit) {
    const productId = productStore.getProductId(item.name);
    if (productId) {
      const batchMap = productStore.batchMap['water'];
      for (const key of batchMap.keys()) {
        if (key.startsWith(`${productId}-`)) {
          batchMap.delete(key);
        }
      }
    }
  }
};

// New function to load batch states
const loadBatchStates = async (item) => {
  try {
    const response = await inventoryService.getProductBatches(item.id);
    if (response && response.content) {
      // First map the basic batch info
      item.batches = response.content.map(batch => ({
        id: batch.id,
        amount: batch.number.toString(),
        originalAmount: batch.number,
        expires: batch.expirationTime ? format(new Date(batch.expirationTime), 'yyyy-MM-dd') : '',
        isContributed: false // Add this field
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

      productStore.addBatchIds(item.name, item.batches);
    }
  } catch {
    item.batches = [];
  }
};

const addBatch = (productIndex) => {
  const product = items.value[productIndex];
  const today = new Date();
  today.setFullYear(today.getFullYear() + 2);
  const formattedDate = format(today, "yyyy-MM-dd");
  product.batches.push({
    amount: "",
    expires: formattedDate,
    isNew: true
  });
};

const validateAndFormatDate = (dateStr) => {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  if (dateStr.length === 7) {
    return `${dateStr}-01`;
  }
  return dateStr;
};

const saveBatch = async (productIndex, batchIndex) => {
  const product = items.value[productIndex];
  const batch = product.batches[batchIndex];
  const productId = productStore.getProductId(product.name);
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
  await inventoryService.createProductBatch(
    productId,
    Number(batch.amount),
    batch.expires || undefined
  );

  // Reload all batch states after adding
  await loadBatchStates(product);
  await updateTotalUnits(product.id);
  await fetchTotalWater();
};

const removeBatch = async (productIndex, batchIndex) => {
  const product = items.value[productIndex];
  const batch = product.batches[batchIndex];
  if (batch.isNew) {
    product.batches.splice(batchIndex, 1);
    return;
  }
  const batchId = productStore.getBatchId(product.name, batch.amount, batch.expires);
  if (!batchId) return;
  await inventoryService.deleteProductBatch(batchId);
  product.batches.splice(batchIndex, 1);
  await updateTotalUnits(product.id);
  await fetchTotalWater();
};

const addProduct = async () => {
  const name = newProductName.value.trim();
  if (!name) return;
  newProductUnit.value = 'l';
  const exists = items.value.some(
    (item) => item?.name?.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    showExistsModal.value = true;
    return;
  }
  const unit = 'l';
  const validUnits = ['l'];
  if (!validUnits.includes(unit)) {
    return;
  }
  await inventoryService.createWaterProductType({
    name,
    unit,
    category: 'water'
  });
  newProductName.value = "";
  await fetchProductTypes();
};

const updateTotalUnits = async (productId) => {
  const item = items.value.find(item => item.id === productId);
  if (item) {
    item.totalUnits = await inventoryService.getTotalUnitsForProductType(productId);
  }
};

const getTotalAmount = (item) => {
  if (item.totalUnits === undefined) return "-";
  return `${item.totalUnits} ${item.unit === 'l' ? 'liter' : item.unit}`;
};

const deleteProductType = async (index) => {
  const item = items.value[index];
  const confirmDelete = confirm(`Er du sikker på at du vil slette produkttypen ${item.name}?`);
  if (!confirmDelete) return;
  await inventoryService.deleteProductType(item.id);
  items.value.splice(index, 1);
  const productId = productStore.getProductId(item.name);
  if (productId) {
    const batchMap = productStore.batchMap['water'];
    for (const key of batchMap.keys()) {
      if (key.startsWith(`${productId}-`)) {
        batchMap.delete(key);
      }
    }
  }
};

// Add a batch to a group
const addBatchToGroup = async (batchId) => {
  if (!selectedGroupId.value || !batchId) return;

  addingBatchToGroup.value = true;
  try {
    await groupService.addBatchToGroup({
      batchId: batchId,
      groupId: selectedGroupId.value
    });

    // Find the item containing this batch and reload its states
    const item = items.value.find(item =>
      item.batches.some(batch => batch.id === batchId)
    );
    if (item) {
      await loadBatchStates(item);
    }

    toast('Suksess!', {
      description: 'Produktet ble lagt til i gruppen.',
      duration: 3000
    });
  } catch (error) {
    console.error('Error adding batch to group:', error);
    if (error.message) {
      toast('Feil', {
        description: error.message,
        duration: 5000
      });
    } else {
      toast('Feil', {
        description: 'Det oppstod en feil ved deling av produkt med gruppen.',
        duration: 5000
      });
    }
  } finally {
    addingBatchToGroup.value = false;
  }
};

function clampBatchAmount(batch) {
  if (Number(batch.amount) > batch.originalAmount) {
    batch.amount = batch.originalAmount.toString();
  }
}
</script>
