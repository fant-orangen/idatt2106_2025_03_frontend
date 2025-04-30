<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle>{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="flex justify-center items-center py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>

      <div v-else-if="news.length === 0" class="text-center py-4 text-muted-foreground">
        {{ emptyMessage }}
      </div>

      <ScrollArea v-else className="h-[300px]">
        <ul class="timeline">
          <li v-for="item in news" :key="item.id">
            <div class="dot"></div>
            <div class="timeline-content">
              <div class="flex justify-between items-baseline">
                <strong class="text-sm text-muted-foreground">{{ formatDateFull(item.publishedAt) }}</strong>
              </div>
              <h3 class="font-medium mt-1">{{ item.title }}</h3>
              <p class="text-sm mt-1">{{ item.content }}</p>
            </div>
          </li>
        </ul>
      </ScrollArea>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { News } from '@/models/News';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateFull } from '@/utils/dateUtils.ts';

const props = defineProps<{
  crisisId: number | null;
  fetchNewsFn: (id: number) => Promise<News[]>;
  title?: string;
  emptyMessage?: string;
  errorMessage?: string;
}>();

const { t } = useI18n();

const news = ref<News[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const title = props.title ?? t('crisis.related_news', 'Related News');
const emptyMessage = props.emptyMessage ?? t('crisis.no_related_news', 'No related news found for this event');
const errorMessage = props.errorMessage ?? t('crisis.error_loading_news', 'Failed to load related news');

const fetchNews = async (crisisId: number) => {
  if (!crisisId) return;
  loading.value = true;
  error.value = null;
  try {
    news.value = await props.fetchNewsFn(crisisId);
  } catch (error) {
    error.value = errorMessage;
  } finally {
    loading.value = false;
  }
};

watch(() => props.crisisId, (newId) => {
  if (newId) {
    fetchNews(newId);
  } else {
    news.value = [];
  }
}, { immediate: true });
</script>

<style scoped>
.timeline {
  position: relative;
  margin: 1.5rem 0;
  padding-left: 2rem;
  list-style: none;
  border-left: 2px solid var(--color-border, #e2e8f0);
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
  background-color: var(--color-primary, #3b82f6);
  border-radius: 50%;
  z-index: 1;
}

.timeline-content {
  position: relative;
  z-index: 2;
}
</style>
