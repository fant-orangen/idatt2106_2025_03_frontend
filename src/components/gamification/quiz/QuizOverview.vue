<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2, Pencil, MoveUp } from 'lucide-vue-next'
import type { QuizAttemptSummary } from '@/models/Quiz'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'
import { useQuizStore } from '@/stores/QuizStore.ts'
import { useUserStore } from '@/stores/UserStore.ts'
import { Badge } from '@/components/ui/badge'
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
import { useRouter } from 'vue-router'
import Button from '@/components/ui/button/Button.vue'
import { quizService } from '@/services/QuizService.ts'

const quizStore = useQuizStore() // Using the QuizStore
const userStore = useUserStore() // Using the UserStore
const router = useRouter()

type LastAttempt = {
  attemptId: number
  score: number
  maxScore: number
}

const lastAttempts = ref<Record<number, LastAttempt | null>>({})

onMounted(async () => {
  try {
    await quizStore.fetchAllActiveQuizzes() // Fetch quizzes
    await fetchLastAttempts() // Fetch last attempts for each quiz
  } catch (error) {
    console.error('Error during initialization:', error)
  }
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

/**
 * Fetch the last attempt for each quiz
 */
const fetchLastAttempts = async () => {
  for (const quiz of quizStore.quizzes) {
    const lastAttempt = await fetchLastQuizAttempt(quiz.id)
    if (lastAttempt === null) {
      lastAttempts.value[quiz.id] = null
      continue
    }
    try {
      // Await the result of the asynchronous function
      const correctAnswersResponse = await quizService.getTotalCorrectAnswersForAttempt(
        lastAttempt.id,
      )
      const score = correctAnswersResponse // Assuming this is the correct answer count

      // Fetch the total number of questions (max score) for the quiz
      const questions = await quizService.getQuizQuestionsByQuizId(quiz.id)
      const maxScore = questions.length

      // Save the score and max score in the `lastAttempts` object
      lastAttempts.value[quiz.id] = {
        attemptId: lastAttempt.id,
        score: score,
        maxScore: maxScore,
      }

    } catch (error) {
      console.error(`Error fetching data for quiz ${quiz.id}:`, error)
      lastAttempts.value[quiz.id] = null
    }
  }

}

const fetchLastQuizAttempt = async (quizId: number): Promise<QuizAttemptSummary | null> => {
  try {
    // Fetch the first page with a size of 1, sorted by `completedAt` in descending order
    const response = await quizService.getLatestQuizAttempt(quizId)

    if (response === null) {
      console.error(`No attempts found for quiz ${quizId}`)
      return null
    }

    return response
  } catch (error) {
    console.error(`Error fetching last attempt for quiz ${quizId}:`, error)
    return null // Handle errors gracefully
  }
}

const handleEdit = (quizId: number) => {
  router.push({
    name: 'EditQuiz',
    params: { quizId },
  })
}

const handleTakeQuiz = (quizId: number) => {
  router.push({
    name: 'Quiz',
    params: { quizId },
  })
}

const archiveQuiz = (quizId: number) => {
  if (!userStore.isAdminUser) {
    console.error('User is not authorized to delete quizzes')
    return
  }
  quizStore.archiveQuiz(quizId)
  quizStore.fetchAllActiveQuizzes()
}
</script>

<template>
  <div class="flex flex-col items-center m-10">
    <h1 class="text-2xl font-bold m-10">{{ $t('gamification.quizOverview') }}</h1>
    <Button
      v-if="userStore.isAdminUser"
      @click="router.push('/quiz-overview/admin/new-quiz')"
      class="mb-10"
    >
      <Plus :size="40" /> {{ $t('gamification.createNewQuiz') }}
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
      :endMessage="$t('gamification.noMoreQuizzes')"
      @load-more="quizStore.fetchAllActiveQuizzes(quizStore.currentPage + 1)"
      class="w-full max-w-2xl mb-10 mt-10"
    >
      <ul class="space-y-4">
        <li v-for="quiz in quizStore.filteredQuizzes" :key="quiz.id">
          <Card
            class="hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-800 transition-shadow duration-200"
          >
            <CardHeader>
              <CardTitle>
                {{ quiz.name }}
              </CardTitle>
              <CardDescription>{{ quiz.description }}</CardDescription>
            </CardHeader>
            <CardContent>
              <p v-if="lastAttempts[quiz.id] !== null">
                {{ $t('gamification.previousAttempt') }}:
                <Badge
                  :style="{
                    backgroundColor:
                      (lastAttempts[quiz.id]?.score ?? 0) /
                        (lastAttempts[quiz.id]?.maxScore ?? 1) >=
                      0.8
                        ? 'var(--crisis-level-green)'
                        : (lastAttempts[quiz.id]?.score ?? 0) /
                              (lastAttempts[quiz.id]?.maxScore ?? 1) >=
                            0.4
                          ? 'var(--crisis-level-yellow)'
                          : 'var(--crisis-level-red)',
                  }"
                >
                  {{
                    Math.round(
                      ((lastAttempts[quiz.id]?.score ?? 0) /
                        (lastAttempts[quiz.id]?.maxScore ?? 1)) *
                        100,
                    )
                  }}%
                </Badge>
              </p>
              <p v-else>{{ $t('gamification.noAttempts') }}</p>
            </CardContent>
            <CardFooter>
              <div class="flex w-full justify-between items-center">
                <div class="flex flex-row gap-4">
                  <Button @click="handleTakeQuiz(quiz.id)">
                    {{ $t('gamification.takeQuiz', 'Ta Quiz') }}
                  </Button>
                  <Button
                    variant="outline"
                    @click="router.push({ name: 'QuizHistory', params: { quizId: quiz.id } })"
                  >
                    {{ $t('gamification.gameHistory') }}
                  </Button>
                </div>
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
                              <AlertDialogTitle>{{
                                $t('alert.areYouSure', 'Er du sikker?')
                              }}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {{
                                  $t(
                                    'alert.deleteQuiz',
                                    'Er du helt sikker på at du vil slette denne quizen? Denne handlingen kan ikke angres.',
                                  )
                                }}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel variant="destructive">{{
                                $t('common.cancel')
                              }}</AlertDialogCancel>
                              <AlertDialogAction @click="archiveQuiz(quiz.id)">{{
                                $t('common.continue', 'Fortsett')
                              }}</AlertDialogAction>
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
    <Button class="flex justify-center items-center mb-10" @click="scrollToTop">
      <MoveUp class="h-5 w-5" />
      {{ $t('gamification.backToTop') }}
    </Button>
  </div>
</template>
