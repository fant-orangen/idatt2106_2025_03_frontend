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

  <Card class="">
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
              <Input type="text" v-model="selectedEvent.name" readonly disabled />
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { MeetingPlace, CreateMeetingPlaceRequest } from '@/models/MeetingPlace'
import meetingPlaceService from '@/services/MeetingPlaceService'
import * as z from 'zod'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
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
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectLabel,
} from '@/components/ui/select'
import {
Card,
CardContent,
CardHeader,
CardTitle,
} from '@/components/ui/card'

const { t } = useI18n();

const selectedMP = ref<MeetingPlace | null>(null);
const allMPts = computed<MeetingPlace[]>(() => data)

async function getAllMeetingPoints() {
  try {

  } catch (error) {

  }
}

async function selectMeetingPoint(id: number) {
	if (!event) {
		console.log('Event doesnt exist in array from backend');
		return;
	}
	try {
		const crisisEventDetails = await fetchCrisisEventById(event.id);
		console.log('Crisis Event details er: ', crisisEventDetails);
		if (crisisEventDetails) {
			selectedEvent.value = crisisEventDetails;
		} else {
			callToast('Could not load event...');
		}
	} catch (error) {
		console.error('Failed to select event', error);
	}
}

async function createNewMP(data: CreateMeetingPlaceRequest) {
  try {
    const response = await meetingPlaceService.createMeetingPlace(data)
    console.log('Creating new meeting place ...')
    callToast(response.data);
  } catch (error) {
    console.error('Could not create new meeting place', error)
  }
}

async function archiveMP(id: number) {
  try {
    const response = await meetingPlaceService.archiveMeetingPlace(id)
    console.log('Putting meeting place in archive ...')
    callToast(response.data);
  } catch (error) {
    console.error('Could not create new meeting place', error)
  }
}

async function activateMP(id: number) {
  try {
    const response = await meetingPlaceService.activateMeetingPlace(id)
    console.log('Activating the meeting place ...')
    callToast(response.data);
  } catch (error) {
    console.error('Could not create new meeting place', error)
  }
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