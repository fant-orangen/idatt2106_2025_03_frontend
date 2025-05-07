import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { quizService } from '@/services/QuizService.ts'
import type { QuizPreview } from '@/models/Quiz'

export const useQuizStore = defineStore('quiz', () => {
  // State
  const quizzes = ref<QuizPreview[]>([]) // Store quizzes
  const currentPage = ref(0) // Current page
  const totalPages = ref(0) // Total pages
  const isLoading = ref(false) // Loading state
  const hasMore = ref(true) // Whether there are more quizzes to load
  const searchQuery = ref('') // Search query

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

  return {
    quizzes,
    currentPage,
    totalPages,
    isLoading,
    hasMore,
    searchQuery,
    filteredQuizzes,
    fetchAllActiveQuizzes,
    resetQuizzes,
    deleteQuiz,
  }
})
