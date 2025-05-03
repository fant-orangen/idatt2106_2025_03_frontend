<template>
  <Card class="household-members">
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <CardTitle>{{ householdName || $t('household.members') }}</CardTitle>
      <Button
        :variant="manageMode ? 'default' : 'ghost'"
        size="sm"
        class="transition-all duration-300 ease-in-out"
        :class="{ 'bg-destructive/10 hover:bg-destructive/20 text-destructive': manageMode }"
        @click="toggleManageMode"
      >
        <span v-if="manageMode">{{ $t('household.done') }}</span>
        <span v-else>{{ $t('household.manage-members') }}</span>
      </Button>
    </CardHeader>
    <CardContent>
      <!-- Household count -->
      <div class="mb-2 text-sm text-muted-foreground flex items-center gap-1">
        <UserIcon class="h-3.5 w-3.5" />
        <span>
          {{ householdMembers.length }} {{ householdMembers.length === 1 ? $t('household.person') : $t('household.people') }} {{ $t('household.in-household') }}
        </span>
      </div>

      <!-- Scrollable list of household members -->
      <div class="scrollable-container mb-4">
        <div v-if="householdMembers.length === 0" class="flex flex-col items-center justify-center h-24 text-muted-foreground">
          <UserIcon class="h-8 w-8 mb-2 opacity-40" />
          <p>{{ $t('household.no-members-found') }}</p>
        </div>
        <div v-else class="space-y-1.5">
          <div
            v-for="member in householdMembers"
            :key="member.id"
            class="relative group rounded-md border border-border bg-card hover:bg-accent/30 transition-all duration-200 overflow-hidden"
            :class="{ 'hover:border-destructive/50': manageMode }"
          >
            <!-- Member content -->
            <div
              class="flex items-center gap-3 p-2.5 cursor-pointer transition-all duration-300"
              :class="{ 'pl-10': manageMode }"
              @click="!manageMode ? selectMember(member) : null"
            >
              <!-- User Icon with status indicator -->
              <div class="flex-shrink-0 relative">
                <div class="h-8 w-8 rounded-full bg-accent/50 flex items-center justify-center">
                  <UserIcon class="h-4 w-4 text-accent-foreground" />
                </div>
              </div>

              <!-- Name and details -->
              <div class="flex-grow min-w-0">
                <p class="font-medium truncate">
                  {{ member.firstName ? `${member.firstName} ${member.lastName}` : member.name }}
                </p>
                <p v-if="member.email" class="text-xs text-muted-foreground truncate">
                  {{ member.email }}
                </p>
              </div>
            </div>

            <!-- Remove button - absolutely positioned -->
            <div
              v-if="manageMode"
              class="absolute left-0 top-0 bottom-0 flex items-center justify-center transition-all duration-300 ease-in-out"
              :class="{ 'opacity-100': manageMode, 'opacity-0': !manageMode }"
            >
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive-foreground ml-1"
                @click.stop="confirmRemoveMember(member)"
              >
                <XIcon class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="space-y-2">
        <Button variant="outline" class="w-full justify-start gap-2" @click="toggleAddEmptyUser">
          <PlusIcon class="h-4 w-4" />
          <span>{{ $t('household.add-empty-user') }}</span>
        </Button>

        <Button variant="outline" class="w-full justify-start gap-2" @click="toggleInviteUser">
          <MailIcon class="h-4 w-4" />
          <span>{{ $t('household.invite-user') }}</span>
        </Button>
      </div>

      <!-- Add empty user form -->
      <AddEmptyUser
        v-if="showAddUser"
        @save="handleSaveUser"
        @cancel="showAddUser = false"
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
              {{ memberToRemove?.firstName ? `${memberToRemove.firstName} ${memberToRemove.lastName}` : memberToRemove?.name }}
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" @click="memberToRemove = null">{{ $t('common.cancel') }}</Button>
            <Button variant="destructive" @click="executeRemoveMember">{{ $t('common.remove') }}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import AddEmptyUser from './AddEmptyUser.vue';
import { UserIcon, XIcon, PlusIcon, MailIcon } from 'lucide-vue-next';
import AddUser from './AddUser.vue';
import { getHouseholdMembers, getEmptyHouseholdMembers, addEmptyMember, removeEmptyMemberFromHousehold, getCurrentHousehold } from '@/services/HouseholdService.ts'
import type { HouseholdMember, EmptyHouseholdMember } from '@/models/Household.ts'
import { toast } from 'vue-sonner';
import { useHouseholdStore } from '@/stores/HouseholdStore';

const { t } = useI18n();
const householdStore = useHouseholdStore();

const props = defineProps({
  householdName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['memberSelected']);
const showAddUser = ref(false);
const manageMode = ref(false);
const showInviteUser = ref(false);
const memberToRemove = ref<HouseholdMember | EmptyHouseholdMember | null>(null);
const householdMembers = ref<(HouseholdMember | EmptyHouseholdMember)[]>([]);

const fetchMembers = async () => {
  try {
    const members = await getHouseholdMembers();
    const emptyMembers = await getEmptyHouseholdMembers();
    householdMembers.value = [...members, ...emptyMembers];
  } catch (error) {
    console.error('Error fetching household members:', error);
    toast.error(t('household.error-fetching-members'));
  }
};

onMounted(async () => {
  await fetchMembers();
});

const selectMember = (member: HouseholdMember) => {
  console.log('Selected member:', member);
  emit('memberSelected', member);
};

const toggleAddEmptyUser = () => {
  // If already showing, close it; otherwise open it and close the other form
  if (showAddUser.value) {
    showAddUser.value = false;
  } else {
    showInviteUser.value = false;
    showAddUser.value = true;
  }
};

const handleSaveUser = async (userData: {
  name: string;
  type: string;
  description: string;
}) => {
  try {
    await addEmptyMember(userData);
    await fetchMembers(); // Refresh the members list
    showAddUser.value = false;
    toast.success(t('household.member-added-success'));
  } catch (error) {
    console.error('Failed to save user:', error);
    toast.error(t('household.member-added-error'));
  }
};

const toggleInviteUser = () => {
  // If already showing, close it; otherwise open it and close the other form
  if (showInviteUser.value) {
    showInviteUser.value = false;
  } else {
    showAddUser.value = false;
    showInviteUser.value = true;
  }
};

const handleUserInvited = (userData: { email: string }) => {
  console.log('User invited:', userData);
  showInviteUser.value = false;
  toast.success(t('household.invitation-sent-success'));
};

const toggleManageMode = () => {
  manageMode.value = !manageMode.value;
  // Reset any pending removal when toggling mode
  memberToRemove.value = null;
};

// Show confirmation dialog before removing a member
const confirmRemoveMember = (member: HouseholdMember | EmptyHouseholdMember) => {
  memberToRemove.value = member;
};

// Execute the actual removal after confirmation
const executeRemoveMember = async () => {
  if (!memberToRemove.value?.id) return;

  try {
    // Note: This will throw an error since the backend doesn't support this yet
    await removeEmptyMemberFromHousehold(memberToRemove.value.id);
    await fetchMembers(); // Refresh the members list
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
