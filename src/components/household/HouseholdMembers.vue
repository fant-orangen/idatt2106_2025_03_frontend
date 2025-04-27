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
            @click="!manageMode ? selectMember(member) : null"
          >
            <div class="flex items-center gap-2 w-full">
              <!-- Remove Button comes first when manageMode -->
              <transition name="fade-slide">
                <Button
                  v-if="manageMode"
                  variant="destructive"
                  size="icon"
                  class="shrink-0"
                  @click.stop="removeMember(member.id)"
                >
                  <XIcon class="w-4 h-4" />
                </Button>
              </transition>

              <!-- User Icon -->
              <span class="flex-shrink-0">
                <UserIcon v-if="member.type === 'adult'" class="h-4 w-4" />
                <BabyIcon v-else-if="member.type === 'child'" class="h-4 w-4" />
                <PawPrintIcon v-else-if="member.type === 'pet'" class="h-4 w-4" />
              </span>

              <!-- Name -->
              <span class="flex-grow">
                {{ member.firstName }} {{ member.lastName }}
              </span>
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

      <Button variant="outline" class="mt-2 w-full" @click="inviteUser">
        {{ $t('household.invite-user') }}
      </Button>

      <AddUser
        v-if="showInviteUser"
        @invited="handleUserInvited"
        @cancel="showInviteUser = false"
      />

      <Button variant="destructive" class="mt-2 w-full" @click="toggleManageMode">
        {{ manageMode ? $t('household.done') : $t('household.manage-members') }}
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AddEmptyUser from './AddEmptyUser.vue';
import { BabyIcon, PawPrintIcon, UserIcon, XIcon } from 'lucide-vue-next';
import AddUser from './AddUser.vue';
import { addEmptyMember, removeEmptyMemberFromHousehold, getEmptyHouseholdMembers, getHouseholdMembers } from '@/services/HouseholdService.ts'
import type { Member, EmptyMember } from '@/models/Household.ts'
import { useHouseholdStore } from '@/stores/HouseholdStore';
useI18n();

const emit = defineEmits(['memberSelected']);
const showAddUser = ref(false);
const manageMode = ref(false);
const householdStore = useHouseholdStore();
const showInviteUser = ref(false);

const householdMembers = ref<Member[]>([]);

// Mock data for demonstration (replace with actual API calls)
onMounted(async() => {
  // Simulate fetching household members from backend
  householdMembers.value = [
    { id: 1, firstName: 'John', lastName: 'Doe', type: 'adult' },
    { id: 2, firstName: 'Jane', lastName: 'Doe', type: 'child'  },
    { id: 3, firstName: 'Alice', lastName: 'Smith', type: 'pet' },
  ];
  try {
    const currentHouseholdId = householdStore.currentHousehold?.id || 1;
    const emptyMembers = await getEmptyHouseholdMembers(currentHouseholdId);
    householdMembers.value = [...householdMembers.value, ...emptyMembers];
  } catch (error) {
    console.error('Failed to fetch empty members:', error);
  }
});

// Methods
const selectMember = (member: Member) => {
  //get user id and fetch profile information.
  console.log('Selected member:', member);
  emit('memberSelected', member);
};

const addEmptyUser = () => {
  showAddUser.value = true;
};

const handleSaveUser = async (userData: {
  firstName: string;
  lastName: string;
  type: string;
  description?: string;
}) => {
  try {
    const currentHouseholdId = householdStore.currentHousehold?.id || 1;

    const newMemberData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      type: userData.type,
      ...(userData.description ? { description: userData.description } : {})
    };

    const createdMember = await addEmptyMember(currentHouseholdId, newMemberData);
    householdMembers.value.push(createdMember);
    showAddUser.value = false;
  } catch (error) {
    console.error('Failed to save empty user:', error);
  }
};

const inviteUser = () => {
  showAddUser.value = false;
  showInviteUser.value = true;
};

const handleUserInvited = (userData) => {
  console.log('User invited:', userData);
  showInviteUser.value = false;
};

const toggleManageMode = () => {
  manageMode.value = !manageMode.value;
};

const removeMember = async (memberId: number) => {
  try {
    const currentHouseholdId = householdStore.currentHousehold?.id || 1;
    await removeEmptyMemberFromHousehold(currentHouseholdId, memberId);
    householdMembers.value = householdMembers.value.filter(member => member.id !== memberId);
  } catch (error) {
    console.error('Failed to remove member:', error);
  }
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
