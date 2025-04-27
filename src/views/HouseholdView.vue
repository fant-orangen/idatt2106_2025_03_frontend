<template>
  <div class="household-container">
    <!-- Show when user has no household -->
    <MemberNotInHousehold v-if="!householdStore.isMemberOfHousehold" @household-updated="refreshHouseholdData" />

    <!-- Show when user has a household -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <HouseholdMembers @member-selected="handleMemberSelected" />
      <ShelterStore @view-beredskapslager="handleViewBeredskapslager" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useHouseholdStore } from '@/stores/HouseholdStore';
import HouseholdMembers from '@/components/household/HouseholdMembers.vue';
import ShelterStore from '@/components/household/ShelterStore.vue';
import MemberNotInHousehold from '@/components/household/MemberNotInHousehold.vue';

const householdStore = useHouseholdStore();

// Types
interface HouseholdMember {
  id: number;
  firstName: string;
  lastName: string;
}

// Methods
const handleMemberSelected = (member: HouseholdMember) => {
  console.log('Selected member in parent:', member);
  // Implement member selection logic here
};

const handleViewBeredskapslager = () => {
  console.log('View beredskapslager in parent');
  // Implement navigation to beredskapslager page
};

const refreshHouseholdData = async () => {
  await householdStore.fetchCurrentHousehold();
};

// Fetch household data when the component mounts
onMounted(async () => {
  await householdStore.fetchCurrentHousehold();
});
</script>

<style scoped>
.household-container {
  padding: 1rem;
}
</style>
