
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
            <span class="font-semibold">{{ t('crisis.scenario_theme', 'Scenario Theme') }}</span>
            <span class="col-span-2">
              <Button
                v-if="crisisDetails.scenarioThemeId"
                variant="link"
                class="p-0 h-auto text-sm font-normal"
                @click="navigateToScenarioTheme(crisisDetails.scenarioThemeId)"
              >
                {{ t('crisis.view_scenario_theme', 'View Scenario Theme') }}
                <ArrowRight class="ml-1 h-3 w-3" />
              </Button>

              <Button
                v-else
                variant="link"
                class="p-0 h-auto text-sm font-normal"
                @click="navigateToDefaultScenarioTheme()"
              >
                {{ t('crisis.view_scenario_themes', 'View Scenario Themes') }}
                <ArrowRight class="ml-1 h-3 w-3" />
              </Button>
            </span>
          </div>

        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next';
import type { CrisisEventDto } from '@/models/CrisisEvent.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateFull } from '@/utils/dateUtils.ts';
import { getSeverityClass } from '@/utils/severityUtils';

/**
 * CrisisDetails component
 *
 * This component displays detailed information about a crisis event, including:
 * - Name and severity level
 * - Description
 * - Geographic coordinates and affected radius
 * - Timestamps (start time and last update)
 * - Creator information
 *
 * @component
 */

/**
 * Component props
 */
const props = defineProps<{
  /** The crisis event to display details for. Can be null if no crisis is selected. */
  crisis: CrisisEventDto | null;
}>();

const { t } = useI18n();
const router = useRouter();

/**
 * Validates if a coordinate value is valid (a finite number)
 *
 * @param coord - The coordinate value to check
 * @returns True if the coordinate is valid, false otherwise
 */
const isValidCoordinate = (coord: unknown): boolean => {
  console.log("unknown", coord);
  if (typeof coord !== 'number' || isNaN(coord)) {
    return false;
  }
  return isFinite(coord);
};

/**
 * Computed property that formats and enhances crisis data for display
 * Adds formatted timestamps and severity class for styling
 */
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
 * Navigates to the scenario theme page with the theme ID in the URL path
 *
 * @param {number} themeId - The ID of the scenario theme to navigate to
 */
function navigateToScenarioTheme(themeId: number) {
  router.push({
    name: 'ScenarioTheme',
    params: { id: themeId.toString() }
  });
}

/**
 * Navigates to the information page without a specific scenario theme ID
 * This will show all available scenario themes
 */
function navigateToDefaultScenarioTheme() {
  router.push({
    name: 'Information'
  });
}
</script>
