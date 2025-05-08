<script setup lang="ts">
import QuizComponent from '@/components/gamification/quiz/QuizComponent.vue'
import { defineProps } from 'vue'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

const quizName = 'General Knowledge Quiz' // This should be passed as a prop or fetched from a store
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
        <BreadcrumbLink href="/quiz-overview"> Quiz Overview </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage> {{ quizName }} </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
  <QuizComponent :quizId="props.quizId" />
</template>
