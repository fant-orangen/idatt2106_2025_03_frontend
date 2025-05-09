<script setup lang="ts">
import { defineProps } from 'vue'
import QuizHistoryComponent from '@/components/gamification/quiz/QuizHistoryComponent.vue'

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
        <BreadcrumbLink href="/"> {{ $t('navigation.home') }} </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/quiz-overview">
          {{ $t('gamification.gameHistory') }}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage> {{ props.quizId }} </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

  <QuizHistoryComponent :quizId="props.quizId" />
</template>
