<template>
  <div class="min-h-screen p-6 bg-background text-foreground">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Header -->
      <h1 class="text-3xl font-bold mb-6">Matvarer</h1>

      <!-- Product List -->
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[
          'border rounded-lg p-4 space-y-4',
          item?.name?.toLowerCase() === 'vann'
            ? 'border-primary bg-muted'
            : 'border-border bg-card',
          'mb-3'
        ]"
      >
        <!-- Product Overview -->
        <div class="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2">
          <div class="font-medium">
            <span v-if="item?.name?.toLowerCase() === 'vann'">💧</span> {{ item?.name }}
          </div>
          <div class="text-left sm:text-left">{{ getTotalAmount(item) }}</div>
          <div class="left-center sm:text-left">{{ item?.caloriesPerUnit }} kcal per {{ item?.unit }}</div>
          <div class="text-right sm:text-center">
            <Button
              variant="link"
              @click="toggleEdit(index)"
              class="text-sm"
            >
              {{ item?.edit ? 'Lagre' : 'Rediger' }}
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
                :readonly="item.name.toLowerCase() === 'vann'"
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

      <!-- Add New Product -->
      <div class="pt-6 space-y-4">
        <h2 class="text-lg font-semibold">Legg til</h2>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <Input
            v-model="newProductName"
            placeholder="Produktnavn"
          />
          <Select v-model="newProductUnit">
            <SelectTrigger>
              <SelectValue placeholder="Velg enhet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="l">L</SelectItem>
              <SelectItem value="stk">stk</SelectItem>
              <SelectItem value="gram">gram</SelectItem>
              <SelectItem value="dl">dl</SelectItem>
            </SelectContent>
          </Select>
          <Input
            v-model="newProductCalories"
            placeholder="kcal per enhet"
          />
          <Button
            variant="link"
            @click="addProduct"
            class="text-sm text-primary hover:underline"
          >
            + Legg til
          </Button>
        </div>
      </div>

      <!-- Error Popup -->
      <Dialog v-model="showExistsModal">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feil</DialogTitle>
            <DialogDescription>
              Denne produkttypen finnes allerede. Trykk på "Rediger" for å legge til en ny batch.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button @click="showExistsModal = false">OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { format } from 'date-fns';
import { inventoryService } from '@/services/InventoryService';
import { useProductStore } from '@/stores/ProductStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const props = defineProps({
  searchText: {
    type: String,
    default: ''
  }
});

const productStore = useProductStore();
productStore.setType('food');

const items = ref([]);
const newProductName = ref("");
const newProductUnit = ref("");
const newProductCalories = ref("");
const showExistsModal = ref(false);
const isLoading = ref(true);

const fetchProductTypes = async () => {
  try {
    isLoading.value = true;
    const response = await inventoryService.getFoodProductTypes();
    if (!response || !response.content) {
      throw new Error('Invalid response format from server');
    }
    items.value = response.content.map(product => ({
      id: product.id,
      name: product.name,
      unit: product.unit,
      caloriesPerUnit: product.caloriesPerUnit?.toString() || '0',
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

onMounted(fetchProductTypes);

let searchTimeout;
watch(() => props.searchText, async (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (val && val.trim() !== '') {
      isLoading.value = true;
      try {
        const response = await inventoryService.searchProductTypes(val, 'food');
        if (response && response.content) {
          items.value = response.content.map(product => ({
            id: product.id,
            name: product.name,
            unit: product.unit,
            caloriesPerUnit: product.caloriesPerUnit?.toString() || '0',
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
      const batchMap = productStore.batchMap['food'];
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
  if (product.name.toLowerCase() === "vann") {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 2);
    const formattedDate = format(today, "yyyy-MM-dd");
    product.batches.push({
      amount: "",
      expires: formattedDate,
      isNew: true
    });
  } else {
    product.batches.push({
      amount: "",
      expires: "",
      isNew: true
    });
  }
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
};

const addProduct = async () => {
  const name = newProductName.value.trim();
  if (!name || !newProductUnit.value || !newProductCalories.value) return;
  const exists = items.value.some(
    (item) => item?.name?.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    showExistsModal.value = true;
    return;
  }
  const unit = newProductUnit.value.toLowerCase();
  const validUnits = ['kg', 'l', 'stk', 'gram', 'dl'];
  if (!validUnits.includes(unit)) {
    return;
  }
  await inventoryService.createFoodProductType({
    name,
    unit,
    caloriesPerUnit: parseFloat(newProductCalories.value) || 0,
    category: 'food'
  });
  newProductName.value = "";
  newProductUnit.value = "";
  newProductCalories.value = "";
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
  return `${item.totalUnits} ${item.unit}`;
};

const deleteProductType = async (index) => {
  const item = items.value[index];
  const confirmDelete = confirm(`Er du sikker på at du vil slette produkttypen ${item.name}?`);
  if (!confirmDelete) return;
  await inventoryService.deleteProductType(item.id);
  items.value.splice(index, 1);
  const productId = productStore.getProductId(item.name);
  if (productId) {
    const batchMap = productStore.batchMap['food'];
    for (const key of batchMap.keys()) {
      if (key.startsWith(`${productId}-`)) {
        batchMap.delete(key);
      }
    }
  }
};
</script>
