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

          <div class="text-center">{{ medicine.count }} {{ medicine.unit }} </div>
          <div class="text-center">{{ medicine.expires }}</div>
          <div class="text-center">{{ medicine.notes || ":" }}</div>
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
              <option vlaue="tube">tube</option>
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

    </div>
  </div>

</template>

<script setup>
</script>
