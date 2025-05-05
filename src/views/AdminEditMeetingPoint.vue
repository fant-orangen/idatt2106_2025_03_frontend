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

    <h1>{{$t('admin.meeting-point')}}</h1>
  </div>

  <Card v-if="!selectedMP">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card Description</CardDescription>
    </CardHeader>
    <CardContent>
      <InfiniteScroll :is-loading="isFetchingNextPage" :has-more="hasNextPage" @load-more="fetchNextPage">
        <div v-for="meetingPoint in allMPts" 
        :key="meetingPoint.id" 
        @click="fetchMeetingPointDetails(meetingPoint.id)">
          
        </div>
      </InfiniteScroll>
    </CardContent>
    
    <CardFooter>
      <template #loading>
        <div class="text-center p-4">Laster...</div>
      </template>
      <template #end-message>
        <div class="text-center p-4">Alle hendelser er lastet inn</div>
      </template>
    </CardFooter>
  </Card>

  <!--Form to create new meeting point -->
  <Card v-if="selectedMP" class="">
    <CardHeader>
      <CardTitle></CardTitle>
      <CardDescription>Card Description</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="onSubmit" >
        <FormField name="title">
          <FormItem>
            <FormLabel>{{$t('add-event-info.titles.title')}}</FormLabel>
            <FormControl>
              <Input type="text" v-model="selectedMP.name" readonly disabled />
            </FormControl>
            <FormDescription>{{ $t('add-event-info.title') }}</FormDescription>
          </FormItem>
        </FormField>
						
        <br>
        <div class="container">
          <FormField v-slot="{ field, meta, errorMessage }" name="latitude">
            <FormItem>
              <FormLabel>{{$t('add-event-info.titles.latitude')}}</FormLabel>
              <FormControl>
                <Input class="w-[100px]" type="number" step="any" v-bind="field" />
              </FormControl>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!--Longitude field-->
          <FormField v-slot="{ field, meta, errorMessage }" name="longitude">
            <FormItem>
              <FormLabel>{{$t('add-event-info.titles.longitude')}}</FormLabel>
              <FormControl>
                <Input class="w-[100px]" type="number" step="any" v-bind="field" />
              </FormControl>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

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
        <p class="text-muted-foreground text-sm">{{ $t('add-event-info.coordinates') }}</p>
        <br>
        <!--Description of meeting point-->
        <FormField v-slot="{ field, meta, errorMessage }" name="description">
            <FormItem>
                <FormLabel>{{$t('add-event-info.titles.description')}}:</FormLabel>
                <FormControl>
                  <Textarea
                    class="descriptionArea"
                    v-bind="field">
                  </Textarea>
                </FormControl>
                <FormDescription>{{ $t('add-event-info.description') }}</FormDescription>
                <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
            </FormItem>
        </FormField>
        <br>
        <div class="buttons">
          <Button>{{$t('add-event-info.titles.submit')}}</Button>
          <Button type="button" variant="destructive" @click="deactivateEvent(selectedEvent.id)">{{$t('add-event-info.titles.deactivate')}}</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Separator } from '@/components/ui/separator'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { MeetingPlace, CreateMeetingPlaceDto, MeetingPlacePreviewDto } from '@/models/MeetingPlace'
import { meetingPlaceService } from '@/services/MeetingPlaceService'
import * as z from 'zod'
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
} from '@/components/ui/card'

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


const form = ref();
const onSubmit = ref<(e?: Event) => void>();
const selectedMP = ref<MeetingPlace | null>(null);
const newMeetingPoint = ref<CreateMeetingPlaceDto | null>(null);
const allMPts = computed<MeetingPlacePreviewDto[]>(() => data.value?.pages.flat() ?? []);

allMPts.value.forEach((event: MeetingPlacePreviewDto) => { console.log(event.id)});

watch(selectedMP, async (meetingPoint) => {
  if (meetingPoint && form.value) {
    // await nexttick();
    form.value.setValues({
      title: meetingPoint.name,
      latitude: meetingPoint.latitude,
      longitude: meetingPoint.longitude,
      address: meetingPoint.address,
    })
  }
});

onMounted(() => {
  fetchNextPage();
  try {
    setUpForm();
  } catch (error) {
    console.error('Kunne ikke sette opp form skjema...', error);
  }
})

function setUpForm() {
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
	form.value = useForm({ validationSchema: formSchema });
	onSubmit.value = form.value.handleSubmit(handleFormSubmit);
}

async function handleFormSubmit(values: any) {
  if (!selectedMP.value) {
    console.error('No meeting point selected...');
    return;
  }
  newMeetingPoint.value = {
    name: values.title,
    latitude: values.latitude,
    longitude: values.longitude,
    address: values.address ?? '',
  }
  createNewMP(newMeetingPoint.value);
}

/**
 * Fetch details about a specific meeting point from the backend API
 * @param id 
 */
async function fetchMeetingPointDetails(id: number) {
  let mpExists: boolean = false
	for (let i = 0; i < allMPts.value.length; i++) {
    if (allMPts.value[i].id === id) {
      mpExists = true;
      break;
	  }
  }
  if (mpExists) {
    try {
      const meetingPointResponse = await meetingPlaceService.getAMeetingPlace(id);
      console.log('MP details er: ', meetingPointResponse);
      
      if (meetingPointResponse) {
        selectedMP.value = meetingPointResponse;
      } else {
        callToast('Could not load meeting point...');
      }
    } catch (error) {
      console.error('Failed to select MP', error);
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
    callToast('Archived the meeting point: ');

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
	selectedMP.value = null;
	form.value?.resetForm();
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

<style scoped>
  h1 {
    margin: 10px;
    font-size: 2em;
  }

</style>