<template>
<div style="margin: 20px;">
	<Breadcrumb>
		<BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbLink href="/admin-panel">
				{{ $t('navigation.admin-panel') }}
				</BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator/>
			<BreadcrumbItem>
				<BreadcrumbPage href="/edit-event">{{ $t('admin.edit-event') }}</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	</Breadcrumb>


    <h1>{{$t('admin.edit-event')}}:</h1>

    <!--Go back button shows up when an event is chosen-->
    <div v-if="selectedEvent">
        <Button @click="cancelUpdate()">{{ $t('navigation.go-back') }}</Button>
    </div>

    <div class="page">
        <!--Scrollable element of all current events-->
        <div class="events" v-if="!selectedEvent">
            <ScrollArea class="rounded-md border w-[100%] h-[100%]" >
                <div class="p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle><b>{{ $t('add-event-info.titles.choose-event') }}:</b></CardTitle>
                        </CardHeader>
                        <CardContent class="card-content">
                            <div v-for="(event, index) in events" :key="index" @click="selectEvent(index)"
                            class="text-sm cursor-pointer transition-colors"
                            :class="{
                                'hover:bg-muted/80': true
                            }">
                                <span class="severity-tag">{{ event.name }} | </span> 
                                <span :class="['severity-tag', event.severity]">{{ $t('crisis.color.' + event.severity) }}</span> 
                                <span class="severity-tag"> | {{ formatDateFull(event.startTime) }}</span>
                                <Separator class="my-2" />
                            </div> 
                            <br>
                            
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </div>

        <!--if user selected an event from the list: this form will show up-->
        <div class="edit">
            <Card v-if="selectedEvent">
                <CardContent>
                <!--Title of the event-->
                <form @submit="onSubmit" >
                    <div class="read-only">
                        <FormField name="title">
                            <FormItem>
                                <FormLabel>{{$t('add-event-info.titles.title')}}</FormLabel>
                                <FormControl>
                                    <Input type="text" :model-value="selectedEvent.name" readonly disabled />
                                </FormControl>
                                <FormDescription>{{ $t('add-event-info.title') }}</FormDescription>
                            </FormItem>
                        </FormField>
                        <br>
                        <FormField name="active">
                            <FormItem>
                                <FormLabel>{{$t('add-event-info.titles.active')}}</FormLabel>
                                <FormControl>
                                    <Input type="text" :model-value=" $t('add-event-info.active.' + selectedEvent?.active)" readonly disabled />
                                </FormControl>
                                <FormDescription>{{ $t('add-event-info.active.description') }}</FormDescription>
                            </FormItem>
                        </FormField>
                    </div>
                    
                    <br>

                    <div class="container">
                        <FormField v-slot="{ field, meta, errorMessage }" name="epicenterLatitude">
                            <FormItem>
                                <FormLabel>{{$t('add-event-info.titles.latitude')}}</FormLabel>
                                <FormControl>
                                    <Input class="w-[100px]" type="number" :placeholder=selectedEvent.epicenterLatitude v-bind="field" />
                                </FormControl>
                                <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
                            </FormItem>
                        </FormField>

                    <!--Longitude field-->
                    <FormField v-slot="{ field, meta, errorMessage }" name="epicenterLongitude">
                        <FormItem>
                            <FormLabel>{{$t('add-event-info.titles.longitude')}}</FormLabel>
                            <FormControl>
                                <Input class="w-[100px]" type="number" :placeholder=selectedEvent.epicenterLongitude v-bind="field" />
                            </FormControl>
                            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
                        </FormItem>
                    </FormField>

                    <!--Address field-->
                    <FormField v-slot="{ field, meta, errorMessage }" name="address">
                        <FormItem>
                            <FormLabel>{{$t('add-event-info.titles.address')}}</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Eksempelveien 2" v-bind="field" />
                            </FormControl>
                            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
                        </FormItem>
                    </FormField>
                    </div>
                    <p class="text-muted-foreground text-sm">{{ $t('add-event-info.coordinates') }}</p>
                    <br>

                    <!--Field for selecting a radius for the event-->
                    <FormField v-slot="{ field, meta, errorMessage }" name="radius">
                        <FormItem>
                            <FormLabel>{{$t('add-event-info.titles.radius')}}</FormLabel>
                            <FormControl>
                                <Input type="number" :placeholder=selectedEvent.radius v-bind="field" />
                            </FormControl>
                            <FormDescription>{{ $t('add-event-info.radius') }}</FormDescription>
                            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
                        </FormItem>
                    </FormField><br>

                    <!--Choose time of event first occurring-->
                    <div class="read-only">
                        <FormField name="startTime">
                            <FormItem>
                                <FormLabel>{{$t('add-event-info.titles.time')}}</FormLabel>
                                <FormControl>
                                    <Input type="text" :model-value="formatDateFull(selectedEvent.startTime)" readonly disabled />
                                </FormControl>
                                <FormDescription>{{ $t('add-event-info.time') }}</FormDescription>
                            </FormItem>
                        </FormField>
                    </div>
                    <br>

                        <!--Choosing a priority-->
                    <FormField v-slot="{ field, meta, errorMessage }" name="severity">
                        <FormItem>
                            <FormLabel>{{$t('add-event-info.titles.priority')}}</FormLabel>
                            <FormControl>
                                <Select v-bind="field">
                                    <SelectTrigger style="cursor: pointer;">
                                        <SelectValue :placeholder="t('add-event-info.crisis-level.' +  selectedEvent.severity)"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem class="severity-tag green" value="green">{{ $t('add-event-info.crisis-level.low') }}</SelectItem>
                                            <SelectItem class="severity-tag yellow" value="yellow">{{ $t('add-event-info.crisis-level.medium') }}</SelectItem>
                                            <SelectItem class="severity-tag red" value="red">{{ $t('add-event-info.crisis-level.high') }}</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>{{ $t('add-event-info.priority') }}</FormDescription>
                            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
                        </FormItem>
                    </FormField>
                    <br>

                    <!--Description of event-->
                    <FormField v-slot="{ field, meta, errorMessage }" name="description">
                    <FormItem>
                        <FormLabel>{{$t('add-event-info.titles.description')}}:</FormLabel>
                        <FormControl>
                            <Textarea type="text" :placeholder="selectedEvent.description" v-bind="field"></Textarea>
                        </FormControl>
                        <FormDescription>{{ $t('add-event-info.description') }}</FormDescription>
                        <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
                    </FormItem>
                    </FormField><br>
                    <div class="buttons">
                        <Button>{{$t('add-event-info.titles.submit')}}</Button>
                        <Button type="button" variant="destructive" @click="deactivateEvent(selectedEvent.id)">{{$t('add-event-info.titles.deactivate')}}</Button>
                    </div>
                   </form>
                </CardContent>
            </Card>
        </div>
        <!--The map-->
        <div class="map" v-if="selectedEvent">
            Burde være et map inne i redigeringsdelen
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { updateCurrentEvent, deactivateCurrentEvent } from '@/services/api/AdminServices'
import type { CrisisEventDto, UpdateCrisisEventDto } from '@/models/CrisisEvent.ts';
import { fetchAllCrisisEvents, fetchCrisisEventById } from '@/services/api/CrisisEventService'
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import {formatDateFull} from '@/utils/dateUtils.ts';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
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
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { add } from 'date-fns';

/*
 * TODO: fix bug where old value of field is updated to 0, when field is not actually updated
 */

const { t } = useI18n();
const events = ref<CrisisEventDto[]>([]);
const selectedEvent = ref<CrisisEventDto | null>(null);
const updatedEvent = ref<UpdateCrisisEventDto | null> (null);

const router = useRouter();

/**
 * Saves the event the admin user chose to edit to the 'selectedEvent' variable. 
 * @param index - index of event in the 'events' array. 
 */
async function selectEvent(index: number) {
    if (!events.value[index]) {
        console.log('Event doesnt exist in array from backend');
        return;
    }
    try {
        const crisisEventDetails = await fetchCrisisEventById(events.value[index].id);
        console.log('Crisis Event details er: ', crisisEventDetails);
        if (crisisEventDetails) {
            selectedEvent.value = crisisEventDetails;
        } else {
            console.log('Could not get the event from backend!');
            callToast('Could not load event...');
        }
    } catch (error) {
        console.error('Failed to select event', error);
    }
}

/**
 * When the component is loaded, the events saved will be displayed automatically.
 * Awaits response from fetchAllCrisisEvents() from backend API.
 */
onMounted(async () => {
    try {
        const response = await fetchAllCrisisEvents();
        console.log('All events gotten content: ', response);
        events.value = response;
    } catch (error) {
        console.error('Failed to get events from backend!', error);
    }
});

/**
 * Validation of form fields that can be updated. 
 */
const formSchema = toTypedSchema(
    z.object({
    epicenterLatitude: 
        z.preprocess((val) => val === '' ? undefined : Number(val), z.number()
        .min(-90, t('add-event-info.errors.latitude'))
        .max(90, t('add-event-info.errors.latitude')))
        .optional(),
    epicenterLongitude: 
        z.preprocess((val) => val === '' ? undefined : Number(val), z.number()
        .min(-180, t('add-event-info.errors.longitude'))
        .max(180, t('add-event-info.errors.longitude')))
        .optional(),
    address: z.string()
        .max(100, t('add-event-info.errors.address'))
        .optional(),
    radius: 
        z.preprocess((val) => val === '' ? undefined : Number(val), z.number()
        .min(1, t('add-event-info.errors.radius'))
        .max(10000, t('add-event-info.errors.radius'))),
    severity: z.enum(["green", "yellow", "red"]),
    description: z.preprocess(
        (val) => (val === '' ? undefined : val),
        z.string()
        .max(500, t('add-event-info.errors.description'))
        .optional()
    ),  
  }).refine((data) => {
    if ((data.epicenterLatitude === undefined || isNaN(data.epicenterLatitude)) || (data.epicenterLongitude === undefined || isNaN(data.epicenterLongitude))) {
        return !!data.address && data.address.length > 0;
    }
    return true;
  }, {
    message: t('add-event-info.errors.position-missing'),
    path: ['address'],
  })
);

/** 
 * Sets the initial values in the form fields to the values fetched from the backend API. 
 */
const initialValues = computed(() => ({
    epicenterLatitude: selectedEvent.value?.epicenterLatitude ?? '',
    epicenterLongitude: selectedEvent.value?.epicenterLongitude ?? '',
    address: '',
    radius: selectedEvent.value?.radius ?? '',
    severity: selectedEvent.value?.severity ?? undefined,
    description: selectedEvent.value?.description ?? '',
}));

const form = useForm({
    validationSchema: formSchema,
    initialValues, //idk why this is red but it works
    enableReinitialize: true
});

/**
 * Handles submitting the updates to the backend API. 
 * Checks if the selected event is not null. If not, then the updated fields should be 
 * saved with the new changes, and the fields unchanged should stay as they were when first fetched 
 * from the backend API. 
 */
const onSubmit = form.handleSubmit(async (values) => {
    try {
        if (!selectedEvent.value) {
            console.error('No event selected');
            return;
        }
        //only the updated fields should be added to updatedEvent, non updated fields should stay
        updatedEvent.value = {
            ...selectedEvent.value,
            name: selectedEvent.value.name, // only change the edited fields
            latitude: values.epicenterLatitude ?? selectedEvent.value.epicenterLatitude,
            longitude: values.epicenterLongitude ?? selectedEvent.value.epicenterLongitude,
            description: values.description ?? selectedEvent.value.description,
            severity: values.severity ?? selectedEvent.value.severity,
            radius: values.radius ?? selectedEvent.value.radius,
        };
        const response = await updateCurrentEvent(selectedEvent.value.id, updatedEvent.value);

        console.log('Event updated successfully!', response.data);
        callToast('Updated the event with your new values!');
        
        selectedEvent.value = null; // redirects user back to the list of events
        updatedEvent.value = null;

        await fetchAllCrisisEvents(); // update the list of crisis events
    } catch (error) {
        console.error('An error occured while updating the event: ', error);
    }
});

/**
 * Cancels the potential changes of variables. 
 * Being used in 'Go back' button.
 */
 function cancelUpdate() {
    selectedEvent.value = null;
    updatedEvent.value = null;
 }

 /**
  * Deactivates the event by setting the 'active' attribute in backend API to 'false'. 
  * Shows up in the form as 'inactive' if false, or 'active' if true. 
  * @param id 
  */
 async function deactivateEvent(id: number) {
    try {
        await deactivateCurrentEvent(id);
        callToast('Hendelsen er nå satt som inaktiv!');
        
        selectedEvent.value = null; // redirects user back to the list of events
        updatedEvent.value = null;
        await fetchAllCrisisEvents(); // update the list of crisis events
    } catch (error) {
        console.error('Something happened when trying to deactivate: ', error);
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
    font-size: 2em;
    margin: 20px
}

.buttons > Button {
    margin: 5px;
}

.page {
	display: flex;
	flex-flow: row wrap;
	justify-content: space-evenly;
	margin: 30px;
	gap: 15px;
}

.container {
	display: flex;
	flex-flow: row nowrap;
	gap: 10px;
}

.events {
    min-width: 450px;
    min-height: fit-content;
    max-height: 500px;
}

.events > div {
    box-shadow: 2px 2px 4px;
}

.edit {
    min-width: fit-content;
    max-width: 450px;
}

.read-only {
    cursor: not-allowed;
}

.read-only input {
    background-color: var(--color-muted);
    cursor: not-allowed;
}

.card-content > div {
    padding-top: 10px;
    border-radius: 8px;
    text-align: center;
    font-size: 1em;
}

.severity-tag {
    padding: 2px 10px;
    border-radius: 8px;
    text-transform: uppercase;
}

.green {
    width: fit-content;
    background-color: var(--color-chart-2); /* should be green but is off*/
}
.yellow {
    width: fit-content;
    background-color: var(--color-chart-4); /*should be yellow on dark mode... */
}
.red {
    width: fit-content;
    background-color: var(--color-chart-1); /*should be red but is blue  */
}

.map { /*denne kan fjernes når kartet er på plass, brukes bare som placeholder,
	kartet kan godt være litt større enn størrelsen jeg har satt på boksen*/
	border-radius: 8px;
	border: solid grey;
	min-width: 300px;
	min-height: 400px;
	background-color: lightgreen;
}
</style>
