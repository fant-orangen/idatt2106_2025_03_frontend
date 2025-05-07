import api from './api/AxiosInstance'
import type { Page } from '../types/Page'
import type {
  QuizPreview,
  CreateQuizRequest,
  QuizQuestionResponse,
  CreateQuizQuestionRequest,
  QuizAnswerResponse,
  CreateQuizAnswerRequest,
  QuizAttemptSummary,
  CreateUserQuizAnswerRequest,
  QuizAnswerAdminResponse,
} from '@/models/Quiz'

// TODO: these API functions have not been tested in the frontend yet
class QuizService {
  /**
   * Create a new quiz (admin only)
   */
  async createQuiz(data: CreateQuizRequest): Promise<{ quizId: number }> {
    const response = await api.post('/quizzes/admin', data)
    return response.data
  }

  /**
   * Delete a quiz (admin only)
   */
  async deleteQuiz(quizId: number): Promise<void> {
    await api.delete(`/quizzes/admin/${quizId}`)
  }

  /**
   * Archive a quiz (admin only)
   */
  async archiveQuiz(quizId: number): Promise<void> {
    await api.patch(`/quizzes/admin/${quizId}/archive`)
  }

  /**
   * Get all questions for a quiz
   */
  async getQuizQuestionsByQuizId(quizId: number): Promise<QuizQuestionResponse[]> {
    const response = await api.get(`/quizzes/user/${quizId}/questions`)
    return response.data
  }

  /**
   * Get all answers for a quiz question
   */
  async getAnswersByQuestionId(questionId: number): Promise<QuizAnswerResponse[]> {
    const response = await api.get(`/quizzes/user/questions/${questionId}/answers`)
    console.log('Quiz answers:', response.data)
    return response.data
  }

  /**
   * Get all correct answers for a quiz question
   */
  async getCorrectAnswersByQuestionId(questionId: number): Promise<QuizAnswerAdminResponse[]> {
    const response = await api.get(`/quizzes/admin/${questionId}/answers/correct`)
    return response.data
  }

  /**
   * Save a quiz question (admin only)
   */
  async saveQuizQuestion(data: CreateQuizQuestionRequest): Promise<void> {
    const response = await api.post('/quizzes/admin/questions', data)
    return response.data
  }

  /**
   * Update a quiz question (admin only)
   */
  async updateQuizQuestion(questionId: number, data: CreateQuizQuestionRequest): Promise<void> {
    console.log('Updating quiz question:', questionId, data)
    await api.patch(`/quizzes/admin/questions/${questionId}`, data)
  }

  /**
   * Update a quiz answer (admin only)
   */
  async updateQuizAnswer(answerId: number, data: CreateQuizAnswerRequest): Promise<void> {
    await api.patch(`/quizzes/admin/answers/${answerId}`, data)
  }

  /**
   * Save a quiz answer (admin only)
   */
  async saveQuizAnswer(data: CreateQuizAnswerRequest): Promise<void> {
    await api.post('/quizzes/admin/answers', data)
  }

  /**
   * Delete a quiz question (admin only)
   */
  async deleteQuizQuestion(questionId: number): Promise<void> {
    await api.delete(`/quizzes/admin/questions/${questionId}`)
  }

  /**
   * Delete a quiz answer (admin only)
   */
  async deleteQuizAnswer(answerId: number): Promise<void> {
    await api.delete(`/quizzes/admin/answers/${answerId}`)
  }

  /**
   * Get all active quizzes (paginated)
   */
  async getAllActiveQuizzes(page: number = 0, size: number = 20): Promise<Page<QuizPreview>> {
    const response = await api.get('/quizzes/user/all/previews/active', {
      params: { page, size },
    })
    return response.data
  }

  /**
   * Get all archived quizzes (paginated)
   */
  async getAllArchivedQuizzes(page: number = 0, size: number = 20): Promise<Page<QuizPreview>> {
    const response = await api.get('/quizzes/user/all/previews/archived', {
      params: { page, size },
    })
    return response.data
  }

  // --- UserQuizController endpoints ---

  /**
   * Create a user quiz attempt
   */
  async createUserQuizAttempt(quizId: number): Promise<number> {
    const response = await api.post(`/quizzes/user/${quizId}/attempts`)
    return response.data.attemptId // Extract and return the attemptId from the response
  }
  /**
   * Record a user's answer to a quiz question for a specific attempt
   */
  async createUserQuizAnswer(data: CreateUserQuizAnswerRequest): Promise<void> {
    await api.post('/quizzes/user/attempts/answer', data)
  }

  async getUserQuizAnswer(
    quizId: number,
    questionId: number,
    attemptId: number,
  ): Promise<QuizAnswerResponse | null> {
    const response = await api.get(
      `/quizzes/user/${quizId}/questions/${questionId}/attempts/${attemptId}/answers`,
    )
    return response.data
  }

  /**
   * Get all attempts for a quiz by the current user (paginated)
   */
  async getQuizAttemptsByQuizId(
    quizId: number,
    page: number = 0,
    size: number = 20,
  ): Promise<Page<QuizAttemptSummary>> {
    const response = await api.get(`/quizzes/user/attempts/${quizId}`, {
      params: { page, size },
    })
    return response.data
  }

  /**
   * Get paginated basic info about quizzes with at least one attempt by the current user
   */
  async getAttemptedQuizHistory(page: number = 0, size: number = 20): Promise<Page<QuizPreview>> {
    const response = await api.get('/quizzes/user/attempted', {
      params: { page, size },
    })
    return response.data
  }

  /**
   * Get the total number of correct answers for a given quiz attempt
   */
  async getTotalCorrectAnswersForAttempt(attemptId: number): Promise<number> {
    const response = await api.get(`/quizzes/user/attempts/${attemptId}/correct-count`)
    return response.data
  }

  async getLatestQuizAttempt(quizId: number): Promise<QuizAttemptSummary | null> {
    const response = await api.get(`/quizzes/user/${quizId}/attempts/latest`)
    return response.data
  }
}

export const quizService = new QuizService()
