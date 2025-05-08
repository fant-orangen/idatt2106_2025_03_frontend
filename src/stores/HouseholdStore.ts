import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import { getCurrentHousehold } from '@/services/HouseholdService';
import type { Household, HouseholdMember, EmptyHouseholdMemberDto } from '@/models/Household';

// Type alias for convenience
type Member = HouseholdMember | EmptyHouseholdMemberDto;

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

  return {
    currentHousehold,
    members,
    isLoading,
    error,
    isMemberOfHousehold,
    fetchCurrentHousehold,
  };
});
