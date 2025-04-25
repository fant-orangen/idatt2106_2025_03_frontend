<template>
  <div class="add-user">
    <form @submit.prevent="inviteUser">
      <div class="space-y-4">
        <!-- Email field -->
        <div>
          <Label for="email">{{ $t('household.email-address') }}</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            :placeholder="$t('household.enter-email')"
            required
          />
        </div>
        <!-- Personal message -->
        <div>
          <Label for="message">{{ $t('household.personal-message') }}</Label>
          <Textarea
            id="message"
            v-model="message"
            :placeholder="$t('household.optional-message')"
            rows="3"
          />
        </div>

        <div class="flex justify-between">
          <!-- Status message -->
          <div v-if="status" :class="{'text-green-600': isSuccess, 'text-red-600': !isSuccess}" class="text-sm">
            {{ status }}
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <Button type="submit" variant="default" :disabled="isLoading">
            <span v-if="isLoading" class="mr-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ $t('household.send-invitation') }}
          </Button>
          <Button type="button" variant="outline" @click="cancel">
            {{ $t('household.cancel') }}
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const { t } = useI18n();
const emit = defineEmits(['invited', 'cancel']);

const email = ref('');
const message = ref('');
const isLoading = ref(false);
const status = ref('');
const isSuccess = ref(false);

const inviteUser = async () => {
  if (!email.value) return;

  isLoading.value = true;
  status.value = '';

  try {
    // Here you would make an API call to send the invitation
    // Example:
    // await userService.inviteToHousehold({
    //   email: email.value,
    //   accessLevel: accessLevel.value,
    //   message: message.value
    // });

    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 1000));

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

const cancel = () => {
  emit('cancel');
  resetForm();
};

const resetForm = () => {
  email.value = '';
  message.value = '';
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
