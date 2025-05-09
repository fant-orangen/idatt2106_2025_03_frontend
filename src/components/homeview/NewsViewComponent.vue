<template>
  <div
    class="border border-[var(--default-blue2)]/30 rounded-lg overflow-hidden h-full min-h-[600px] flex flex-col"
  >
    <div class="p-4 bg-[var(--default-blue2)]/5">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold flex items-center">
          <font-awesome-icon
            :icon="['fas', 'newspaper']"
            class="mr-2 text-[var(--default-blue2)]"
          />
          {{ t('info.news') }}
        </h2>
      </div>
    </div>

    <div class="news-content p-4 flex-grow flex flex-col">
      <!-- Loading state -->
      <div v-if="initialLoading" class="flex justify-center items-center py-6 flex-grow">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="text-center py-4 text-red-500 flex-grow flex items-center justify-center"
      >
        {{ error }}
      </div>

      <!-- Empty state -->
      <div
        v-else-if="news.length === 0 && !loading"
        class="text-center py-4 text-muted-foreground flex-grow flex items-center justify-center"
      >
        {{ t('news.no_general_news', 'No news available') }}
      </div>

      <!-- News content with scrolling - using flex-grow to fill available space -->
      <div v-else class="flex-grow overflow-y-auto pr-2 h-[450px]">
        <InfiniteScroll
          :is-loading="loading"
          :has-more="hasMore"
          :loading-text="t('news.loading_more', 'Loading more news...')"
          :end-message="t('news.no_more_news', 'No more news to load')"
          @load-more="loadMoreNews"
        >
          <ul class="relative my-6 pl-4 list-none border-l-2 border-[#e2e8f0]">
            <li v-for="item in news" :key="item.id" class="relative mb-6 pl-4">
              <!-- Crisis name in top right of each news item -->
              <div class="absolute right-0 top-0">
                <a
                  @click="navigateToCrisis(item.crisisEventId)"
                  class="text-sm font-medium text-[var(--default-blue2)] hover:underline cursor-pointer"
                >
                  {{ item.crisisEventName }}
                </a>
              </div>

              <div
                class="absolute left-0 top-[0.45rem] w-3 h-3 bg-foreground rounded-full z-10 transform -translate-x-6"
              ></div>
              <div>
                <div class="flex justify-between items-baseline">
                  <strong class="text-sm text-muted-foreground">{{
                    formatDateFull(item.publishedAt)
                  }}</strong>
                </div>
                <h3 class="font-medium mt-1">{{ item.title }}</h3>
                <p class="text-sm mt-1">{{ item.content }}</p>
              </div>
            </li>
          </ul>
        </InfiniteScroll>
      </div>
    </div>

    <div
      class="p-3 text-center border-t border-[var(--default-blue2)]/20 bg-[var(--default-blue2)]/5"
    >
      <Button
        variant="outline"
        class="text-[var(--default-blue2)] border-[var(--default-blue2)]/30 hover:bg-[var(--default-blue2)]/10 dark:hover:bg-[var(--default-blue)]/30 w-full"
        @click="navigateTo('/news')"
      >
        {{ t('home.view_all_news') }} <ChevronRight class="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-vue-next'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faNewspaper } from '@fortawesome/free-solid-svg-icons'
import { fetchGeneralNews } from '@/services/api/NewsService.ts'
import type { News } from '@/models/News.ts'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import { formatDateFull } from '@/utils/dateUtils.ts'

// Register FontAwesome icons
library.add(faNewspaper)

// State variables
const news = ref<News[]>([])
const loading = ref(false)
const initialLoading = ref(true)
const error = ref<string | null>(null)
const page = ref(0)
const pageSize = 3
const hasMore = ref(true)

const router = useRouter()
const { t } = useI18n()

/**
 * Loads more news articles when scrolling
 */
const loadMoreNews = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    console.log('Loading more news, current page:', page.value)
    const response = await fetchGeneralNews(page.value, pageSize)
    console.log('Received response:', response)

    if (response.content && response.content.length > 0) {
      news.value.push(...response.content)
      page.value++
      hasMore.value = page.value < response.totalPages
    } else {
      hasMore.value = false
    }
  } catch (err) {
    console.error('Failed to load news:', err)
    error.value = t('news.error_loading', 'Failed to load news')
    hasMore.value = false
  } finally {
    loading.value = false
    initialLoading.value = false
  }
}

/**
 * Navigates to the specified route
 *
 * @param {string} route - The route to navigate to
 */
const navigateTo = (route: string) => {
  router.push(route)
}

/**
 * Navigates to the crisis event page with the specified ID
 *
 * @param {number} crisisEventId - The ID of the crisis event
 */
const navigateToCrisis = (crisisEventId: number) => {
  router.push(`/crisis-event?id=${crisisEventId}`)
}

// Load initial news data when component mounts
onMounted(loadMoreNews)
</script>
