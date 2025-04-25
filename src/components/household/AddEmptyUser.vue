<template>
  <div class="add-empty-user">
    <form @submit.prevent="saveUser">
      <div class="space-y-4">
        <!-- Name field -->
        <div>
          <Label for="name">Name</Label>
          <Input id="name" v-model="newUser.firstName" placeholder="Enter name" required />
        </div>

        <!-- Last name field -->
        <div>
          <Label for="lastName">Last Name</Label>
          <Input id="lastName" v-model="newUser.lastName" placeholder="Enter last name" required />
        </div>

        <!-- Type selection -->
        <div>
          <Label for="type">Type</Label>
          <Select v-model="newUser.type">
            <SelectTrigger id="type" class="w-full">
              <SelectValue :placeholder="newUser.type || 'Select type'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adult">Adult</SelectItem>
              <SelectItem value="child">Child</SelectItem>
              <SelectItem value="pet">Pet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Description field -->
        <div>
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="newUser.description"
            placeholder="Additional information"
            rows="3"
          />
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <Button type="submit" variant="default">Save</Button>
          <Button type="button" variant="outline" @click="cancel">Cancel</Button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface NewUser {
  firstName: string;
  lastName: string;
  type: string;
  description: string;
}

const emit = defineEmits(['save', 'cancel']);

const newUser = ref<NewUser>({
  firstName: '',
  lastName: '',
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
    firstName: '',
    lastName: '',
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
