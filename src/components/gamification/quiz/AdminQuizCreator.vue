<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

import { quizService } from '@/services/QuizService'

import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const quizName = ref('')
const quizDescription = ref('')
const quizNameError = ref(false)
const quizDescriptionError = ref(false)
const errorMessage = ref('')

function validateAndSubmit() {
  quizNameError.value = false
  quizDescriptionError.value = false
  errorMessage.value = ''

  if (!quizName.value.trim()) {
    quizNameError.value = true
    errorMessage.value = t('gamification.quizCreator.nameError')
    return
  }

  if (!quizDescription.value.trim()) {
    quizDescriptionError.value = true
    errorMessage.value = t('gamification.quizCreator.descriptionError')
    return
  }

  // Call the service to create the quiz
  quizService
    .createQuiz({
      name: quizName.value,
      description: quizDescription.value,
    })
    .then((response) => {
      // Assuming the response contains the created quiz's ID
      const createdQuizId = response.quizId
      toast.success(t('gamification.quizCreator.quizCreated') + ': ' + createdQuizId)
      // Navigate to the EditQuizView with the created quiz ID
      router.push({ name: 'EditQuiz', params: { quizId: createdQuizId } })
    })
    .catch((error) => {
      console.error('Error creating quiz:', error)
      toast.error(t('gamification.quizCreator.quizCreationError'))
    })
}
</script>

<template>
  <!-- Define Quiz Window -->
  <div class="define-quiz w-6/7 mt-50 md:w-1/2 mx-auto md:min-w-160">
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
          <Input
            id="quiz-name"
            v-model="quizName"
            :placeholder="$t('gamification.quizCreator.enterTitle')"
          />
          <Label for="quiz-description">
            {{ $t('gamification.quizCreator.quizDescription') }}
          </Label>
          <Textarea
            id="quiz-description"
            v-model="quizDescription"
            :placeholder="$t('gamification.quizCreator.enterDescription')"
          />
        </div>
      </CardContent>
      <CardFooter>
        <div class="flex flex-col gap-4 w-full">
          <div v-if="quizNameError" class="text-red-500">
            {{ errorMessage }}
          </div>
          <div class="flex gap-4">
            <Button class="flex-1" @click="validateAndSubmit()">
              {{ $t('gamification.quizCreator.createQuiz') }}
            </Button>
            <Button class="flex-1" @click="router.push('/quizzes/')" variant="outline">
              {{ $t('gamification.quizCreator.cancelButton') }}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>
