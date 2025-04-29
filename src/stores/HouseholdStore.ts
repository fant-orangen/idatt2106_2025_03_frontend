import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import { getCurrentHousehold, getHouseholdMembers, getEmptyHouseholdMembers, joinWithToken } from '@/services/HouseholdService';
import type { Household, Member } from '@/models/Household';

export const useHouseholdStore = defineStore('household', () => {
  const userStore = useUserStore();

  const currentHousehold = ref<Household | null>(null);
  const members = ref<Member[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isMemberOfHousehold = computed(() => !!currentHousehold.value);

  function setCurrentHousehold(household: Household | null): void {
    currentHousehold.value = household;
  }

  function setMembers(newMembers: Member[]): void {
    members.value = newMembers;
  }

  function addMember(member: Member): void {
    members.value.push(member);
  }

  function removeMember(memberId: number): void {
    members.value = members.value.filter(member => member.id !== memberId);
  }

  function setLoading(loading: boolean): void {
    isLoading.value = loading;
  }

  function setError(errorMessage: string | null): void {
    error.value = errorMessage;
  }

  async function fetchCurrentHousehold(): Promise<void> {
    if (!userStore.loggedIn) return;

    setLoading(true);
    setError(null);

    try {
      const household = await getCurrentHousehold();
      setCurrentHousehold(household);
    } catch (err: Error | unknown) {
      console.error('Error fetching household:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch household');
    } finally {
      setLoading(false);
    }
  }

  async function fetchHouseholdMembers(): Promise<void> {
    if (!currentHousehold.value) return;

    setLoading(true);
    setError(null);

    try {
      const regularMembers = await getHouseholdMembers();
      const emptyMembers = await getEmptyHouseholdMembers();
      setMembers([...regularMembers, ...emptyMembers]);
    } catch (err: Error | unknown) {
      console.error('Error fetching household members:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch household members');
    } finally {
      setLoading(false);
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

    setLoading(true);
    setError(null);

    try {
      const household = await joinWithToken(token);
      setCurrentHousehold(household);
    } catch (err: Error | unknown) {
      console.error('Error joining household with token:', err);
      setError(err instanceof Error ? err.message : 'Failed to join household');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Resets all household-related state in the store
   * Useful when logging out or cleaning up state
   */
  function cleanHousehold(): void {
    setCurrentHousehold(null);
    setMembers([]);
    setError(null);
    setLoading(false);
  }

  return {
    currentHousehold,
    members,
    isLoading,
    error,
    isMemberOfHousehold,
    setCurrentHousehold,
    setMembers,
    addMember,
    removeMember,
    setLoading,
    setError,
    fetchCurrentHousehold,
    fetchHouseholdMembers,
    joinHouseholdWithToken,
    cleanHousehold
  };
});
