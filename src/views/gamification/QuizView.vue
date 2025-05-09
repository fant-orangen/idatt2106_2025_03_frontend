<script setup lang="ts">
import QuizComponent from '@/components/gamification/quiz/QuizComponent.vue'
import { defineProps, onMounted } from 'vue'
import { quizService } from '@/services/QuizService'
import { ref } from 'vue'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

const props = defineProps<{
  quizId: number
}>()

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
</script>

<template>
  <Breadcrumb class="m-5">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/"> {{ $t('navigation.home') }} </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/quiz-overview">
          {{ $t('gamification.quizOverview') }}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage> {{ quizName }} </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
  <QuizComponent :quizId="props.quizId" />
</template>
