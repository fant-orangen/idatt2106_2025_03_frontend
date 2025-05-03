<template>
  <div class="household-container max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ household?.name || t('household.my-household') }}</h1>
      <div class="flex gap-2">
        <Button v-if="showAdminTransferButton" variant="outline" class="flex items-center gap-2" @click="openTransferAdminDialog">
          <UserIcon class="h-4 w-4" />
          <span>{{ t('household.transfer-admin-role') }}</span>
        </Button>
        <Button v-if="hasHousehold" variant="outline" class="flex items-center gap-2" @click="showLeaveDialog = true">
          <LogOutIcon class="h-4 w-4" />
          <span>{{ t('household.leave-household') }}</span>
        </Button>
        <Button variant="outline" class="flex items-center gap-2" @click="goToGroupPage">
          <UsersIcon class="h-4 w-4" />
          <span>{{ t('group.go-to-groups') }}</span>
        </Button>
      </div>
    </div>

    <!-- Show when user has no household -->
    <MemberNotInHousehold v-if="!hasHousehold" @household-updated="refreshHouseholdData" />

    <!-- Show when user has a household -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HouseholdMembers
        :household-name="household?.name"
        @member-selected="handleMemberSelected"
      />
      <ShelterStore @view-beredskapslager="handleViewBeredskapslager" />
    </div>

    <!-- Leave Household Dialog -->
    <Dialog :open="showLeaveDialog" @update:open="showLeaveDialog = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('household.leave-confirm-title') }}</DialogTitle>
          <DialogDescription>
            {{ t('household.leave-confirm') }}
          </DialogDescription>
        </DialogHeader>
        <div v-if="isAdmin" class="py-4 text-destructive">
          <p>{{ t('household.leave-admin-warning') }}</p>
          <p class="mt-2">{{ t('household.transfer-admin-first') }}</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showLeaveDialog = false">{{ t('common.cancel') }}</Button>
          <Button
            variant="destructive"
            @click="leaveCurrentHousehold"
            :disabled="isAdmin"
          >
            {{ t('household.leave-household') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Transfer Admin Role Dialog -->
    <Dialog :open="showTransferAdminDialog" @update:open="showTransferAdminDialog = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('household.transfer-admin-title') }}</DialogTitle>
          <DialogDescription>
            {{ t('household.transfer-admin-description') }}
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <div v-if="householdMembers.length === 0" class="text-center py-4 text-muted-foreground">
            {{ t('household.no-members-to-transfer') }}
          </div>
          <div v-else class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="member in householdMembers"
              :key="member.id"
              class="flex items-center justify-between p-2 border rounded-md hover:bg-accent/20 cursor-pointer"
              @click="selectMemberForAdminTransfer(member)"
            >
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-full bg-accent/50 flex items-center justify-center">
                  <UserIcon class="h-4 w-4" />
                </div>
                <span>{{ member.firstName ? `${member.firstName} ${member.lastName}` : member.name }}</span>
              </div>
              <ChevronRightIcon class="h-4 w-4" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showTransferAdminDialog = false">{{ t('common.cancel') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { UsersIcon, LogOutIcon, UserIcon, ChevronRightIcon } from 'lucide-vue-next';
import HouseholdMembers from '@/components/household/HouseholdMembers.vue';
import ShelterStore from '@/components/household/ShelterStore.vue';
import MemberNotInHousehold from '@/components/household/MemberNotInHousehold.vue';
import {
  getCurrentHousehold,
  leaveHousehold,
  isCurrentUserHouseholdAdmin,
  transferAdminRole,
  getHouseholdMembers
} from '@/services/HouseholdService';
import { toast } from 'vue-sonner';
import { useHouseholdStore } from '@/stores/HouseholdStore';

const { t } = useI18n()
const router = useRouter()
const householdStore = useHouseholdStore();
const hasHousehold = ref(false);
const household = ref<{ id: number; name: string } | null>(null);
const isAdmin = ref(false);
const showLeaveDialog = ref(false);
const showTransferAdminDialog = ref(false);
const householdMembers = ref<any[]>([]);

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
  try {
    const householdData = await getCurrentHousehold();
    hasHousehold.value = !!householdData;
    household.value = householdData;

    if (hasHousehold.value) {
      // Check if the current user is an admin
      isAdmin.value = await isCurrentUserHouseholdAdmin();

      // If admin, fetch household members for potential admin transfer
      if (isAdmin.value) {
        const members = await getHouseholdMembers();
        // Filter out the current user and empty members
        householdMembers.value = members.filter(member =>
          member.id && member.email && member.id !== parseInt(householdStore.currentHousehold?.id?.toString() || '0')
        );
      }
    }
  } catch (error) {
    console.error('Error fetching household data:', error);
    toast.error(t('household.error-fetching-data'));
  }
};

const goToGroupPage = () => {
  router.push('/group');
};

const leaveCurrentHousehold = async () => {
  try {
    await leaveHousehold();
    toast.success(t('household.leave-success'));
    showLeaveDialog.value = false;
    await refreshHouseholdData();
  } catch (error) {
    console.error('Error leaving household:', error);
    toast.error(t('household.leave-error'));
  }
};

const openTransferAdminDialog = () => {
  showTransferAdminDialog.value = true;
};

const selectMemberForAdminTransfer = async (member: HouseholdMember) => {
  try {
    await transferAdminRole(member.id!);
    toast.success(t('household.admin-transferred-success'));
    showTransferAdminDialog.value = false;
    await refreshHouseholdData();
  } catch (error) {
    console.error('Error transferring admin role:', error);
    toast.error(t('household.admin-transferred-error'));
  }
};

// Computed property to determine if we should show the admin transfer button
const showAdminTransferButton = computed(() => {
  return isAdmin.value && hasHousehold.value;
});

// Fetch household data when the component mounts
onMounted(async () => {
  await refreshHouseholdData();
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
