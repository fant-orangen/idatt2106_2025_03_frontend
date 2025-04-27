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
      </div>

    </div>
  </div>

</template>

<script setup>
</script>
