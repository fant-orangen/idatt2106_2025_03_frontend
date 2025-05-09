<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('group.leave-group-title') }}</DialogTitle>
        <DialogDescription>
          {{ t('group.leave-group-confirmation') || 'Er du sikker på at du vil forlate denne gruppen?' }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          @click="$emit('update:open', false)"
        >
          {{ t('common.cancel') }}
        </Button>
        <Button
          variant="destructive"
          @click="confirmLeave"
        >
          {{ t('group.leave-group') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const { t } = useI18n();
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'confirm': [];
}>();

/**
 * Confirms leaving the group and closes the dialog
 */
const confirmLeave = () => {
  emit('confirm');
  emit('update:open', false);
};
</script>
