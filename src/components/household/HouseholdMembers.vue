<template>
  <Card class="household-members">
    <CardHeader>
      <CardTitle>My Household</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Scrollable list of household members -->
      <div class="scrollable-container">
        <div v-if="householdMembers.length === 0" class="text-center text-gray-500">
          No household members found.
        </div>
        <div v-else>
          <Button
            v-for="member in householdMembers"
            :key="member.id"
            variant="outline"
            class="w-full mb-2 justify-start"
            @click="selectMember(member)"
          >
            {{ member.firstName }} {{ member.lastName }}
          </Button>
        </div>
      </div>

      <!-- Household count -->
      <div class="mt-4 text-sm text-gray-500">
        {{ householdMembers.length }} {{ householdMembers.length === 1 ? 'person' : 'people' }} in household
      </div>

      <!-- Add empty user button -->
      <Button variant="outline" class="mt-4 w-full" @click="addEmptyUser">
        Add Empty User
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Types
interface HouseholdMember {
  id: number;
  firstName: string;
  lastName: string;
}

// Props and emits
const emit = defineEmits(['memberSelected']);

// State
const householdMembers = ref<HouseholdMember[]>([]);

// Mock data for demonstration (replace with actual API calls)
onMounted(() => {
  // Simulate fetching household members from backend
  householdMembers.value = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Doe' },
    { id: 3, firstName: 'Alice', lastName: 'Smith' },
  ];
});

// Methods
const selectMember = (member: HouseholdMember) => {
  console.log('Selected member:', member);
  // Emit event to parent component
  emit('memberSelected', member);
};

const addEmptyUser = () => {
  const newId = householdMembers.value.length > 0
    ? Math.max(...householdMembers.value.map(m => m.id)) + 1
    : 1;

  householdMembers.value.push({
    id: newId,
    firstName: 'New',
    lastName: 'User'
  });
};
</script>

<style scoped>
.scrollable-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
}
</style>
