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
        <div class="events" v-if="selectedEvent == null">
            <ScrollArea class="rounded-md border w-[100%] h-[100%]" >
                <div class="p-4">
                    <h4 class="mb-4 text-sm font-medium leading-none">{{ $t('add-event-info.titles.choose-event') }}:</h4>
                    
                    <!--Remove, only for testing under dev -->
                    <div class="text-sm hover:underline cursor-pointer transition-colors" @click="selectEvent(1)">test1</div>
                    <Separator class="my-2" />
                    <div class="text-sm hover:underline cursor-pointer transition-colors">test2</div>
                    <Separator class="my-2" />
                    <div class="text-sm hover:underline cursor-pointer transition-colors">test3</div>
                    <Separator class="my-2" />
                    
                    <div v-for="event in events" :key="event.id" @click="selectEvent(event)"
                    class="text-sm hover:underline cursor-pointer transition-colors"
                    :class="{
                        'bg-muted': selectedEvent?.id === event.id,
                        'hover:bg-muted/50': selectedEvent?.id !== event.id
                    }">
                        {{ event.title }} | {{ event.priority }} | {{ event.time }} | {{ event.date }}
                        <Separator class="my-2" />

                    </div>
                </div>
            </ScrollArea>
        </div>

        <div class="edit" v-if="selectedEvent">
            <!--Title of the event-->
            <form @submit="onSubmit">
                <div class="read-only">
                    <FormField  name="title">
                        <FormItem>
                            <FormLabel>{{$t('add-event-info.titles.title')}}</FormLabel>
                            <FormControl>
                                <Input type="text" :value="selectedEvent?.title" readonly disabled />
                            </FormControl>
                            <FormDescription>{{ $t('add-event-info.title') }}</FormDescription>
                        </FormItem>
                    </FormField>
                </div>
                <br>

                <div class="container">
                    <FormField v-slot="{ field, meta, errorMessage }" name="latitude">
                    <FormItem>
                        <FormLabel>{{$t('add-event-info.titles.latitude')}}</FormLabel>
                        <FormControl>
                            <Input class="w-[100px]" type="number" placeholder="latitude" v-bind="field" />
                        </FormControl>
                        <FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
                    </FormItem>
                </FormField>

                <!--Longitude field-->
                <FormField v-slot="{ field, meta, errorMessage }" name="longitude">
                    <FormItem>
                        <FormLabel>{{$t('add-event-info.titles.longitude')}}</FormLabel>
                        <FormControl>
                            <Input class="w-[100px]" type="number" placeholder="longitude" v-bind="field" />
                        </FormControl>
                        <FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
                    </FormItem>
                </FormField>

                <!--Address field-->
                <FormField v-slot="{ field, meta, errorMessage }" name="address">
                    <FormItem>
                        <FormLabel>{{$t('add-event-info.titles.address')}}</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Eksempelveien 2" v-bind="field" />
                        </FormControl>
                        <FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
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
                            <Input type="number" placeholder="meters" v-bind="field" />
                        </FormControl>
                        <FormDescription>{{ $t('add-event-info.radius') }}</FormDescription>
                        <FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
                    </FormItem>
                </FormField><br>

                <div class="container">
                    <!--Choose time of event first occurring-->
                    <div class="read-only">
                        <FormField name="time">
                            <FormItem>
                                <FormLabel>{{$t('add-event-info.titles.time')}}</FormLabel>
                                <FormControl>
                                    <Input type="time" :value="selectedEvent?.time" readonly disabled />
                                </FormControl>
                                <FormDescription>{{ $t('add-event-info.time') }}</FormDescription>
                            </FormItem>
                        </FormField>
                    </div>

                    <!--Choose date of event first occurring-->
                    <div class="read-only">
                        <FormField name="date">
                            <FormItem>
                                <FormLabel>{{$t('add-event-info.titles.date')}}</FormLabel>
                                <FormControl>
                                    <Input type="date" :value="selectedEvent?.date" readonly disabled />
                                </FormControl>
                                <FormDescription>{{ $t('add-event-info.date') }}</FormDescription>
                            </FormItem>
                        </FormField>
                    </div>
                </div>
                <br>

                    <!--Choosing a priority-->
                <FormField v-slot="{ field, meta, errorMessage }" name="priority">
                    <FormItem>
                        <FormLabel>{{$t('add-event-info.titles.priority')}}</FormLabel>
                        <FormControl>
                            <Select v-bind="field">
                                <SelectTrigger style="cursor: pointer;">
                                    <SelectValue placeholder="Velg et krisenivå"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Low">{{ $t('add-event-info.crisis-level.low') }}</SelectItem>
                                        <SelectItem value="Medium">{{ $t('add-event-info.crisis-level.medium') }}</SelectItem>
                                        <SelectItem value="High">{{ $t('add-event-info.crisis-level.high') }}</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormDescription>{{ $t('add-event-info.priority') }}</FormDescription>
                        <FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
                    </FormItem>
                </FormField>
                <br>

                <!--Description of event-->
                <FormField v-slot="{ field, meta, errorMessage }" name="description">
                <FormItem>
                    <FormLabel>{{$t('add-event-info.titles.description')}}:</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Description" v-bind="field"></Textarea>
                    </FormControl>
                    <FormDescription>{{ $t('add-event-info.description') }}</FormDescription>
                    <FormMessage v-if="meta.touched  || meta.submitFailed">{{ errorMessage }}</FormMessage>
                </FormItem>
                </FormField><br>

                <Button>{{$t('add-event-info.titles.submit')}}</Button>
            </form>

            <!--The map-->
            
        </div>

        <div class="map" v-if="selectedEvent">
            Burde være et map inne i redigeringsdelen
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { getCurrentEvents, updateCurrentEvent } from '@/services/api/AdminServices'
import { ref, onMounted } from 'vue'
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
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Event {
  id: number;
  title: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  radius: number;
  priority: 'Low' | 'Medium' | 'High';
  description: string;
  time?: string;
  date?: string;
}
const { t } = useI18n();
const events = ref<Event[]>([]);
const selectedEvent = ref<Event | null>(null);

const router = useRouter();

const selectEvent = (event: Event) => { 
    selectedEvent.value = event;
    console.log('Selected event: ', event);
    form.setValues({
        latitude: event.latitude || '',
        longitude: event.longitude || '',
        address: event.address || '',
        radius: event.radius || '',
        priority: event.priority || '',
        description: event.description || ''
    })
}

/**
 * When the component is loaded, the events saved will be displayed automatically.
 * Awaits response from getCurrentEvents() from backend server.
 */
onMounted(async () => {
    try {
        const response = await getCurrentEvents();
        events.value = response.data;
    } catch (error) {
        console.error('Failed to get events from backend!', error);
    }
});

const formSchema = toTypedSchema(
    z.object({
    latitude: z.preprocess((val) => Number(val), z.number()
        .min(-90, t('add-event-info.errors.latitude'))
        .max(90, t('add-event-info.errors.latitude')))
        .optional(),
    longitude: z.preprocess((val) => Number(val), z.number()
        .min(-180, t('add-event-info.errors.longitude'))
        .max(180, t('add-event-info.errors.longitude')))
        .optional(),
    address: z.string()
        .max(100, t('add-event-info.errors.address'))
        .optional(),
    radius: z.preprocess((val) => Number(val), z.number()
        .min(1, t('add-event-info.errors.radius'))
        .max(10000, t('add-event-info.errors.radius'))),
    priority: z.enum(["Low", "Medium", "High"]),
    description: z.string()
        .max(500, t('add-event-info.errors.description')),
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
    validationSchema: formSchema,
    initialValues: {
        latitude: '',
        longitude: '',
        address: '',
        radius: '',
        priority: '',
        description: ''
    }
});

const onSubmit = form.handleSubmit(async (values) => {
    try {
        const response = await updateCurrentEvent(selectedEvent.value.id, values);

        console.log('Event updated successfully!', response.data);

        router.push('/admin-panel'); //redirect user to the panel 
    } catch (error) {
        console.error('An error occured while updating the event: ', error);
    }
		
});

 function cancelUpdate() {
    selectedEvent.value = null;
 }

</script>

<style scoped>
h1 {
    font-size: 2em;
    margin: 20px
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
    max-width: 450px;
}

.read-only {
    cursor: not-allowed;
}

.read-only input {
    background-color: var(--color-muted);
    cursor: not-allowed;
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