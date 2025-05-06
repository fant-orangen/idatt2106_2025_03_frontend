<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { QuizPreview } from '@/models/Quiz'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'
import { useQuizStore } from '@/stores/QuizStore.ts'
import { useUserStore } from '@/stores/UserStore.ts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import Button from '@/components/ui/button/Button.vue'

const quizzes = ref<QuizPreview[]>([]) // Explicitly define the type
const quizStore = useQuizStore() // Using the QuizStore
const userStore = useUserStore() // Using the UserStore

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
      class="w-full max-w-2xl mb-10 mt-10"
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
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Button
          v-if="userStore.isAdminUser"
          class="fixed h-15 w-15 bottom-15 left-15 z-100 rounded-full flex items-center justify-center"
        >
          <Plus :size="40" />
        </Button>
      </TooltipTrigger>
      <TooltipContent> CREATE A NEW QUIZ </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
