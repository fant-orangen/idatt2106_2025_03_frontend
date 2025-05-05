<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ $t('household.stats') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <!-- Total members -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UsersIcon class="h-5 w-5 text-primary" />
            <span>{{ $t('household.total_members') }}</span>
          </div>
          <Badge variant="outline" class="text-lg dark:bg-white dark:text-black">{{ totalMembers }}</Badge>
        </div>

        <!-- People -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UserIcon class="h-5 w-5 text-blue-500" />
            <span>{{ $t('household.adults') }}</span>
          </div>
          <Badge variant="outline" class="bg-blue-300 dark:text-black">{{ adultCount }}</Badge>
        </div>

        <!-- Children -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <BabyIcon class="h-5 w-5 text-green-500" />
            <span>{{ $t('household.children') }}</span>
          </div>
          <Badge variant="outline" class="bg-green-300 dark:text-black">{{ childCount }}</Badge>
        </div>

        <!-- Pets -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <PawPrintIcon class="h-5 w-5 text-amber-500" />
            <span>{{ $t('household.pets') }}</span>
          </div>
          <Badge variant="outline" class="bg-amber-300 dark:text-black">{{ petCount }}</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UsersIcon, UserIcon, BabyIcon, PawPrintIcon } from 'lucide-vue-next';
import type { HouseholdMember, EmptyHouseholdMemberDto } from '@/models/Household';

const props = defineProps<{
  members: (HouseholdMember | EmptyHouseholdMemberDto)[];
}>();

// Calculate total members
const totalMembers = computed(() => props.members.length);

// Calculate adult count (real members + empty adult members)
const adultCount = computed(() =>
  props.members.filter(member =>
    'email' in member ||
    (!('email' in member) && (member as EmptyHouseholdMemberDto).type.toLowerCase() === 'adult')
  ).length
);

// Calculate child count (empty members with type 'CHILD')
const childCount = computed(() =>
  props.members.filter(member =>
    !('email' in member) &&
    (member as EmptyHouseholdMemberDto).type.toLowerCase() === 'child'
  ).length
);

// Calculate pet count (empty members with type 'PET' or 'DOG')
const petCount = computed(() =>
  props.members.filter(member =>
    !('email' in member) &&
    (['pet', 'dog'].includes((member as EmptyHouseholdMemberDto).type.toLowerCase()))
  ).length
);
</script>
