<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :closeable="false">
      <DialogHeader>
        <DialogTitle>{{ $t('invitation.title') }}</DialogTitle>
        <DialogDescription>
          {{ $t('invitation.description') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="isLoading" class="flex justify-center py-4">
        <div class="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>

      <div v-else-if="error" class="text-red-500 py-4">
        {{ error }}
      </div>

      <div v-else-if="currentInvitation" class="py-4">
        <div class="space-y-4">
          <div>
            <h3 class="font-medium">{{ $t('invitation.from') }}</h3>
            <p>{{ currentInvitation.senderName }}</p>
          </div>

          <div>
            <h3 class="font-medium">{{ $t('invitation.household') }}</h3>
            <p>{{ currentInvitation.householdName }}</p>
          </div>

          <div v-if="currentInvitation.message">
            <h3 class="font-medium">{{ $t('invitation.message') }}</h3>
            <p>{{ currentInvitation.message }}</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <div class="flex gap-2 justify-end w-full">
          <Button
            variant="destructive"
            @click="declineCurrentInvitation"
            :disabled="isLoading"
          >
            {{ $t('invitation.decline') }}
          </Button>
          <Button
            variant="default"
            @click="acceptCurrentInvitation"
            :disabled="isLoading"
          >
            {{ $t('invitation.accept') }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInvitationStore } from '@/stores/InvitationStore';
import { useUserStore } from '@/stores/UserStore';
import type { Invitation } from '@/models/Invitation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

useI18n();
const invitationStore = useInvitationStore();
const userStore = useUserStore();

const isOpen = ref(false);
const currentInvitationIndex = ref(0);

// Computed properties
const isLoading = computed(() => invitationStore.isLoading);
const error = computed(() => invitationStore.error);
const pendingInvitations = computed(() => invitationStore.pendingInvitations);
const currentInvitation = computed<Invitation | null>(() => {
  if (pendingInvitations.value.length > currentInvitationIndex.value) {
    return pendingInvitations.value[currentInvitationIndex.value];
  }
  return null;
});

// Watch for changes in pending invitations
watch(pendingInvitations, (newInvitations) => {
  if (newInvitations.length > 0) {
    isOpen.value = true;
    currentInvitationIndex.value = 0;
  } else {
    isOpen.value = false;
  }
}, { immediate: true });

// Watch for changes in user login status
watch(() => userStore.loggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    fetchInvitations();
  } else {
    isOpen.value = false;
  }
}, { immediate: true });

// Methods
async function fetchInvitations() {
  if (userStore.loggedIn) {
    await invitationStore.fetchInvitations();
  }
}

async function acceptCurrentInvitation() {
  if (currentInvitation.value) {
    await invitationStore.acceptInvitation(currentInvitation.value.id);
    moveToNextInvitation();
  }
}

async function declineCurrentInvitation() {
  if (currentInvitation.value) {
    await invitationStore.declineInvitation(currentInvitation.value.id);
    moveToNextInvitation();
  }
}

function moveToNextInvitation() {
  if (currentInvitationIndex.value < pendingInvitations.value.length - 1) {
    currentInvitationIndex.value++;
  } else {
    isOpen.value = false;
  }
}

function onOpenChange(open: boolean) {
  // Prevent closing the dialog by clicking outside or pressing escape
  // Only allow closing when there are no more invitations
  if (!open && pendingInvitations.value.length > 0) {
    isOpen.value = true;
  } else {
    isOpen.value = open;
  }
}

// Fetch invitations on component mount
onMounted(() => {
  fetchInvitations();
});
</script>
