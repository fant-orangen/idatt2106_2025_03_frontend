
<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle>{{ t('crisis.details', 'Crisis Details') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="crisisDetails" class="space-y-4">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          {{ crisisDetails.name || 'Unnamed Crisis' }}
          <Badge :class="crisisDetails.severityClass || 'bg-gray-500 text-white'">
            {{ crisisDetails.severity ? crisisDetails.severity.toUpperCase() : 'UNKNOWN' }}
          </Badge>
        </h3>

        <p v-if="crisisDetails.description" class="mt-2 text-muted-foreground">
          {{ crisisDetails.description }}
        </p>

        <div class="mt-4 space-y-3">
          <div class="grid grid-cols-3 text-sm">
            <span class="font-semibold">{{ t('crisis.coordinates', 'Coordinates') }}</span>
            <span class="col-span-2">
              {{ isValidCoordinate(crisisDetails.epicenterLatitude) ? crisisDetails.epicenterLatitude.toFixed(4) : 'N/A'
              }},
              {{ isValidCoordinate(crisisDetails.epicenterLongitude) ? crisisDetails.epicenterLongitude.toFixed(4) : 'N/A'
              }}
            </span>
          </div>

          <div class="grid grid-cols-3 text-sm">
            <span class="font-semibold">{{ t('crisis.radius', 'Radius') }}</span>
            <span class="col-span-2">
              {{ isValidCoordinate(crisisDetails.radius) ? `${crisisDetails.radius}m` : 'N/A' }}
            </span>
          </div>

          <div class="grid grid-cols-3 text-sm">
            <span class="font-semibold">{{ t('crisis.started', 'Started') }}</span>
            <span class="col-span-2">{{ crisisDetails.formattedStartTime || 'N/A' }}</span>
          </div>

          <div class="grid grid-cols-3 text-sm">
            <span class="font-semibold">{{ t('crisis.updated', 'Updated') }}</span>
            <span class="col-span-2">{{ crisisDetails.formattedUpdateTime || 'N/A' }}</span>
          </div>

          <div class="grid grid-cols-3 text-sm">
            <span class="font-semibold">{{ t('crisis.created_by', 'Created By') }}</span>
            <span class="col-span-2">{{ crisisDetails.createdByUser || 'N/A' }}</span>
          </div>

          <Badge :variant="crisisDetails.scenarioThemeId || 'default'">
            {{ crisisDetails.severity ? crisisDetails.severity.toUpperCase() : 'UNKNOWN' }}
          </Badge>

        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { CrisisEventDto } from '@/models/CrisisEvent.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateFull } from '@/utils/dateUtils.ts';
import { getSeverityClass } from '@/utils/severityUtils';

const props = defineProps<{
  crisis: CrisisEventDto | null;
}>();

const { t } = useI18n();
const router = useRouter();

const isValidCoordinate = (coord: unknown): boolean => {
  console.log("unknown", coord);
  if (typeof coord !== 'number' || isNaN(coord)) {
    return false;
  }
  return isFinite(coord);
};

const crisisDetails = computed(() => {
  if (!props.crisis) return null;

  return {
    ...props.crisis,
    formattedStartTime: formatDateFull(props.crisis.startTime),
    formattedUpdateTime: formatDateFull(props.crisis.updatedAt),
    severityClass: getSeverityClass(props.crisis.severity),
  };
});

/**
 * Navigates to the scenario page with the current crisis ID
 * For now, we'll navigate to a placeholder route
 */
function navigateToScenarioPage() {
  if (!props.crisis) return;

  // For now, navigate to the crisis event view with a query parameter
  // This can be updated later to navigate to a specific scenario page
  router.push({
    name: 'CrisisEvent',
    query: { scenarioId: props.crisis.id }
  });
}
</script>
