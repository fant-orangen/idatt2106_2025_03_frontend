<template>
  <div class="space-y-6">

    <!-- Create new household -->
    <Card v-if="!showCreateForm">
      <CardHeader>
        <CardTitle>{{ t('household.create_new') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col items-center text-center">
          <HomeIcon class="h-16 w-16 mb-4 text-primary opacity-80" />
          <p class="mb-4">
            {{ t('household.create_description') }}
          </p>
          <Button size="lg" class="mt-2" @click="showCreateForm = true">
            {{ t('household.create_button') }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Create household form -->
    <Card v-if="showCreateForm">
      <CardHeader>
        <CardTitle>{{ t('household.create.title') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateNewHousehold @created="handleHouseholdCreated" />
      </CardContent>
      <CardFooter>
        <Button variant="ghost" @click="showCreateForm = false">
          {{ t('household.cancel') }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HomeIcon } from 'lucide-vue-next';
import { useHouseholdStore } from '@/stores/HouseholdStore';

import CreateNewHousehold from '@/components/household/CreateNewHousehold.vue';

const { t } = useI18n();
const householdStore = useHouseholdStore();
const showCreateForm = ref(false);

const emit = defineEmits(['household-updated']);

const handleHouseholdCreated = (household: any) => {
  toast.success(t('household.created-success'));
  if (household) {
    householdStore.fetchCurrentHousehold();
  }
  emit('household-updated');
  showCreateForm.value = false;
};

const handleHouseholdUpdate = () => {
  emit('household-updated');
  showCreateForm.value = false;
};
</script>
