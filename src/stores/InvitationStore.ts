/**
 * Invitation store module for global invitation state management.
 *
 * This Pinia store manages the application's invitation state,
 * including fetching pending invitations and responding to invitations.
 *
 * @module InvitationStore
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchPendingInvitations, respondToInvitation } from '@/services/InvitationService';
import type { Invitation } from '@/models/Invitation';
import { InvitationStatus } from '@/models/Invitation';

/**
 * Defines and exports the invitation store for global invitation state management.
 *
 * Provides reactive state for invitations and methods for fetching and responding to invitations.
 */
export const useInvitationStore = defineStore("invitation", () => {
  const pendingInvitations = ref<Invitation[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetches pending invitations for the current user.
   *
   * Updates the store state with the fetched invitations.
   *
   * @returns {Promise<void>} Promise that resolves when invitations are fetched
   */
  async function fetchInvitations(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      pendingInvitations.value = await fetchPendingInvitations();
    } catch (err) {
      console.error('Error fetching invitations:', err);
      error.value = 'Failed to fetch invitations';
      pendingInvitations.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Computed property that returns true if there are pending invitations.
   */
  const hasPendingInvitations = computed(() => pendingInvitations.value.length > 0);

  return {
    pendingInvitations,
    isLoading,
    error,
    hasPendingInvitations,
    fetchInvitations,
  };
});
