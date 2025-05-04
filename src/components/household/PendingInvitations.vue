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
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcwIcon, Loader2, XIcon } from 'lucide-vue-next';
import { getPendingHouseholdInvitations, declineHouseholdInvitation } from '@/services/HouseholdService';
import type { Invitation } from '@/models/Invitation';
import { toast } from 'vue-sonner';

const { t } = useI18n();
const invitations = ref<Invitation[]>([]);
const isLoading = ref(false);

// Format date for display
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

// Refresh invitations
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

// Cancel invitation
const cancelInvitation = async (token: string) => {
  try {
    await declineHouseholdInvitation(token);
    toast.success(t('household.invitation-canceled'));
    await refreshInvitations();
  } catch (error) {
    console.error('Error canceling invitation:', error);
    toast.error(t('household.error-canceling-invitation'));
  }
};

// Load invitations when component mounts
onMounted(async () => {
  await refreshInvitations();
});

// Expose methods for parent component
defineExpose({
  refreshInvitations
});
</script>
