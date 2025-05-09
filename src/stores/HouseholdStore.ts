import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/UserStore.ts';
import {
  getCurrentHousehold,
  getHouseholdMembers,
  getEmptyHouseholdMembers,
  joinWithToken
} from '@/services/HouseholdService.ts';
import type { Household, HouseholdMember, EmptyHouseholdMemberDto } from '@/models/Household.ts';

export const useHouseholdStore = defineStore('household', () => {
  // State
  const currentHousehold = ref<Household | null>(null);
  const members = ref<(HouseholdMember | EmptyHouseholdMemberDto)[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isMemberOfHousehold = computed(() => !!currentHousehold.value);

  // Mutations / Actions
  function setCurrentHousehold(household: Household | null) {
    currentHousehold.value = household;
  }

  function setMembers(list: (HouseholdMember | EmptyHouseholdMemberDto)[]) {
    members.value = list;
  }

  function addMember(member: HouseholdMember | EmptyHouseholdMemberDto) {
    members.value.push(member);
  }

  function removeMember(memberId: number) {
    members.value = members.value.filter(m => m.id !== memberId);
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(err: string | null) {
    error.value = err;
  }

  async function fetchCurrentHousehold() {
    const userStore = useUserStore();
    if (!userStore.loggedIn) return;

    setLoading(true);
    setError(null);
    try {
      const household = await getCurrentHousehold();
      setCurrentHousehold(household);
    } catch (err: any) {
      setCurrentHousehold(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function fetchHouseholdMembers() {
    if (!currentHousehold.value) return;

    setLoading(true);
    setError(null);
    try {
      const regular = await getHouseholdMembers();
      const empty = await getEmptyHouseholdMembers();
      setMembers([...regular, ...empty]);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function joinHouseholdWithToken(token: string) {
    const trimmed = token.trim();
    if (!trimmed) {
      throw new Error('Token is required');
    }

    setLoading(true);
    setError(null);
    try {
      const household = await joinWithToken(trimmed);
      setCurrentHousehold(household);
      return household;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function cleanHousehold() {
    setCurrentHousehold(null);
    setMembers([]);
    setLoading(false);
    setError(null);
  }

  return {
    // State
    currentHousehold,
    members,
    isLoading,
    error,
    // Computed
    isMemberOfHousehold,
    // Actions
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
    setCurrentHousehold,
    setLoading,
    setError,

  };
});

export type HouseholdStore = ReturnType<typeof useHouseholdStore>;

