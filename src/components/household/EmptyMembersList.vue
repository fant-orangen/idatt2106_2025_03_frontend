<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <CardTitle>{{ $t('household.empty_members') }}</CardTitle>
      <Button
        v-if="isAdmin"
        variant="outline"
        size="sm"
        @click="$emit('add-empty-member')"
      >
        <PlusIcon class="h-4 w-4 mr-1" />
        {{ $t('household.add_empty_member') }}
      </Button>
    </CardHeader>
    <CardContent>
      <div v-if="emptyMembers.length === 0" class="flex flex-col items-center justify-center h-24 text-muted-foreground">
        <UserIcon class="h-8 w-8 mb-2 opacity-40" />
        <p>{{ $t('household.no_empty_members') }}</p>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="member in emptyMembers"
          :key="member.id"
          class="relative group rounded-md border border-border bg-card hover:bg-accent/30 transition-all duration-200 overflow-hidden p-3"
          :class="{ 'hover:border-destructive/50': isAdmin }"
        >
          <div class="flex items-center gap-3">
            <!-- Member icon based on type -->
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full flex items-center justify-center"
                :class="getMemberTypeClass(member.type)">
                <component :is="getMemberTypeIcon(member.type)" class="h-5 w-5" />
              </div>
            </div>

            <!-- Member details -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium">{{ member.name }}</p>
              <p class="text-xs text-muted-foreground">{{ member.type }}</p>
              <p v-if="member.description" class="text-xs text-muted-foreground mt-1">
                {{ member.description }}
              </p>
            </div>

            <!-- Admin actions -->
            <div v-if="isAdmin" class="flex-shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                @click="$emit('remove-member', member.id)"
              >
                <TrashIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserIcon, BabyIcon, PawPrintIcon, PlusIcon, TrashIcon } from 'lucide-vue-next';
import type { EmptyHouseholdMemberDto } from '@/models/Household';

const props = defineProps<{
  emptyMembers: EmptyHouseholdMemberDto[];
  isAdmin: boolean;
}>();

defineEmits(['add-empty-member', 'remove-member']);

// Get the appropriate icon component based on member type
const getMemberTypeIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'CHILD':
      return BabyIcon;
    case 'DOG':
    case 'PET':
      return PawPrintIcon;
    default:
      return UserIcon;
  }
};

// Get the appropriate CSS class based on member type
const getMemberTypeClass = (type: string) => {
  switch (type.toUpperCase()) {
    case 'CHILD':
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
    case 'DOG':
    case 'PET':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300';
    default:
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
  }
};
</script>
