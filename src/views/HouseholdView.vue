<template>
  <div class="household-container max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold">{{ household?.name || t('household.my-household') }}</h1>
          <Button
            v-if="isAdmin && hasHousehold"
            variant="ghost"
            size="sm"
            class="h-7 w-7 rounded-full"
            @click="openEditHouseholdDialog"
          >
            <PencilIcon class="h-4 w-4" />
          </Button>
        </div>
        <p v-if="household?.address" class="text-sm text-muted-foreground mt-1">{{ household.address }}</p>
      </div>
      <div class="flex gap-2">
        <!-- Delete button moved to edit dialog -->
        <Button v-if="showAdminTransferButton" variant="outline" class="flex items-center gap-2" @click="openTransferAdminDialog">
          <UserIcon class="h-4 w-4" />
          <span>{{ t('household.transfer-admin-role') }}</span>
        </Button>
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
            <!-- Household members -->
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
                <span>{{ member.firstName ? `${member.firstName} ${member.lastName}` : member.email }}</span>
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

    <!-- Edit Household Dialog -->
    <Dialog :open="showEditHouseholdDialog" @update:open="showEditHouseholdDialog = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('household.edit-household') }}</DialogTitle>
          <DialogDescription>
            {{ t('household.edit-household-description') }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="updateHouseholdDetails" class="space-y-4">
          <div class="space-y-2">
            <Label for="householdName">{{ t('household.name') }}</Label>
            <Input
              id="householdName"
              v-model="editHouseholdData.name"
              :placeholder="t('household.name-placeholder')"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="householdAddress">{{ t('household.address') }}</Label>
            <Input
              id="householdAddress"
              v-model="editHouseholdData.address"
              :placeholder="t('household.address-placeholder')"
              required
            />
          </div>
          <DialogFooter>
            <div class="flex w-full justify-between items-center">
              <Button
                variant="destructive"
                type="button"
                class="flex items-center gap-2"
                @click="showConfirmDeleteDialog = true"
              >
                <TrashIcon class="h-4 w-4" />
                {{ t('household.delete_household') }}
              </Button>
              <div class="flex gap-2">
                <Button variant="ghost" type="button" @click="showEditHouseholdDialog = false">{{ t('common.cancel') }}</Button>
                <Button type="submit" :disabled="isUpdatingHousehold">
                  <Loader2 v-if="isUpdatingHousehold" class="mr-2 h-4 w-4 animate-spin" />
                  {{ t('common.save') }}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Household Confirmation Dialog -->
    <Dialog :open="showConfirmDeleteDialog" @update:open="showConfirmDeleteDialog = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('household.confirm_delete_title') }}</DialogTitle>
          <DialogDescription>
            {{ t('household.confirm_delete_description') }}
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <p class="text-destructive font-medium">{{ t('household.delete_warning') }}</p>
          <p class="mt-2 text-sm text-muted-foreground">{{ t('household.delete_permanent') }}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showConfirmDeleteDialog = false">{{ t('common.cancel') }}</Button>
          <Button
            variant="destructive"
            @click="handleDeleteHousehold"
            :disabled="isDeletingHousehold"
          >
            <Loader2 v-if="isDeletingHousehold" class="mr-2 h-4 w-4 animate-spin" />
            {{ t('household.confirm_delete') }}
          </Button>
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {HouseholdMember} from '@/models/Household';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { UsersIcon, LogOutIcon, UserIcon, ChevronRightIcon, PencilIcon, Loader2, TrashIcon } from 'lucide-vue-next';
import HouseholdMembers from '@/components/household/HouseholdMembers.vue';
import ShelterStore from '@/components/household/ShelterStore.vue';
import MemberNotInHousehold from '@/components/household/MemberNotInHousehold.vue';
import UserInvitations from '@/components/household/UserInvitations.vue';
import PendingInvitations from '@/components/household/PendingInvitations.vue';
import HouseholdStats from '@/components/household/HouseholdStats.vue';
// DeleteHousehold component no longer used - functionality integrated into edit dialog
import { useUserStore } from '@/stores/UserStore';
import {
  getCurrentHousehold,
  leaveHousehold,
  isCurrentUserHouseholdAdmin,
  promoteUserToAdmin,
  getHouseholdMembers,
  getEmptyHouseholdMembers,
  removeEmptyMemberFromHousehold,
  getNonAdminHouseholdMembers,
  updateHousehold,
  deleteHousehold
} from '@/services/HouseholdService'
import { toast } from 'vue-sonner';
// Using direct service calls instead of the store

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore();
// Using direct service calls instead of the store
const hasHousehold = ref(false);
const household = ref<{ id: number; name: string; address?: string } | null>(null);
const isAdmin = ref(false);
const showLeaveDialog = ref(false);
const showEditHouseholdDialog = ref(false);
const isUpdatingHousehold = ref(false);
const showConfirmDeleteDialog = ref(false);
const isDeletingHousehold = ref(false);
const editHouseholdData = ref({
  name: '',
  address: ''
});
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
 * Non-admin members of the household.
 * Used for the admin transfer dialog.
 * @type {Ref<HouseholdMember[]>}
 */
const nonAdminMembers = ref<HouseholdMember[]>([]);

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
 * Opens the edit household dialog and populates it with current household data
 */
const openEditHouseholdDialog = () => {
  if (household.value) {
    editHouseholdData.value.name = household.value.name || '';
    editHouseholdData.value.address = household.value.address || '';
    showEditHouseholdDialog.value = true;
  }
};

/**
 * Updates the household details with the data from the edit form
 * @async
 */
const updateHouseholdDetails = async () => {
  if (!isAdmin.value || !household.value) return;

  isUpdatingHousehold.value = true;
  try {
    await updateHousehold({
      name: editHouseholdData.value.name.trim(),
      address: editHouseholdData.value.address.trim()
    });

    // Update local data
    await refreshHouseholdData();
    showEditHouseholdDialog.value = false;
    toast.success(t('household.update-success'));
  } catch (error) {
    console.error('Error updating household:', error);
    toast.error(t('household.update-error'));
  } finally {
    isUpdatingHousehold.value = false;
  }
};

/**
 * Handles the household deletion process
 * @async
 */
const handleDeleteHousehold = async () => {
  if (!isAdmin.value) return;

  isDeletingHousehold.value = true;
  try {
    await deleteHousehold();
    toast.success(t('household.delete_success'));
    showConfirmDeleteDialog.value = false;
    showEditHouseholdDialog.value = false;
    await refreshHouseholdData();
  } catch (error: any) {
    console.error('Error deleting household:', error);

    if (error.response && error.response.data) {
      toast.error(error.response.data);
    } else {
      toast.error(t('household.delete_error'));
    }
  } finally {
    isDeletingHousehold.value = false;
  }
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

      // Fetch non-admin members for the admin transfer dialog
      if (isAdmin.value) {
        nonAdminMembers.value = await getNonAdminHouseholdMembers();
      }

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
 * Opens the dialog for giving admin rights to another household member.
 * Fetches non-admin members using the dedicated API endpoint.
 */
const openTransferAdminDialog = async () => {
  try {
    // Fetch non-admin members using the dedicated endpoint
    nonAdminMembers.value = await getNonAdminHouseholdMembers();
    showTransferAdminDialog.value = true;
  } catch (error) {
    console.error('Error fetching non-admin members:', error);
    toast.error(t('household.error-fetching-members'));
  }
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
  } catch (error: any) {
    console.error('Error transferring admin role:', error);

    // Check if we have a specific error message from the backend
    if (error.response && error.response.data) {
      // If the error is about the user already being an admin
      if (error.response.data.includes('already an admin')) {
        toast.error(t('household.already-admin-error'));
      } else {
        toast.error(error.response.data);
      }
    } else {
      toast.error(t('household.admin-transferred-error'));
    }
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
  await refreshHouseholdData();
  // Ensure user invitations are refreshed for users without a household
  if (!hasHousehold.value) {
    setTimeout(() => {
      if (userInvitationsRef.value) {
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
