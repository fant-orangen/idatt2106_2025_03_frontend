<script setup lang="ts">
import { defineProps } from 'vue'
import QuizHistoryComponent from '@/components/gamification/quiz/QuizHistoryComponent.vue'
import { quizService } from '@/services/QuizService.ts'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

// const getQuizNameById = (quizId: number): string => {
//   quizService.get
//   return `Quiz ${quizId}`
// }

const props = defineProps<{
  quizId: number
}>()
</script>

<template>
  <Breadcrumb class="m-5">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/"> Home </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/quizzes"> Quiz Overview </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage> Quiz History - {{ props.quizId }} </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

  <QuizHistoryComponent :quizId="props.quizId" />
</template>
