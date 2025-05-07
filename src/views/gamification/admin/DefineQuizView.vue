<script setup lang="ts">
import AdminQuizCreator from '@/components/gamification/quiz/AdminQuizCreator.vue'
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
        <BreadcrumbPage> Quiz Creator </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
  <AdminQuizCreator />
</template>
