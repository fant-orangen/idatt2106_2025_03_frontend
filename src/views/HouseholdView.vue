<template>
  <div class="household-container max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ t('household.my-household') }}</h1>
      <Button variant="outline" class="flex items-center gap-2" @click="goToGroupPage">
        <UsersIcon class="h-4 w-4" />
        <span>{{ t('group.go-to-groups') }}</span>
      </Button>
    </div>

    <!-- Show when user has no household -->
    <MemberNotInHousehold v-if="false" @household-updated="refreshHouseholdData" />

    <!-- Show when user has a household -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HouseholdMembers @member-selected="handleMemberSelected" />
      <ShelterStore @view-beredskapslager="handleViewBeredskapslager" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button';
import { UsersIcon } from 'lucide-vue-next';
import { useHouseholdStore } from '@/stores/HouseholdStore';
import HouseholdMembers from '@/components/household/HouseholdMembers.vue';
import ShelterStore from '@/components/household/ShelterStore.vue';
import MemberNotInHousehold from '@/components/household/MemberNotInHousehold.vue';

const { t } = useI18n()
const router = useRouter()

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
  min-height: calc(100vh - 64px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .household-container {
    padding: 1rem;
  }
}
</style>
