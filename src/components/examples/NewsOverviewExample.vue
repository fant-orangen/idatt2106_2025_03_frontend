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

      <!-- Example 2: General News with 2 items per page -->
      <div>
        <h2 class="text-xl font-semibold mb-4">General News (2 per page)</h2>
        <NewsOverview
          :crisis-id="1"
          title="General News"
          :paginated-fetch-fn="paginatedGeneralNews"
          :page-size="2"
        />
      </div>

      <!-- Example 3: Crisis News with 1 item per page -->
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">Crisis News (1 per page)</h2>
        <NewsOverview
          :crisis-id="1"
          title="Crisis News (Minimal)"
          :page-size="1"
        />
      </div>

      <!-- Example 4: General News with 5 items per page -->
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">General News (5 per page)</h2>
        <NewsOverview
          :crisis-id="1"
          title="General News (Large)"
          :paginated-fetch-fn="paginatedGeneralNewsLarge"
          :page-size="5"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NewsOverview from '@/components/news/NewsOverview.vue';
import { paginatedGeneralNews, paginatedGeneralNewsLarge } from '@/services/api/CustomNewsService';
</script>

<style scoped>
.news-example-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
