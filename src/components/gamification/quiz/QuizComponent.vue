<script setup lang="ts">
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ref, onMounted } from 'vue'
import { defineProps } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { quizService } from '@/services/QuizService'
import type { CreateUserQuizAnswerRequest } from '@/models/Quiz'
import type { QuizQuestionResponse } from '@/models/Quiz'
import type { QuizAnswerResponse } from '@/models/Quiz'

// Props
const props = defineProps<{ quizId: number }>()
const nrOfQuestions = ref(1)
const quizName = ref('') // Store the quiz name

async function fetchQuizName(quizId: number) {
  try {
    quizName.value = await quizService.getQuizNameById(quizId) // Fetch and store the quiz name
  } catch (error) {
    console.error(`Error fetching quiz name for quizId ${quizId}:`, error)
    quizName.value = 'Unknown Quiz' // Fallback value
  }
}

onMounted(() => {
  fetchQuizName(props.quizId) // Fetch the quiz name when the component is mounted
})

// Reactive variables
const playerScore = ref(0)
const questionNr = ref(0)
const question = ref('')
const correctAnswer = ref<string[]>([])
const options = ref<QuizAnswerResponse[]>([]) // Store full answer objects
const selectedAnswer = ref('')
const questionAnswered = ref(false)
const fetchedQuestions = ref<QuizQuestionResponse[]>([])
const quizCompleted = ref(false)

// Feedback for the question
const questionDescription = ref('')
const userAnswers = ref<{ questionId: number; answerId: number }[]>([])

// Function to handle answer selection
const handleAnswer = (answer: string) => {
  if (questionAnswered.value) return // Prevent multiple answers
  selectedAnswer.value = answer
  questionAnswered.value = true

  if (correctAnswer.value.includes(answer)) {
    // Check if the answer is correct
    playerScore.value++
    questionDescription.value = 'Korrekt! Bra jobba!'
  } else {
    questionDescription.value = 'Ikke riktig! Du klarer bedre!'
  }

  // Save the user's answer
  const currentQuestionId = fetchedQuestions.value[questionNr.value].id // Get the current question ID
  const selectedAnswerId = options.value.find((a) => a.answerBody === answer)?.id // Find the answer ID
  if (selectedAnswerId) {
    userAnswers.value.push({ questionId: currentQuestionId, answerId: selectedAnswerId })
  }
}

// Function to fetch quiz data
const fetchQuizData = async () => {
  try {
    fetchedQuestions.value = await quizService.getQuizQuestionsByQuizId(props.quizId)

    if (!fetchedQuestions.value || fetchedQuestions.value.length === 0) {
      console.error('No questions found for this quiz.')
      return
    }

    // Get the current question based on questionNr
    const currentQuestion = fetchedQuestions.value[questionNr.value]
    const answers = await quizService.getAnswersByQuestionId(currentQuestion.id)
    const correctAnswers = await quizService.getCorrectAnswersByQuestionId(currentQuestion.id)

    // Populate fields
    question.value = currentQuestion.questionBody
    options.value = answers // Store full answer objects in options

    // Filter correct answers based on the `isCorrect` property
    correctAnswer.value = correctAnswers
      .filter((answer) => answer.isCorrect) // Ensure only correct answers are included
      .map((answer) => answer.answerBody) // Map to the answer body

    selectedAnswer.value = ''
    questionAnswered.value = false

    nrOfQuestions.value = fetchedQuestions.value.length

    // Log the correct answers for the current question
    console.log(
      `Correct answers for question "${currentQuestion.questionBody}":`,
      correctAnswer.value,
    )
  } catch (error) {
    console.error('Error fetching quiz data:', error)
  }
}

// Function to handle "Next" button click
const handleNextQuestion = async () => {
  if (questionNr.value + 1 < nrOfQuestions.value) {
    questionNr.value++
    await fetchQuizData()
  } else {
    console.log('Quiz completed!')
    quizCompleted.value = true
    try {
      await sendQuizAttemptToBackend()
    } catch (error) {
      console.error('Error sending quiz attempt to backend:', error)
    }
    userAnswers.value = []
  }
}

// Fetch quiz data when the component is mounted
onMounted(() => {
  fetchQuizData()
})

const sendQuizAttemptToBackend = async () => {
  try {
    // Step 1: Create a new quiz attempt
    const userQuizAttemptId = await quizService.createUserQuizAttempt(props.quizId)

    // Step 2: Send all user's answers to the backend
    const answersToSend: CreateUserQuizAnswerRequest[] = userAnswers.value.map((answer) => ({
      userQuizAttemptId,
      quizId: props.quizId,
      questionId: answer.questionId,
      answerId: answer.answerId,
    }))

    console.log('Answers to send:', answersToSend)

    for (const answer of answersToSend) {
      await quizService.createUserQuizAnswer(answer)
    }

    console.log('Quiz attempt and answers sent successfully!')
  } catch (error) {
    console.error('Error sending quiz attempt to backend:', error)
  }
}

const restartQuiz = () => {
  playerScore.value = 0
  questionNr.value = 0
  question.value = ''
  correctAnswer.value = []
  options.value = []
  selectedAnswer.value = ''
  questionAnswered.value = false
  quizCompleted.value = false
  userAnswers.value = []
  fetchQuizData()
}
</script>

<template>
  <div class="page-contents flex flex-col flex-grow justify-center items-center mb-15">
    <h1 class="text-4xl font-bold text-foreground flex justify-center mb-15 mt-10 text-center">
      {{ quizName }}
    </h1>

    <!-- Show quiz summary if completed -->
    <div v-if="quizCompleted" class="flex flex-col items-center justify-center w-full h-full">
      <Card class="test w-8/10 md:min-w-150 md:w-1/2 h-fill">
        <CardHeader>
          <CardTitle>{{ $t('gamification.quizSummary') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-4">
            <p class="text-lg">
              {{ $t('gamification.youScored') }} {{ playerScore }} {{ $t('gamification.outOf') }}
              {{ nrOfQuestions }}!
            </p>
            <p class="text-md">{{ $t('gamification.thanksForParticipating') }}</p>
          </div>
        </CardContent>
        <CardFooter class="flex gap-4">
          <Button class="flex-1" @click="restartQuiz">{{ $t('gamification.restartQuiz') }}</Button>
          <Button class="flex-1" @click="$router.push('/quiz-overview/')">
            {{ $t('gamification.backToQuizzes') }}
          </Button>
        </CardFooter>
      </Card>
    </div>

    <!-- Show quiz questions if not completed -->
    <div v-else class="flex flex-col items-center justify-center w-full h-full">
      <Card class="test w-8/10 md:min-w-150 md:w-1/2 h-fill">
        <CardHeader>
          <div class="flex flex-col gap-4">
            <Progress :model-value="(questionNr / nrOfQuestions) * 100" />
            <CardTitle> Question {{ questionNr + 1 }} </CardTitle>
            <CardDescription> {{ question }} </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-4">
            <!-- Dynamically render options -->
            <Button
              v-for="option in options"
              :key="option.id"
              variant="outline"
              class="w-full flex items-center whitespace-normal h-fit text-left"
              :class="{
                'bg-green-500 text-white dark:bg-green-600 pointer-events-none':
                  questionAnswered && correctAnswer.includes(option.answerBody),
                'bg-red-500 text-white dark:bg-red-550 pointer-events-none':
                  questionAnswered &&
                  selectedAnswer === option.answerBody &&
                  !correctAnswer.includes(option.answerBody),
                'pointer-events-none': questionAnswered,
              }"
              @click="handleAnswer(option.answerBody)"
            >
              <div class="flex w-full justify-between items-center">
                <span class="flex-1">{{ option.answerBody }}</span>
                <span v-if="questionAnswered" class="ml-4">
                  <Check v-if="correctAnswer.includes(option.answerBody)" />
                  <X v-else />
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div class="flex flex-col gap-4 w-full">
            <CardDescription v-if="questionAnswered">
              {{ questionDescription }}
            </CardDescription>
            <Button :disabled="!questionAnswered" class="w-full" @click="handleNextQuestion">
              {{
                questionNr + 1 < nrOfQuestions
                  ? $t('gamification.nextQuestion', 'Neste spørsmål')
                  : $t('gamification.finishQuiz', 'Avslutt quiz')
              }}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
