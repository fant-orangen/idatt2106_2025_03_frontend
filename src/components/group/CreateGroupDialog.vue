<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('group.create-group-title') }}</DialogTitle>
        <DialogDescription>
          {{ t('group.create-group-description') }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="groupName" class="text-right">
            {{ t('group.group-name') }}
          </Label>
          <Input
            id="groupName"
            v-model="groupName"
            class="col-span-3"
            :placeholder="t('group.enter-group-name')"
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
          :disabled="!groupName.trim() || isCreating"
          @click="createNewGroup"
          :class="{ 'opacity-50 cursor-not-allowed': isCreating }"
        >
          <Loader2 v-if="isCreating" class="mr-2 h-4 w-4 animate-spin" />
          {{ t('group.create') }}
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
import { groupService } from '@/services/api/GroupService';

const { t } = useI18n();

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'group-created': [];
}>();

const groupName = ref('');
const isCreating = ref(false);

/**
 * Creates a new group with the specified name
 */
const createNewGroup = async () => {
  if (!groupName.value.trim() || isCreating.value) return;

  isCreating.value = true;
  try {
    await groupService.createGroup(groupName.value.trim());
    toast.success(t('group.group-created-success'));
    emit('group-created');
    closeDialog();
  } catch (error) {
    console.error('Error creating group:', error);

    // Handle different error types for better user feedback
    if (error instanceof Error) {
      toast.error(error.message);
    } else if (typeof error === 'object' && error !== null && 'response' in error) {
      const errorResponse = error as { response?: { data?: string } };
      if (errorResponse.response?.data) {
        toast.error(errorResponse.response.data);
      } else {
        toast.error(t('group.group-created-error'));
      }
    } else {
      toast.error(t('group.group-created-error'));
    }
  } finally {
    isCreating.value = false;
  }
};

/**
 * Closes the dialog and resets the form
 */
const closeDialog = () => {
  groupName.value = '';
  emit('update:open', false);
};
</script>
