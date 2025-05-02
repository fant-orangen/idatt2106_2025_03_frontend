<template>
  <div class="household-container">
    <!-- Show when user has no household -->
    <MemberNotInHousehold v-if="false" @household-updated="refreshHouseholdData" />

    <!-- Show when user has a household -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <HouseholdMembers @member-selected="handleMemberSelected" />
      <ShelterStore @view-beredskapslager="handleViewBeredskapslager" />
    </div>
  </div>

  <!-- Navigate to groups -->
  <button
      @click="goToGroupPage"
      class="ml-4 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
  >
    {{ t('group.go-to-groups') }}
  </button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const router = useRouter()

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

const goToGroupPage = () => {
  router.push('/group')
}


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
