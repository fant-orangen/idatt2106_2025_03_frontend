<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { quizService } from '@/services/QuizService.ts'
import { QuizPreview } from '@/models/Quiz'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'
import { useQuizStore } from '@/stores/QuizStore.ts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import Button from '@/components/ui/button/Button.vue'

const quizzes = ref<QuizPreview[]>([]) // Explicitly define the type
const quizStore = useQuizStore() // Using the QuizStore

onMounted(() => {
  quizStore.fetchAllActiveQuizzes()
})

/**
 * Scrolls the user back to the top of the page or container
 */
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth', // Smooth scrolling
  })
}
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-2xl font-bold m-10">Quizzes</h1>

    <!-- Search Input -->
    <div class="relative w-full max-w-2xl items-center">
      <Input
        v-model="quizStore.searchQuery"
        id="search"
        type="text"
        placeholder="Search..."
        class="pl-10"
      />
      <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
        <Search class="size-6 text-muted-foreground" />
      </span>
    </div>
    <InfiniteScroll
      :isLoading="quizStore.isLoading"
      :hasMore="quizStore.hasMore"
      loadingText="Loading more quizzes..."
      endMessage="No more quizzes to load"
      @load-more="quizStore.fetchAllActiveQuizzes(quizStore.currentPage + 1)"
      class="w-full max-w-2xl mt-10"
    >
      <ul class="space-y-4">
        <li v-for="quiz in quizStore.filteredQuizzes" :key="quiz.id">
          <Card>
            <CardHeader>
              <CardTitle>
                {{ quiz.name }}
              </CardTitle>
              <CardDescription>{{ quiz.description }}</CardDescription>
            </CardHeader>
            <CardContent> Last attempt: </CardContent>
            <CardFooter>
              <Button>
                {{ $t('gamification.quiz.takeQuiz') }}
              </Button>
            </CardFooter>
          </Card>
        </li>
      </ul>
    </InfiniteScroll>
    <Button
      v-if="quizzes.length > 0"
      class="flex justify-center items-center m-5"
      @click="scrollToTop"
    >
      Back to top
    </Button>
  </div>
</template>
