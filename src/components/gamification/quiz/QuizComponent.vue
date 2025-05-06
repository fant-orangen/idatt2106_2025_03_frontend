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
import { ref } from 'vue'
import { Check, X } from 'lucide-vue-next'

// Props
const nrOfQuestions = ref(10)
const quizName = ref('General Knowledge Quiz')

// Reactive variables
const playerScore = ref(0)
const questionNr = ref(0)
const question = ref('What is the capital of France?')
const correctAnswer = ref(
  'London is the capital and largest city of England and the United Kingdom, with a population of just over 9 million. It stands on the River Thames in southeast England at the head of a 50-mile estuary leading to the North Sea.',
)
const selectedAnswer = ref('')
const questionAnswered = ref(false)

// Options for the question
const optionOne = ref(
  'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
)
const optionTwo = ref(
  'London is the capital and largest city of England and the United Kingdom, with a population of just over 9 million. It stands on the River Thames in southeast England at the head of a 50-mile estuary leading to the North Sea.',
)
const optionThree = ref(
  "Berlin is the capital and largest city of Germany by both area and population. Its 3.7 million inhabitants make it the European Union's most populous city, according to population within city limits.",
)
const optionFour = ref(
  'Madrid is the capital and most populous city of Spain. The city has almost 3.4 million inhabitants and a metropolitan area population of approximately 6.7 million. It is the second-largest city in the European Union.',
)

// Feedback for the question
const questionDescription = ref('Correct! The capital of France is Paris.')

// Function to handle answer selection
const handleAnswer = (answer: string) => {
  if (questionAnswered.value) return // Prevent multiple answers
  selectedAnswer.value = answer
  questionAnswered.value = true
  if (answer === correctAnswer.value) {
    playerScore.value++
  }
}
</script>

<template>
  <div class="page-contents flex flex-col flex-grow justify-center items-center">
    <h1 class="text-4xl font-bold text-foreground flex justify-center mb-15 mt-10 text-center">
      {{ quizName }}
    </h1>
    <div class="flex flex-col items-center justify-center w-full h-full">
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
            <!-- Option 1 -->
            <Button
              variant="outline"
              class="w-full flex items-center whitespace-normal h-fit text-left"
              :class="{
                'bg-green-500 text-white dark:bg-green-600 pointer-events-none':
                  questionAnswered && optionOne === correctAnswer,
                'bg-red-500 text-white dark:bg-red-550 pointer-events-none':
                  questionAnswered && selectedAnswer === optionOne && optionOne !== correctAnswer,
                'pointer-events-none': questionAnswered,
              }"
              @click="handleAnswer(optionOne)"
            >
              <div class="flex w-full justify-between items-center">
                <span class="flex-1">{{ optionOne }}</span>
                <span v-if="questionAnswered" class="ml-4">
                  <Check v-if="optionOne === correctAnswer" />
                  <X v-else />
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              class="w-full flex items-center whitespace-normal h-fit text-left"
              :class="{
                'bg-green-500 text-white dark:bg-green-600 pointer-events-none':
                  questionAnswered && optionTwo === correctAnswer,
                'bg-red-500 text-white dark:bg-red-550 pointer-events-none':
                  questionAnswered && selectedAnswer === optionTwo && optionTwo !== correctAnswer,
                'pointer-events-none': questionAnswered,
              }"
              @click="handleAnswer(optionTwo)"
            >
              <div class="flex w-full justify-between items-center">
                <span class="flex-1">{{ optionTwo }}</span>
                <span v-if="questionAnswered" class="ml-4">
                  <Check v-if="optionTwo === correctAnswer" />
                  <X v-else />
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              class="w-full flex items-center whitespace-normal h-fit text-left"
              :class="{
                'bg-green-500 text-white dark:bg-green-600 pointer-events-none':
                  questionAnswered && optionThree === correctAnswer,
                'bg-red-500 text-white dark:bg-red-550 pointer-events-none':
                  questionAnswered &&
                  selectedAnswer === optionThree &&
                  optionThree !== correctAnswer,
                'pointer-events-none': questionAnswered,
              }"
              @click="handleAnswer(optionThree)"
            >
              <div class="flex w-full justify-between items-center">
                <span class="flex-1">{{ optionThree }}</span>
                <span v-if="questionAnswered" class="ml-4">
                  <Check v-if="optionThree === correctAnswer" />
                  <X v-else />
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              class="w-full flex items-center whitespace-normal h-fit text-left"
              :class="{
                'bg-green-500 text-white dark:bg-green-600 pointer-events-none':
                  questionAnswered && optionFour === correctAnswer,
                'bg-red-500 text-white dark:bg-red-550 pointer-events-none':
                  questionAnswered && selectedAnswer === optionFour && optionFour !== correctAnswer,
                'pointer-events-none': questionAnswered,
              }"
              @click="handleAnswer(optionFour)"
            >
              <div class="flex w-full justify-between items-center">
                <span class="flex-1">{{ optionFour }}</span>
                <span v-if="questionAnswered" class="ml-4">
                  <Check v-if="optionFour === correctAnswer" />
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
            <Button
              :disabled="!questionAnswered"
              class="w-full"
              @click="((questionAnswered = false), (selectedAnswer = ''), questionNr++)"
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
