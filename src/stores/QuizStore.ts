import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { quizService } from '@/services/QuizService.ts'
import type { QuizPreview, QuizAttemptSummary } from '@/models/Quiz'

export const useQuizStore = defineStore('quiz', () => {
  // State
  const quizzes = ref<QuizPreview[]>([]) // Store quizzes
  const currentPage = ref(0) // Current page
  const totalPages = ref(0) // Total pages
  const isLoading = ref(false) // Loading state
  const hasMore = ref(true) // Whether there are more quizzes to load
  const searchQuery = ref('') // Search query
  const quizAttempts = ref<QuizAttemptSummary[]>([]) // Store quiz attempts

  // Computed property to filter quizzes based on the search query
  const filteredQuizzes = computed(() => {
    if (!searchQuery.value) return quizzes.value
    return quizzes.value.filter((quiz) =>
      quiz.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  })

  // Actions
  /**
   * Fetches a page of active quizzes from the API
   * Handles loading states and pagination
   *
   * @param page - The page number to fetch
   * @param size - The number of items per page
   */
  const fetchAllActiveQuizzes = async (page: number = 0, size: number = 10) => {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    try {
      const response = await quizService.getAllActiveQuizzes(page, size)

      // Append new quizzes
      quizzes.value.push(...response.content)

      // Update pagination state
      currentPage.value = response.number
      totalPages.value = response.totalPages

      // Check if there are more quizzes to load
      hasMore.value = !response.last
    } catch (error) {
      console.error('Error fetching active quizzes:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetches all quiz attempts for a specific quiz
   *
   * @param quizId - The ID of the quiz
   */
  const fetchQuizAttempts = async (quizId: number) => {
    try {
      let currentPage = 0
      const pageSize = 20 // Number of attempts to fetch per page
      let hasMore = true

      // Initialize an array to store all quiz attempts
      const allAttempts: QuizAttemptSummary[] = []

      while (hasMore) {
        // Fetch paginated quiz attempts
        const summary = await quizService.getQuizAttemptsByQuizId(quizId, currentPage, pageSize)

        // Add the attempts from the current page to the array
        allAttempts.push(...summary.content)

        // Check if there are more pages to fetch
        hasMore = !summary.last // `summary.last` indicates if this is the last page
        currentPage++ // Move to the next page
      }

      // Store the attempts in the state
      quizAttempts.value = allAttempts
    } catch (error) {
      console.error('Error fetching quiz attempts:', error)
    }
  }

  /**
   * Resets the quiz store state (e.g., when performing a new search)
   */
  const resetQuizzes = () => {
    quizzes.value = []
    currentPage.value = 0
    totalPages.value = 0
    hasMore.value = true
  }

  const deleteQuiz = async (quizId: number) => {
    try {
      await quizService.deleteQuiz(quizId)
      quizzes.value = quizzes.value.filter((quiz) => quiz.id !== quizId)
    } catch (error) {
      console.error('Error deleting quiz:', error)
    }
  }

  const archiveQuiz = async (quizId: number) => {
    try {
      await quizService.archiveQuiz(quizId)
      quizzes.value = quizzes.value.filter((quiz) => quiz.id !== quizId)
    } catch (error) {
      console.error('Error archiving quiz:', error)
    }
  }

  return {
    quizzes,
    currentPage,
    totalPages,
    isLoading,
    hasMore,
    searchQuery,
    filteredQuizzes,
    quizAttempts,
    fetchAllActiveQuizzes,
    fetchQuizAttempts,
    resetQuizzes,
    deleteQuiz,
    archiveQuiz,
  }
})
