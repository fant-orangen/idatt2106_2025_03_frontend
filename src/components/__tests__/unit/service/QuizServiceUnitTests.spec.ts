/**
 * QuizService Unit Tests
 *
 * This file contains comprehensive unit tests for the QuizService, which is responsible
 * for quiz-related operations including creating, updating, and fetching quizzes,
 * quiz questions, quiz answers, and user quiz attempts.
 *
 * The tests verify the service's functionality including:
 * - Creating, updating, and deleting quizzes (admin operations)
 * - Managing quiz questions and answers
 * - Fetching active and archived quizzes
 * - Creating and managing user quiz attempts
 * - Retrieving quiz attempt history and results
 *
 * @file QuizServiceUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { AxiosResponse } from 'axios'
import { quizService } from '@/services/QuizService.ts'
import type {
  QuizPreview,
  CreateQuizRequest,
  QuizQuestionResponse,
  CreateQuizQuestionRequest,
  QuizAnswerResponse,
  CreateQuizAnswerRequest,
  QuizAttemptSummary,
  CreateUserQuizAnswerRequest,
  QuizAnswerAdminResponse
} from '@/models/Quiz'
import type { Page } from '@/types/Page'

// Helper function to create a proper AxiosResponse object
function createAxiosResponse<T = any>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: { headers: {} } as any
  }
}

// Mock the AxiosInstance
vi.mock('@/services/api/AxiosInstance.ts', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))
import api from '@/services/api/AxiosInstance.ts'

/**
 * Helper function to create a mock QuizPreview
 *
 * @param id - The unique identifier for the quiz
 * @returns A QuizPreview object with default test values
 */
const createMockQuizPreview = (id: number): QuizPreview => ({
  id,
  name: `Quiz ${id}`,
  description: `Description for Quiz ${id}`,
  status: id % 2 === 0 ? 'ACTIVE' : 'ARCHIVED',
  questionCount: id + 5,
  createdAt: new Date().toISOString()
})

/**
 * Helper function to create a mock CreateQuizRequest
 *
 * @param id - Optional identifier to create unique content
 * @returns A CreateQuizRequest object with default test values
 */
const createMockCreateQuizRequest = (id: number = 1): CreateQuizRequest => ({
  name: `New Quiz ${id}`,
  description: `Description for new Quiz ${id}`,
  status: 'ACTIVE'
})

/**
 * Helper function to create a mock QuizQuestionResponse
 *
 * @param id - The unique identifier for the question
 * @returns A QuizQuestionResponse object with default test values
 */
const createMockQuizQuestionResponse = (id: number): QuizQuestionResponse => ({
  id,
  questionBody: `Question ${id} body`
})

/**
 * Helper function to create a mock CreateQuizQuestionRequest
 *
 * @param quizId - The ID of the quiz this question belongs to
 * @param id - Optional identifier to create unique content
 * @returns A CreateQuizQuestionRequest object with default test values
 */
const createMockCreateQuizQuestionRequest = (quizId: number, id: number = 1): CreateQuizQuestionRequest => ({
  quizId,
  questionBody: `New Question ${id} body`,
  position: id
})

/**
 * Helper function to create a mock QuizAnswerResponse
 *
 * @param id - The unique identifier for the answer
 * @param quizId - The ID of the quiz this answer belongs to
 * @param questionId - The ID of the question this answer belongs to
 * @returns A QuizAnswerResponse object with default test values
 */
const createMockQuizAnswerResponse = (id: number, quizId: number, questionId: number): QuizAnswerResponse => ({
  id,
  quizId,
  questionId,
  answerBody: `Answer ${id} body`
})

/**
 * Helper function to create a mock QuizAnswerAdminResponse
 *
 * @param id - The unique identifier for the answer
 * @param quizId - The ID of the quiz this answer belongs to
 * @param questionId - The ID of the question this answer belongs to
 * @param isCorrect - Whether this answer is correct
 * @returns A QuizAnswerAdminResponse object with default test values
 */
const createMockQuizAnswerAdminResponse = (
  id: number,
  quizId: number,
  questionId: number,
  isCorrect: boolean = false
): QuizAnswerAdminResponse => ({
  id,
  quizId,
  questionId,
  answerBody: `Answer ${id} body`,
  isCorrect
})

/**
 * Helper function to create a mock CreateQuizAnswerRequest
 *
 * @param quizId - The ID of the quiz this answer belongs to
 * @param questionId - The ID of the question this answer belongs to
 * @param id - Optional identifier to create unique content
 * @param isCorrect - Whether this answer is correct
 * @returns A CreateQuizAnswerRequest object with default test values
 */
const createMockCreateQuizAnswerRequest = (
  quizId: number,
  questionId: number,
  id: number = 1,
  isCorrect: boolean = false
): CreateQuizAnswerRequest => ({
  quizId,
  questionId,
  answerBody: `New Answer ${id} body`,
  isCorrect
})

/**
 * Helper function to create a mock QuizAttemptSummary
 *
 * @param id - The unique identifier for the attempt
 * @param score - Optional score for the attempt
 * @returns A QuizAttemptSummary object with default test values
 */
const createMockQuizAttemptSummary = (id: number, score?: number): QuizAttemptSummary => ({
  id,
  completedAt: new Date().toISOString(),
  score
})

/**
 * Helper function to create a mock CreateUserQuizAnswerRequest
 *
 * @param attemptId - The ID of the user quiz attempt
 * @param quizId - The ID of the quiz
 * @param questionId - The ID of the question
 * @param answerId - The ID of the answer
 * @returns A CreateUserQuizAnswerRequest object with default test values
 */
const createMockCreateUserQuizAnswerRequest = (
  attemptId: number,
  quizId: number,
  questionId: number,
  answerId: number
): CreateUserQuizAnswerRequest => ({
  userQuizAttemptId: attemptId,
  quizId,
  questionId,
  answerId
})

/**
 * Helper function to create a mock Page of items
 *
 * @param items - The items to include in the page
 * @param page - The page number
 * @param size - The page size
 * @param total - The total number of elements
 * @returns A Page object containing the provided items
 */
const createMockPage = <T>(items: T[], page: number = 0, size: number = 20, total: number = items.length): Page<T> => ({
  content: items,
  totalElements: total,
  totalPages: Math.ceil(total / size),
  size,
  number: page,
  first: page === 0,
  last: (page + 1) * size >= total,
  empty: items.length === 0
})

/**
 * Main test suite for the QuizService
 *
 * This suite contains all tests related to the QuizService functionality.
 * Each nested describe block focuses on a specific aspect of the service's behavior.
 */
describe('QuizService', () => {
  /**
   * Test Setup
   *
   * Before each test:
   * 1. Reset all mocks to clear any previous mock calls or implementations
   */
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
  })

  /**
   * Test Teardown
   *
   * After each test, reset all mocks to ensure a clean state for the next test.
   */
  afterEach(() => {
    vi.resetAllMocks()
  })

  /**
   * createQuiz Tests
   *
   * These tests verify the behavior of the createQuiz function.
   */
  describe('createQuiz', () => {
    /**
     * Test: Successful Quiz Creation
     *
     * Verifies that the createQuiz function correctly creates a new quiz
     * and returns the created quiz ID.
     */
    it('should create a quiz successfully', async () => {
      const quizData = createMockCreateQuizRequest()
      const mockResponse = { quizId: 1 }

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockResponse))

      const result = await quizService.createQuiz(quizData)

      expect(api.post).toHaveBeenCalledWith('/quizzes/admin', quizData)
      expect(result).toEqual(mockResponse)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the createQuiz function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when creating a quiz', async () => {
      const quizData = createMockCreateQuizRequest()
      const errorMessage = 'Failed to create quiz'

      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.createQuiz(quizData)).rejects.toThrow(errorMessage)
      expect(api.post).toHaveBeenCalledWith('/quizzes/admin', quizData)
    })
  })

  /**
   * deleteQuiz Tests
   *
   * These tests verify the behavior of the deleteQuiz function.
   */
  describe('deleteQuiz', () => {
    /**
     * Test: Successful Quiz Deletion
     *
     * Verifies that the deleteQuiz function correctly deletes a quiz.
     */
    it('should delete a quiz successfully', async () => {
      const quizId = 1

      vi.mocked(api.delete).mockResolvedValue(createAxiosResponse({}))

      await quizService.deleteQuiz(quizId)

      expect(api.delete).toHaveBeenCalledWith(`/quizzes/admin/${quizId}`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the deleteQuiz function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when deleting a quiz', async () => {
      const quizId = 1
      const errorMessage = 'Failed to delete quiz'

      vi.mocked(api.delete).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.deleteQuiz(quizId)).rejects.toThrow(errorMessage)
      expect(api.delete).toHaveBeenCalledWith(`/quizzes/admin/${quizId}`)
    })
  })

  /**
   * archiveQuiz Tests
   *
   * These tests verify the behavior of the archiveQuiz function.
   */
  describe('archiveQuiz', () => {
    /**
     * Test: Successful Quiz Archiving
     *
     * Verifies that the archiveQuiz function correctly archives a quiz.
     */
    it('should archive a quiz successfully', async () => {
      const quizId = 1

      vi.mocked(api.patch).mockResolvedValue(createAxiosResponse({}))

      await quizService.archiveQuiz(quizId)

      expect(api.patch).toHaveBeenCalledWith(`/quizzes/admin/${quizId}/archive`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the archiveQuiz function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when archiving a quiz', async () => {
      const quizId = 1
      const errorMessage = 'Failed to archive quiz'

      vi.mocked(api.patch).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.archiveQuiz(quizId)).rejects.toThrow(errorMessage)
      expect(api.patch).toHaveBeenCalledWith(`/quizzes/admin/${quizId}/archive`)
    })
  })

  /**
   * unarchiveQuiz Tests
   *
   * These tests verify the behavior of the unarchiveQuiz function.
   */
  describe('unarchiveQuiz', () => {
    /**
     * Test: Successful Quiz Unarchiving
     *
     * Verifies that the unarchiveQuiz function correctly unarchives a quiz.
     */
    it('should unarchive a quiz successfully', async () => {
      const quizId = 1

      vi.mocked(api.patch).mockResolvedValue(createAxiosResponse({}))

      await quizService.unarchiveQuiz(quizId)

      expect(api.patch).toHaveBeenCalledWith(`/quizzes/admin/${quizId}/unarchive`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the unarchiveQuiz function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when unarchiving a quiz', async () => {
      const quizId = 1
      const errorMessage = 'Failed to unarchive quiz'

      vi.mocked(api.patch).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.unarchiveQuiz(quizId)).rejects.toThrow(errorMessage)
      expect(api.patch).toHaveBeenCalledWith(`/quizzes/admin/${quizId}/unarchive`)
    })
  })

  /**
   * getQuizQuestionsByQuizId Tests
   *
   * These tests verify the behavior of the getQuizQuestionsByQuizId function.
   */
  describe('getQuizQuestionsByQuizId', () => {
    /**
     * Test: Successful Quiz Questions Fetch
     *
     * Verifies that the getQuizQuestionsByQuizId function correctly fetches quiz questions
     * and returns the questions data.
     */
    it('should fetch quiz questions successfully', async () => {
      const quizId = 1
      const mockQuestions = [
        createMockQuizQuestionResponse(1),
        createMockQuizQuestionResponse(2),
        createMockQuizQuestionResponse(3)
      ]

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockQuestions))

      const result = await quizService.getQuizQuestionsByQuizId(quizId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/${quizId}/questions`)
      expect(result).toEqual(mockQuestions)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getQuizQuestionsByQuizId function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching quiz questions', async () => {
      const quizId = 1
      const errorMessage = 'Failed to fetch quiz questions'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getQuizQuestionsByQuizId(quizId)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/${quizId}/questions`)
    })
  })

  /**
   * getAnswersByQuestionId Tests
   *
   * These tests verify the behavior of the getAnswersByQuestionId function.
   */
  describe('getAnswersByQuestionId', () => {
    /**
     * Test: Successful Quiz Answers Fetch
     *
     * Verifies that the getAnswersByQuestionId function correctly fetches quiz answers
     * and returns the answers data.
     */
    it('should fetch quiz answers successfully', async () => {
      const questionId = 1
      const quizId = 1
      const mockAnswers = [
        createMockQuizAnswerResponse(1, quizId, questionId),
        createMockQuizAnswerResponse(2, quizId, questionId),
        createMockQuizAnswerResponse(3, quizId, questionId)
      ]

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockAnswers))

      const result = await quizService.getAnswersByQuestionId(questionId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/questions/${questionId}/answers`)
      expect(result).toEqual(mockAnswers)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getAnswersByQuestionId function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching quiz answers', async () => {
      const questionId = 1
      const errorMessage = 'Failed to fetch quiz answers'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getAnswersByQuestionId(questionId)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/questions/${questionId}/answers`)
    })
  })

  /**
   * getCorrectAnswersByQuestionId Tests
   *
   * These tests verify the behavior of the getCorrectAnswersByQuestionId function.
   */
  describe('getCorrectAnswersByQuestionId', () => {
    /**
     * Test: Successful Correct Answers Fetch
     *
     * Verifies that the getCorrectAnswersByQuestionId function correctly fetches correct answers
     * and returns the answers data.
     */
    it('should fetch correct answers successfully', async () => {
      const questionId = 1
      const quizId = 1
      const mockAnswers = [
        createMockQuizAnswerAdminResponse(1, quizId, questionId, true),
        createMockQuizAnswerAdminResponse(2, quizId, questionId, true)
      ]

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockAnswers))

      const result = await quizService.getCorrectAnswersByQuestionId(questionId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/admin/${questionId}/answers/correct`)
      expect(result).toEqual(mockAnswers)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getCorrectAnswersByQuestionId function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching correct answers', async () => {
      const questionId = 1
      const errorMessage = 'Failed to fetch correct answers'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getCorrectAnswersByQuestionId(questionId)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/quizzes/admin/${questionId}/answers/correct`)
    })
  })

  /**
   * saveQuizQuestion Tests
   *
   * These tests verify the behavior of the saveQuizQuestion function.
   */
  describe('saveQuizQuestion', () => {
    /**
     * Test: Successful Quiz Question Save
     *
     * Verifies that the saveQuizQuestion function correctly saves a quiz question
     * and returns the saved question data.
     */
    it('should save a quiz question successfully', async () => {
      const quizId = 1
      const questionData = createMockCreateQuizQuestionRequest(quizId)
      const mockQuestion = createMockQuizQuestionResponse(1)

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockQuestion))

      const result = await quizService.saveQuizQuestion(questionData)

      expect(api.post).toHaveBeenCalledWith('/quizzes/admin/questions', questionData)
      expect(result).toEqual(mockQuestion)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the saveQuizQuestion function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when saving a quiz question', async () => {
      const quizId = 1
      const questionData = createMockCreateQuizQuestionRequest(quizId)
      const errorMessage = 'Failed to save quiz question'

      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.saveQuizQuestion(questionData)).rejects.toThrow(errorMessage)
      expect(api.post).toHaveBeenCalledWith('/quizzes/admin/questions', questionData)
    })
  })

  /**
   * updateQuizQuestion Tests
   *
   * These tests verify the behavior of the updateQuizQuestion function.
   */
  describe('updateQuizQuestion', () => {
    /**
     * Test: Successful Quiz Question Update
     *
     * Verifies that the updateQuizQuestion function correctly updates a quiz question.
     */
    it('should update a quiz question successfully', async () => {
      const quizId = 1
      const questionId = 1
      const questionData = createMockCreateQuizQuestionRequest(quizId)

      vi.mocked(api.patch).mockResolvedValue(createAxiosResponse({}))

      await quizService.updateQuizQuestion(questionId, questionData)

      expect(api.patch).toHaveBeenCalledWith(`/quizzes/admin/questions/${questionId}`, questionData)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the updateQuizQuestion function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when updating a quiz question', async () => {
      const quizId = 1
      const questionId = 1
      const questionData = createMockCreateQuizQuestionRequest(quizId)
      const errorMessage = 'Failed to update quiz question'

      vi.mocked(api.patch).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.updateQuizQuestion(questionId, questionData)).rejects.toThrow(errorMessage)
      expect(api.patch).toHaveBeenCalledWith(`/quizzes/admin/questions/${questionId}`, questionData)
    })
  })

  /**
   * updateQuizAnswer Tests
   *
   * These tests verify the behavior of the updateQuizAnswer function.
   */
  describe('updateQuizAnswer', () => {
    /**
     * Test: Successful Quiz Answer Update
     *
     * Verifies that the updateQuizAnswer function correctly updates a quiz answer.
     */
    it('should update a quiz answer successfully', async () => {
      const quizId = 1
      const questionId = 1
      const answerId = 1
      const answerData = createMockCreateQuizAnswerRequest(quizId, questionId)

      vi.mocked(api.patch).mockResolvedValue(createAxiosResponse({}))

      await quizService.updateQuizAnswer(answerId, answerData)

      expect(api.patch).toHaveBeenCalledWith(`/quizzes/admin/answers/${answerId}`, answerData)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the updateQuizAnswer function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when updating a quiz answer', async () => {
      const quizId = 1
      const questionId = 1
      const answerId = 1
      const answerData = createMockCreateQuizAnswerRequest(quizId, questionId)
      const errorMessage = 'Failed to update quiz answer'

      vi.mocked(api.patch).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.updateQuizAnswer(answerId, answerData)).rejects.toThrow(errorMessage)
      expect(api.patch).toHaveBeenCalledWith(`/quizzes/admin/answers/${answerId}`, answerData)
    })
  })

  /**
   * saveQuizAnswer Tests
   *
   * These tests verify the behavior of the saveQuizAnswer function.
   */
  describe('saveQuizAnswer', () => {
    /**
     * Test: Successful Quiz Answer Save
     *
     * Verifies that the saveQuizAnswer function correctly saves a quiz answer.
     */
    it('should save a quiz answer successfully', async () => {
      const quizId = 1
      const questionId = 1
      const answerData = createMockCreateQuizAnswerRequest(quizId, questionId)

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse({}))

      await quizService.saveQuizAnswer(answerData)

      expect(api.post).toHaveBeenCalledWith('/quizzes/admin/answers', answerData)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the saveQuizAnswer function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when saving a quiz answer', async () => {
      const quizId = 1
      const questionId = 1
      const answerData = createMockCreateQuizAnswerRequest(quizId, questionId)
      const errorMessage = 'Failed to save quiz answer'

      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.saveQuizAnswer(answerData)).rejects.toThrow(errorMessage)
      expect(api.post).toHaveBeenCalledWith('/quizzes/admin/answers', answerData)
    })
  })

  /**
   * deleteQuizQuestion Tests
   *
   * These tests verify the behavior of the deleteQuizQuestion function.
   */
  describe('deleteQuizQuestion', () => {
    /**
     * Test: Successful Quiz Question Deletion
     *
     * Verifies that the deleteQuizQuestion function correctly deletes a quiz question.
     */
    it('should delete a quiz question successfully', async () => {
      const questionId = 1

      vi.mocked(api.delete).mockResolvedValue(createAxiosResponse({}))

      await quizService.deleteQuizQuestion(questionId)

      expect(api.delete).toHaveBeenCalledWith(`/quizzes/admin/questions/${questionId}`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the deleteQuizQuestion function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when deleting a quiz question', async () => {
      const questionId = 1
      const errorMessage = 'Failed to delete quiz question'

      vi.mocked(api.delete).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.deleteQuizQuestion(questionId)).rejects.toThrow(errorMessage)
      expect(api.delete).toHaveBeenCalledWith(`/quizzes/admin/questions/${questionId}`)
    })
  })

  /**
   * deleteQuizAnswer Tests
   *
   * These tests verify the behavior of the deleteQuizAnswer function.
   */
  describe('deleteQuizAnswer', () => {
    /**
     * Test: Successful Quiz Answer Deletion
     *
     * Verifies that the deleteQuizAnswer function correctly deletes a quiz answer.
     */
    it('should delete a quiz answer successfully', async () => {
      const answerId = 1

      vi.mocked(api.delete).mockResolvedValue(createAxiosResponse({}))

      await quizService.deleteQuizAnswer(answerId)

      expect(api.delete).toHaveBeenCalledWith(`/quizzes/admin/answers/${answerId}`)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the deleteQuizAnswer function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when deleting a quiz answer', async () => {
      const answerId = 1
      const errorMessage = 'Failed to delete quiz answer'

      vi.mocked(api.delete).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.deleteQuizAnswer(answerId)).rejects.toThrow(errorMessage)
      expect(api.delete).toHaveBeenCalledWith(`/quizzes/admin/answers/${answerId}`)
    })
  })

  /**
   * getAllActiveQuizzes Tests
   *
   * These tests verify the behavior of the getAllActiveQuizzes function.
   */
  describe('getAllActiveQuizzes', () => {
    /**
     * Test: Successful Active Quizzes Fetch
     *
     * Verifies that the getAllActiveQuizzes function correctly fetches active quizzes
     * and returns the paginated quiz data.
     */
    it('should fetch active quizzes successfully', async () => {
      const page = 0
      const size = 20
      const mockQuizzes = [
        createMockQuizPreview(1),
        createMockQuizPreview(2),
        createMockQuizPreview(3)
      ]
      const mockPage = createMockPage(mockQuizzes, page, size)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await quizService.getAllActiveQuizzes(page, size)

      expect(api.get).toHaveBeenCalledWith('/quizzes/user/all/previews/active', { params: { page, size } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Default Parameters
     *
     * Verifies that the getAllActiveQuizzes function correctly uses default parameters
     * when they are not provided.
     */
    it('should use default parameters when not provided', async () => {
      const defaultPage = 0
      const defaultSize = 20
      const mockQuizzes = [
        createMockQuizPreview(1),
        createMockQuizPreview(2),
        createMockQuizPreview(3)
      ]
      const mockPage = createMockPage(mockQuizzes, defaultPage, defaultSize)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await quizService.getAllActiveQuizzes()

      expect(api.get).toHaveBeenCalledWith('/quizzes/user/all/previews/active', { params: { page: defaultPage, size: defaultSize } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getAllActiveQuizzes function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching active quizzes', async () => {
      const page = 0
      const size = 20
      const errorMessage = 'Failed to fetch active quizzes'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getAllActiveQuizzes(page, size)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith('/quizzes/user/all/previews/active', { params: { page, size } })
    })
  })

  /**
   * getAllArchivedQuizzes Tests
   *
   * These tests verify the behavior of the getAllArchivedQuizzes function.
   */
  describe('getAllArchivedQuizzes', () => {
    /**
     * Test: Successful Archived Quizzes Fetch
     *
     * Verifies that the getAllArchivedQuizzes function correctly fetches archived quizzes
     * and returns the paginated quiz data.
     */
    it('should fetch archived quizzes successfully', async () => {
      const page = 0
      const size = 20
      const mockQuizzes = [
        createMockQuizPreview(1),
        createMockQuizPreview(2),
        createMockQuizPreview(3)
      ]
      const mockPage = createMockPage(mockQuizzes, page, size)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await quizService.getAllArchivedQuizzes(page, size)

      expect(api.get).toHaveBeenCalledWith('/quizzes/user/all/previews/archived', { params: { page, size } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Default Parameters
     *
     * Verifies that the getAllArchivedQuizzes function correctly uses default parameters
     * when they are not provided.
     */
    it('should use default parameters when not provided', async () => {
      const defaultPage = 0
      const defaultSize = 20
      const mockQuizzes = [
        createMockQuizPreview(1),
        createMockQuizPreview(2),
        createMockQuizPreview(3)
      ]
      const mockPage = createMockPage(mockQuizzes, defaultPage, defaultSize)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await quizService.getAllArchivedQuizzes()

      expect(api.get).toHaveBeenCalledWith('/quizzes/user/all/previews/archived', { params: { page: defaultPage, size: defaultSize } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getAllArchivedQuizzes function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching archived quizzes', async () => {
      const page = 0
      const size = 20
      const errorMessage = 'Failed to fetch archived quizzes'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getAllArchivedQuizzes(page, size)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith('/quizzes/user/all/previews/archived', { params: { page, size } })
    })
  })

  /**
   * createUserQuizAttempt Tests
   *
   * These tests verify the behavior of the createUserQuizAttempt function.
   */
  describe('createUserQuizAttempt', () => {
    /**
     * Test: Successful User Quiz Attempt Creation
     *
     * Verifies that the createUserQuizAttempt function correctly creates a user quiz attempt
     * and returns the attempt ID.
     */
    it('should create a user quiz attempt successfully', async () => {
      const quizId = 1
      const mockResponse = { attemptId: 1 }

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse(mockResponse))

      const result = await quizService.createUserQuizAttempt(quizId)

      expect(api.post).toHaveBeenCalledWith(`/quizzes/user/${quizId}/attempts`)
      expect(result).toEqual(mockResponse.attemptId)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the createUserQuizAttempt function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when creating a user quiz attempt', async () => {
      const quizId = 1
      const errorMessage = 'Failed to create user quiz attempt'

      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.createUserQuizAttempt(quizId)).rejects.toThrow(errorMessage)
      expect(api.post).toHaveBeenCalledWith(`/quizzes/user/${quizId}/attempts`)
    })
  })

  /**
   * createUserQuizAnswer Tests
   *
   * These tests verify the behavior of the createUserQuizAnswer function.
   */
  describe('createUserQuizAnswer', () => {
    /**
     * Test: Successful User Quiz Answer Creation
     *
     * Verifies that the createUserQuizAnswer function correctly creates a user quiz answer.
     */
    it('should create a user quiz answer successfully', async () => {
      const attemptId = 1
      const quizId = 1
      const questionId = 1
      const answerId = 1
      const answerData = createMockCreateUserQuizAnswerRequest(attemptId, quizId, questionId, answerId)

      vi.mocked(api.post).mockResolvedValue(createAxiosResponse({}))

      await quizService.createUserQuizAnswer(answerData)

      expect(api.post).toHaveBeenCalledWith('/quizzes/user/attempts/answer', answerData)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the createUserQuizAnswer function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when creating a user quiz answer', async () => {
      const attemptId = 1
      const quizId = 1
      const questionId = 1
      const answerId = 1
      const answerData = createMockCreateUserQuizAnswerRequest(attemptId, quizId, questionId, answerId)
      const errorMessage = 'Failed to create user quiz answer'

      vi.mocked(api.post).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.createUserQuizAnswer(answerData)).rejects.toThrow(errorMessage)
      expect(api.post).toHaveBeenCalledWith('/quizzes/user/attempts/answer', answerData)
    })
  })

  /**
   * getUserQuizAnswer Tests
   *
   * These tests verify the behavior of the getUserQuizAnswer function.
   */
  describe('getUserQuizAnswer', () => {
    /**
     * Test: Successful User Quiz Answer Fetch
     *
     * Verifies that the getUserQuizAnswer function correctly fetches a user quiz answer
     * and returns the answer data.
     */
    it('should fetch a user quiz answer successfully', async () => {
      const quizId = 1
      const questionId = 1
      const attemptId = 1
      const mockAnswer = createMockQuizAnswerResponse(1, quizId, questionId)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockAnswer))

      const result = await quizService.getUserQuizAnswer(quizId, questionId, attemptId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/${quizId}/questions/${questionId}/attempts/${attemptId}/answers`)
      expect(result).toEqual(mockAnswer)
    })

    /**
     * Test: Null Response Handling
     *
     * Verifies that the getUserQuizAnswer function correctly handles null responses
     * from the API.
     */
    it('should handle null responses when fetching a user quiz answer', async () => {
      const quizId = 1
      const questionId = 1
      const attemptId = 1

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(null))

      const result = await quizService.getUserQuizAnswer(quizId, questionId, attemptId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/${quizId}/questions/${questionId}/attempts/${attemptId}/answers`)
      expect(result).toBeNull()
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getUserQuizAnswer function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching a user quiz answer', async () => {
      const quizId = 1
      const questionId = 1
      const attemptId = 1
      const errorMessage = 'Failed to fetch user quiz answer'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getUserQuizAnswer(quizId, questionId, attemptId)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/${quizId}/questions/${questionId}/attempts/${attemptId}/answers`)
    })
  })

  /**
   * getQuizAttemptsByQuizId Tests
   *
   * These tests verify the behavior of the getQuizAttemptsByQuizId function.
   */
  describe('getQuizAttemptsByQuizId', () => {
    /**
     * Test: Successful Quiz Attempts Fetch
     *
     * Verifies that the getQuizAttemptsByQuizId function correctly fetches quiz attempts
     * and returns the paginated attempts data.
     */
    it('should fetch quiz attempts successfully', async () => {
      const quizId = 1
      const page = 0
      const size = 20
      const mockAttempts = [
        createMockQuizAttemptSummary(1, 80),
        createMockQuizAttemptSummary(2, 90),
        createMockQuizAttemptSummary(3, 70)
      ]
      const mockPage = createMockPage(mockAttempts, page, size)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await quizService.getQuizAttemptsByQuizId(quizId, page, size)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/attempts/${quizId}`, { params: { page, size } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Default Parameters
     *
     * Verifies that the getQuizAttemptsByQuizId function correctly uses default parameters
     * when they are not provided.
     */
    it('should use default parameters when not provided', async () => {
      const quizId = 1
      const defaultPage = 0
      const defaultSize = 20
      const mockAttempts = [
        createMockQuizAttemptSummary(1, 80),
        createMockQuizAttemptSummary(2, 90),
        createMockQuizAttemptSummary(3, 70)
      ]
      const mockPage = createMockPage(mockAttempts, defaultPage, defaultSize)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await quizService.getQuizAttemptsByQuizId(quizId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/attempts/${quizId}`, { params: { page: defaultPage, size: defaultSize } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getQuizAttemptsByQuizId function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching quiz attempts', async () => {
      const quizId = 1
      const page = 0
      const size = 20
      const errorMessage = 'Failed to fetch quiz attempts'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getQuizAttemptsByQuizId(quizId, page, size)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/attempts/${quizId}`, { params: { page, size } })
    })
  })

  /**
   * getAttemptedQuizHistory Tests
   *
   * These tests verify the behavior of the getAttemptedQuizHistory function.
   */
  describe('getAttemptedQuizHistory', () => {
    /**
     * Test: Successful Attempted Quiz History Fetch
     *
     * Verifies that the getAttemptedQuizHistory function correctly fetches attempted quiz history
     * and returns the paginated quiz data.
     */
    it('should fetch attempted quiz history successfully', async () => {
      const page = 0
      const size = 20
      const mockQuizzes = [
        createMockQuizPreview(1),
        createMockQuizPreview(2),
        createMockQuizPreview(3)
      ]
      const mockPage = createMockPage(mockQuizzes, page, size)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await quizService.getAttemptedQuizHistory(page, size)

      expect(api.get).toHaveBeenCalledWith('/quizzes/user/attempted', { params: { page, size } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Default Parameters
     *
     * Verifies that the getAttemptedQuizHistory function correctly uses default parameters
     * when they are not provided.
     */
    it('should use default parameters when not provided', async () => {
      const defaultPage = 0
      const defaultSize = 20
      const mockQuizzes = [
        createMockQuizPreview(1),
        createMockQuizPreview(2),
        createMockQuizPreview(3)
      ]
      const mockPage = createMockPage(mockQuizzes, defaultPage, defaultSize)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPage))

      const result = await quizService.getAttemptedQuizHistory()

      expect(api.get).toHaveBeenCalledWith('/quizzes/user/attempted', { params: { page: defaultPage, size: defaultSize } })
      expect(result).toEqual(mockPage)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getAttemptedQuizHistory function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching attempted quiz history', async () => {
      const page = 0
      const size = 20
      const errorMessage = 'Failed to fetch attempted quiz history'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getAttemptedQuizHistory(page, size)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith('/quizzes/user/attempted', { params: { page, size } })
    })
  })

  /**
   * getTotalCorrectAnswersForAttempt Tests
   *
   * These tests verify the behavior of the getTotalCorrectAnswersForAttempt function.
   */
  describe('getTotalCorrectAnswersForAttempt', () => {
    /**
     * Test: Successful Total Correct Answers Fetch
     *
     * Verifies that the getTotalCorrectAnswersForAttempt function correctly fetches total correct answers
     * and returns the count.
     */
    it('should fetch total correct answers successfully', async () => {
      const attemptId = 1
      const mockResponse = { correctAnswers: 8 }

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockResponse))

      const result = await quizService.getTotalCorrectAnswersForAttempt(attemptId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/attempts/${attemptId}/correct-count`)
      expect(result).toEqual(mockResponse.correctAnswers)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getTotalCorrectAnswersForAttempt function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching total correct answers', async () => {
      const attemptId = 1
      const errorMessage = 'Failed to fetch total correct answers'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getTotalCorrectAnswersForAttempt(attemptId)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/attempts/${attemptId}/correct-count`)
    })
  })

  /**
   * getLatestQuizAttempt Tests
   *
   * These tests verify the behavior of the getLatestQuizAttempt function.
   */
  describe('getLatestQuizAttempt', () => {
    /**
     * Test: Successful Latest Quiz Attempt Fetch
     *
     * Verifies that the getLatestQuizAttempt function correctly fetches the latest quiz attempt
     * and returns the attempt data.
     */
    it('should fetch latest quiz attempt successfully', async () => {
      const quizId = 1
      const mockAttempt = createMockQuizAttemptSummary(1, 85)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockAttempt))

      const result = await quizService.getLatestQuizAttempt(quizId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/${quizId}/attempts/latest`)
      expect(result).toEqual(mockAttempt)
    })

    /**
     * Test: Null Response Handling
     *
     * Verifies that the getLatestQuizAttempt function correctly handles null responses
     * from the API.
     */
    it('should handle null responses when fetching latest quiz attempt', async () => {
      const quizId = 1

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(null))

      const result = await quizService.getLatestQuizAttempt(quizId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/${quizId}/attempts/latest`)
      expect(result).toBeNull()
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getLatestQuizAttempt function correctly handles errors
     * from the API and re-throws them.
     */
    it('should handle errors when fetching latest quiz attempt', async () => {
      const quizId = 1
      const errorMessage = 'Failed to fetch latest quiz attempt'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      await expect(quizService.getLatestQuizAttempt(quizId)).rejects.toThrow(errorMessage)
      expect(api.get).toHaveBeenCalledWith(`/quizzes/user/${quizId}/attempts/latest`)
    })
  })

  /**
   * getQuizNameById Tests
   *
   * These tests verify the behavior of the getQuizNameById function.
   */
  describe('getQuizNameById', () => {
    /**
     * Test: Successful Quiz Name Fetch
     *
     * Verifies that the getQuizNameById function correctly fetches a quiz name
     * and returns the name.
     */
    it('should fetch quiz name successfully', async () => {
      const quizId = 1
      const mockResponse = { name: 'Test Quiz' }

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockResponse))

      const result = await quizService.getQuizNameById(quizId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/${quizId}/name`)
      expect(result).toEqual(mockResponse.name)
    })

    /**
     * Test: Error Handling
     *
     * Verifies that the getQuizNameById function correctly handles errors
     * from the API and returns a fallback value.
     */
    it('should handle errors when fetching quiz name and return fallback value', async () => {
      const quizId = 1
      const errorMessage = 'Failed to fetch quiz name'

      vi.mocked(api.get).mockRejectedValue(new Error(errorMessage))

      const result = await quizService.getQuizNameById(quizId)

      expect(api.get).toHaveBeenCalledWith(`/quizzes/${quizId}/name`)
      expect(result).toEqual('Unknown Quiz')
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the QuizService functions in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Empty Page Handling
     *
     * Verifies that the service correctly handles empty pages of quizzes.
     */
    it('should handle empty pages of quizzes', async () => {
      const page = 10 // A page number that would be beyond available data
      const size = 20
      const mockEmptyPage = createMockPage([], page, size, 0) // 0 total items

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockEmptyPage))

      const result = await quizService.getAllActiveQuizzes(page, size)

      expect(api.get).toHaveBeenCalledWith('/quizzes/user/all/previews/active', { params: { page, size } })
      expect(result.content).toHaveLength(0)
      expect(result.empty).toBe(true)
    })

    /**
     * Test: Partial Page Handling
     *
     * Verifies that the service correctly handles partially filled pages of quizzes.
     */
    it('should handle partially filled pages of quizzes', async () => {
      const page = 2
      const size = 20
      const total = 45 // This will result in a partial page for page 2
      const mockQuizzes = [
        createMockQuizPreview(41),
        createMockQuizPreview(42),
        createMockQuizPreview(43),
        createMockQuizPreview(44),
        createMockQuizPreview(45)
      ]
      const mockPartialPage = createMockPage(mockQuizzes, page, size, total)

      vi.mocked(api.get).mockResolvedValue(createAxiosResponse(mockPartialPage))

      const result = await quizService.getAllActiveQuizzes(page, size)

      expect(api.get).toHaveBeenCalledWith('/quizzes/user/all/previews/active', { params: { page, size } })
      expect(result.content).toHaveLength(5) // 45 total items, page 2 with size 20 should have 5 items
      expect(result.last).toBe(true)
    })

  })
})
