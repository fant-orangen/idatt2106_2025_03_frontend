<template>
  <div class="flex gap-6 p-6">

    <!-- Sidebar -->
    <aside class="bg-sidebar text-sidebar-foreground rounded-lg p-4 w-64 shadow flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <h2 class="text-xl font-bold mb-4">{{ t('group.title') }}</h2>

      <!-- Scrollbar for list of groups -->
      <ul class="space-y-3 overflow-y-auto pr-1 flex-1">
        <li
            v-for="group in groups"
            :key="group.id"
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition cursor-pointer"
            :class="{ 'bg-opacity-80': currentGroupId === group.groupId }"
            @click="switchToGroup(group.groupId)"
        >
          <span class="i-heroicons-home w-5 h-5" /> {{ group.name }}
        </li>
      </ul>

      <!-- Button for inviting household -->
      <button
          @click="inviteHousehold"
          class="mt-4 bg-sidebar-accent text-sidebar-accent-foreground py-2 rounded-md text-sm font-medium"
      >
        {{ t('group.invite-household') }}
      </button>

      <!-- Households in group -->
      <div class="mt-4">
        <h3 class="text-lg font-semibold mb-2">{{ t('group.households') }}</h3>
        <div class="max-h-48 overflow-y-auto pr-1">
          <ul class="space-y-2">
            <li
                v-for="household in households"
                :key="household.id"
                class="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-secondary text-sidebar-secondary-foreground text-sm"
            >
              <span class="i-heroicons-home-modern w-4 h-4" />
              <div>
                <p class="font-medium">{{ household.name }}</p>
                <p class="text-xs opacity-80">{{ household.populationCount }} {{ t('group.residents') }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">{{ t('group.shared-inventory') }}</h2>
        <button
          v-if="currentGroupId"
          @click="leaveCurrentGroup"
          class="text-sm text-destructive hover:text-destructive/90 transition"
        >
          {{ t('group.leave-group') }} <!-- TODO: implement translation and only allow if the user is household admin -->
        </button>
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

onMounted(async () => {
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

function switchToGroup(groupId: number) {
  groupStore.setCurrentGroup(groupId);
}

function inviteHousehold() {
  // TODO: Implement household invitation
  console.log('Invite household not implemented');
}

async function leaveCurrentGroup() {
  if (!currentGroupId.value) return;

  const confirmLeave = confirm('Er du sikker på at du vil forlate denne gruppen?');
  if (!confirmLeave) return;

  try {
    await groupService.leaveGroup(currentGroupId.value);

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
    alert('Det oppstod en feil ved forsøk på å forlate gruppen');
  }
}
</script>
