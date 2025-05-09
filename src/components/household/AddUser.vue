<template>
  <div class="add-user">
    <form @submit.prevent="inviteUser">
      <div class="space-y-4">
        <!-- Email field -->
        <div>
          <Label for="email">{{ t('household.email-address') }}</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            :placeholder="$t('household.enter-email')"
            required
          ></Input>
        </div>

        <div class="flex justify-between">
          <!-- Status message -->
          <div v-if="status" :class="{'text-green-600': isSuccess, 'text-red-600': !isSuccess}" class="text-sm">
            {{ status }}
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col md:flex-row gap-2">
          <Button type="submit" variant="default" :disabled="isLoading">
            <span v-if="isLoading" class="mr-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ t('household.send-invitation') }}
          </Button>
          <Button type="button" variant="outline" @click="cancel">
            {{ t('common.cancel') }}
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
/**
 * @component AddUser
 * @description A form component for inviting users to join a household by email.
 * Provides input field for email address and handles the invitation process.
 * Emits events when an invitation is sent or the form is cancelled.
 */
import { ref, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { inviteUserToHousehold } from '@/services/HouseholdService';

const { t } = useI18n();

/** Events emitted by this component */
const emit = defineEmits(['invited', 'cancel']);

/** Email address input value */
const email = ref('');

/** Loading state indicator */
const isLoading = ref(false);

/** Status message to display after form submission */
const status = ref('');

/** Whether the last operation was successful */
const isSuccess = ref(false);

/**
 * Sends an invitation to the specified email address
 * @async
 */
const inviteUser = async () => {
  if (!email.value) return;

  isLoading.value = true;
  status.value = '';

  try {
    await inviteUserToHousehold(email.value);

    status.value = t('household.invitation-sent');
    isSuccess.value = true;

    // Emit success event to parent component
    emit('invited', {
      email: email.value,
    });
    resetForm();
  } catch (error) {
    console.error('Error inviting user:', error);
    status.value = t('household.invitation-failed');
    isSuccess.value = false;
  } finally {
    isLoading.value = false;
  }
};

/**
 * Cancels the invitation process and resets the form
 */
const cancel = () => {
  emit('cancel');
  resetForm();
};

/**
 * Resets the form fields to their initial values
 */
const resetForm = () => {
  email.value = '';
};
</script>

<style scoped>
.add-user {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
