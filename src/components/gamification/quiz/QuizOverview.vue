<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2, Pencil } from 'lucide-vue-next'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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

const handleEdit = (quizId: number) => {
  console.log(`Edit quiz with ID: ${quizId}`)
}

const deleteQuiz = (quizId: number) => {
  if (!userStore.isAdminUser) {
    console.error('User is not authorized to delete quizzes')
    return
  }
  console.log(`Delete quiz with ID: ${quizId}`)
  quizStore.deleteQuiz(quizId)
  quizStore.fetchAllActiveQuizzes()
}
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-2xl font-bold m-10">Quizzes</h1>
    <Button v-if="userStore.isAdminUser" class="mb-10">
      <Plus :size="40" /> Create new quiz
    </Button>
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
          <Card
            class="hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-800 transition-shadow duration-300"
          >
            <CardHeader>
              <CardTitle>
                {{ quiz.name }}
              </CardTitle>
              <CardDescription>{{ quiz.description }}</CardDescription>
            </CardHeader>
            <CardContent> Last attempt: </CardContent>
            <CardFooter>
              <div class="flex w-full justify-between items-center">
                <Button>
                  {{ $t('gamification.quiz.takeQuiz') }}
                </Button>
                <div>
                  <TooltipProvider :delayDuration="350">
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          v-if="userStore.isAdminUser"
                          size="icon"
                          variant="ghost"
                          @click="handleEdit(quiz.id)"
                        >
                          <Pencil :size="20" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent> Edit Quiz </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider :delayDuration="350">
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertDialog>
                          <AlertDialogTrigger as-child>
                            <Button v-if="userStore.isAdminUser" size="icon" variant="ghost">
                              <Trash2 class="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{{ $t('alert.areYouSure') }}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {{ $t('alert.deleteQuiz') }}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel variant="destructive">Cancel</AlertDialogCancel>
                              <AlertDialogAction @click="deleteQuiz(quiz.id)"
                                >Continue</AlertDialogAction
                              >
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipTrigger>
                      <TooltipContent> Delete Quiz </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
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
