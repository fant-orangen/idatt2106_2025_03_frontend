<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <CardTitle>{{ $t('household.pending-invitations') }}</CardTitle>
      <Button
        variant="ghost"
        size="sm"
        class="h-8 w-8"
        @click="refreshInvitations"
        :disabled="isLoading"
      >
        <RefreshCcwIcon class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
      </Button>
    </CardHeader>
    <CardContent>
      <div v-if="isLoading" class="flex justify-center py-4">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      <div v-else-if="invitations.length === 0" class="text-center py-4 text-muted-foreground">
        {{ $t('household.no-pending-invitations') }}
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="invitation in invitations"
          :key="invitation.token"
          class="border rounded-md p-3 bg-card hover:bg-accent/10 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium">{{ invitation.inviteeEmail }}</p>
              <p class="text-xs text-muted-foreground">
                {{ $t('household.invitation-expires', { date: formatDate(invitation.expiresAt) }) }}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              class="text-destructive hover:text-destructive hover:bg-destructive/10"
              @click="cancelInvitation(invitation.token)"
            >
              <XIcon class="h-4 w-4 mr-1" />
              {{ $t('household.cancel-invitation') }}
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
/**
 * @component PendingInvitations
 * @description Displays and manages invitations sent by the current user to others to join their household.
 * Provides functionality to cancel pending invitations and refresh the list.
 * Only visible to household admins.
 */
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcwIcon, Loader2, XIcon } from 'lucide-vue-next';
import { getPendingHouseholdInvitations, cancelHouseholdInvitation } from '@/services/HouseholdService';
import type { Invitation } from '@/models/Invitation';
import { toast } from 'vue-sonner';

const { t } = useI18n();

/** List of pending invitations sent by the current user */
const invitations = ref<Invitation[]>([]);

/** Loading state indicator */
const isLoading = ref(false);

/**
 * Formats a date string for display using the user's locale
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted date string
 */
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

/**
 * Refreshes the list of pending invitations from the backend
 * @async
 * @returns {Promise<void>}
 */
const refreshInvitations = async () => {
  isLoading.value = true;
  try {
    const data = await getPendingHouseholdInvitations();
    invitations.value = data;
  } catch (error) {
    console.error('Error fetching household invitations:', error);
    toast.error(t('household.error-fetching-invitations'));
  } finally {
    isLoading.value = false;
  }
};

/**
 * Cancels a pending invitation that was sent to another user
 * @async
 * @param {string} token - The invitation token
 * @returns {Promise<void>}
 */
const cancelInvitation = async (token: string) => {
  try {
    await cancelHouseholdInvitation(token);
    toast.success(t('household.invitation-canceled'));
    await refreshInvitations();
  } catch (error) {
    console.error('Error canceling invitation:', error);
    toast.error(t('household.error-canceling-invitation'));
  }
};

/**
 * Loads invitations when the component mounts
 */
onMounted(async () => {
  await refreshInvitations();
});

// Expose methods for parent component
defineExpose({
  refreshInvitations
});
</script>
