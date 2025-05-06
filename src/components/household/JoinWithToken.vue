<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>{{ t('household.join.title') }}</CardTitle>
      <CardDescription>
        {{ t('household.join.subtitle') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleJoinWithToken">
        <div class="grid w-full items-center gap-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="token">{{ t('household.join.tokenLabel') }}</Label>
            <Input
              id="token"
              v-model="token"
              :placeholder="t('household.join.tokenPlaceholder')"
            />
            <p v-if="error" class="text-sm text-destructive mt-1">{{ error }}</p>
          </div>
          <Button
            type="submit"
            :disabled="isLoading || !token.trim()"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ t('household.join.submitButton') }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Loader2 } from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { joinWithToken } from '@/services/HouseholdService';
import { toast } from 'vue-sonner';

const { t } = useI18n();
const router = useRouter();
const emit = defineEmits(['joined']);

const token = ref('');
const isLoading = ref(false);
const error = ref('');

async function handleJoinWithToken() {
  if (!token.value.trim()) return;

  error.value = '';
  isLoading.value = true;

  try {
    const household = await joinWithToken(token.value);
    // Emit joined event
    emit('joined', household);
    toast.success(t('household.join.success'));
    // Redirect to the household page after successfully joining
    router.push('/household');
  } catch (err: Error | unknown) {
    error.value = err instanceof Error ? err.message : t('household.join.errors.generic');
  } finally {
    isLoading.value = false;
  }
}
</script>
