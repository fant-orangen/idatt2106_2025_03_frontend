<template>
  <div class="flex gap-6 p-6">

    <!-- Sidebar -->
    <aside class="bg-sidebar text-sidebar-foreground rounded-lg p-4 w-64 shadow flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <h2 class="text-xl font-bold mb-4">{{ t('group.title') }}</h2>

      <!-- Scrollbar for list of groups -->
      <ul class="space-y-3 overflow-y-auto pr-1 flex-1">
        <li
            v-for="household in households"
            :key="household.id"
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition"
        >
          <span class="i-heroicons-home w-5 h-5" /> {{ household.name }}
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

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div
            v-for="item in sharedInventory"
            :key="item.id"
            class="bg-card border border-border p-4 rounded-lg shadow-sm"
        >
          <div class="font-semibold">{{ item.productName }}</div>
          <div class="text-muted-foreground text-sm">
            {{ item.amount }} stk – delt av {{ item.sharedBy }}
          </div>
        </div>
      </div>

      <!-- Direct to inventory -->
      <router-link
          to="/inventory"
          class="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
      >
        {{ t('group.share-from-inventory') }}
      </router-link>

      <!-- Modal for sharing (currently unused, but kept) -->

      <ShareItemModal
          v-if="isShareModalOpen"
          @close="isShareModalOpen = false"
          @shared="refreshGroupInventory"
      />
    </main>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GroupService from '@/services/api/GroupService';
import ShareItemModal from '@/views/ShareItemModal.vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n();

interface Household {
  id: string;
  name: string;
  groupId: string;
}

interface SharedItem {
  id: string;
  productName: string;
  amount: number;
  sharedBy: string;
}

const households = ref<Household[]>([]);
const sharedInventory = ref<SharedItem[]>([]);
const isShareModalOpen = ref(false);

onMounted(async () => {
  households.value = await GroupService.getUserGroups().then(res => res.data);
  await refreshGroupInventory();
});

function openShareModal() {
  isShareModalOpen.value = true;
}

async function refreshGroupInventory() {
  const currentGroupId = households.value[0]?.groupId;
  if (currentGroupId) {
    sharedInventory.value = await GroupService.getGroupInventory(currentGroupId).then(res => res.data);
  }
}

function inviteHousehold() {
  // TODO, temporarily no backend logic
}

function switchGroup() {
  // TODO, temporarily no backend logic
}
</script>
