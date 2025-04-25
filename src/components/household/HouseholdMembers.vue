<template>
  <Card class="household-members">
    <CardHeader>
      <CardTitle>{{ $t('household.my-household') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Scrollable list of household members -->
      <div class="scrollable-container">
        <div v-if="householdMembers.length === 0" class="text-center text-gray-500">
          {{ $t('household.no-members-found') }}
        </div>
        <div v-else>
          <Button
            v-for="member in householdMembers"
            :key="member.id"
            variant="outline"
            class="w-full mb-2 justify-start"
            @click="selectMember(member)"
          >
            <div class="flex items-center gap-2 w-full">
              <!-- Icon based on member type -->
              <span class="flex-shrink-0">
                <UserIcon v-if="member.type === 'adult'" class="h-4 w-4" />
                <BabyIcon v-else-if="member.type === 'child'" class="h-4 w-4" />
                <PawPrintIcon v-else-if="member.type === 'pet'" class="h-4 w-4" />
              </span>
              <!-- Member name -->
              <span>{{ member.firstName }} {{ member.lastName }}</span>
            </div>
          </Button>
        </div>
      </div>

      <!-- Household count -->
      <div class="mt-4 text-sm text-gray-500">
        {{ householdMembers.length }} {{ householdMembers.length === 1 ? $t('household.person') : $t('household.people') }} {{ $t('household.in-household') }}
      </div>

      <!-- Add empty user button -->
      <Button variant="outline" class="mt-4 w-full" @click="addEmptyUser">
        {{ $t('household.add-empty-user') }}
      </Button>

      <AddEmptyUser
        v-if="showAddUser"
        @save="handleSaveUser"
        @cancel="showAddUser = false"
      />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AddEmptyUser from './AddEmptyUser.vue';
import { BabyIcon, PawPrintIcon, UserIcon } from 'lucide-vue-next';
useI18n();

interface HouseholdMember {
  id: number;
  firstName: string;
  lastName: string;
  type: string;
}

const emit = defineEmits(['memberSelected']);
const showAddUser = ref(false);

const householdMembers = ref<HouseholdMember[]>([]);

// Mock data for demonstration (replace with actual API calls)
onMounted(() => {
  // Simulate fetching household members from backend
  householdMembers.value = [
    { id: 1, firstName: 'John', lastName: 'Doe', type: 'adult' },
    { id: 2, firstName: 'Jane', lastName: 'Doe', type: 'child'  },
    { id: 3, firstName: 'Alice', lastName: 'Smith', type: 'pet' },
  ];
});

// Methods
const selectMember = (member: HouseholdMember) => {
  console.log('Selected member:', member);
  // Emit event to parent component
  emit('memberSelected', member);
};

const addEmptyUser = () => {
  showAddUser.value = true;
};
const handleSaveUser = (userData) => {
  const newId = householdMembers.value.length > 0
    ? Math.max(...householdMembers.value.map(m => m.id)) + 1
    : 1;

  householdMembers.value.push({
    id: newId,
    firstName: userData.firstName,
    lastName: userData.lastName,
    type: userData.type,
    description: userData.description
  });

  showAddUser.value = false;
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
