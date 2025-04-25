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
import { useRouter } from 'vue-router'

const router = useRouter()

const currentStatus = 'crisis.no-crisis'
</script>

<template>
  <div class="content flex justify-center items-center pt-20 flex-col gap-20">
    <div class="crisis-status">
      <Card class="crisis-status-card w-120 bg-secondary">
        <CardHeader class="items-center">
          <CardTitle class="flex flex-col items-center justify-center text-center gap-3 text-2xl">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" size="2xl" />
            {{ $t('crisis.crisis-status') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="flex justify-center items-center">
          {{ $t(currentStatus) }}
        </CardContent>
      </Card>
    </div>
    <div class="container flex flex-row gap-40">
      <div class="before-during-after flex flex-col gap-20">
        <Button class="h-30 w-80" @click="router.push('before-crisis')">
          {{ $t('time.before') }}</Button
        >
        <Button class="h-30 w-80" @click="router.push('during-crisis')">
          {{ $t('time.during') }}</Button
        >
        <Button class="h-30 w-80" @click="router.push('after-crisis')">
          {{ $t('time.after') }}</Button
        >
      </div>
      <div class="map flex justify-center items-center bg-accent-foreground flex-grow text-black">
        map
      </div>
    </div>
  </div>
</template>

<style></style>
