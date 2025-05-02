<template>
  <div>
    <CrisisEventOverview />
  </div>
</template>

<script setup lang="ts">
/**
 * CrisisEventView
 *
 * This view serves as a container for the CrisisEventOverview component.
 * It provides a dedicated page for viewing and interacting with crisis events.
 *
 * The page displays:
 * - A map of crisis events
 * - A list of active crisis events
 * - Detailed information about the selected crisis
 * - Event history and related news
 *
 * @component
 */
import CrisisEventOverview from '@/components/crisis/CrisisEventOverview.vue';
</script>
