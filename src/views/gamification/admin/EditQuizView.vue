<script setup lang="ts">
import { defineProps } from 'vue'
import AdminEditQuiz from '@/components/gamification/quiz/AdminEditQuiz.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

const props = defineProps<{ quizId: number }>()
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
        <BreadcrumbPage> {{ $t('gamification.quizCreator') }} </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

  <AdminEditQuiz :quizId="props.quizId" />
</template>
