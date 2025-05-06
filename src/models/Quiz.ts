// Quiz preview for lists and history
export interface QuizPreview {
  id: number
  name: string
  description: string
  status: string
  questionCount: number
  createdAt: string // ISO string
}

// For creating a quiz
export interface CreateQuizRequest {
  name: string
  description: string
  status?: string
}

// For quiz questions (response)
export interface QuizQuestionResponse {
  id: number
  questionBody: string
}

// For creating/updating a quiz question
export interface CreateQuizQuestionRequest {
  quizId: number
  questionBody: string
  position?: number
}

// For quiz answers (response)
export interface QuizAnswerResponse {
  id: number
  quizId: number
  questionId: number
  answerBody: string
}

// For quiz answers (admin response)
export interface QuizAnswerAdminResponse {
  id: number
  quizId: number
  questionId: number
  answerBody: string
  isCorrect: boolean
}

// For creating/updating a quiz answer
export interface CreateQuizAnswerRequest {
  quizId: number
  questionId: number
  answerBody: string
  isCorrect: boolean
}

// For user quiz attempt summary
export interface QuizAttemptSummary {
  id: number
  completedAt: string // ISO string
}

// For creating a user quiz answer
export interface CreateUserQuizAnswerRequest {
  userQuizAttemptId: number
  quizId: number
  questionId: number
  answerId: number
}
