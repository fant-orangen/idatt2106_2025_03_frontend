<template>
  <Card class="household-members">
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <CardTitle>{{ householdName || $t('household.members') }}</CardTitle>
      <div class="flex items-center gap-2">
        <Button
          v-if="isAdmin"
          :variant="manageMode ? 'default' : 'outline'"
          size="sm"
          class="transition-all duration-300 ease-in-out flex items-center gap-1.5"
          :class="{ 'bg-destructive/10 hover:bg-destructive/20 text-destructive': manageMode }"
          @click="toggleManageMode"
        >
          <span v-if="manageMode" class="flex items-center gap-1.5">
            <CheckIcon class="h-4 w-4" />
            {{ $t('household.done') }}
          </span>
          <span v-else class="flex items-center gap-1.5">
            <UsersIcon class="h-4 w-4" />
            {{ $t('household.manage-members') }}
          </span>
        </Button>
        <Button
          v-if="isAdmin && manageMode && selectedMembers.length > 0"
          variant="destructive"
          size="sm"
          @click="confirmRemoveSelected"
        >
          <TrashIcon class="h-4 w-4 mr-1" />
          {{ $t('household.remove_selected', { count: selectedMembers.length }) }}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <!-- Member type tabs -->
      <div class="border-b mb-4">
        <div class="flex space-x-2">
          <button
            class="px-3 py-2 text-sm font-medium transition-colors relative"
            :class="activeTab === 'people' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'"
            @click="switchTab('people')"
          >
            <div class="flex items-center gap-1.5">
              <UserIcon class="h-4 w-4" />
              <span>{{ $t('household.users') }}</span>
              <Badge variant="secondary" size="sm" class="ml-1">{{ realMembers.length }}</Badge>
            </div>
          </button>
          <button
            class="px-3 py-2 text-sm font-medium transition-colors relative"
            :class="activeTab === 'others' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'"
            @click="switchTab('others')"
          >
            <div class="flex items-center gap-1.5">
              <UsersIcon class="h-4 w-4" />
              <span>{{ $t('household.others') }}</span>
              <Badge variant="secondary" size="sm" class="ml-1">{{ emptyMembers.length }}</Badge>
            </div>
          </button>
        </div>
      </div>

      <!-- People tab content -->
      <div v-if="activeTab === 'people'" class="space-y-4">
        <!-- Household count -->
        <div class="mb-2 text-sm text-muted-foreground flex items-center gap-1">
          <UserIcon class="h-3.5 w-3.5" />
          <span>
            {{ realMembers.length }} {{ realMembers.length === 1 ? $t('household.user') : $t('household.users') }} {{ $t('household.in-household') }}
          </span>
        </div>

        <!-- Scrollable list of household members -->
        <div class="scrollable-container mb-4">
          <div v-if="realMembers.length === 0" class="flex flex-col items-center justify-center h-24 text-muted-foreground">
            <UserIcon class="h-8 w-8 mb-2 opacity-40" />
            <p>{{ $t('household.no-members-found') }}</p>
          </div>
          <div v-else class="space-y-1.5">
            <div
              v-for="member in realMembers"
              :key="member.id"
              class="relative group rounded-md border border-border bg-card hover:bg-accent/30 transition-all duration-200 overflow-hidden"
              :class="{
                'hover:border-destructive/50': manageMode,
                'border-primary': isSelected(member)
              }"
            >
              <!-- Selection is indicated by border -->

              <!-- Member content -->
              <div
                class="flex items-center gap-3 p-2.5 cursor-pointer transition-all duration-300"
                @click.stop="manageMode ? toggleMemberSelection(member) : selectMember(member)"
                v-if="'email' in member"
                v-user-profile="{ userId: member.id }"
              >
                <!-- Real user content -->
                <!-- User Icon with status indicator -->
                <div class="flex-shrink-0 relative">
                  <div class="h-8 w-8 rounded-full bg-accent/50 flex items-center justify-center">
                    <UserIcon class="h-4 w-4 text-accent-foreground" />
                  </div>
                </div>

                <!-- Name and details -->
                <div class="flex-grow min-w-0">
                  <div class="flex items-center gap-1.5">
                    <p class="font-medium truncate">
                      {{ 'firstName' in member ? `${member.firstName} ${member.lastName}` : ('name' in member ? (member as any).name : (member as any).email || '') }}
                    </p>
                    <!-- Admin badge -->
                    <Badge v-if="'isAdmin' in member && member.isAdmin" variant="default" class="text-xs ml-1 bg-primary text-primary-foreground font-bold">
                      {{ $t('household.admin_badge') }}
                    </Badge>
                  </div>
                  <p v-if="member.email" class="text-xs text-muted-foreground truncate">
                    {{ member.email }}
                  </p>
                </div>

              </div>

              <!-- Empty member content -->
              <div
                v-else
                class="flex items-center gap-3 p-2.5 cursor-pointer transition-all duration-300"
                @click.stop="manageMode ? toggleMemberSelection(member) : selectMember(member)"
              >
                <!-- User Icon with status indicator -->
                <div class="flex-shrink-0 relative">
                  <div class="h-8 w-8 rounded-full bg-accent/50 flex items-center justify-center">
                    <UserIcon class="h-4 w-4 text-accent-foreground" />
                  </div>
                </div>
              </div>

              <!-- Remove button - absolutely positioned -->
              <div
                v-if="manageMode"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-in-out"
                :class="{ 'opacity-100': manageMode, 'opacity-0': !manageMode }"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
                  @click.stop="confirmRemoveMember(member)"
                  title="Remove member"
                >
                  <TrashIcon class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Others tab content -->
      <div v-if="activeTab === 'others'" class="space-y-4">
        <!-- Empty members count -->
        <div class="mb-2 text-sm text-muted-foreground flex items-center gap-1">
          <UsersIcon class="h-3.5 w-3.5" />
          <span>
            {{ emptyMembers.length }} {{ emptyMembers.length === 1 ? $t('household.other_member') : $t('household.other_members') }} {{ $t('household.in-household') }}
          </span>
        </div>

        <!-- Scrollable list of empty members -->
        <div class="scrollable-container mb-4">
          <div v-if="emptyMembers.length === 0" class="flex flex-col items-center justify-center h-24 text-muted-foreground">
            <UsersIcon class="h-8 w-8 mb-2 opacity-40" />
            <p>{{ $t('household.no-empty-members-found') }}</p>
          </div>
          <div v-else class="space-y-1.5">
            <div
              v-for="member in emptyMembers"
              :key="member.id"
              class="relative group rounded-md border border-border bg-card hover:bg-accent/30 transition-all duration-200 overflow-hidden"
              :class="{
                'hover:border-destructive/50': manageMode,
                'border-primary': isSelected(member)
              }"
            >
              <!-- Selection is indicated by border -->

              <!-- Member content -->
              <div
                class="flex items-center gap-3 p-2.5 cursor-pointer transition-all duration-300"
                @click="manageMode ? toggleMemberSelection(member) : selectMember(member)"
              >
                <!-- Member icon based on type -->
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 rounded-full flex items-center justify-center"
                    :class="getMemberTypeClass(member.type)">
                    <component :is="getMemberTypeIcon(member.type)" class="h-4 w-4" />
                  </div>
                </div>

                <!-- Member details -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ member.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ member.type }}</p>
                  <p v-if="member.description" class="text-xs text-muted-foreground mt-1">
                    {{ member.description }}
                  </p>
                </div>

              </div>

              <!-- Remove button (visible on hover or in manage mode) -->
              <div
                v-if="manageMode"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-in-out"
                :class="{ 'opacity-100': manageMode, 'opacity-0': !manageMode }"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
                  @click.stop="confirmRemoveMember(member)"
                  title="Remove member"
                >
                  <TrashIcon class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add empty member button (only for admin) -->
        <div v-if="isAdmin" class="mt-4">
          <Button variant="outline" class="w-full justify-start gap-2" @click="toggleAddEmptyMember">
            <PlusIcon class="h-4 w-4" />
            <span>{{ $t('household.add-empty-member') }}</span>
          </Button>
        </div>
      </div>

      <!-- Action buttons (only shown in people tab and for admin users) -->
      <div v-if="activeTab === 'people' && isAdmin" class="space-y-2 mt-4">
        <Button variant="outline" class="w-full justify-start gap-2" @click="toggleInviteUser">
          <MailIcon class="h-4 w-4" />
          <span>{{ $t('household.invite-user') }}</span>
        </Button>
      </div>

      <!-- Message for non-admin users -->
      <div v-if="activeTab === 'people' && !isAdmin && showInviteInfo" class="mt-4 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
        <p>{{ $t('household.admin_only') }}</p>
      </div>

      <!-- Add empty member form -->
      <AddEmptyMember
        v-if="showAddEmptyMember || showAddUser"
        @added="handleEmptyMemberAdded"
        @cancel="closeAddForms"
      />

      <!-- Invite user form -->
      <AddUser
        v-if="showInviteUser"
        @invited="handleUserInvited"
        @cancel="showInviteUser = false"
      />

      <!-- Confirmation dialog for removing members -->
      <Dialog :open="!!memberToRemove" @update:open="memberToRemove = null">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ $t('household.confirm-remove-member') }}</DialogTitle>
            <DialogDescription>
              {{ $t('household.confirm-remove-member-description') }}
            </DialogDescription>
          </DialogHeader>
          <div class="py-4">
            <p class="font-medium">
              {{ memberToRemove && 'firstName' in memberToRemove ? `${memberToRemove.firstName} ${memberToRemove.lastName}` : (memberToRemove && 'name' in memberToRemove ? (memberToRemove as any).name : (memberToRemove as any)?.email || '') }}
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" @click="memberToRemove = null">{{ $t('common.cancel') }}</Button>
            <Button variant="destructive" @click="executeRemoveMember">{{ $t('common.remove') }}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Dialog for confirming multiple member removal -->
      <Dialog :open="showConfirmMultipleRemove" @update:open="showConfirmMultipleRemove = $event">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ $t('household.confirm-remove-multiple-title') }}</DialogTitle>
            <DialogDescription>
              {{ $t('household.confirm-remove-multiple-description', { count: selectedMembers.length }) }}
            </DialogDescription>
          </DialogHeader>
          <div class="py-4">
            <div class="max-h-40 overflow-y-auto border rounded p-2">
              <ul class="space-y-1">
                <li v-for="member in selectedMembers" :key="member.id" class="text-sm">
                  <span v-if="'email' in member">
                    {{ member.firstName }} {{ member.lastName }}
                  </span>
                  <span v-else>
                    {{ member.name }} ({{ member.type }})
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="showConfirmMultipleRemove = false">{{ $t('common.cancel') }}</Button>
            <Button variant="destructive" @click="removeSelectedMembers">{{ $t('household.remove-selected') }}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
/**
 * @component HouseholdMembers
 * @description Displays and manages household members, including real members and empty members.
 * Provides functionality for adding, removing, and managing household members.
 * Supports admin operations like promoting members to admin status.
 */
import { ref, onMounted, defineEmits, defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { userProfilePopup } from '@/composables/userProfilePopup.ts';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import AddEmptyMember from './AddEmptyMember.vue';
import {
  UserIcon,
  XIcon,
  PlusIcon,
  MailIcon,
  TrashIcon,
  UsersIcon,
  BabyIcon,
  PawPrintIcon,
  CheckIcon
} from 'lucide-vue-next';
import AddUser from './AddUser.vue';
import {
  getHouseholdMembers,
  getEmptyHouseholdMembers,
  addEmptyMember,
  removeEmptyMemberFromHousehold,
  getCurrentHousehold,
  removeMemberFromHousehold,
  isCurrentUserHouseholdAdmin
} from '@/services/HouseholdService.ts'
import type { HouseholdMember, EmptyHouseholdMemberDto } from '@/models/Household.ts'
import { toast } from 'vue-sonner';
// Direct service calls are preferred over using the store
import { useUserStore } from '@/stores/UserStore';

const { t } = useI18n();
const userStore = useUserStore();
const vUserProfile = userProfilePopup;

const props = defineProps({
  householdName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['memberSelected']);
const showAddUser = ref(false);
const showAddEmptyMember = ref(false);
const manageMode = ref(false);
const showInviteUser = ref(false);
const showInviteInfo = ref(true); // Show info message for non-admin users
const memberToRemove = ref<HouseholdMember | EmptyHouseholdMemberDto | null>(null);
const householdMembers = ref<HouseholdMember[]>([]);
const emptyMembers = ref<EmptyHouseholdMemberDto[]>([]);
const isAdmin = ref(false);
const selectedMembers = ref<(HouseholdMember | EmptyHouseholdMemberDto)[]>([]);
const showConfirmMultipleRemove = ref(false);
const activeTab = ref('people'); // 'people' or 'others'

/**
 * Computed property that returns the list of real household members.
 * @returns {HouseholdMember[]} Array of real household members
 */
const realMembers = computed(() => householdMembers.value);

/**
 * Returns the appropriate icon component based on member type.
 * @param {string} type - The type of the member (e.g., 'CHILD', 'DOG', 'PET')
 * @returns {Component} The icon component to use
 */
const getMemberTypeIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'CHILD':
      return BabyIcon;
    case 'PET':
      return PawPrintIcon;
    default:
      return UserIcon;
  }
};

/**
 * Returns the appropriate CSS class based on member type.
 * @param {string} type - The type of the member (e.g., 'CHILD', 'DOG', 'PET')
 * @returns {string} CSS class string for styling the member icon
 */
const getMemberTypeClass = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'CHILD':
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
    case 'PET':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300';
    default:
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
  }
};

/**
 * Checks if a member is currently selected in the UI.
 * @param {HouseholdMember | EmptyHouseholdMemberDto} member - The member to check
 * @returns {boolean} True if the member is selected, false otherwise
 */
const isSelected = (member: HouseholdMember | EmptyHouseholdMemberDto) => {
  return selectedMembers.value.some(m => m.id === member.id);
};

/**
 * Toggles the selection state of a member for multi-select operations.
 * @param {HouseholdMember | EmptyHouseholdMemberDto} member - The member to toggle selection for
 */
const toggleMemberSelection = (member: HouseholdMember | EmptyHouseholdMemberDto) => {
  if (isSelected(member)) {
    selectedMembers.value = selectedMembers.value.filter(m => m.id !== member.id);
  } else {
    selectedMembers.value.push(member);
  }
};

/**
 * Fetches both regular and empty household members from the backend.
 * Also checks if the current user is an admin of the household.
 * @async
 */
const fetchMembers = async () => {
  try {
    const members = await getHouseholdMembers();
    householdMembers.value = members;

    const emptyMembersList = await getEmptyHouseholdMembers();
    emptyMembers.value = emptyMembersList;

    isAdmin.value = await isCurrentUserHouseholdAdmin();
  } catch (error) {
    console.error('Error fetching household members:', error);
    toast.error(t('household.error-fetching-members'));
  }
};

onMounted(async () => {
  await fetchMembers();
});

/**
 * Handles member selection and emits the selected member to parent components.
 * @param {HouseholdMember | EmptyHouseholdMemberDto} member - The member that was selected
 */
const selectMember = (member: HouseholdMember | EmptyHouseholdMemberDto) => {
  console.log('Selected member:', member);
  emit('memberSelected', member);
};

/**
 * Toggles the visibility of the add empty user form.
 * Closes other forms if opening this one.
 */
const toggleAddEmptyUser = () => {
  if (showAddUser.value) {
    showAddUser.value = false;
  } else {
    showInviteUser.value = false;
    showAddEmptyMember.value = false;
    showAddUser.value = true;
  }
};

/**
 * Closes all add forms.
 */
const closeAddForms = () => {
  showAddUser.value = false;
  showAddEmptyMember.value = false;
};

/**
 * Switches between tabs and closes any open forms
 * @param {string} tab - The tab to switch to ('people' or 'others')
 */
const switchTab = (tab: string) => {
  // Close any open forms when switching tabs
  showAddUser.value = false;
  showAddEmptyMember.value = false;
  showInviteUser.value = false;

  // Switch to the selected tab
  activeTab.value = tab;
};

/**
 * Toggles the visibility of the add empty member form.
 * Closes other forms if opening this one.
 */
const toggleAddEmptyMember = () => {
  // If already showing, close it; otherwise open it and close the other forms
  if (showAddEmptyMember.value) {
    showAddEmptyMember.value = false;
  } else {
    showAddEmptyMember.value = true;
    showAddUser.value = false;
    showInviteUser.value = false;
  }
};



/**
 * Toggles the visibility of the invite user form.
 * Closes other forms if opening this one.
 */
const toggleInviteUser = () => {
  // If already showing, close it; otherwise open it and close the other form
  if (showInviteUser.value) {
    showInviteUser.value = false;
  } else {
    showAddUser.value = false;
    showInviteUser.value = true;
  }
};

/**
 * Handles the event when a user has been invited to the household.
 * @param {Object} userData - The data of the invited user
 * @param {string} userData.email - The email of the invited user
 */
const handleUserInvited = (userData: { email: string }) => {
  console.log('User invited:', userData);
  showInviteUser.value = false;
  toast.success(t('household.invitation-sent-success'));
};

/**
 * Handles the event when an empty member has been added to the household.
 * Refreshes the member list and shows a success toast.
 * @async
 */
const handleEmptyMemberAdded = async () => {
  closeAddForms();
  await fetchMembers();
  toast.success(t('household.empty-member-added'));
};

/**
 * Toggles the manage mode for household members.
 * Clears selections and pending removals when exiting manage mode.
 */
const toggleManageMode = () => {
  manageMode.value = !manageMode.value;
  memberToRemove.value = null;
  if (!manageMode.value) {
    selectedMembers.value = [];
  }
};

/**
 * Shows a confirmation dialog before removing a member from the household.
 * @param {HouseholdMember | EmptyHouseholdMemberDto} member - The member to remove
 */
const confirmRemoveMember = (member: HouseholdMember | EmptyHouseholdMemberDto) => {
  memberToRemove.value = member;
};

/**
 * Shows a confirmation dialog for removing multiple selected members.
 * Only shows the dialog if there are members selected.
 */
const confirmRemoveSelected = () => {
  if (selectedMembers.value.length === 0) return;
  showConfirmMultipleRemove.value = true;
};

/**
 * Removes multiple selected members from the household.
 * Handles both real members and empty members appropriately.
 * @async
 */
const removeSelectedMembers = async () => {
  if (selectedMembers.value.length === 0) return;

  try {
    for (const member of selectedMembers.value) {
      if ('email' in member) {
        await removeMemberFromHousehold(member.id);
      } else {
        await removeEmptyMemberFromHousehold(member.id);
      }
    }

    toast.success(t('household.members-removed-success', { count: selectedMembers.value.length }));
    selectedMembers.value = [];
    showConfirmMultipleRemove.value = false;
    await fetchMembers(); // Refresh the list
  } catch (error) {
    console.error('Error removing members:', error);
    toast.error(t('household.members-removed-error'));
  }
};

/**
 * Executes the removal of a single member from the household.
 * Handles both real members and empty members appropriately.
 * @async
 */
const executeRemoveMember = async () => {
  if (!memberToRemove.value?.id) return;

  try {
    if ('email' in memberToRemove.value) {
      // It's a real user
      await removeMemberFromHousehold(memberToRemove.value.id);
    } else {
      // It's an empty member
      await removeEmptyMemberFromHousehold(memberToRemove.value.id);
    }
    await fetchMembers();
    toast.success(t('household.member-removed-success'));
  } catch (error) {
    console.error('Failed to remove member:', error);
    toast.error(t('household.member-removed-error'));
  } finally {
    memberToRemove.value = null;
  }
};
</script>

<style scoped>
.scrollable-container {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
}

.scrollable-container::-webkit-scrollbar {
  width: 6px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background-color: var(--muted);
  border-radius: 6px;
}

/* Smooth transitions for all interactive elements */
button, .relative {
  transition: all 0.2s ease-in-out;
}

/* Hover effect for member items */
.group:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Animation for manage mode */
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.absolute {
  animation: slideIn 0.2s ease-out;
}
</style>
