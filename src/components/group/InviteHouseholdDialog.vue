<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('group.invite-household-title') }}</DialogTitle>
        <DialogDescription>
          {{ t('group.invite-household-description') }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="householdName" class="text-right">
            {{ t('group.household-name') }}
          </Label>
          <Input
            id="householdName"
            v-model="householdName"
            class="col-span-3"
            :placeholder="t('group.enter-household-name')"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          @click="closeDialog"
        >
          {{ t('common.cancel') }}
        </Button>
        <Button
          :disabled="!householdName.trim() || isSending"
          @click="sendInvitation"
          :class="{ 'opacity-50 cursor-not-allowed': isSending }"
        >
          <Loader2 v-if="isSending" class="mr-2 h-4 w-4 animate-spin" />
          {{ t('group.send-invitation') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { Loader2 } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendGroupInvitation } from '@/services/InvitationService';

const { t } = useI18n();
const props = defineProps<{
  open: boolean;
  groupId: number;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'invitation-sent': [];
}>();

const householdName = ref('');
const isSending = ref(false);

/**
 * Sends a group invitation to the specified household
 */
const sendInvitation = async () => {
  if (!householdName.value.trim() || isSending.value) return;

  isSending.value = true;
  try {
    await sendGroupInvitation(householdName.value.trim(), props.groupId);
    toast.success(t('group.invitation-sent-success'));
    emit('invitation-sent');
    closeDialog();
  } catch (error) {
    console.error('Error sending group invitation:', error);

    // Handle different error types for better user feedback
    if (error instanceof Error) {
      toast.error(error.message);
    } else if (typeof error === 'object' && error !== null && 'response' in error) {
      const errorResponse = error as { response?: { data?: string } };
      if (errorResponse.response?.data) {
        toast.error(errorResponse.response.data);
      } else {
        toast.error(t('group.invitation-error'));
      }
    } else {
      toast.error(t('group.invitation-error'));
    }
  } finally {
    isSending.value = false;
  }
};

/**
 * Closes the dialog and resets the form
 */
const closeDialog = () => {
  householdName.value = '';
  emit('update:open', false);
};
</script>
