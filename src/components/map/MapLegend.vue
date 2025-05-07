<template>
  <div :class="[
    'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
    $attrs.class
  ]">
    <div class="grid grid-cols-3 gap-x-4 gap-y-2 md:grid-cols-6">
      <div
        v-for="item in items"
        :key="item.labelKey"
        class="flex items-center gap-2"
      >
        <template v-if="item.icon">
          <img
            :src="item.icon"
            :class="['h-9 w-auto', item.extraClass || '']"
            alt=""
          />
        </template>
        <template v-else-if="item.iconClass">
          <div
            :class="['w-6 h-6 rounded-full', item.iconClass]"
          />
        </template>
        <span class="text-sm">{{ t(item.labelKey) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MapLegend Component
 *
 * A responsive grid display of map icons and their corresponding labels.
 * This component renders a legend for map features, displaying icons or colored indicators
 * with translated labels for each map element type.
 */
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/**
 * Represents a single item in the map legend
 *
 * @typedef {Object} LegendItem
 * @property {string} [icon] - URL to the icon image
 * @property {string} [iconClass] - CSS class for styling a colored indicator (used when no icon is provided)
 * @property {string} [extraClass] - Additional CSS classes to apply to the icon
 * @property {string} labelKey - Translation key for the item's label
 */
type LegendItem = {
  icon?: string
  iconClass?: string
  extraClass?: string
  labelKey: string
}

/**
 * Map icon imports
 *
 * These icons represent different points of interest and features on the map.
 * They are used in the legend to help users identify map elements visually.
 * The standard marker icon comes from Leaflet, while custom POI icons are from the local assets.
 */
import markerIconUrl        from 'leaflet/dist/images/marker-icon.png'
import firestationIconUrl from '@/assets/mapicons/firestation.svg'
import policestationIconUrl from '@/assets/mapicons/policestation.svg'
import hospitalIconUrl from '@/assets/mapicons/hospital.svg'
import pharmacyIconUrl from '@/assets/mapicons/pharmacy.svg'
import gasstationIconUrl from '@/assets/mapicons/gasstation.svg'
import grocerystoreIconUrl from '@/assets/mapicons/grocerystore.svg'
import waterpointIconUrl from '@/assets/mapicons/waterpoint.svg'
import meetingpointIconUrl from '@/assets/mapicons/meetingpoint.svg'
import shelterIconUrl from '@/assets/mapicons/shelter.svg'
import defaultPoiIconUrl from '@/assets/mapicons/home.svg'

/**
 * Component props
 */
const props = defineProps({
  /**
   * Optional title for the legend
   */
  title: { type: String, default: '' },

  /**
   * Controls whether the title is displayed
   */
  showTitle: { type: Boolean, default: true }
})

/**
 * Legend items configuration
 * Each item represents a map feature with its icon and translated label
 */
const items: LegendItem[] = [
  { icon: markerIconUrl, labelKey: 'map.legend.user-location', extraClass: 'user-location-icon' },
  { icon: markerIconUrl, labelKey: 'map.legend.household-location', extraClass: 'filter hue-rotate-300' },
  { iconClass: 'bg-yellow-400', labelKey: 'map.legend.crisis-level-1' },
  { iconClass: 'bg-orange-400', labelKey: 'map.legend.crisis-level-2' },
  { iconClass: 'bg-red-400',    labelKey: 'map.legend.crisis-level-3' },
  { icon: firestationIconUrl,   labelKey: 'map.legend.fire-station' },
  { icon: policestationIconUrl, labelKey: 'map.legend.police-station' },
  { icon: hospitalIconUrl,      labelKey: 'map.legend.hospital' },
  { icon: pharmacyIconUrl,      labelKey: 'map.legend.pharmacy' },
  { icon: gasstationIconUrl,    labelKey: 'map.legend.gas-station' },
  { icon: grocerystoreIconUrl,  labelKey: 'map.legend.grocery-store' },
  { icon: waterpointIconUrl,    labelKey: 'map.legend.water-point' },
  { icon: meetingpointIconUrl,  labelKey: 'map.legend.meeting-point' },
  { icon: shelterIconUrl,       labelKey: 'map.legend.shelter' },
  { icon: defaultPoiIconUrl,    labelKey: 'map.legend.default' }
]
</script>
