<template>
  <div class="news-example-container">
    <h1 class="text-2xl font-bold mb-6">News Overview Examples</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Example 1: Crisis News with 2 items per page -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Crisis News (2 per page)</h2>
        <NewsOverview
          :crisis-id="1"
          title="Crisis News"
          :page-size="2"
        />
      </div>
      
      <!-- Example 2: General News with 3 items per page -->
      <div>
        <h2 class="text-xl font-semibold mb-4">General News (3 per page)</h2>
        <NewsOverview
          :crisis-id="1"
          title="General News"
          :paginated-fetch-fn="paginatedGeneralNews"
          :page-size="3"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NewsOverview from '@/components/news/NewsOverview.vue';
import { paginatedGeneralNews } from '@/services/api/CustomNewsService';
</script>

<style scoped>
.news-example-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
