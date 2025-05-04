<template>
  <Button 
    variant="destructive" 
    size="sm" 
    class="flex items-center gap-1"
    @click="showConfirmDialog = true"
  >
    <TrashIcon class="h-4 w-4" />
    {{ $t('household.delete_household') }}
  </Button>

  <Dialog :open="showConfirmDialog" @update:open="showConfirmDialog = $event">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('household.confirm_delete_title') }}</DialogTitle>
        <DialogDescription>
          {{ $t('household.confirm_delete_description') }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <p class="text-destructive font-medium">{{ $t('household.delete_warning') }}</p>
        <p class="mt-2 text-sm text-muted-foreground">{{ $t('household.delete_permanent') }}</p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showConfirmDialog = false">
          {{ $t('common.cancel') }}
        </Button>
        <Button 
          variant="destructive" 
          @click="handleDelete"
          :disabled="isDeleting"
        >
          <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
          {{ $t('household.confirm_delete') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { TrashIcon, Loader2 } from 'lucide-vue-next';
import { deleteHousehold } from '@/services/HouseholdService';
import { toast } from 'vue-sonner';

const { t } = useI18n();
const emit = defineEmits(['deleted']);

const showConfirmDialog = ref(false);
const isDeleting = ref(false);

const handleDelete = async () => {
  isDeleting.value = true;
  try {
    await deleteHousehold();
    toast.success(t('household.delete_success'));
    showConfirmDialog.value = false;
    emit('deleted');
  } catch (error) {
    console.error('Error deleting household:', error);
    toast.error(t('household.delete_error'));
  } finally {
    isDeleting.value = false;
  }
};
</script>
