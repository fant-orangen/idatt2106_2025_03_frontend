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
    </aside>

    <!-- Main content -->
    <main class="flex-1">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">{{ t('group.shared-inventory') }}</h2>
        <button
            @click="switchGroup"
            class="underline text-sm text-primary hover:text-primary-foreground transition"
        >
          {{ t('group.switch-group') }}
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
import { ref, onMounted, computed } from 'vue';
import { groupService } from '@/services/api/GroupService';
import { useGroupStore } from '@/stores/GroupStore';
import { useI18n } from 'vue-i18n'
import InventorySearchBar from '@/components/inventory/InventorySearchBar.vue';
import GroupInventory from '@/components/group/GroupInventory.vue';

const { t } = useI18n();
const groupStore = useGroupStore();

interface Group {
  id: number;
  name: string;
  groupId: number;
}

const groups = ref<Group[]>([]);
const searchText = ref('');
const currentGroupId = computed(() => groupStore.currentGroupId);

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

function switchGroup() {
  // TODO: Implement group switching
  console.log('Switch group not implemented');
}
</script>
