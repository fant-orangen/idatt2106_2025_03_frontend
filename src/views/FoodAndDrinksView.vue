<template>
  <div class="min-h-screen p-6 bg-background text-foreground pb-35">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Navbar -->
      <nav class="flex flex-col justify-center space-y-4 mb-8 md:pace-x-4 md:flex-row gap-4">
        <button
          :class="navClass('food')"
          @click="goTo('food')"
          class="flex items-center gap-2 px-4 py-2 h-12 w-full md:w-auto"

        >
          <Utensils class="w-5 h-5" /> {{ $t('food-and-drinks.food', 'Food') }}
        </button>
        <button
          :class="navClass('water')"
          @click="goTo('water')"
          class="flex items-center gap-2 px-4 py-2 h-12 w-full md:w-auto"

        >
          <Droplet class="w-5 h-5" /> {{ $t('food-and-drinks.water', 'Water') }}
        </button>
        <button
          :class="navClass('medicine')"
          @click="goTo('medicine')"
          class="flex items-center gap-2 px-4 py-2 h-12 w-full md:w-auto"

        >
          <Pill class="w-5 h-5" /> {{ $t('food-and-drinks.medicine', 'Medicine') }}
        </button>
      </nav>

      <!-- Inventory Search Bar -->
      <div class="bg-muted rounded-lg shadow-md p-4">
        <InventorySearchBar
          class="mb-6"
          @update:search="searchText = $event"
        />
      </div>

      <!-- Dynamic inventory subcomponent -->
      <div class="bg-card rounded-lg shadow-md p-6">
        <component :is="currentComponent" :search-text="searchText" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, defineAsyncComponent, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/ProductStore'
import InventorySearchBar from '@/components/inventory/InventorySearchBar.vue'
import { Utensils, Droplet, Pill } from 'lucide-vue-next';


const FoodInventory = defineAsyncComponent(() => import('@/components/inventory/FoodInventory.vue'))
const WaterInventory = defineAsyncComponent(
  () => import('@/components/inventory/WaterInventory.vue'),
)
const MedicineInventory = defineAsyncComponent(
  () => import('@/components/inventory/MedicineInventory.vue'),
)

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const searchText = ref('')

const tabMap = {
  food: FoodInventory,
  water: WaterInventory,
  medicine: MedicineInventory,
}

const currentTab = computed(() => {
  if (route.name === 'FoodAndDrinks' || route.name === 'FoodInventory') return 'food'
  if (route.name === 'WaterInventory') return 'water'
  if (route.name === 'MedicineInventory') return 'medicine'
  return 'food'
})

const currentComponent = computed(() => {
  return tabMap[currentTab.value]
})

function navClass(tab) {
  return [
    'px-4 py-2 rounded-md font-semibold',
    currentTab.value === tab ? 'bg-primary text-white dark:text-black' : 'bg-muted text-foreground hover:bg-accent',
  ]
}

function goTo(tab) {
  // Clear product store on tab switch
  productStore.clearProductIds()
  if (tab === 'food') {
    router.push({ name: 'FoodInventory' })
  } else if (tab === 'water') {
    router.push({ name: 'WaterInventory' })
  } else if (tab === 'medicine') {
    router.push({ name: 'MedicineInventory' })
  }
}

// Watch for route changes and clear store
watch(
  () => route.name,
  () => {
    productStore.clearProductIds()
  },
)
</script>
