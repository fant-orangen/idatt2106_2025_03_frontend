<template>
  <!-- Wrapped legend in shadcn Card for consistent styling -->
  <Card class="w-full">
    <CardHeader class="pb-0">
      <CardTitle class="text-lg">
        {{ t('map.legend.title', 'Legend') }}
      </CardTitle>
    </CardHeader>
    <CardContent class="pt-2">
      <!-- Responsive grid: 2 cols on xs, 3 on sm, 4 on md, 6 on lg+ -->
      <div class="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div
          v-for="item in items"
          :key="item.labelKey"
          class="flex items-center gap-2 whitespace-nowrap"
        >
          <img
            v-if="item.icon"
            :src="item.icon"
            alt=""
            class="w-6 h-6 object-contain"
            :class="item.extraClass || ''"
          />
          <div
            v-else
            :style="item.style"
            class="w-6 h-6 rounded-full"
          ></div>
          <span class="text-sm">
            {{ t(item.labelKey) }}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Legend icons
import markerIconUrl        from 'leaflet/dist/images/marker-icon.png'
import firestationIconUrl   from '@/assets/mapicons/firestation.svg'
import policestationIconUrl from '@/assets/mapicons/policestation.svg'
import hospitalIconUrl      from '@/assets/mapicons/hospital.svg'
import pharmacyIconUrl      from '@/assets/mapicons/pharmacy.svg'
import gasstationIconUrl    from '@/assets/mapicons/gasstation.svg'
import grocerystoreIconUrl  from '@/assets/mapicons/grocerystore.svg'
import waterpointIconUrl    from '@/assets/mapicons/waterpoint.svg'
import meetingpointIconUrl  from '@/assets/mapicons/meetingpoint.svg'
import shelterIconUrl       from '@/assets/mapicons/shelter.svg'
import defaultPoiIconUrl    from '@/assets/mapicons/home.svg'

const { t } = useI18n()

// Legend items configuration
const items = [
  { icon: markerIconUrl,        labelKey: 'map.legend.user-location' },
  { icon: markerIconUrl,        labelKey: 'map.legend.household-location', extraClass: 'filter hue-rotate-300' },
  { style: { backgroundColor: 'var(--crisis-level-green)'}, labelKey: 'map.legend.crisis-level-1' },
  { style: { backgroundColor: 'var(--crisis-level-yellow)'},  labelKey: 'map.legend.crisis-level-2' },
  { style: { backgroundColor: 'var(--crisis-level-red)'},     labelKey: 'map.legend.crisis-level-3' },
  { icon: firestationIconUrl,    labelKey: 'map.legend.fire-station' },
  { icon: policestationIconUrl,  labelKey: 'map.legend.police-station' },
  { icon: hospitalIconUrl,       labelKey: 'map.legend.hospital' },
  { icon: pharmacyIconUrl,       labelKey: 'map.legend.pharmacy' },
  { icon: gasstationIconUrl,     labelKey: 'map.legend.gas-station' },
  { icon: grocerystoreIconUrl,   labelKey: 'map.legend.grocery-store' },
  { icon: waterpointIconUrl,     labelKey: 'map.legend.water-point' },
  { icon: meetingpointIconUrl,   labelKey: 'map.legend.meeting-point' },
  { icon: shelterIconUrl,        labelKey: 'map.legend.shelter' },
  { icon: defaultPoiIconUrl,     labelKey: 'map.legend.default' }
]
</script>
