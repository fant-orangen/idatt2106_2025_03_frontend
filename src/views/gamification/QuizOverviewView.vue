<script setup lang="ts">
import QuizOverview from '@/components/gamification/quiz/QuizOverview.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
</script>

<template>
  <div class="flex flex-col">
    <Breadcrumb class="m-5">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/"> {{ $t('navigation.home') }} </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage> {{ $t('gamification.quizOverview') }} </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <QuizOverview />
  </div>
</template>
