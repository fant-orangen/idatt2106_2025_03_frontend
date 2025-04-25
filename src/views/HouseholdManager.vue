<template>
  <div class="household-container">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left side: Household members component -->
      <HouseholdMembers @member-selected="handleMemberSelected" />

      <!-- Right side: Shelter store component -->
      <ShelterStore @view-beredskapslager="handleViewBeredskapslager" />
    </div>
  </div>
</template>

<script setup lang="ts">
import HouseholdMembers from '@/components/household/HouseholdMembers.vue';
import ShelterStore from '@/components/household/ShelterStore.vue';

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
</script>

<style scoped>
.household-container {
  padding: 1rem;
}
</style>
