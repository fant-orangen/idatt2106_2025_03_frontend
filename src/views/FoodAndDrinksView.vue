<template>
  <div class="min-h-screen p-6 bg-background text-foreground">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Navbar -->
      <nav class="flex space-x-4 mb-8">
        <button
          :class="navClass('food')"
          @click="goTo('food')"
        >Matvarer</button>
        <button
          :class="navClass('water')"
          @click="goTo('water')"
        >Vann</button>
        <button
          :class="navClass('medicine')"
          @click="goTo('medicine')"
        >Medisin</button>
      </nav>
      <!-- Dynamic inventory subcomponent -->
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup>
import { computed, watch, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/ProductStore';

const FoodInventory = defineAsyncComponent(() => import('@/components/inventory/FoodInventory.vue'));
const WaterInventory = defineAsyncComponent(() => import('@/components/inventory/WaterInventory.vue'));
const MedicineInventory = defineAsyncComponent(() => import('@/components/inventory/MedicineInventory.vue'));

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();

const tabMap = {
  food: FoodInventory,
  water: WaterInventory,
  medicine: MedicineInventory,
};

const currentTab = computed(() => {
  if (route.name === 'FoodAndDrinks' || route.name === 'FoodInventory') return 'food';
  if (route.name === 'WaterInventory') return 'water';
  if (route.name === 'MedicineInventory') return 'medicine';
  return 'food';
});

const currentComponent = computed(() => {
  return tabMap[currentTab.value];
});

function navClass(tab) {
  return [
    'px-4 py-2 rounded-md font-semibold',
    currentTab.value === tab ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-accent',
  ];
}

function goTo(tab) {
  // Clear product store on tab switch
  productStore.clearProductIds();
  if (tab === 'food') {
    router.push({ name: 'FoodInventory' });
  } else if (tab === 'water') {
    router.push({ name: 'WaterInventory' });
  } else if (tab === 'medicine') {
    router.push({ name: 'MedicineInventory' });
  }
}

// Watch for route changes and clear store
watch(
  () => route.name,
  () => {
    productStore.clearProductIds();
  }
);
</script>
