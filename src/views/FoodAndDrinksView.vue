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
          item.name.toLowerCase() === 'vann'
            ? 'border-primary bg-muted'
            : 'border-border bg-card'
        ]"
      >
        <!-- Product overview -->
        <div class="grid grid-cols-4 items-center">
          <div class="font-medium">
            <span v-if="item.name.toLowerCase() === 'vann'">💧</span> {{ item.name }}
          </div>
          <div class="text-center">{{ getTotalAmount(item) }}</div>
          <div class="text-center">{{ item.unit }} – {{ item.caloriesPerUnit }} kcal</div>
          <div class="text-right">
            <button @click="toggleEdit(index)" class="text-sm text-primary underline">
              {{ item.edit ? $t("Lagre") : $t("Rediger") }}
            </button>
          </div>
        </div>

        <!-- Batch editing -->
        <div v-if="item.edit" class="space-y-4 mt-4">
          <div
            v-for="(batch, bIndex) in item.batches"
            :key="bIndex"
            class="grid grid-cols-4 gap-3 items-center"
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
              :readonly="item.name.toLowerCase() === 'Vann'"
            />
            <button @click="removeBatch(index, bIndex)" class="text-destructive text-sm underline">
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
            <option value="L">L</option>
            <option value="stk">stk</option>
            <option value="poser">poser</option>
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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { format } from "date-fns";

const { t } = useI18n();

/**
 * List of all food and drink items in inventory.
 * Each item can have multiple batches with amount and expiration date.
 */
const items = ref([
  {
    name: "Vann",
    unit: "L",
    caloriesPerUnit: "0",
    edit: false,
    batches: [{ amount: "8", expires: "2026-04-24" }]
  },
  {
    name: "Havregryn",
    unit: "kg",
    caloriesPerUnit: "389",
    edit: false,
    batches: [{ amount: "2", expires: "2025-09-01" }]
  }
]);

/** New product input fields */
const newProductName = ref("");
const newProductUnit = ref("");
const newProductCalories = ref("");

/** Controls popup for duplicate product */
const showExistsModal = ref(false);

/**
 * Toggle edit mode for a product item.
 * @param {number} index - Index of the item in items list.
 */
const toggleEdit = (index) => {
  items.value[index].edit = !items.value[index].edit;
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
      expires: formattedDate
    });
  } else {
    product.batches.push({
      amount: "",
      expires: ""
    });
  }
};

/**
 * Remove a batch from a product.
 * @param {number} productIndex - product index.
 * @param {number} batchIndex - batch index inside the product.
 */
const removeBatch = (productIndex, batchIndex) => {
  items.value[productIndex].batches.splice(batchIndex, 1);
};

/**
 * Add a new product to the inventory.
 * Prevent adding duplicates.
 */
const addProduct = () => {
  const name = newProductName.value.trim();
  if (!name || !newProductUnit.value || !newProductCalories.value) return;

  const exists = items.value.some(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    showExistsModal.value = true;
    return;
  }

  items.value.push({
    name,
    unit: newProductUnit.value,
    caloriesPerUnit: newProductCalories.value,
    edit: true,
    batches: []
  });

  newProductName.value = "";
  newProductUnit.value = "";
  newProductCalories.value = "";
};

/**
 * Get total quantity string for a product (sum of all batch amounts).
 * @param {object} item - product item.
 * @returns {string} - formatted total amount.
 */
const getTotalAmount = (item) => {
  return item.batches
    .map((b) => `${b.amount}${item.unit}`)
    .join(" + ") || "-";
};

</script>
