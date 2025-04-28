<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle>{{ $t('household.create.title') }}</CardTitle>
      <CardDescription>{{ $t('household.create.subtitle') }}</CardDescription>
    </CardHeader>

    <CardContent>
      <form @submit.prevent="createNewHousehold" class="space-y-4">
        <div class="space-y-1">
          <Label for="householdName">{{ $t('household.create.nameLabel') }}</Label>
          <Input
            id="householdName"
            v-model="householdName"
            type="text"
            :placeholder="$t('household.create.namePlaceholder')"
            required
          />
        </div>

        <div class="space-y-1">
          <Label for="householdLocation">{{ $t('household.create.locationLabel') }}</Label>
          <Input
            id="householdLocation"
            v-model="householdLocation"
            type="text"
            :placeholder="$t('household.create.locationPlaceholder')"
          />
        </div>

        <div class="space-y-1">
          <Label for="householdDescription">{{ $t('household.create.descriptionLabel') }}</Label>
          <Textarea
            id="householdDescription"
            v-model="householdDescription"
            :placeholder="$t('household.create.descriptionPlaceholder')"
            rows="3"
          />
        </div>

        <Button
          type="submit"
          class="w-full"
          :disabled="isLoading"
        >
          <Loader v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ $t('household.create.submitButton') }}
        </Button>

        <div v-if="error" class="text-red-500 text-sm mt-2">
          {{ error }}
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createHousehold } from '@/services/HouseholdService';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const { t } = useI18n();
const router = useRouter();

// Form fields
const householdName = ref('');
const householdLocation = ref('');
const householdDescription = ref('');

// State
const error = ref('');
const isLoading = ref(false);

async function createNewHousehold() {
  if (!householdName.value.trim()) {
    error.value = t('household.create.errors.nameRequired');
    return;
  }

  error.value = '';
  isLoading.value = true;

  try {
    await createHousehold({
      name: householdName.value.trim(),
      address: householdLocation.value.trim() ? { street: householdLocation.value.trim() } : undefined,
      description: householdDescription.value.trim() || undefined
    });

    // Redirect to household page after successful creation
    router.push('/household');
  } catch (err: Error | unknown) {
    error.value = err instanceof Error ? err.message : t('household.create.errors.generic');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
