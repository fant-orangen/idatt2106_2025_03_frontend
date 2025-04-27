<template>
  <div class="container mx-auto py-8 px-4">
    <div class="max-w-md mx-auto">
      <JoinWithToken class="mb-6" />

      <Card v-if="!showCreateForm">
        <CardHeader>
          <CardTitle>{{ t('household.create_new') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="mb-4">
            {{ t('household.create_description') }}
          </p>
          <Button variant="outline" @click="showCreateForm = true">
            {{ t('household.create_button') }}
          </Button>
        </CardContent>
      </Card>

      <CreateNewHousehold v-if="showCreateForm" class="mt-6" />

      <div v-if="showCreateForm" class="mt-4 text-center">
        <Button variant="ghost" size="sm" @click="showCreateForm = false">
          {{ t('household.cancel') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import JoinWithToken from '@/components/household/JoinWithToken.vue';
import CreateNewHousehold from '@/components/household/CreateNewHousehold.vue';

const { t } = useI18n();
const showCreateForm = ref(false);

const emit = defineEmits(['household-updated']);

const handleHouseholdUpdate = () => {
  emit('household-updated');
  showCreateForm.value = false;
};
</script>
