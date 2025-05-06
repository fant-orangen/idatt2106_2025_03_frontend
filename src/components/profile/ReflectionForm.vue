<template>
  <Form :validation-schema="reflectionSchema" @submit="onSubmit" v-slot="{ errors }">
    <div class="grid gap-4">
      <!-- Crisis Event Info (if provided) -->
      <div v-if="reflection?.crisisEventId && !isEditing" class="grid gap-2">
        <label class="text-sm font-medium leading-none">{{ t('reflect.crisis-event') }}</label>
        <div class="p-2 border rounded-md bg-muted/20">
          <p class="text-sm">
            {{ t('reflect.reflection-for-crisis') }}
            <span v-if="crisisEventName" class="font-medium">{{ crisisEventName }}</span>
          </p>
        </div>
      </div>

      <!-- Reflection Content -->
      <FormField v-slot="{ componentField }" name="content">
        <FormItem>
          <FormLabel>{{ t('reflect.content') }}</FormLabel>
          <FormControl>
            <Textarea
              v-bind="componentField"
              v-model="content"
              :placeholder="t('reflect.content-placeholder')"
              class="min-h-[150px]"
              :class="{ 'border-destructive': errors.content }"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Sharing Options -->
      <div class="grid gap-2">
        <label class="text-sm font-medium leading-none">{{ t('reflect.sharing-options') }}</label>
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="share-reflection"
            v-model="isShared"
            class="h-4 w-4 rounded border-border text-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <label
            for="share-reflection"
            class="text-sm font-medium leading-none cursor-pointer"
            @click="isShared = !isShared"
          >
            {{ t('reflect.share-with-community') }} ({{ isShared ? 'Yes' : 'No' }})
          </label>
        </div>
        <div class="flex items-center space-x-2">
          <Button type="button" size="sm" @click="toggleShared">Toggle Shared ({{ isShared }})</Button>
        </div>
        <p class="text-sm text-muted-foreground">
          {{ t('reflect.sharing-description-simple') }}
        </p>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" @click="$emit('cancel')">
          {{ t('common.cancel') }}
        </Button>
        <Button type="submit" :disabled="isSubmitting">
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ isEditing ? t('common.save') : t('reflect.create') }}
        </Button>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
/**
 * @component ReflectionForm
 * @description Form component for creating and editing reflections.
 * Allows users to enter reflection content, select a crisis event, and choose sharing options.
 * Validates input and emits events for saving or canceling.
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { Form } from 'vee-validate';
import { Loader2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// Using native checkbox instead of component
// Select components removed as we no longer need the dropdown
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { ReflectionResponseDto, CreateReflectionDto, UpdateReflectionDto } from '@/models/Reflection';
// Crisis event imports removed as we no longer fetch crisis events

const { t } = useI18n();

// Props
const props = defineProps<{
  reflection: Partial<ReflectionResponseDto> | null;
  isEditing: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'save', data: CreateReflectionDto | UpdateReflectionDto): void;
  (e: 'cancel'): void;
}>();

// Form state
const content = ref('');
const isShared = ref(false);
const selectedCrisisId = ref<number | null>(null);
const isSubmitting = ref(false);
const crisisEventName = ref<string>('');

// Validation schema
const reflectionSchema = toTypedSchema(
  z.object({
    content: z.string().min(1, t('reflect.content-required')),
  })
);

// Initialize form with reflection data if editing
watch(() => props.reflection, (newValue) => {
  if (newValue) {
    content.value = newValue.content || '';
    isShared.value = newValue.shared || false;
    selectedCrisisId.value = newValue.crisisEventId || null;
  }
}, { immediate: true });

// Fetch crisis event name if we have an ID
const fetchCrisisEventName = async (crisisId: number) => {
  try {
    // This would typically call an API to get the crisis event name
    // For now, we'll just set a placeholder
    crisisEventName.value = t('reflect.selected-crisis');
  } catch (error) {
    console.error('Error fetching crisis event name:', error);
    crisisEventName.value = t('reflect.unknown-crisis');
  }
};

// Toggle the shared value
const toggleShared = () => {
  isShared.value = !isShared.value;
  console.log('Toggled isShared to:', isShared.value);
};

// Form submission handler
const onSubmit = () => {
  isSubmitting.value = true;

  try {
    // Force isShared to be a boolean
    const sharedValue = isShared.value === true;
    console.log('isShared.value:', isShared.value, 'type:', typeof isShared.value);
    console.log('sharedValue:', sharedValue, 'type:', typeof sharedValue);

    const formData: CreateReflectionDto | UpdateReflectionDto = {
      content: content.value,
      shared: sharedValue
    };
    console.log('formData:', formData);

    // Add crisis event ID if it was provided in the reflection prop
    if (!props.isEditing && props.reflection?.crisisEventId) {
      (formData as CreateReflectionDto).crisisEventId = props.reflection.crisisEventId;
    }

    emit('save', formData);
  } catch (error) {
    console.error('Form submission error:', error);
    toast.error(t('reflect.form-error'));
  } finally {
    isSubmitting.value = false;
  }
};

// Fetch crisis event name if we have an ID
onMounted(() => {
  if (props.reflection?.crisisEventId) {
    fetchCrisisEventName(props.reflection.crisisEventId);
  }
});
</script>
