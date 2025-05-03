<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const quizDefined = ref(false)
const quizName = ref('')
const quizDescription = ref('')
const quizNameError = ref(false)
const quizDescriptionError = ref(false)
const errorMessage = ref('')

function validateQuizDefinition() {
  // Check if the quiz name is empty
  if (quizName.value.trim() === '') {
    quizNameError.value = true
    errorMessage.value = t('gamification.quizCreator.nameError')
  } else if (quizDescription.value.trim() === '') {
    quizDescriptionError.value = true
    errorMessage.value = t('gamification.quizCreator.descriptionError')
  } else {
    quizNameError.value = false
    quizDescriptionError.value = false
    errorMessage.value = ''
    quizDefined.value = true
  }
}
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold text-foreground flex justify-center mb-15 mt-10 text-center">
      {{ $t('gamification.quizCreator.title') }}
    </h1>
    <div class="define-quiz w-6/7 md:w-1/2 mx-auto md:min-w-160">
      <Card>
        <CardHeader>
          <CardTitle>
            {{ $t('gamification.quizCreator.creatorTitle') }}
          </CardTitle>
          <CardDescription>
            {{ $t('gamification.quizCreator.creatorDescription') }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-4">
            <Label for="quiz-name">
              {{ $t('gamification.quizCreator.quizName') }}
            </Label>
            <Input id="quiz-name" :placeholder="$t('gamification.quizCreator.enterTitle')" />
            <Label for="quiz-description">
              {{ $t('gamification.quizCreator.quizDescription') }}
            </Label>
            <Textarea
              id="quiz-description"
              :placeholder="$t('gamification.quizCreator.enterDescription')"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button @click="validateQuizDefinition()">
            {{ $t('gamification.quizCreator.createQuiz') }}
          </Button>
        </CardFooter>
      </Card>
    </div>
    <div class="flex flex-col gap-10">
      <div class="add-question"></div>
      <div class="quiz-preview"></div>
    </div>
  </div>
</template>
