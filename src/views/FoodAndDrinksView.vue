<template>
  <div class="min-h-screen p-6 bg-background text-foreground">
    <div class="max-w-5xl mx-auto space-y-8">

      <!-- Main header -->
      <h1 class="text-3xl font-bold">{{ $t("Ditt nåværende lager") }}</h1>

      <!-- Product list -->
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[
          'border rounded-lg p-4 space-y-4',
          item?.name?.toLowerCase() === 'vann'
            ? 'border-primary bg-muted'
            : 'border-border bg-card'
        ]"
      >
        <!-- Product overview -->
        <div class="grid grid-cols-4 items-center">
          <div class="font-medium">
            <span v-if="item?.name?.toLowerCase() === 'vann'">💧</span> {{ item?.name }}
          </div>
          <div class="text-center">{{ getTotalAmount(item) }}</div>
          <div class="text-center">{{ item?.unit }} – {{ item?.caloriesPerUnit }} kcal</div>
          <div class="text-right">
            <button @click="toggleEdit(index)" class="text-sm text-primary underline">
              {{ item?.edit ? $t("Lagre") : $t("Rediger") }}
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
            <div class="text-sm text-center">{{ item.unit }}</div>
            <input
              v-model="batch.expires"
              class="bg-input text-foreground py-2 px-3 text-center rounded-md"
              placeholder="Utløp"
              :readonly="item.name.toLowerCase() === 'vann'"
            />
            <button
              v-if="batch.isNew"
              @click="saveBatch(index, bIndex)"
              class="text-sm text-primary underline"
            >
              {{ $t("Lagre") }}
            </button>
            <button @click="removeBatch(index, bIndex)" class="text-sm text-destructive underline">
              {{ $t("Slett") }}
            </button>
          </div>

          <!-- Add new batch -->
          <button @click="addBatch(index)" class="text-sm text-accent hover:underline mt-2">
            + {{ $t("Legg til") }}
          </button>
        </div>
      </div>

      <!-- Add new product type -->
      <div class="pt-6 space-y-2">
        <h2 class="text-lg font-semibold">{{ $t("Legg til") }}</h2>
        <div class="grid grid-cols-4 gap-4 items-center">
          <input
            v-model="newProductName"
            placeholder="Produktnavn"
            class="bg-input text-foreground py-2 px-3 rounded-md"
          />
          <select v-model="newProductUnit" class="bg-input text-foreground py-2 px-3 rounded-md">
            <option disabled value="">Velg enhet</option>
            <option value="kg">kg</option>
            <option value="l">L</option>
            <option value="stk">stk</option>
            <option value="gram">gram</option>
            <option value="dl">dl</option>
          </select>
          <input
            v-model="newProductCalories"
            placeholder="kcal per enhet"
            class="bg-input text-foreground py-2 px-3 rounded-md"
          />
          <button @click="addProduct" class="text-sm text-primary underline">
            + {{ $t("Legg til") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error popup for duplicate item -->
    <div
      v-if="showExistsModal"
      class="fixed top-1/4 left-1/2 -translate-x-1/2 bg-card text-foreground border border-destructive p-6 rounded-lg shadow-xl"
    >
      <p class="text-center">
        <strong>{{ $t('Denne produkttypen finnes allerede.') }}</strong><br>
        {{ $t('Du kan ikke legge til den samme typen flere ganger.') }}<br>
        {{ $t('Trykk på "Rediger" for å legge til en ny batch.') }}
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
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { format } from "date-fns";
import { inventoryService } from '@/services/InventoryService';
import { useProductStore } from '@/stores/ProductStore';

const { t } = useI18n();
const productStore = useProductStore();

/**
 * List of all food and drink items in inventory.
 * Each item can have multiple batches with amount and expiration date.
 */
const items = ref([]);

/** New product input fields */
const newProductName = ref("");
const newProductUnit = ref("");
const newProductCalories = ref("");

/** Controls popup for duplicate product */
const showExistsModal = ref(false);

/** Loading state */
const isLoading = ref(true);
const error = ref(null);

/**
 * Fetch product types from the backend
 */
const fetchProductTypes = async () => {
  try {
    isLoading.value = true;
    const response = await inventoryService.getProductTypes();

    if (!response || !response.content) {
      throw new Error('Invalid response format from server');
    }

    // Transform the response to match our frontend structure
    items.value = response.content.map(product => ({
      id: product.id,
      name: product.name,
      unit: product.unit,
      caloriesPerUnit: product.caloriesPerUnit?.toString() || '0',
      edit: false,
      batches: [], // Initialize with empty batches
      totalUnits: 0 // Initialize total units
    }));

    // Fetch total units for each product
    await Promise.all(items.value.map(async (item) => {
      try {
        item.totalUnits = await inventoryService.getTotalUnitsForProductType(item.id);
      } catch (error) {
        console.error(`Error fetching total units for ${item.name}:`, error);
        item.totalUnits = 0;
      }
    }));
  } catch (err) {
    error.value = err;
    console.error('Error fetching product types:', err);
    items.value = []; // Reset items on error
  } finally {
    isLoading.value = false;
  }
};

// Fetch product types when component mounts
onMounted(fetchProductTypes);

/**
 * Toggle edit mode for a product item and fetch its batches.
 * @param {number} index - Index of the item in items list.
 */
const toggleEdit = async (index) => {
  const item = items.value[index];
  item.edit = !item.edit;

  if (item.edit) {
    try {
      const response = await inventoryService.getProductBatches(item.id);
      if (response && response.content) {
        // Transform batches to match our frontend structure
        item.batches = response.content.map(batch => ({
          amount: batch.number.toString(),
          expires: batch.expirationTime ? format(new Date(batch.expirationTime), 'yyyy-MM-dd') : ''
        }));
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
      item.batches = [];
    }
  }
};

/**
 * Add a new batch entry to an existing product.
 * If the product is "Vann", auto-generate expiration date two years from now.
 * @param {number} productIndex - Index of the product.
 */
const addBatch = (productIndex) => {
  const product = items.value[productIndex];

  if (product.name.toLowerCase() === "vann") {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 2);
    const formattedDate = format(today, "yyyy-MM-dd");

    product.batches.push({
      amount: "",
      expires: formattedDate,
      isNew: true // Flag to indicate this is a new batch that needs to be saved
    });
  } else {
    product.batches.push({
      amount: "",
      expires: "",
      isNew: true // Flag to indicate this is a new batch that needs to be saved
    });
  }
};

/**
 * Save a new batch to the backend
 * @param {number} productIndex - Index of the product
 * @param {number} batchIndex - Index of the batch within the product
 */
const saveBatch = async (productIndex, batchIndex) => {
  const product = items.value[productIndex];
  const batch = product.batches[batchIndex];
  const productId = productStore.getProductId(product.name);

  if (!productId) {
    console.error('Product ID not found in store');
    return;
  }

  if (!batch.amount || isNaN(Number(batch.amount))) {
    console.error('Invalid amount');
    return;
  }

  try {
    // Create the batch in the backend
    await inventoryService.createProductBatch(
      productId,
      Number(batch.amount),
      batch.expires || undefined
    );

    // Update the batch to remove the isNew flag
    batch.isNew = false;

    // Update total units
    await updateTotalUnits(product.id);
  } catch (error) {
    console.error('Error creating batch:', error);
    // You might want to show an error message to the user here
  }
};

/**
 * Remove a batch from a product.
 * @param {number} productIndex - product index.
 * @param {number} batchIndex - batch index inside the product.
 */
const removeBatch = async (productIndex, batchIndex) => {
  const product = items.value[productIndex];
  const batch = product.batches[batchIndex];

  // If it's a new batch that hasn't been saved yet, just remove it from the UI
  if (batch.isNew) {
    product.batches.splice(batchIndex, 1);
    return;
  }

  const productId = productStore.getProductId(product.name);

  if (!productId) {
    console.error('Product ID not found in store');
    return;
  }

  try {
    // TODO: Add delete batch API call when available
    product.batches.splice(batchIndex, 1);
  } catch (error) {
    console.error('Error removing batch:', error);
    // You might want to show an error message to the user here
  }
};

/**
 * Add a new product to the inventory.
 * Prevent adding duplicates.
 */
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

  try {
    // Convert unit to lowercase for consistency
    const unit = newProductUnit.value.toLowerCase();
    const validUnits = ['kg', 'l', 'stk', 'gram', 'dl'];
    if (!validUnits.includes(unit)) {
      throw new Error('Invalid unit type. Valid units are: kg, l, stk, gram, dl');
    }

    // Create the product in the backend
    const newProduct = await inventoryService.createProductType({
      name,
      unit,
      caloriesPerUnit: parseFloat(newProductCalories.value) || 0,
      isWater: name.toLowerCase() === 'vann'
    });

    // Add the new product to the local state
    items.value.push({
      id: newProduct.id,
      name: newProduct.name,
      unit: newProduct.unit,
      caloriesPerUnit: (newProduct.caloriesPerUnit ?? 0).toString(),
      edit: true,
      batches: [],
      totalUnits: 0
    });

    // Clear the input fields
    newProductName.value = "";
    newProductUnit.value = "";
    newProductCalories.value = "";
  } catch (error) {
    console.error('Error creating product:', error);
    // You might want to show an error message to the user here
  }
};

/**
 * Update total units for a product
 * @param productId The ID of the product
 */
const updateTotalUnits = async (productId) => {
  try {
    const item = items.value.find(item => item.id === productId);
    if (item) {
      item.totalUnits = await inventoryService.getTotalUnitsForProductType(productId);
    }
  } catch (error) {
    console.error('Error updating total units:', error);
  }
};

/**
 * Get total quantity string for a product.
 * @param {object} item - product item.
 * @returns {string} - formatted total amount.
 */
const getTotalAmount = (item) => {
  if (item.totalUnits === undefined) return "-";
  return `${item.totalUnits}${item.unit}`;
};

</script>
