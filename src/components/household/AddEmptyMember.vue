<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ $t('household.add_empty_member') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Name -->
        <div class="space-y-2">
          <Label for="name">{{ $t('household.member_name') }}</Label>
          <Input id="name" v-model="formData.name" :placeholder="$t('household.member_name_placeholder')" required />
        </div>

        <!-- Type -->
        <div class="space-y-2">
          <Label for="type">{{ $t('household.member_type') }}</Label>
          <Select v-model="formData.type">
            <SelectTrigger>
              <SelectValue :placeholder="$t('household.select_member_type')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adult">{{ $t('household.type_adult') }}</SelectItem>
              <SelectItem value="child">{{ $t('household.type_child') }}</SelectItem>
              <SelectItem value="pet">{{ $t('household.type_pet') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">{{ $t('household.description') }}</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            :placeholder="$t('household.description_placeholder')"
            rows="3"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" @click="$emit('cancel')">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ $t('common.save') }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-vue-next';
import { addEmptyMember } from '@/services/HouseholdService';
import { toast } from 'vue-sonner';
import type { EmptyHouseholdMemberCreateDto } from '@/models/Household';

const { t } = useI18n();
const emit = defineEmits(['added', 'cancel']);
const isSubmitting = ref(false);

const formData = ref<EmptyHouseholdMemberCreateDto>({
  name: '',
  type: 'adult', // Already lowercase to match backend expectations
  description: ''
});

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.type) {
    toast.error(t('household.required_fields'));
    return;
  }

  isSubmitting.value = true;
  try {
    // Convert type to lowercase before sending to backend
    const dataToSend = {
      ...formData.value,
      type: formData.value.type.toLowerCase()
    };
    const result = await addEmptyMember(dataToSend);
    toast.success(t('household.member_added_success'));
    emit('added', result);
  } catch (error) {
    console.error('Error adding empty member:', error);
    toast.error(t('household.member_added_error'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>
