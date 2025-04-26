<script setup lang="ts">
import { useNewsStore } from '@/stores/NewsStore'
import { onMounted } from 'vue'

const newsStore = useNewsStore()
const news = newsStore.news

const fetchNews = async () => {
  await newsStore.fetchNews()
}

onMounted(() => {
  fetchNews()
})
</script>

<template>
  <div class="news-page w-full max-w-3xl mx-auto p-6">
    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <span>{{ $t('navigation.home')}}</span> &gt; <span class="current">{{ $t('info.news')}}</span>
    </div>

    <!-- Page Title -->
    <h1 class="text-2xl font-bold mb-4">{{ $t('info.news')}}</h1>

    <!-- News Timeline -->
    <div v-if="news.length === 0" class="text-center">
      <p>{{ $t('errors.no-news-available')}}</p>
    </div>
    <ul v-else class="timeline">
      <li v-for="item in news" :key="item.id">
        <div class="dot"></div>
        <div class="timeline-content">
          <strong>{{ item.time }}</strong> – {{ item.title || $t('notifications.untiteled') }}
          <p>{{ item.message }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Breadcrumb styling */
.breadcrumb {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  margin-bottom: 1rem;
}

.breadcrumb .current {
  color: var(--color-foreground);
  font-weight: 500;
}

/* Timeline styling */
.timeline {
  position: relative;
  margin: 1.5rem 0;
  padding-left: 2rem;
  list-style: none;
  border-left: 2px solid var(--color-foreground);
}

.timeline li {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.dot {
  position: absolute;
  left: -2.4rem;
  top: 0.45rem;
  width: 0.75rem;
  height: 0.75rem;
  background-color: var(--color-foreground);
  border-radius: 50%;
  z-index: 1;
}

.timeline-content {
  position: relative;
  z-index: 2;
  color: var(--text-color);
}
</style>