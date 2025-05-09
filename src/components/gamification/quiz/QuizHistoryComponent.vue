<script setup lang="ts">
import { useQuizStore } from '@/stores/QuizStore'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import { defineProps, onMounted, ref } from 'vue'
import type { QuizAttemptSummary } from '@/models/Quiz'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoveUp } from 'lucide-vue-next'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { quizService } from '@/services/QuizService'

const quizStore = useQuizStore()
const quizName = ref('') // Store the quiz name

const props = defineProps<{
  quizId: number
}>()

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth', // Smooth scrolling
  })
}

const fetchQuizAttempts = async (quizId: number): Promise<QuizAttemptSummary[]> => {
  try {
    let currentPage = 0
    const pageSize = 20 // Number of attempts to fetch per page
    let hasMore = true

    // Initialize an array to store all quiz attempts
    const allAttempts: QuizAttemptSummary[] = []

    while (hasMore) {
      // Fetch paginated quiz attempts
      const response = await quizService.getQuizAttemptsByQuizId(quizId, currentPage, pageSize)

      // Fetch the total number of questions for the quiz
      const totalQuestions = (await quizService.getQuizQuestionsByQuizId(quizId)).length

      // Map attempts to include the score
      const attemptsWithScores = await Promise.all(
        response.content.map(async (attempt) => {
          const correctAnswersResponse = await quizService.getTotalCorrectAnswersForAttempt(
            attempt.id,
          )
          const correctAnswers = correctAnswersResponse
          const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
          return {
            ...attempt,
            score, // Add the calculated score
          }
        }),
      )

      // Add the attempts with scores to the array
      allAttempts.push(...attemptsWithScores)

      // Check if there are more pages to fetch
      hasMore = !response.last // `response.last` indicates if this is the last page
      currentPage++ // Move to the next page
    }

    // Store the attempts in the quiz store
    quizStore.quizAttempts = allAttempts

    // Return the fetched attempts
    return allAttempts
  } catch (error) {
    console.error('Error fetching quiz attempts:', error)
    return []
  }
}

async function fetchQuizName(quizId: number) {
  try {
    quizName.value = await quizService.getQuizNameById(quizId) // Fetch and store the quiz name
  } catch (error) {
    console.error(`Error fetching quiz name for quizId ${quizId}:`, error)
    quizName.value = 'Unknown Quiz' // Fallback value
  }
}

onMounted(() => {
  fetchQuizAttempts(props.quizId)
  fetchQuizName(props.quizId)
})
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-2xl font-bold mb-4">{{ quizName }}</h1>
    <h2 class="text-xl mb-4">Attempt History</h2>

    <InfiniteScroll
      :isLoading="quizStore.isLoading"
      :hasMore="quizStore.hasMore"
      loadingText="Loading more attempts..."
      endMessage="No more attempts to load"
      @load-more="quizStore.fetchQuizAttempts(props.quizId)"
      class="w-full max-w-2xl mb-10 mt-10"
    >
      <div class="space-y-4">
        <Card
          v-for="quizAttempt in quizStore.quizAttempts"
          :key="quizAttempt.id"
          class="hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-800 transition-shadow duration-200"
        >
          <CardHeader>
            <CardTitle> Attempt {{ quizAttempt.id }}</CardTitle>
            <CardDescription>
              Attempt Date: {{ format(new Date(quizAttempt.completedAt), 'yyyy-MM-dd HH:mm') }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge
              :style="{
                backgroundColor:
                  (quizAttempt.score ?? 0) >= 80
                    ? 'var(--crisis-level-green)'
                    : (quizAttempt.score ?? 0) >= 40
                      ? 'var(--crisis-level-yellow)'
                      : 'var(--crisis-level-red)',
                color: 'white', // Optional: Ensure text is readable
              }"
            >
              {{ quizAttempt.score }}%
            </Badge>
          </CardContent>
        </Card>
      </div>
    </InfiniteScroll>
    <Button class="flex justify-center items-center mb-10" @click="scrollToTop">
      <MoveUp class="h-5 w-5" />Back to top
    </Button>
  </div>
</template>
