<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
import { useUserStore } from '@/stores/UserStore'
import {
  QuizAnswerAdminResponse,
  CreateQuizQuestionRequest,
  CreateQuizAnswerRequest,
} from '@/types/Quiz.ts'

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

import { Check, Pencil, Trash2 } from 'lucide-vue-next'

import { quizService } from '@/services/QuizService'

const props = defineProps<{
  quizId: number
  quizName: string
}>()

const { t } = useI18n()

const newQuestionText = ref('')
const options = ref<string[]>([''])
const correctOption = ref<number[]>([])
const fetchedQuestions = ref<
  { questionBody: string; options: { answerBody: string; isCorrect: boolean }[] }[]
>([])
const editingQuestionId = ref<number | null>(null) // Tracks the question being edited

const userStore = useUserStore()

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

async function submitQuestion() {
  if (!newQuestionText.value.trim() || correctOption.value === null) {
    toast.error(t('gamification.quizCreator.questionValidationError'))
    console.log(newQuestionText.value, correctOption.value)
    return
  }

  try {
    // Step 1: Create the question
    console.log('Creating question:', newQuestionText.value)
    console.log('Quiz ID:', props.quizId)
    const questionResponse = await quizService.saveQuizQuestion({
      quizId: props.quizId,
      questionBody: newQuestionText.value,
    })

    const questionId = questionResponse.id
    console.log('Created question ID:', questionId)

    // Step 2: Add answers for the question
    for (let i = 0; i < options.value.length; i++) {
      const answerBody = options.value[i]
      const isCorrect = correctOption.value.includes(i)

      console.log('Answer:', answerBody, 'Is correct:', isCorrect)

      await quizService.saveQuizAnswer({
        quizId: props.quizId,
        questionId,
        answerBody,
        isCorrect,
      })
    }

    toast.success(t('gamification.quizCreator.questionAdded'))

    // Reset the form
    newQuestionText.value = ''
    options.value = ['']
    correctOption.value = []

    // Fetch the updated questions and answers
    await fetchQuestionsAndAnswers()
  } catch (error) {
    console.error('Error creating question or answers:', error)
    toast.error(t('gamification.quizCreator.questionCreationError'))
    console.log('user is admin: ', userStore.isAdminUser)
  }
}

async function deleteQuestion(questionId: number) {
  try {
    console.log('Deleting question with ID:', questionId)
    await quizService.deleteQuizQuestion(questionId)
    toast.success(t('gamification.quizCreator.questionDeleted'))
    // Refresh the questions list
    await fetchQuestionsAndAnswers()
  } catch (error) {
    console.error('Error deleting question:', error)
    toast.error(t('gamification.quizCreator.deleteError'))
  }
}

function editQuestion(questionId: number) {
  const questionToEdit = fetchedQuestions.value.find(
    (question) => question.questionId === questionId,
  )
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

async function saveEditedQuestion() {
  if (!newQuestionText.value.trim() || correctOption.value.length === 0) {
    toast.error(t('gamification.quizCreator.questionValidationError'))
    return
  }

  try {
    console.log('Saving edited question:', editingQuestionId.value)

    // Prepare the data for the API
    const data: CreateQuizQuestionRequest = {
      quizId: props.quizId,
      questionBody: newQuestionText.value,
    }

    await quizService.updateQuizQuestion(editingQuestionId.value!, data)

    const questionToEdit = fetchedQuestions.value.find(
      (question) => question.questionId === editingQuestionId.value,
    )

    console.log(editingQuestionId.value, questionToEdit)

    if (questionToEdit) {
      for (let i = 0; i < options.value.length; i++) {
        const answerBody = options.value[i]
        const isCorrect = correctOption.value.includes(i)

        // Check if the answer already exists
        const existingAnswer = questionToEdit.options[i]

        if (existingAnswer) {
          // Update the existing answer
          const answerData: CreateQuizAnswerRequest = {
            quizId: props.quizId,
            questionId: editingQuestionId.value!,
            answerBody,
            isCorrect,
          }
          await quizService.updateQuizAnswer(existingAnswer.answerId, answerData)
        } else {
          // Add a new answer if it doesn't exist
          await quizService.saveQuizAnswer({
            quizId: props.quizId,
            questionId: editingQuestionId.value!,
            answerBody,
            isCorrect,
          })
        }
      }
    }

    toast.success(t('gamification.quizCreator.questionUpdated'))

    resetForm()

    await fetchQuestionsAndAnswers()
  } catch (error) {
    console.error('Error saving edited question:', error)
    toast.error(t('gamification.quizCreator.updateError'))
  }
}

function resetForm() {
  newQuestionText.value = ''
  options.value = ['']
  correctOption.value = []
  editingQuestionId.value = null
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
      <div class="flex add-question w-full md:w-full">
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
                  v-for="(question, index) in fetchedQuestions"
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
                            ? 'bg-muted font-medium text-foreground'
                            : 'text-foreground',
                        ]"
                      >
                        <div class="flex items-center">
                          <span>{{ option.answerBody }}</span>
                          <Check
                            v-if="option.isCorrect"
                            class="w-5 h-5 ml-5 text-accent-foreground"
                          />
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <div class="flex justify-end w-full gap-2">
                      <TooltipProvider delayDuration="350">
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="outline"
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
                      <TooltipProvider delayDuration="350">
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="outline"
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
