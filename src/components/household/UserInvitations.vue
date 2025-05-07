<template>
  <Card v-if="invitations.length > 0 || isLoading">
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <CardTitle>{{ $t('household.your-invitations') }}</CardTitle>
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
      <div v-else-if="invitations.length === 0" class="flex flex-col items-center justify-center py-6 text-muted-foreground">
        <MailXIcon class="h-10 w-10 mb-2 opacity-40" />
        <p>{{ $t('household.no-invitations') }}</p>
        <p class="text-xs mt-1">{{ $t('household.check-back-later') }}</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="invitation in invitations"
          :key="invitation.token"
          class="border rounded-md p-3 bg-card hover:bg-accent/10 transition-colors"
        >
          <div class="flex flex-col gap-2">
            <div>
              <p class="font-medium">{{ invitation.household.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ $t('household.invitation-from', { name: getInviterName(invitation) }) }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ $t('household.invitation-expires', { date: formatDate(invitation.expiresAt) }) }}
              </p>
            </div>
            <div class="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                class="text-destructive hover:text-destructive hover:bg-destructive/10"
                @click="declineInvite(invitation.token)"
              >
                {{ $t('household.decline') }}
              </Button>
              <Button
                variant="default"
                size="sm"
                @click="acceptInvite(invitation.token)"
              >
                {{ $t('household.accept') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
/**
 * @component UserInvitations
 * @description Displays and manages invitations received by the current user to join households.
 * Provides functionality to accept or decline invitations, and to refresh the list of invitations.
 * Emits events when invitations are accepted or declined.
 */
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcwIcon, Loader2, MailXIcon } from 'lucide-vue-next';
import { fetchPendingInvitations, acceptInvitation, declineInvitation } from '@/services/InvitationService';
import type { Invitation } from '@/models/Invitation';
import { toast } from 'vue-sonner';

const { t } = useI18n();

/** List of pending invitations for the current user */
const invitations = ref<Invitation[]>([]);

/** Loading state indicator */
const isLoading = ref(false);

/** Events emitted by this component */
const emit = defineEmits(['accepted', 'declined', 'refreshed']);

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
 * Gets the formatted name of the user who sent the invitation
 * @param {Invitation} invitation - The invitation object
 * @returns {string} Formatted name and email of the inviter
 */
const getInviterName = (invitation: Invitation) => {
  const { inviterUser } = invitation;
  return `${inviterUser.firstName} ${inviterUser.lastName} (${inviterUser.email})`;
};

/**
 * Refreshes the list of pending invitations from the backend
 * @async
 * @returns {Promise<void>}
 */
const refreshInvitations = async () => {
  isLoading.value = true;
  try {
    const data = await fetchPendingInvitations();
    invitations.value = data;
    emit('refreshed', data);
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    toast.error(t('household.error-fetching-invitations'));
  } finally {
    isLoading.value = false;
  }
};

/**
 * Accepts an invitation to join a household
 * @async
 * @param {string} token - The invitation token
 * @returns {Promise<void>}
 */
const acceptInvite = async (token: string) => {
  try {
    const household = await acceptInvitation(token);
    toast.success(t('household.invitation-accepted'));
    emit('accepted', household);
  } catch (error) {
    console.error('Error accepting invitation:', error);
    toast.error(t('household.error-accepting-invitation'));
  }
};

/**
 * Declines an invitation to join a household
 * @async
 * @param {string} token - The invitation token
 * @returns {Promise<void>}
 */
const declineInvite = async (token: string) => {
  try {
    await declineInvitation(token);
    toast.success(t('household.invitation-declined'));
    await refreshInvitations();
    emit('declined');
  } catch (error) {
    console.error('Error declining invitation:', error);
    toast.error(t('household.error-declining-invitation'));
  }
};

/**
 * Loads invitations when the component mounts
 */
onMounted(async () => {
  console.log('UserInvitations component mounted, refreshing invitations...');
  await refreshInvitations();
});

// Expose methods for parent component
defineExpose({
  refreshInvitations
});
</script>
