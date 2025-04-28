<template>
  <div class="container mx-auto p-4">
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Shelter Store Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground mb-4">
          Select a category to browse items in your shelter store
        </p>
      </CardContent>
    </Card>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <p>Loading categories...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-destructive">{{ error }}</p>
      <Button variant="outline" class="mt-4" @click="loadCategories">
        Try Again
      </Button>
    </div>

    <!-- Categories grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="category in categories"
        :key="category.id"
        class="hover:shadow-md transition-shadow cursor-pointer"
        @click="selectCategory(category)"
      >
        <CardContent class="p-6 flex flex-col items-center text-center">
          <!-- Using Lucide icons based on category icon property -->
          <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <component
              :is="getCategoryIcon(category.icon)"
              class="text-primary h-8 w-8"
            />
          </div>
          <h3 class="font-medium text-lg mb-2">{{ category.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ category.description }}</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchCategories, type Category } from '@/mock/categoryData';
import {
  Utensils,
  Droplet,
  Radio,
  Package
} from 'lucide-vue-next';

// State
const categories = ref<Category[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Load categories on component mount
onMounted(() => {
  loadCategories();
});

// Methods
const loadCategories = async () => {
  loading.value = true;
  error.value = null;

  try {
    categories.value = await fetchCategories();
  } catch (err) {
    error.value = 'Failed to load categories. Please try again.';
    console.error('Error loading categories:', err);
  } finally {
    loading.value = false;
  }
};

// Map category icon string to Lucide icon component
const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case 'utensils':
      return Utensils;
    case 'droplet':
      return Droplet;
    case 'radio':
      return Radio;
    default:
      return Package; // Default icon
  }
};

const selectCategory = (category: Category) => {
  // Log the selection for debugging
  console.log('Selected category:', category);

  // In a real application, this would navigate to a category detail page
  // For now, we'll just show an alert since we don't have category detail pages yet
  alert(`You selected the ${category.name} category. This would navigate to a detail page in a complete implementation.`);

  // Uncomment this when category detail pages are implemented
  // router.push(`/lager/category/${category.id}`);
};
</script>

<style scoped>
/* Additional styling if needed */
</style>
