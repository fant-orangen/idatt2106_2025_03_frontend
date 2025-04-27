import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import { getCurrentHousehold, getHouseholdMembers, joinWithToken } from '@/services/HouseholdService';
import type { Household, Member } from '@/models/Household';

export const useHouseholdStore = defineStore('household', () => {
  const userStore = useUserStore();

  // State
  const currentHousehold = ref<Household | null>(null);
  const members = ref<Member[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isMemberOfHousehold = computed(() => !!currentHousehold.value);

  // Actions
  async function fetchCurrentHousehold(): Promise<void> {
    if (!userStore.loggedIn) return;

    isLoading.value = true;
    error.value = null;

    try {
      currentHousehold.value = await getCurrentHousehold();

      // If user has a household, fetch its members
      if (currentHousehold.value) {
        await fetchHouseholdMembers();
      }
    } catch (err: Error | unknown) {
      console.error('Error fetching household:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch household';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchHouseholdMembers(): Promise<void> {
    if (!currentHousehold.value) return;

    isLoading.value = true;

    try {
      members.value = await getHouseholdMembers(currentHousehold.value.id);
    } catch (err: Error | unknown) {
      console.error('Error fetching household members:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch household members';
    } finally {
      isLoading.value = false;
    }
  }
  /**
   * Join a household using an invitation token
   * @param token The invitation token
   * @returns Promise that resolves when the operation is successful
   */
  async function joinHouseholdWithToken(token: string): Promise<void> {
    if (!token.trim()) {
      throw new Error('Token is required');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const household = await joinWithToken(token);
      currentHousehold.value = household;
      await fetchHouseholdMembers();
    } catch (err: Error | unknown) {
      console.error('Error joining household with token:', err);
      error.value = err instanceof Error ? err.message : 'Failed to join household';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Resets all household-related state in the store
   * Useful when logging out or cleaning up state
   */
  function cleanHousehold(): void {
    currentHousehold.value = null;
    members.value = [];
    error.value = null;
    isLoading.value = false;
  }

  return {
    currentHousehold,
    members,
    isLoading,
    error,
    isMemberOfHousehold,
    fetchCurrentHousehold,
    fetchHouseholdMembers,
    joinHouseholdWithToken,
    cleanHousehold
  };
});
