<template>
  <div class="min-h-screen p-6 bg-background text-foreground dark">
    <div class="max-w-5xl mx-auto space-y-8">

      <!-- Header -->
      <h1 class="text-3xl font-bold">{{ $t("Ditt nåværende lager") }}</h1>

      <!-- Product types -->
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[
          'border rounded-lg p-4 space-y-4',
          item.name.toLowerCase() === 'vann'
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900'
            : 'border-blue-500'
        ]"
      >
        <!-- Main representation -->
        <div class="grid grid-cols-4 items-center">
          <div class="font-medium">
            <span v-if="item.name.toLowerCase() === 'vann'">💧</span> {{ item.name }}
          </div>
          <div class="text-center">{{ getTotalAmount(item) }}</div>
          <div class="text-center">{{ item.unit }} – {{ item.caloriesPerUnit }} kcal</div>
          <div class="text-right">
            <button @click="toggleEdit(index)" class="text-sm text-blue-400 underline">
              {{ item.edit ? $t("Lagre") : t("Rediger") }}
            </button>
          </div>
        </div>

        <!-- Batch details -->
        <div v-if="item.edit" class="space-y-4 mt-4">
          <div
            v-for="(batch, bIndex) in item.batches"
            :key="bIndex"
            class="grid grid-cols-4 gap-3 items-center"
          >
            <input
              v-model="batch.amount"
              type="number"
              class="bg-secondary py-2 px-3 text-center rounded-md"
              placeholder="Mengde"
            />
            <div class="text-sm text-center">{{ item.unit }}</div>
            <input
              v-model="batch.expires"
              class="bg-secondary py-2 px-3 text-center rounded-md"
              placeholder="Utløp"
              :readonly="item.name.toLowerCase() === 'vann'"
            />
            <button @click="removeBatch(index, bIndex)" class="text-red-400 text-sm underline">Slett</button>
          </div>

          <!-- Add new batch -->
          <button @click="addBatch(index)" class="text-sm text-green-400 hover:underline mt-2">
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
            class="bg-secondary py-2 px-3 rounded-md"
          />
          <select v-model="newProductUnit" class="bg-secondary py-2 px-3 rounded-md">
            <option disabled value="">Velg enhet</option>
            <option value="kg">kg</option>
            <option value="L">L</option>
            <option value="stk">stk</option>
            <option value="poser">poser</option>
          </select>
          <input
            v-model="newProductCalories"
            placeholder="kcal per enhet"
            class="bg-secondary py-2 px-3 rounded-md"
          />
          <button @click="addProduct" class="text-sm text-blue-400 underline">
            + {{ $t("Legg til") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error popup -->
    <div
      v-if="showExistsModal"
      class="fixed top-1/4 left-1/2 -translate-x-1/2 bg-card text-foreground border border-red-400 p-6 rounded-lg shadow-xl"
    >
      <p class="text-center">
        <strong>{{ $t('Denne produkttypen finnes allerede.') }}</strong><br>
        {{ $t('Du kan ikke legge til den samme typen flere ganger.') }}<br>
        {{ $t('Trykk på "Rediger" for å legge til en ny batch.') }}
      </p>
      <div class="text-right mt-4">
        <button @click="showExistsModal = false" class="text-sm text-blue-400 underline">
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

const items = ref([
  {
    name: "Vann",
    unit: "L",
    caloriesPerUnit: "0",
    edit: false,
    batches: [
      { amount: "8", expires: "2026-04-24" }
    ]
  },
  {
    name: "Havregryn",
    unit: "kg",
    caloriesPerUnit: "389",
    edit: false,
    batches: [
      { amount: "2", expires: "2025-09-01" }
    ]
  }
]);

const newProductName = ref("");
const newProductUnit = ref("");
const newProductCalories = ref("");
const showExistsModal = ref(false);

const toggleEdit = (index) => {
  items.value[index].edit = !items.value[index].edit;
};

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

const removeBatch = (productIndex, batchIndex) => {
  items.value[productIndex].batches.splice(batchIndex, 1);
};

const addProduct = () => {
  const name = newProductName.value.trim();
  if (!name || !newProductUnit.value || !newProductCalories.value) return;

  const exists = items.value.some((item) => item.name.toLowerCase() === name.toLowerCase());

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

const getTotalAmount = (item) => {
  return item.batches
    .map((b) => `${b.amount}${item.unit}`)
    .join(" + ") || " - ";
};
</script>
