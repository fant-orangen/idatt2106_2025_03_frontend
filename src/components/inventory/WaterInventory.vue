<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Vann</h1>
    <div class="mb-4 text-lg font-medium text-primary">
      Totalt vann i husholdningen: {{ totalWater }} liter
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
      <div class="grid grid-cols-4 items-center">
        <div class="font-medium">
          <span>💧</span> {{ item?.name }}
        </div>
        <div class="text-center">{{ getTotalAmount(item) }}</div>
        <div class="text-right">
          <button @click="toggleEdit(index)" class="text-sm text-primary underline">
            {{ item?.edit ? 'Lagre' : 'Rediger' }}
          </button>
        </div>
      </div>
      <!-- Batch editing -->
      <div v-if="item.edit" class="space-y-4 mt-4">
        <div
          v-for="(batch, bIndex) in item.batches"
          :key="bIndex"
          class="grid grid-cols-5 gap-3 items-center"
        >
          <input
            v-model="batch.amount"
            type="number"
            class="bg-input text-foreground py-2 px-3 text-center rounded-md"
            placeholder="Mengde"
          />
          <div class="text-sm text-center">{{ item.unit === 'l' ? 'liter' : item.unit }}</div>
          <template v-if="batch.isNew">
            <input
              v-model="batch.expires"
              class="bg-input text-foreground py-2 px-3 text-center rounded-md"
              placeholder="Utløp"
              :readonly="true"
            />
          </template>
          <template v-else>
            <div class="text-sm text-center">{{ batch.expires }}</div>
          </template>
          <button
            v-if="batch.isNew"
            @click="() => { console.log('WaterInventory: Save batch clicked', { productIndex: index, batchIndex: bIndex, batch }); saveBatch(index, bIndex); }"
            class="text-sm text-primary underline"
          >
            Lagre
          </button>
          <button @click="() => { console.log('WaterInventory: Delete batch clicked', { productIndex: index, batchIndex: bIndex, batch }); removeBatch(index, bIndex); }" class="text-sm text-destructive underline">
            Slett
          </button>
        </div>
        <!-- Add new batch -->
        <div class="flex justify-between items-center mt-2">
          <button @click="addBatch(index)" class="text-sm text-accent hover:underline">
            + Legg til
          </button>
          <button
            v-if="item.edit"
            @click="deleteProductType(index)"
            class="text-sm text-destructive hover:underline"
          >
            Slett produkttype
          </button>
        </div>
      </div>
    </div>
    <!-- Add new product type -->
    <div class="pt-6 space-y-2">
      <h2 class="text-lg font-semibold">Legg til</h2>
      <div class="grid grid-cols-4 gap-4 items-center">
        <input
          v-model="newProductName"
          placeholder="Produktnavn"
          class="bg-input text-foreground py-2 px-3 rounded-md"
        />
        <div class="bg-input text-foreground py-2 px-3 rounded-md text-center select-none">liter</div>
        <button @click="addProduct" class="text-sm text-primary underline">
          + Legg til
        </button>
      </div>
    </div>
    <!-- Error popup for duplicate item -->
    <div
      v-if="showExistsModal"
      class="fixed top-1/4 left-1/2 -translate-x-1/2 bg-card text-foreground border border-destructive p-6 rounded-lg shadow-xl"
    >
      <p class="text-center">
        <strong>Denne produkttypen finnes allerede.</strong><br>
        Du kan ikke legge til den samme typen flere ganger.<br>
        Trykk på "Rediger" for å legge til en ny batch.
      </p>
      <div class="text-right mt-4">
        <button @click="showExistsModal = false" class="text-sm text-primary underline">
          OK
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { format } from 'date-fns';
import { inventoryService } from '@/services/InventoryService';
import { useProductStore } from '@/stores/ProductStore';

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
  item.edit = !item.edit;
  if (item.edit) {
    try {
      const response = await inventoryService.getProductBatches(item.id);
      if (response && response.content) {
        item.batches = response.content.map(batch => ({
          id: batch.id,
          amount: batch.number.toString(),
          expires: batch.expirationTime ? format(new Date(batch.expirationTime), 'yyyy-MM-dd') : ''
        }));
        productStore.addBatchIds(item.name, item.batches);
      }
    } catch {
      item.batches = [];
    }
  } else {
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
  // Fetch updated batches after adding
  const response = await inventoryService.getProductBatches(productId);
  if (response && response.content) {
    product.batches = response.content.map(batch => ({
      id: batch.id,
      amount: batch.number.toString(),
      expires: batch.expirationTime ? format(new Date(batch.expirationTime), 'yyyy-MM-dd') : ''
    }));
    productStore.addBatchIds(product.name, product.batches);
  }
  batch.isNew = false;
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
</script>
