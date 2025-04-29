<template>
  <div class="add-empty-user">
    <form @submit.prevent="saveUser">
      <div class="space-y-4">
        <!-- Name field -->
        <div>
          <Label for="name">{{ $t('household.name') }}</Label>
          <Input id="name" v-model="newUser.name" :placeholder="$t('household.enter-name')" required />
        </div>

        <!-- Type selection -->
        <div>
          <Label for="type">{{ $t('household.type') }}</Label>
          <Select v-model="newUser.type">
            <SelectTrigger id="type" class="w-full">
              <SelectValue :placeholder="newUser.type || $t('household.select-type')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adult">{{ $t('household.adult') }}</SelectItem>
              <SelectItem value="child">{{ $t('household.child') }}</SelectItem>
              <SelectItem value="pet">{{ $t('household.pet') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Description field -->
        <div>
          <Label for="description">{{ $t('household.description') }}</Label>
          <Textarea
            id="description"
            v-model="newUser.description"
            :placeholder="$t('household.additional-info')"
            rows="3"
          />
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <Button type="submit" variant="default">{{ $t('household.save') }}</Button>
          <Button type="button" variant="outline" @click="cancel">{{ $t('household.cancel') }}</Button>
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// Initialize i18n
useI18n();

interface NewUser {
  name: string;
  type: string;
  description: string;
}

const emit = defineEmits(['save', 'cancel']);

const newUser = ref<NewUser>({
  name: '',
  type: 'adult', // Default value
  description: ''
});

const saveUser = () => {
  emit('save', { ...newUser.value });
  resetForm();
};

const cancel = () => {
  emit('cancel');
  resetForm();
};

const resetForm = () => {
  newUser.value = {
    name: '',
    type: 'adult',
    description: ''
  };
};
</script>

<style scoped>
.add-empty-user {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
