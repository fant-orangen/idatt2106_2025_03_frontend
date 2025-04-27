<template>
  <div class="min-h-screen p-6 bg-background text-foreground dark">
    <div class="max-w-5xl mx-auto space-y-8">

      <!-- Page Title -->
      <h1 class="text-3xl font-bold">{{ t("Your current medicine list") }}</h1>

      <!-- Medicine list -->
      <div
        v-for="(medicine, index) in medicines"
        :key="index"
        class="border boder-blue-400 rounded-lg p4 space-y-4"
      >
        <!-- Basic info -->
        <div class="grid grid-cols-5 items-center">
          <div class="font-medium">
            {{ medicine.name }}
            <span v-if="isExpiringSoon(medicine.expires)" class="text-red-400 text-xs ml-2">
               ⚠️{{ $t('Expires soon') }}
            </span>
          </div>

          <div class="text-center">{{ medicine.amount }} {{ medicine.unit }} </div>
          <div class="text-center">{{ medicine.expires }}</div>
          <div class="text-center">{{ medicine.notes || "Notes:" }}</div>
          <div class="text-right">
            <button @click="toggleEdit(index)" class="text-sm text-blue-400 underline">
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
              class="bg-secondary py-2 px-3 rounded-md text-center"
              placeholder="Quantity"
              />
            <select v-model="medicine.unit" class="bg-secondary py-2 px-3 rounded-md">
              <option value="stk">stk</option>
              <option value="ml">ml</option>
              <option value="mg">mg</option>
              <option value="eske">eske</option>
              <option value="tube">tube</option>
            </select>
            <input
              v-model="medicine.expires"
              type="date"
              class="bg-secondary py-2 px-3 rounded-md text-center"
              />
            <input
              v-model="medicine.notes"
              type="text"
              class="bg-secondary py-2 px-3 rounded-md"
              placeholder="Notes (e.g., requires refrigeration.)"
              />
            <button @click="removeMedicine(index)" class="text-red-400 text-sm underline">
                    {{ $t("delete") }}
            </button>
        </div>
      </div>
    </div>

      <!-- Add new medicine to the list -->
      <div class="pt-6 space-y-2">
        <h2 class="text-lg font-semibold">{{ (" Add Medicine ")}}</h2>
        <div class="grid grid-cols-5 gap-4 items-center">
          <input
            v-model="newMedicineName"
            placeholder="Medicine name"
            class="bg-secondary py-2 px-3 rounded-md"
            />
          <input
          v-model="newMedicineAmount"
          type="number"
          placeholder="Quantity"
          class="bg-secondary py-2 px-3 rounded-md"
          />
          <select v-model="newMedicineUnit" class="bg-secondary py-2 px-3 rounded-md">
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
            class="bg-secondary py-2 px-3 rounded-md"
          />
        <input
          v-model="newMedicineNotes"
          placeholder="Notes (optional)"
          class="bg-secondary py-2 px-3 rounded-md"
        />
      </div>
        <button
          @click="addMedicine"
          class="mt-4 text-sm text-blue-400 hover:underline"
          >
          + {{ $t("Add medicine") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { differenceInDays } from "date-fns";

const { t } = useI18n();
const medicines= ref([]);

const newMedicineName= ref("");
const newMedicineAmount= ref("");
const newMedicineUnit= ref("");
const newMedicineExpires= ref("");
const newMedicineNotes= ref("");

const toggleEdit = (index) => {
  medicines.value[index].edit = !medicines.value[index].edit;
};

const addMedicine = () => {
  if (!newMedicineName.value || !newMedicineAmount.value || !newMedicineUnit.value || !newMedicineExpires) {
    return;
  }

  medicines.value.push({
    name: newMedicineName.value,
    amount: newMedicineAmount.value,
    unit: newMedicineUnit.value,
    expires: newMedicineExpires.value,
    notes: newMedicineNotes.value || "",
    edit: false
  });

  /**
   * Reset from fields
   */

  newMedicineName.value = "";
  newMedicineAmount.value = "";
  newMedicineUnit.value = "";
  newMedicineExpires.value = "";
};
const removeMedicine= (index) => {
  medicines.value.splice(index, 1);
};

/**
 * Temporary method to test frontend. Will be modified when connecting to backend.
 * @param expiresDateString
 * @returns {boolean} if it expires in less than 30 days.
 */
const isExpiringSoon = (expiresDateString) => {
  if (!expiresDateString) return false;
  const today= new Date();
  const expiresDate = new Date(expiresDateString);
  const daysLeft = differenceInDays(expiresDate, today);

  return daysLeft <= 30 && daysLeft >= 0;
  };
</script>
