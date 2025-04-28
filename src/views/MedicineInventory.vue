<!-- Page for view of the current medical inventory in a household -->

<template>
  <div class="min-h-screen p-6 bg-background text-foreground">
    <div class="max-w-5xl mx-auto space-y-8">

      <!-- Main Header -->
      <h1 class="text-3xl font-bold">{{ $t("Your current medicine list") }}</h1>

      <!-- Medicine list -->
      <div
        v-for="(medicine, index) in medicines"
        :key="index"
        class="border border-border rounded-lg bg-card p-4 space-y-4"
      >
        <!-- Basic info -->
        <div class="grid grid-cols-5 items-center">
          <div class="font-medium">
            {{ medicine.name }}
            <span v-if="isExpiringSoon(medicine.expires)" class="text-destructive text-xs ml-2">
              ⚠️ {{ $t('Expires soon') }}
            </span>
          </div>
          <div class="text-center">{{ medicine.amount }} {{ medicine.unit }}</div>
          <div class="text-center">{{ medicine.expires }}</div>
          <div class="text-center">{{ medicine.notes || "-" }}</div>
          <div class="text-right">
            <button @click="toggleEdit(index)" class="text-sm text-primary underline">
              {{ medicine.edit ? $t("Save") : $t("Edit") }}
            </button>
          </div>
        </div>

        <!-- Edit form -->
        <div v-if="medicine.edit" class="space-y-4 mt-4">
          <div class="grid grid-cols-5 gap-3 items-center">
            <input
              v-model="medicine.amount"
              type="number"
              class="bg-input text-foreground py-2 px-3 rounded-md text-center"
              placeholder="Quantity"
            />
            <select v-model="medicine.unit" class="bg-input text-foreground py-2 px-3 rounded-md">
              <option value="stk">stk</option>
              <option value="ml">ml</option>
              <option value="mg">mg</option>
              <option value="eske">eske</option>
              <option value="tube">tube</option>
            </select>
            <input
              v-model="medicine.expires"
              type="date"
              class="bg-input text-foreground py-2 px-3 rounded-md text-center"
            />
            <input
              v-model="medicine.notes"
              type="text"
              class="bg-input text-foreground py-2 px-3 rounded-md"
              placeholder="Notes (e.g., requires refrigeration)"
            />
            <button @click="removeMedicine(index)" class="text-destructive text-sm underline">
              {{ $t("delete") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add new medicine to the list -->
      <div class="pt-6 space-y-2">
        <h2 class="text-lg font-semibold">{{ $t("Add Medicine") }}</h2>
        <div class="grid grid-cols-5 gap-4 items-center">
          <input
            v-model="newMedicineName"
            placeholder="Medicine name"
            class="bg-input text-foreground py-2 px-3 rounded-md"
          />
          <input
            v-model="newMedicineAmount"
            type="number"
            placeholder="Quantity"
            class="bg-input text-foreground py-2 px-3 rounded-md"
          />
          <select v-model="newMedicineUnit" class="bg-input text-foreground py-2 px-3 rounded-md">
            <option disabled value="">Select Unit</option>
            <option value="stk">stk</option>
            <option value="ml">ml</option>
            <option value="mg">mg</option>
            <option value="eske">eske</option>
            <option value="tube">tube</option>
          </select>
          <input
            v-model="newMedicineExpires"
            type="date"
            class="bg-input text-foreground py-2 px-3 rounded-md"
          />
          <input
            v-model="newMedicineNotes"
            placeholder="Notes (optional)"
            class="bg-input text-foreground py-2 px-3 rounded-md"
          />
        </div>
        <button
          @click="addMedicine"
          class="mt-4 text-sm text-primary hover:underline"
        >
          + {{ $t("Add Medicine") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { differenceInDays } from "date-fns"; // temporary use of date-fns, will most likely be modified when connected to backend

const { t } = useI18n();

const medicines = ref([]);

const newMedicineName = ref("");
const newMedicineAmount = ref("");
const newMedicineUnit = ref("");
const newMedicineExpires = ref("");
const newMedicineNotes = ref("");

const toggleEdit = (index) => {
  medicines.value[index].edit = !medicines.value[index].edit;
};

const addMedicine = () => {
  if (!newMedicineName.value || !newMedicineAmount.value || !newMedicineUnit.value || !newMedicineExpires.value) {
    return;
  }

  medicines.value.push({
    name: newMedicineName.value,
    amount: newMedicineAmount.value,
    unit: newMedicineUnit.value,
    expires: newMedicineExpires.value,
    notes: newMedicineNotes.value || "",
    edit: false,
  });

  newMedicineName.value = "";
  newMedicineAmount.value = "";
  newMedicineUnit.value = "";
  newMedicineExpires.value = "";
  newMedicineNotes.value = "";
};

const removeMedicine = (index) => {
  medicines.value.splice(index, 1);
};

const isExpiringSoon = (expiresDateString) => {
  if (!expiresDateString) return false;
  const today = new Date();
  const expiresDate = new Date(expiresDateString);
  const daysLeft = differenceInDays(expiresDate, today);
  return daysLeft <= 30 && daysLeft >= 0;
};
</script>
