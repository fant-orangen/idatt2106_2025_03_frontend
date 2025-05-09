<template>
  <div class="flex gap-6 p-6 flex-col md:flex-row">

    <!-- Sidebar -->
    <aside class="bg-sidebar text-sidebar-foreground rounded-lg p-4 w-full shadow flex flex-col h-full max-h-[calc(100vh-6rem)]  md:w-64">
      <h2 class="text-xl font-bold mb-4">{{ t('group.title') }}</h2>

      <!-- Scrollbar for list of groups -->
      <ScrollArea  class="space-y-3 overflow-y-auto gap-2 pr-1 flex-1">
        <ul class="space-y-2">
          <li
              v-for="group in groups"
              :key="group.id"
              class="flex items-center px-3 py-2 rounded-lg hover:opacity-80 transition cursor-pointer"
              :class="{
                  'bg-black text-accent dark:bg-white ': currentGroupId === group.groupId,
                  'hover:bg-sidebar-primary/15 ': currentGroupId !== group.groupId
                }"
              @click="switchToGroup(group.groupId)"
          >
            <span class="i-heroicons-home w-5 h-5" /> {{ group.name }}
          </li>
        </ul>
      </ScrollArea>

      <!-- Button for inviting household -->
      <Button
          v-if="isAdmin"
          @click="inviteHousehold"
          variant="outline"
          class="mt-4 hover:cursor-pointer hover:bg-sidebar-primary/15"
      >
        {{ t('group.invite-household') }}
      </Button>

      <!-- Create group button -->
      <div v-if="isAdmin" class="mt-8 border-t border-sidebar-border pt-4">
        <Button
            @click="showCreateGroupDialog = true"
            variant="outline"
            class="mt-4 w-full hover:cursor-pointer hover:bg-sidebar-primary/15 dark:hover:bg-sidebar-primary/10"
        >
          {{ t('group.create-group') }}
        </Button>
      </div>

      <!-- Households in group -->
      <div class="mt-4">
        <h3 class="text-lg font-semibold mb-2">{{ t('group.households') }}</h3>
        <ScrollArea class="max-h-48 overflow-y-auto pr-1">
          <ul class="space-y-2">
            <li
                v-for="household in households"
                :key="household.id"
                class="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-secondary text-sidebar-secondary-foreground text-sm"
            >
              <House class="w-5 h-5" />
              <div>
                <p class="font-medium">{{ household.name }}</p>
                <p class="text-xs opacity-80">{{ household.populationCount }} {{ t('group.residents') }}</p>
              </div>
            </li>
          </ul>
        </ScrollArea>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">{{ t('group.shared-inventory') }}</h2>
        <Button
            v-if="isAdmin && currentGroupId"
            @click="confirmDialog()"
            class="text-sm text-white bg-destructive hover:cursor-pointer hover:bg-destructive/70"
        >
          {{ t('group.leave-group') }}
        </Button>
      </div>

      <!-- Inventory Search Bar -->
      <div class="bg-muted rounded-lg shadow-md p-4 mb-6">
        <InventorySearchBar
            class="mb-6"
            @update:search="searchText = $event"
        />
      </div>

      <!-- Group Inventory -->
      <div v-if="currentGroupId" class="bg-card rounded-lg shadow-md p-6">
        <GroupInventory
            :group-id="currentGroupId"
            :search-text="searchText"
        />
      </div>
    </main>
  </div>
  <InviteHouseholdDialog
      :open="showInviteDialog"
      :group-id="selectedGroupId || 0"
      @update:open="showInviteDialog = $event"
  />
  <CreateGroupDialog
      :open="showCreateGroupDialog"
      @update:open="showCreateGroupDialog = $event"
      @group-created="refreshGroups"
  />

  <Dialog v-model:open="openDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Er du sikker?</DialogTitle>
      </DialogHeader>
      <p>Denne handlingen kan ikke angres. 
        <br>Hvis du vil inn i en gruppe må du bli invitert eller lage din egen.
      </p>
      <Button type="button" variant="destructive" class="w-full" @click="leaveCurrentGroup()">
        Forlat
      </Button>
    </DialogContent>
  </Dialog>
</template>


<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { groupService } from '@/services/api/GroupService';
import { useGroupStore } from '@/stores/GroupStore';
import { useI18n } from 'vue-i18n'
import InventorySearchBar from '@/components/inventory/InventorySearchBar.vue';
import GroupInventory from '@/components/group/GroupInventory.vue';
import type { ProductType } from '@/models/Product';
import type { Household } from '@/models/Group';
import { isCurrentUserHouseholdAdmin } from '@/services/HouseholdService';
import { House } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import InviteHouseholdDialog from '@/components/group/InviteHouseholdDialog.vue';
import CreateGroupDialog from '@/components/group/CreateGroupDialog.vue';
import { toast } from 'vue-sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const { t } = useI18n();
const groupStore = useGroupStore();

interface Group {
  id: number;
  name: string;
  groupId: number;
}

const groups = ref<Group[]>([]);
const households = ref<Household[]>([]);
const searchText = ref('');
const currentGroupId = computed(() => groupStore.currentGroupId);
const isAdmin = ref(false);
const showInviteDialog = ref(false);
const showCreateGroupDialog = ref(false);
const selectedGroupId = ref<number | null>(null);
const openDialog = ref(false);

// Check if user is household admin when component mounts
onMounted(async () => {
  try {
    isAdmin.value = await isCurrentUserHouseholdAdmin();
  } catch (error) {
    console.error('Error checking admin status:', error);
    isAdmin.value = false;
  }

  const response = await groupService.getCurrentUserGroups();
  if (response?.content?.length > 0) {
    groups.value = response.content.map(group => ({
      id: group.id,
      name: group.name,
      groupId: group.id
    }));
    // Set the first group as current
    if (groups.value[0]) {
      switchToGroup(groups.value[0].groupId);
    }
  }
});

// Watch for changes in search text and current group ID
watch([searchText, currentGroupId], async ([newSearchText, newGroupId]) => {
  if (!newGroupId) return;

  try {
    let response;
    if (newSearchText.trim() === '') {
      // If search is empty, get all product types
      response = await groupService.getContributedProductTypes(
          { groupId: newGroupId },
          0,
          20
      );
    } else {
      // If there's a search term, use the search endpoint
      response = await groupService.searchContributedProductTypes(
          newGroupId,
          newSearchText,
          0,
          20
      );
    }

    // Update the store with the new product types
    if (response?.content) {
      const productTypes = response.content.map((pt: ProductType) => ({
        name: pt.name,
        id: pt.id
      }));
      groupStore.clearProductTypeIds(); // Clear existing before adding new
      groupStore.addProductTypeIds(productTypes);
    }
  } catch (error) {
    console.error('Error fetching product types:', error);
  }
}, { immediate: true });

// Watch for changes in current group ID to update households
watch(currentGroupId, async (newGroupId) => {
  if (!newGroupId) {
    households.value = [];
    return;
  }

  try {
    const response = await groupService.getCurrentHouseholdsInGroup(newGroupId);
    if (Array.isArray(response)) {
      households.value = response as Household[];
    } else {
      households.value = [];
    }
  } catch (error) {
    console.error('Error fetching households:', error);
    households.value = [];
  }
}, { immediate: true });

function switchToGroup(groupId: number) {
  groupStore.setCurrentGroup(groupId);
}

function inviteHousehold() {
  selectedGroupId.value = currentGroupId.value;
  showInviteDialog.value = true;
}

async function leaveCurrentGroup() {
  if (!currentGroupId.value) return;

  try {
    await groupService.leaveGroup(currentGroupId.value);
    callToast('Du har blitt fjernet fra gruppa!')
    openDialog.value = false
    // Remove the group from the list
    groups.value = groups.value.filter(g => g.groupId !== currentGroupId.value);

    // Switch to another group if available, otherwise clear current group
    if (groups.value.length > 0) {
      switchToGroup(groups.value[0].groupId);
    } else {
      groupStore.clearCurrentGroup();
    }
  } catch (error) {
    console.error('Error leaving group:', error);
    errorToast('Det oppstod en feil ved forsøk på å forlate gruppen');
  }
}

async function refreshGroups() {
  try {
    const response = await groupService.getCurrentUserGroups();
    if (response?.content?.length > 0) {
      groups.value = response.content.map(group => ({
        id: group.id,
        name: group.name,
        groupId: group.id
      }));
      if (groups.value.length && !currentGroupId.value) {
        switchToGroup(groups.value[0].groupId);
      }
    }
  } catch (error) {
    console.error('Error refreshing groups:', error);
  }
}

function confirmDialog() {
  openDialog.value = true
}

function callToast(message: string) {
  toast.success(message)
}

function errorToast(message: string) {
  toast.error(message)
}
</script>
