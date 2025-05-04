<template>
  <div class="household-container max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ household?.name || t('household.my-household') }}</h1>
      <div class="flex gap-2">
        <Button v-if="showAdminTransferButton" variant="outline" class="flex items-center gap-2" @click="openTransferAdminDialog">
          <UserIcon class="h-4 w-4" />
          <span>{{ t('household.transfer-admin-role') }}</span>
        </Button>
        <DeleteHousehold v-if="isAdmin && hasHousehold" @deleted="refreshHouseholdData" />
        <Button v-if="hasHousehold" variant="outline" class="flex items-center gap-2" @click="showLeaveDialog = true">
          <LogOutIcon class="h-4 w-4" />
          <span>{{ t('household.leave-household') }}</span>
        </Button>
        <Button v-if="hasHousehold" variant="outline" class="flex items-center gap-2" @click="goToGroupPage">
          <UsersIcon class="h-4 w-4" />
          <span>{{ t('group.go-to-groups') }}</span>
        </Button>
      </div>
    </div>

    <!-- User has no household - Show pending invitations and create household option -->
    <div v-if="!hasHousehold" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User invitations -->
      <UserInvitations
        ref="userInvitationsRef"
        @accepted="refreshHouseholdData"
        @declined="refreshHouseholdData"
      />

      <!-- Create household options -->
      <MemberNotInHousehold @household-updated="refreshHouseholdData" />
    </div>

    <!-- User has a household - Show household information -->
    <div v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Left column: Household members and management -->
        <div class="space-y-6">
          <!-- Household members -->
          <HouseholdMembers
            :household-name="household?.name"
            @member-selected="handleMemberSelected"
          />

          <!-- Pending invitations (admin only) -->
          <PendingInvitations v-if="isAdmin" ref="pendingInvitationsRef" />

          <!-- User invitations (non-admin only) -->
          <UserInvitations
            v-if="!isAdmin"
            ref="userInvitationsRef"
            @accepted="refreshHouseholdData"
            @declined="refreshHouseholdData"
          />
        </div>

        <!-- Right column: Stats and shelter store -->
        <div class="space-y-6">
          <!-- Household stats -->
          <HouseholdStats :members="allHouseholdMembers" />

          <!-- Shelter store -->
          <ShelterStore @view-beredskapslager="handleViewBeredskapslager" />
        </div>
      </div>
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
          <div v-if="nonAdminMembers.length === 0" class="text-center py-4 text-muted-foreground">
            {{ t('household.no-members-to-transfer') }}
          </div>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <!-- Non-admin members (selectable) -->
            <div
              v-for="member in nonAdminMembers"
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

            <!-- Admin members (not selectable) -->
            <div
              v-for="member in adminMembers"
              :key="member.id"
              class="flex items-center justify-between p-2 border rounded-md bg-muted/30 opacity-70"
            >
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-full bg-accent/50 flex items-center justify-center">
                  <UserIcon class="h-4 w-4" />
                </div>
                <span>{{ member.firstName ? `${member.firstName} ${member.lastName}` : member.name }}</span>
                <Badge variant="default" class="text-xs ml-1 bg-primary text-primary-foreground">
                  {{ t('household.admin_badge') }}
                </Badge>
              </div>
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
import { onMounted, ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import UserInvitations from '@/components/household/UserInvitations.vue';
import PendingInvitations from '@/components/household/PendingInvitations.vue';
import HouseholdStats from '@/components/household/HouseholdStats.vue';
import DeleteHousehold from '@/components/household/DeleteHousehold.vue';
import { useUserStore } from '@/stores/UserStore';
import {
  getCurrentHousehold,
  leaveHousehold,
  isCurrentUserHouseholdAdmin,
  promoteUserToAdmin,
  getHouseholdMembers,
  getEmptyHouseholdMembers,
  removeEmptyMemberFromHousehold
} from '@/services/HouseholdService';
import { toast } from 'vue-sonner';
// Using direct service calls instead of the store

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore();
// Using direct service calls instead of the store
const hasHousehold = ref(false);
const household = ref<{ id: number; name: string } | null>(null);
const isAdmin = ref(false);
const showLeaveDialog = ref(false);
const showTransferAdminDialog = ref(false);
const showCreateForm = ref(false);
const householdMembers = ref<any[]>([]);
const emptyMembers = ref<any[]>([]);
const userInvitationsRef = ref<InstanceType<typeof UserInvitations> | null>(null);
const pendingInvitationsRef = ref<InstanceType<typeof PendingInvitations> | null>(null);

/**
 * Current user from the user store.
 */
const currentUser = computed(() => userStore.profile);

/**
 * Computed property for all household members (real + empty).
 * @returns {Array} Combined array of regular and empty household members
 */
const allHouseholdMembers = computed(() => {
  return [...householdMembers.value, ...emptyMembers.value];
});

/**
 * Computed property for household members who are not admins.
 * Used for the admin transfer dialog.
 * @returns {Array} Array of household members who are not admins
 */
const nonAdminMembers = computed(() => {
  return householdMembers.value.filter(member => !member.isAdmin);
});

/**
 * Computed property for household members who are admins.
 * Used to display admin badges in the transfer dialog.
 * @returns {Array} Array of household members who are admins
 */
const adminMembers = computed(() => {
  return householdMembers.value.filter(member => member.isAdmin);
});

/**
 * Methods
 */

/**
 * Handles when a member is selected in the HouseholdMembers component.
 * @param {any} member - The selected household member
 */
const handleMemberSelected = (member: any) => {
  console.log('Selected member in parent:', member);
  // Implement member selection logic here
};

/**
 * Handles the event when the user wants to view the beredskapslager (shelter store).
 */
const handleViewBeredskapslager = () => {
  console.log('View beredskapslager in parent');
  // Implement navigation to beredskapslager page
};

/**
 * Refreshes all household data from the backend.
 * Fetches household details, members, and updates invitation components.
 * @async
 */
const refreshHouseholdData = async () => {
  try {
    const householdData = await getCurrentHousehold();
    hasHousehold.value = !!householdData;
    household.value = householdData;

    if (hasHousehold.value) {
      // Check if the current user is an admin
      isAdmin.value = await isCurrentUserHouseholdAdmin();

      // Fetch household members
      const members = await getHouseholdMembers();
      householdMembers.value = members;

      // Fetch empty household members
      const empty = await getEmptyHouseholdMembers();
      emptyMembers.value = empty;

      // Refresh invitations in child components
      if (isAdmin.value && pendingInvitationsRef.value) {
        pendingInvitationsRef.value.refreshInvitations();
      } else if (!isAdmin.value && userInvitationsRef.value) {
        userInvitationsRef.value.refreshInvitations();
      }
    } else {
      // If not in a household, refresh user invitations
      // Use nextTick to ensure the component is mounted
      nextTick(() => {
        if (userInvitationsRef.value) {
          console.log('Refreshing user invitations for user without household');
          userInvitationsRef.value.refreshInvitations();
        }
      });
    }
  } catch (error) {
    console.error('Error fetching household data:', error);
    toast.error(t('household.error-fetching-data'));
  }
};

/**
 * Navigates to the group page.
 */
const goToGroupPage = () => {
  router.push('/group');
};

/**
 * Handles the user leaving their current household.
 * Sends the request to the backend and lets the backend handle validation.
 * @async
 */
const leaveCurrentHousehold = async () => {
  try {
    await leaveHousehold();
    toast.success(t('household.leave-success'));
    showLeaveDialog.value = false;
    await refreshHouseholdData();
  } catch (error: any) {
    console.error('Error leaving household:', error);
    // Check if we have a specific error message from the backend
    if (error.response && error.response.data) {
      // If the error is about being the last admin, show a more specific message
      if (error.response.data.includes('last admin')) {
        toast.error(t('household.leave-last-admin-error'));
      } else {
        toast.error(error.response.data);
      }
    } else {
      toast.error(t('household.leave-error'));
    }
  }
};

/**
 * Opens the dialog for transferring admin role to another household member.
 */
const openTransferAdminDialog = () => {
  showTransferAdminDialog.value = true;
};

/**
 * Promotes the selected member to admin status.
 * @param {any} member - The member to promote to admin
 * @async
 */
const selectMemberForAdminTransfer = async (member: any) => {
  try {
    await promoteUserToAdmin(member.email);
    toast.success(t('household.admin-transferred-success'));
    showTransferAdminDialog.value = false;
    await refreshHouseholdData();
  } catch (error) {
    console.error('Error transferring admin role:', error);
    toast.error(t('household.admin-transferred-error'));
  }
};

/**
 * Computed property to determine if we should show the admin transfer button.
 * Only shown if the user is an admin and is in a household.
 */
const showAdminTransferButton = computed(() => {
  return isAdmin.value && hasHousehold.value;
});

// Fetch household data when the component mounts
onMounted(async () => {
  console.log('HouseholdView mounted');
  await refreshHouseholdData();

  console.log('After refreshHouseholdData - hasHousehold:', hasHousehold.value);
  console.log('userInvitationsRef exists:', !!userInvitationsRef.value);

  // Ensure user invitations are refreshed for users without a household
  if (!hasHousehold.value) {
    console.log('User has no household, should show invitations');
    // Force a small delay to ensure the component is mounted
    setTimeout(() => {
      if (userInvitationsRef.value) {
        console.log('Explicitly refreshing user invitations for user without household');
        userInvitationsRef.value.refreshInvitations();
      } else {
        console.warn('userInvitationsRef is still null after timeout');
      }
    }, 500);
  }
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

  /* Fix buttons on narrow screens */
  .flex.items-center.justify-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .flex.gap-2 {
    flex-wrap: wrap;
    width: 100%;
  }

  .flex.gap-2 > button {
    flex: 1 1 auto;
    min-width: 120px;
  }
}
</style>
