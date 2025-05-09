<template>
<div class="p-5">
  <Breadcrumb>
    <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">
      {{ $t('navigation.home') }}
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator/>
    <BreadcrumbItem>
      <BreadcrumbLink href="/admin/admin-panel">
      {{ $t('navigation.admin-panel') }}
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator/>
    <BreadcrumbItem>
      <BreadcrumbLink href="/admin/meeting-point">
      {{ $t('navigation.meeting-point') }}
      </BreadcrumbLink>
    </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

  <h1 class="text-3xl p-5">{{$t('admin.meeting-point')}}</h1>

  <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
    <!--Overview of all meeting points-->
    <Card class="max-h-fit shadow-md hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle>{{ $t('admin.meeting-places') }}: </CardTitle>
      </CardHeader>
      <CardContent class="overflow-y-auto max-h-[500px]">
        <!--Search bar-->
        <div class="relative mb-4 w-full max-w-sm">
          <Input v-model="searchQuery" type="text" :placeholder="t('admin.search-meeting-point')"
            class="w-full rounded-md border px-3 py-2 pl-9 shadow-sm" 
            />
          <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
            <Search class="size-4 text-muted-foreground" />
          </span>
        </div>
        <InfiniteScroll :is-loading="isFetchingNextPage" :has-more="hasNextPage" @load-more="fetchNextPage">
          <div v-for="meetingPoint in filteredMPts"
            :key="meetingPoint.id"
            @click="selectMeetingPoint(meetingPoint.id)"
            class="h-full w-full rounded-md border p-2 cursor-pointer hover:bg-muted transition-colors m-2 min-w-fit">
            <div class="cursor-pointer min-w-fit flex flex-row flex-nowrap">
              <MapPinCheckInside />
              <span>{{ meetingPoint.name }}</span>
            </div>
          </div>
          <div v-if="!filteredMPts.length" class="p-2 text-center">
            {{ $t('common.not-found') }}...
          </div>
        </InfiniteScroll>
      </CardContent>

      <CardFooter>
        <template #loading>
          <div class="text-center p-4">{{ $t('common.loading') }}</div>
        </template>
        <template #end-message>
          <div class="text-center p-4">{{ $t('common.all-is-loaded') }}</div>
        </template>
      </CardFooter>
    </Card>

    <!--Form to create new meeting point -->
    <Card class="max-h-fit shadow-md hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle>{{ $t('admin.create-mp') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit" class="flex flex-col gap-5">
          <!-- Name of meeting place: -->
          <FormField v-slot="{ field, meta, errorMessage }" name="name">
            <FormItem>
              <FormLabel>{{$t('add-event-info.titles.title')}}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="field" class="w-full" />
              </FormControl>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
              <FormDescription>{{ $t('add-event-info.title') }}</FormDescription>
            </FormItem>
          </FormField>

          <div class="flex flex-col gap-5">
            <!--Latitude field-->
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-5 md:flex-row">
                <FormField v-slot="{ field, meta, errorMessage }" name="latitude">
                  <FormItem>
                    <FormLabel>{{$t('add-event-info.titles.latitude')}}</FormLabel>
                    <FormControl>
                      <Input class="w-full" type="number" step="any" v-bind="field" />
                    </FormControl>
                    <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                  </FormItem>
                </FormField>

                <!--Longitude field-->
                <FormField v-slot="{ field, meta, errorMessage }" name="longitude">
                  <FormItem>
                    <FormLabel>{{$t('add-event-info.titles.longitude')}}</FormLabel>
                    <FormControl>
                      <Input class="w-full" type="number" step="any" v-bind="field" />
                    </FormControl>
                    <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                  </FormItem>
                </FormField>
              </div>

              <!--Address field-->
              <FormField v-slot="{ field, meta, errorMessage }" name="address">
                <FormItem>
                  <FormLabel>{{$t('add-event-info.titles.address')}}</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Eksempelveien 2" v-bind="field" />
                  </FormControl>
                  <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                </FormItem>
              </FormField>
            </div>
            <p class="text-muted-foreground text-sm">{{$t('add-event-info.coordinates')}}</p>
          </div>

          <div class="flex flex-row flex-wrap gap-5">
            <Button>{{$t('add-event-info.titles.submit')}}</Button>
            <Button type="button" variant="secondary" @click="cancelUpdate()"> Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- third column -->
    <div class="flex flex-col gap-5 z-50">
      <!-- your existing controller (it already renders a <Card>) -->
      <AdminMapController
        :mapComponent="mapCompRef"
        @location-selected="onLocationSelected"
        @location-cleared="onLocationCleared"
        class="shadow-md hover:shadow-xl transition-shadow"
      />

      <!-- the map container -->
      <div class="flex-grow lg:min-h-[500px] min-h-[400px] rounded-lg overflow-hidden border border-gray-300 shadow-md z-50">
        <MapComponent
          ref="mapCompRef"
          :adminMode="true"
          :showPois="false"
          :showCrisis="false"
          :showMeetingPlaces="false"
          class="h-full w-full"
          @map-clicked="handleMapClick"
        />
      </div>
    </div>

  </div>
  <!--Handle meeting point drawer -->
  <Drawer v-model:open="isOpen" v-if="selectedMP">
    <DrawerContent class="z-101">
      <DrawerHeader class="flex flex-column gap-3">
        <DrawerTitle class="flex flex-row flex-wrap gap-3">
          <MapPinCheckInside />
          <span>{{selectedMP.name}}</span>
          <span :class="['bg rounded-md p-1', selectedMP.status === 'active' ? 'bg-blue-300' : 'bg-gray-300']">{{$t('add-event-info.isArchived.' + selectedMP.status)}}</span>
        </DrawerTitle>
        <DrawerDescription>{{ $t('admin.edit-mp') }}</DrawerDescription>
      </DrawerHeader>
      <DrawerFooter>
        <DrawerClose class="flex flex-row flex-wrap gap-5 justify-center">
          <Button @click="activateMP(selectedMP.id)" variant="outline">Aktiver møteplass</Button>
          <Button @click="archiveMP(selectedMP.id)" variant="destructive">Arkiver møteplass</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</div>
</template>

<script setup lang="ts">
import MapComponent from '@/components/map/MapComponent.vue'
import AdminMapController from '@/components/admin/AdminMapController.vue'
import * as L from 'leaflet'
import { toast } from 'vue-sonner'
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { CreateMeetingPlaceDto, MeetingPlacePreviewDto } from '@/models/MeetingPlace'
import { meetingPlaceService } from '@/services/MeetingPlaceService'
import * as z from 'zod'
import { Search, MapPinCheckInside } from 'lucide-vue-next';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'

const { t } = useI18n();

/**
 * For pagination in list of meeting points:
 */
const queryClient = useQueryClient();
const pageSize = 10;
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery<MeetingPlacePreviewDto[], Error>({
  queryKey: ['allMPts'],
  queryFn: async ({ pageParam = 0 }) => {
		const pageNumber = pageParam as number;
		const page = await meetingPlaceService.getPreviewMeetingPlaces(pageNumber, 10);
		return page.content;
	},
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < pageSize ? undefined : allPages.length;
	},
	initialPageParam: 0
});

const isOpen = ref(false);
const selectedMP = ref<MeetingPlacePreviewDto | null>(null);
const newMeetingPoint = ref<CreateMeetingPlaceDto | null>(null);
const searchQuery = ref('');
const tempMarker = ref<L.Marker | null>(null)

const allMPts = computed<MeetingPlacePreviewDto[]>(() => data.value?.pages.flat() ?? []);
allMPts.value.forEach((event: MeetingPlacePreviewDto) => { console.log(event.name)});

// A ref for your MapComponent instance
const mapCompRef = ref<InstanceType<typeof MapComponent> | null>(null)

// Called by both the controller and a map‐click
function onLocationSelected(loc: { lat: number; lng: number }) {
  // 1) update your form fields (you already have this)
  form.setFieldValue('latitude', loc.lat)
  form.setFieldValue('longitude', loc.lng)

  // 2) remove any old temp marker
  if (tempMarker.value && mapCompRef.value?.removeMarker) {
    mapCompRef.value.removeMarker(tempMarker.value as L.Marker)
    tempMarker.value = null
  }

  // 3) add a fresh one
  if (mapCompRef.value?.addMarker) {
    tempMarker.value = mapCompRef.value.addMarker(
      loc.lat,
      loc.lng,
      'Valgt møteplass'
    )
  }
}

// Fired when the map itself is clicked:
function handleMapClick(evt: { latlng: { lat: number; lng: number } }) {
  onLocationSelected({ lat: evt.latlng.lat, lng: evt.latlng.lng })
}

// Fired when the location is cleared from the controller
function onLocationCleared() {
  // Clear form fields
  form.setFieldValue('latitude', undefined)
  form.setFieldValue('longitude', undefined)

  // Remove any temp marker
  if (tempMarker.value && mapCompRef.value?.removeMarker) {
    mapCompRef.value.removeMarker(tempMarker.value as L.Marker)
    tempMarker.value = null
  }
}

onMounted(() => {
  fetchNextPage()
})

const filteredMPts = computed(() => {
  return allMPts.value.filter(mp => mp.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});


const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, t('add-event-info.errors.title')).max(50, t('add-event-info.errors.title')),
    latitude: z.preprocess((val) => val === '' ? undefined : Number(val), z.number()
      .min(-90, t('add-event-info.errors.latitude'))
      .max(90, t('add-event-info.errors.latitude'))),
    longitude: z.preprocess((val) => val === '' ? undefined : Number(val), z.number()
      .min(-180, t('add-event-info.errors.longitude'))
      .max(180, t('add-event-info.errors.longitude'))),
    address: z.string()
      .max(100, t('add-event-info.errors.address'))
      .optional(),
  }).refine((data) => {
    if ((data.latitude === undefined || isNaN(data.latitude)) || (data.longitude === undefined || isNaN(data.longitude))) {
        return !!data.address && data.address.length > 0;
    }
    return true;
  }, {
    message: t('add-event-info.errors.position-missing'),
    path: ['address'],
  })
);


const form = useForm({
  validationSchema: formSchema
});

const onSubmit = form.handleSubmit(handleFormSubmit);

async function handleFormSubmit(values: any) {
  newMeetingPoint.value = {
    name: values.name,
    latitude: values.latitude,
    longitude: values.longitude,
    address: values.address ?? '',
  }
  createNewMP(newMeetingPoint.value);
}

async function selectMeetingPoint(id: number) {
	for (let i = 0; i < allMPts.value.length; i++) {
    if (allMPts.value[i].id === id) {
      selectedMP.value = allMPts.value[i]
      console.log('mp = ', selectedMP.value)
      isOpen.value = true
      break;
	  }
  }
}

/**
 * Create a new meeting point
 * @param data
 */
async function createNewMP(data: CreateMeetingPlaceDto) {
  try {
    const response = await meetingPlaceService.createMeetingPlace(data)
    console.log('Creating new meeting place ...', response)
    callToast('Created a new meeting place successfully!');
    // send a dialogue message that a new mp was created other than the toast maybe??
    selectedMP.value = null;

    await queryClient.invalidateQueries({queryKey: ['allMPts']});
  } catch (error) {
    console.error('Could not create new meeting place', error)
  }
}

/**
 * Archive (deactivate) a meeting point.
 * @param id
 */
async function archiveMP(id: number) {
  try {
    const response = await meetingPlaceService.archiveMeetingPlace(id)
    console.log('Putting meeting place in archive ...', response)
    callToast('Archived the meeting point.');

    selectedMP.value = null;

    await queryClient.invalidateQueries({queryKey: ['allMPts']});
  } catch (error) {
    console.error('Could not create new meeting place', error)
  }
}

/**
 * Activate a meeting point
 * @param id
 */
async function activateMP(id: number) {
  try {
    const response = await meetingPlaceService.activateMeetingPlace(id)
    console.log('Activating the meeting place ...', response)
    callToast('Activated the meeting point!');

    selectedMP.value = null;
    await queryClient.invalidateQueries({queryKey: ['allMPts']});
  } catch (error) {
    console.error('Could not create new meeting place', error)
  }
}

function cancelUpdate() {
	form.resetForm();
}

/**
* Pop-up functionality.
* Takes in a message to show the user that some action has happened.
* @param message
*/
function callToast (message: string) {
	console.log('Called toast for message: ', message);
	toast(message);
}
</script>
