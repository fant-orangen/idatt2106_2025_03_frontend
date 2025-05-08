<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter } from 'vue-router'
import type { QuizAnswerAdminResponse } from '@/models/Quiz.ts'

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

import { Check, Pencil, Trash2 } from 'lucide-vue-next'

import { quizService } from '@/services/QuizService'

const router = useRouter()
const props = defineProps<{
  quizId: number
}>()

const { t } = useI18n()

const newQuestionText = ref('')
const options = ref<string[]>([''])
const correctOption = ref<number[]>([])

const localQuestions = ref<
  {
    questionId: number | null
    questionBody: string
    options: { answerId: number | null; answerBody: string; isCorrect: boolean }[]
    deleted?: boolean
  }[]
>([])

const fetchedQuestions = ref<
  {
    questionId: number
    questionBody: string
    options: { answerId: number; answerBody: string; isCorrect: boolean }[]
    deleted?: boolean
  }[]
>([])

const editingQuestionId = ref<number | null>(null) // Tracks the question being edited

const hasUnsavedChanges = ref(false)

const previewQuestions = computed(() => {
  // Combine fetchedQuestions and localQuestions, excluding deleted questions
  return [
    ...fetchedQuestions.value.filter((question) => !question.deleted),
    ...localQuestions.value
      .filter((question) => !question.deleted)
      .map((question) => ({
        questionId: question.questionId,
        questionBody: question.questionBody,
        options: question.options.map((option) => ({
          answerId: option.answerId,
          answerBody: option.answerBody,
          isCorrect: option.isCorrect,
        })),
      })),
  ]
})

function addOption() {
  if (options.value.length < 5) {
    options.value.push('')
  } else {
    toast.error(t('gamification.quizCreator.maxOptions'))
  }
}

function setCorrectOption(index: number) {
  if (correctOption.value.includes(index)) {
    // If the option is already selected, remove it
    correctOption.value = correctOption.value.filter((i) => i !== index)
  } else {
    // Otherwise, add it to the list of correct options
    correctOption.value.push(index)
  }
  console.log('Correct options set to:', correctOption.value)
}

async function fetchQuestionsAndAnswers() {
  try {
    // Fetch all questions for the quiz
    const questions = await quizService.getQuizQuestionsByQuizId(props.quizId)
    console.log('Fetched questions from backend:', questions)

    const questionsWithAnswers = []

    // Loop through each question to fetch its answers
    for (const question of questions) {
      const answers: QuizAnswerAdminResponse[] = await quizService.getCorrectAnswersByQuestionId(
        question.id,
      )
      console.log(`Fetched answers for question ${question.id}:`, answers)

      // Map the question and its answers
      questionsWithAnswers.push({
        questionId: question.id,
        questionBody: question.questionBody,
        options: answers.map((answer) => ({
          answerId: answer.id,
          answerBody: answer.answerBody,
          isCorrect: answer.isCorrect,
        })),
      })
    }

    // Update the fetchedQuestions state
    fetchedQuestions.value = questionsWithAnswers
    console.log('Processed questions with answers:', fetchedQuestions.value)
  } catch (error) {
    console.error('Error fetching questions and answers:', error)
    toast.error(t('gamification.quizCreator.fetchError'))
  }
}

function submitQuestion() {
  if (!newQuestionText.value.trim() || correctOption.value.length === 0) {
    toast.error(t('gamification.quizCreator.questionValidationError'))
    return
  }

  // Add the new question to localQuestions
  localQuestions.value.push({
    questionId: null, // New questions don't have an ID yet
    questionBody: newQuestionText.value,
    options: options.value.map((option, index) => ({
      answerId: null, // New answers don't have an ID yet
      answerBody: option,
      isCorrect: correctOption.value.includes(index),
    })),
  })

  hasUnsavedChanges.value = true
  toast.success(t('gamification.quizCreator.questionAdded'))

  // Reset the form
  resetForm()
}

function deleteQuestion(questionId: number) {
  // Check if the question exists in localQuestions
  const localQuestion = localQuestions.value.find((question) => question.questionId === questionId)

  if (localQuestion) {
    localQuestion.deleted = true // Mark as deleted
    hasUnsavedChanges.value = true // Mark as having unsaved changes
    toast.success(t('gamification.quizCreator.questionDeleted'))
    return
  }

  // Check if the question exists in fetchedQuestions
  const fetchedQuestion = fetchedQuestions.value.find(
    (question) => question.questionId === questionId,
  )

  if (fetchedQuestion) {
    fetchedQuestion.deleted = true // Mark as deleted
    hasUnsavedChanges.value = true // Mark as having unsaved changes
    toast.success(t('gamification.quizCreator.questionDeleted'))
    return
  }

  // If the question is not found in either array
  console.error('Failed to find the question to delete in localQuestions or fetchedQuestions.')
  toast.error(t('gamification.quizCreator.deleteQuestionError'))
}

function editQuestion(questionId: number) {
  const questionToEdit =
    localQuestions.value.find((question) => question.questionId === questionId) ||
    fetchedQuestions.value.find((question) => question.questionId === questionId)

  if (questionToEdit) {
    newQuestionText.value = questionToEdit.questionBody
    options.value = questionToEdit.options.map((option) => option.answerBody)
    correctOption.value = questionToEdit.options
      .map((option, index) => (option.isCorrect ? index : null))
      .filter((index) => index !== null) as number[] // Populate correctOption with indices of correct answers

    console.log('Editing question:', questionToEdit)
    console.log('Correct options:', correctOption.value)

    editingQuestionId.value = questionId
  }
}

function saveEditedQuestion() {
  if (!newQuestionText.value.trim() || correctOption.value.length === 0) {
    toast.error(t('gamification.quizCreator.questionValidationError'))
    return
  }

  // Check if the question exists in localQuestions
  const localQuestionIndex = localQuestions.value.findIndex(
    (question) => question.questionId === editingQuestionId.value,
  )

  if (localQuestionIndex !== -1) {
    // Update the question in localQuestions
    localQuestions.value[localQuestionIndex] = {
      questionId: editingQuestionId.value,
      questionBody: newQuestionText.value,
      options: options.value.map((option, index) => ({
        answerId: localQuestions.value[localQuestionIndex].options[index]?.answerId || null,
        answerBody: option,
        isCorrect: correctOption.value.includes(index), // Set isCorrect based on correctOption
      })),
    }

    hasUnsavedChanges.value = true
    toast.success(t('gamification.quizCreator.questionUpdated'))
    resetForm() // Reset the form after saving
    return
  }

  // Check if the question exists in fetchedQuestions
  const fetchedQuestionIndex = fetchedQuestions.value.findIndex(
    (question) => question.questionId === editingQuestionId.value,
  )

  if (fetchedQuestionIndex !== -1) {
    // Update the question in fetchedQuestions
    fetchedQuestions.value[fetchedQuestionIndex] = {
      questionId: editingQuestionId.value,
      questionBody: newQuestionText.value,
      options: options.value.map((option, index) => ({
        answerId: fetchedQuestions.value[fetchedQuestionIndex].options[index]?.answerId || null,
        answerBody: option,
        isCorrect: correctOption.value.includes(index), // Set isCorrect based on correctOption
      })),
    }

    toast.success(t('gamification.quizCreator.questionUpdated'))
    resetForm() // Reset the form after saving
    return
  }

  // If the question is not found in either array
  console.error('Failed to find the question to edit in localQuestions or fetchedQuestions.')
  toast.error(t('gamification.quizCreator.editQuestionError'))
}

function resetForm() {
  newQuestionText.value = ''
  options.value = ['']
  correctOption.value = []
  editingQuestionId.value = null
}

async function saveQuiz() {
  try {
    // Save or update questions in localQuestions
    for (const question of localQuestions.value) {
      if (question.deleted) {
        // Skip saving deleted questions
        continue
      }

      if (question.questionId === null) {
        // Create a new question
        const questionResponse = await quizService.saveQuizQuestion({
          quizId: props.quizId,
          questionBody: question.questionBody,
        })

        const questionId = questionResponse.id

        // Save answers for the new question
        for (const option of question.options) {
          await quizService.saveQuizAnswer({
            quizId: props.quizId,
            questionId,
            answerBody: option.answerBody,
            isCorrect: option.isCorrect,
          })
        }
      } else {
        // Update an existing question
        await quizService.updateQuizQuestion(question.questionId, {
          quizId: props.quizId,
          questionBody: question.questionBody,
        })

        // Update or create answers
        for (const option of question.options) {
          if (option.answerId === null) {
            // Create a new answer
            await quizService.saveQuizAnswer({
              quizId: props.quizId,
              questionId: question.questionId,
              answerBody: option.answerBody,
              isCorrect: option.isCorrect,
            })
          } else {
            // Update an existing answer
            await quizService.updateQuizAnswer(option.answerId, {
              quizId: props.quizId,
              questionId: question.questionId,
              answerBody: option.answerBody,
              isCorrect: option.isCorrect,
            })
          }
        }
      }
    }

    // Delete questions marked as deleted in fetchedQuestions
    for (const question of fetchedQuestions.value) {
      if (question.deleted) {
        await quizService.deleteQuizQuestion(question.questionId)
      }
    }

    // Optionally unarchive the quiz if needed
    await quizService.unarchiveQuiz(props.quizId)

    hasUnsavedChanges.value = false // Reset unsaved changes
    toast.success(t('gamification.quizCreator.quizSaved'))
    router.push({ name: 'QuizOverview' }) // Redirect to the quiz overview page
  } catch (error) {
    console.error('Error saving quiz:', error)
    toast.error(t('gamification.quizCreator.saveQuizError'))
  }
}

onMounted(() => {
  fetchQuestionsAndAnswers()
})
</script>

<template>
  <div>
    <h2 class="font-bold text-foreground text-center my-6">{{ props.quizName }}</h2>

    <div class="flex flex-col items-center justify-center lg:flex-row lg:items-start gap-10 m-10">
      <!-- Question Form -->
      <div class="flex flex-col gap-10 add-question w-full md:w-full">
        <Card class="w-full md:w-full">
          <CardHeader>
            <CardTitle>
              <span v-if="editingQuestionId">
                {{ t('gamification.quizCreator.editQuestion') }} {{ editingQuestionId }}
              </span>
              <span v-else>
                {{ t('gamification.quizCreator.addQuestion') }}
              </span>
            </CardTitle>
            <CardDescription>
              <span v-if="editingQuestionId">
                {{ t('gamification.quizCreator.editQuestionDescription') }}
              </span>
              <span v-else>
                {{ t('gamification.quizCreator.addQuestionDescription') }}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col gap-2">
              <Label for="question-text">{{ t('gamification.quizCreator.questionText') }}</Label>
              <Input
                v-model="newQuestionText"
                id="question-text"
                :placeholder="t('gamification.quizCreator.enterQuestion')"
              />
            </div>

            <!-- Header Row -->
            <div
              class="flex flex-row justify-center items-center gap-4 font-semibold text-sm text-muted-foreground mt-3"
            >
              <div class="w-24">
                <!-- {{ $t('gamification.quizCreator.optionLabel') }} -->
              </div>
              <div class="flex-1">
                <!-- {{ $t('gamification.quizCreator.optionText') }} -->
              </div>
              <div class="w-20 flex justify-center items-center">
                {{ $t('gamification.quizCreator.correct') }}
              </div>
            </div>

            <!-- Option list -->
            <div
              v-for="(option, index) in options"
              :key="index"
              class="flex items-center gap-4 mt-2"
            >
              <Label :for="'option-' + index" class="w-24">
                {{ t('gamification.quizCreator.option') }} {{ index + 1 }}
              </Label>
              <Input v-model="options[index]" :id="'option-' + index" class="flex-1" />
              <div class="flex justify-center items-center w-20">
                <Checkbox
                  class="h-6 w-6"
                  :model-value="correctOption.includes(index)"
                  @update:model-value="setCorrectOption(index)"
                />
              </div>
            </div>

            <Button class="mt-4" variant="outline" @click="addOption">{{
              t('gamification.quizCreator.addOption')
            }}</Button>
          </CardContent>
          <CardFooter>
            <div class="flex flex-row gap-4">
              <Button v-if="editingQuestionId" @click="saveEditedQuestion">
                {{ t('gamification.quizCreator.saveQuestionButton') }}
              </Button>
              <Button v-else @click="submitQuestion">
                {{ t('gamification.quizCreator.addQuestionButton') }}
              </Button>
              <Button v-if="editingQuestionId" variant="outline" @click="resetForm">
                {{ t('gamification.quizCreator.cancelButton') }}
              </Button>
            </div>
          </CardFooter>
        </Card>
        <Button @click="saveQuiz">
          {{ t('gamification.quizCreator.saveQuizButton') }}
        </Button>
        <div v-if="hasUnsavedChanges" class="unsaved-warning text-crisis-level-red">
          {{ t('gamification.quizCreator.unsavedWarning') }}
        </div>
      </div>

      <!-- Preview Panel -->

      <div class="quiz-preview w-full md:w-full">
        <Card class="h-full w-full">
          <CardHeader>
            <CardTitle>{{ t('gamification.quizCreator.previewTitle') }}</CardTitle>
            <CardDescription>{{
              t('gamification.quizCreator.previewDescription')
            }}</CardDescription>
          </CardHeader>
          <ScrollArea class="w-full h-full md:h-[70vh]">
            <CardContent class="pb-2">
              <!-- No Questions Message -->
              <div
                v-if="fetchedQuestions.length === 0"
                class="text-gray-500 text-center py-8 text-base italic"
              >
                {{ t('gamification.quizCreator.noQuestions') }}
              </div>

              <!-- Questions List -->
              <div v-else class="space-y-6">
                <Card
                  v-for="(question, index) in previewQuestions"
                  :key="index"
                  class="p-6 border rounded-2xl shadow-sm bg-card hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle class="font-semibold text-xl text-card-foreground">
                      Question {{ index + 1 }}
                    </CardTitle>
                    <CardDescription class="text-muted-foreground mb-4">
                      {{ question.questionBody }}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul class="space-y-2">
                      <li
                        v-for="(option, optionIndex) in question.options"
                        :key="optionIndex"
                        :class="[
                          'px-4 py-2 rounded-md',
                          option.isCorrect
                            ? 'bg-crisis-level-green font-medium text-background'
                            : 'text-foreground',
                        ]"
                      >
                        <div class="flex items-center">
                          <Check
                            :class="[
                              'w-5 h-5 mr-5 text-background',
                              { invisible: !option.isCorrect },
                            ]"
                          />
                          <span>{{ option.answerBody }}</span>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <div class="flex justify-end w-full gap-2">
                      <TooltipProvider :delayDuration="350">
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="flex justify-center items-center"
                              @click="editQuestion(question.questionId)"
                            >
                              <Pencil class="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {{ t('gamification.quizCreator.editQuestion') }}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider :delayDuration="350">
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="flex justify-center items-center"
                              @click="deleteQuestion(question.questionId)"
                            >
                              <Trash2 class="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {{ t('gamification.quizCreator.deleteQuestion') }}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  </div>
</template>
