<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-vue-next'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUsers } from '@fortawesome/free-solid-svg-icons'

// Register FontAwesome icons
library.add(faUsers)

const router = useRouter()
const { t } = useI18n()

function navigateTo(route: string) {
  router.push(route)
}
</script>

<template>
  <div
    class="reflections-groups bg-card p-6 rounded-lg border border-[var(--crisis-level-yellow)]/30"
  >
    <h2 class="text-xl font-bold mb-3 flex items-center">
      <font-awesome-icon
        :icon="['fas', 'users']"
        class="mr-2 text-[var(--crisis-level-yellow)] w-[18px] h-[18px]"
      />
      {{ t('home.quiz.title', 'Quiz') }}
    </h2>
    <p class="mb-4 text-muted-foreground">
      {{ t('home.community.description', 'Share experiences and resources with your community') }}
    </p>

    <div class="grid grid-cols-2 sm:grid-cols-1 gap-4 mt-6">
      <div
        class="text-center p-4 bg-[var(--crisis-level-yellow)]/10 rounded-lg border border-[var(--crisis-level-yellow)]/20"
      >
        <h3 class="font-medium mb-2">{{ t('home.quiz.title', 'Quiz') }}</h3>
        <p class="text-sm text-muted-foreground mb-3">
          {{
            t(
              'home.quiz.description',
              'Engage in interactive quizzes to test your knowledge, challenge yourself, and learn new concepts in a fun and engaging way.',
            )
          }}
        </p>
        <Button
          variant="outline"
          class="w-full border-[var(--crisis-level-yellow)]/30 text-[var(--crisis-level-yellow)] hover:bg-[var(--default-blue)]/5 dark:hover:bg-[var(--default-blue)]/40"
          @click="navigateTo('/quiz-overview/')"
        >
          {{ t('home.quiz.view', 'View Quizzes') }} <ChevronRight class="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  </div>
</template>
