<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :closeable="false">
      <DialogHeader>
        <DialogTitle>{{ t('invitation.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('invitation.description') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="isLoading" class="flex justify-center py-4">
        <div
          class="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"
        ></div>
      </div>

      <div v-else-if="error" class="text-red-500 py-4">
        {{ error }}
      </div>

      <div v-else-if="currentInvitation" class="py-4">
        <div class="space-y-4">
          <div>
            <h3 class="font-medium">{{ t('invitation.from') }}</h3>
            <p>{{ currentInvitation.senderName }}</p>
          </div>

          <div>
            <h3 class="font-medium">{{ t('invitation.household') }}</h3>
            <p>{{ currentInvitation.householdName }}</p>
          </div>

          <div v-if="currentInvitation.message">
            <h3 class="font-medium">{{ t('invitation.message') }}</h3>
            <p>{{ currentInvitation.message }}</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <div class="flex gap-2 justify-end w-full">
          <Button
            variant="destructive"
            @click="() => replyInvitation(InvitationStatus.DECLINED)"
            :disabled="isLoading"
          >
            {{ t('invitation.decline') }}
          </Button>

          <Button
            variant="default"
            @click="() => replyInvitation(InvitationStatus.ACCEPTED)"
            :disabled="isLoading"
          >
            {{ t('invitation.accept') }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchPendingInvitations, respondToInvitation } from '@/services/InvitationService'
import { InvitationStatus } from '@/models/Invitation'
import type { Invitation } from '@/models/Invitation'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const { t } = useI18n()

// State
const isOpen = ref(false)
const pendingInvitations = ref<Invitation[]>([])
const currentInvitationIndex = ref(0)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const currentInvitation = computed(
  () => pendingInvitations.value[currentInvitationIndex.value] || null,
)

// Methods
async function fetchInvitations() {
  isLoading.value = true
  error.value = null
  try {
    pendingInvitations.value = await fetchPendingInvitations()
    if (pendingInvitations.value.length > 0) {
      isOpen.value = true
      currentInvitationIndex.value = 0
    }
  } catch (err: any) {
    error.value = err?.message || 'Failed to load invitations.'
  } finally {
    isLoading.value = false
  }
}

async function replyInvitation(answer: InvitationStatus) {
  if (!currentInvitation.value) return
  isLoading.value = true
  error.value = null
  try {
    await respondToInvitation(currentInvitation.value.id, answer)
    moveToNextInvitation()
  } catch (err: any) {
    error.value = err?.message || 'Failed to respond to invitation.'
  } finally {
    isLoading.value = false
  }
}

function moveToNextInvitation() {
  if (currentInvitationIndex.value < pendingInvitations.value.length - 1) {
    currentInvitationIndex.value++
  } else {
    isOpen.value = false
  }
}

function onOpenChange(open: boolean) {
  if (!open && pendingInvitations.value.length > 0) {
    isOpen.value = true
  } else {
    isOpen.value = open
  }
}

// Lifecycle
onMounted(() => {
  fetchInvitations()
})
</script>
