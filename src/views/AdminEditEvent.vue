<template>
<div style="margin: 20px;">
<Breadcrumb>
	<BreadcrumbList>
					<BreadcrumbItem>
			<BreadcrumbLink href="/">
			{{ $t('navigation.home') }}
			</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator/>
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
		<Card>
			<CardHeader>
				<CardTitle>{{ $t('add-event-info.titles.choose-event') }}:</CardTitle>
			</CardHeader>
			<CardContent class="card-content">
				<InfiniteScroll :is-loading="isFetchingNextPage" :has-more="hasNextPage" @load-more="fetchNextPage">
					<div v-for="(event, index) in allEvents" :key="event.id" @click="selectEvent(index)"
						:class="['text-sm', 'cursor-pointer', 'transition-colors', 'hover:bg-muted/80']">
						
						<div class=listOfEvents>
							<span class="severity-tag">{{ event.name }} |</span> 
							<span :class="['severity-tag', event.severity]"> {{ $t('crisis.color.' + event.severity) }}</span> 
							<span class="severity-tag"> | {{ formatDateFull(event.startTime) }}</span>
							<span :class="['severity-tag', event.active]"> | {{ $t('add-event-info.active.' + event.active) }}</span>
						</div>	
							<Separator class="my-2" />
					</div> 

					<template #loading>
						<div class="text-center p-4">Laster...</div>
					</template>
					<template #end-message>
						<div class="text-center p-4">Alle hendelser er lastet inn</div>
					</template>
				</InfiniteScroll>
			</CardContent>
		</Card>
	</div>

	<!--if user selected an event from the list: this form will show up-->
	<div class="edit">
		<Card v-if="selectedEvent">
			<CardContent>
				<!--Title of the event-->
				<form @submit.prevent="onSubmit" >
					<div class="read-only">
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
						<FormField name="active">
							<FormItem>
								<FormLabel>{{$t('add-event-info.titles.active')}}</FormLabel>
								<FormControl>
									<Input type="text" :placeholder="$t('add-event-info.active.' + selectedEvent?.active)" readonly disabled />
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
									<Input class="w-[100px]" type="number" step="any" v-bind="field" />
								</FormControl>
								<FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
							</FormItem>
						</FormField>

						<!--Longitude field-->
						<FormField v-slot="{ field, meta, errorMessage }" name="epicenterLongitude">
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

					<!--Field for selecting a radius for the event-->
					<FormField v-slot="{ field, meta, errorMessage }" name="radius">
						<FormItem>
							<FormLabel>{{$t('add-event-info.titles.radius')}}</FormLabel>
							<FormControl>
								<Input type="number" v-bind="field" />
							</FormControl>
							<FormDescription>{{ $t('add-event-info.radius') }}</FormDescription>
							<FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
						</FormItem>
					</FormField>
					<br>

					<!--Choose time of event first occurring-->
					<div class="read-only">
						<FormField name="startTime">
							<FormItem>
								<FormLabel>{{$t('add-event-info.titles.time')}}</FormLabel>
								<FormControl>
									<Input type="text" :placeholder="formatDateFull(selectedEvent.startTime)" readonly disabled />
								</FormControl>
								<FormDescription>{{ $t('add-event-info.time') }}</FormDescription>
							</FormItem>
						</FormField>
					</div>
					<br>

					<!--Choosing a priority-->
					<div class="container">
						<FormField v-slot="{ field, meta, errorMessage }" name="severity">
							<FormItem>
								<FormLabel>{{$t('add-event-info.titles.priority')}}</FormLabel>
								<FormControl>
									<Select v-bind="field">
										<SelectTrigger style="cursor: pointer;">
											<SelectValue :class="['severity-tag', field.value]">{{ $t('add-event-info.crisis-level.' + field.value) }}</SelectValue>
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
								<FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
							</FormItem>
						</FormField>
							<br>

					<!--Category of event-->
					<FormField v-slot="{ field, meta, errorMessage }" name="category">
						<FormItem>
							<FormLabel>{{$t('add-event-info.titles.category')}}</FormLabel>
							<FormControl>	
								<Select v-bind="field">
									<SelectTrigger style="cursor: pointer;">
									<!--<SelectValue :placeholder="$t('add-event-info.scenarios.' + getScenarioName(field.value))"/> Vil kun fungere dersom språkfilene har typen-->	
										<SelectValue :placeholder="scenarioName"/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem v-for="type in scenarioPreviews" :key="type.id"
											:value="type.name"> 
											{{ type.name }}
										<!--	{{ $t('add-event-info.scenarios.' + type.name) }} dette vil bare fungere dersom det er fastsatte typer i språkfilene...-->
										</SelectItem>
										<!--
										<SelectGroup>
											<SelectLabel>{{ $t('sidebar.themes.crisisSituations.extremeWeather.title') }}:</SelectLabel> 
											<SelectItem value="flood">{{ $t('add-event-info.scenarios.flood') }}</SelectItem>
											<SelectItem value="hurricane">{{ $t('add-event-info.scenarios.hurricane') }}</SelectItem>
											<SelectItem value="drought">{{ $t('add-event-info.scenarios.drought') }}</SelectItem>
											<SelectItem value="heatwave">{{ $t('add-event-info.scenarios.heatwave') }}</SelectItem>
										</SelectGroup>
											
										<SelectGroup>
											<SelectLabel>{{ $t('sidebar.themes.crisisSituations.title') }}:</SelectLabel>
											<SelectItem value="pandemic">{{ $t('add-event-info.scenarios.pandemic') }}</SelectItem>
											<SelectItem value="war">{{ $t('add-event-info.scenarios.war') }}</SelectItem>
											<SelectItem value="forest fire">{{ $t('add-event-info.scenarios.forest fire') }}</SelectItem>
											<SelectItem value="power outage">{{ $t('add-event-info.scenarios.power outage') }}</SelectItem>
											<SelectItem value="water shortage">{{ $t('add-event-info.scenarios.water shortage') }}</SelectItem>
											<SelectItem value="cyber attack">{{ $t('add-event-info.scenarios.cyber attack') }}</SelectItem>
											<SelectItem value="major accident">{{ $t('add-event-info.scenarios.major accident') }}</SelectItem>
										</SelectGroup>-->
									</SelectContent>
								</Select>
							</FormControl>
							<FormDescription>{{ $t('add-event-info.category') }}</FormDescription>
							<FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
						</FormItem>
					</FormField>
					</div>
					<br>
					<!--Description of event-->
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
import { updateCurrentEvent, deactivateCurrentEvent, getCurrentEvents } from '@/services/api/AdminServices'
import type { CrisisEventDto, UpdateCrisisEventDto } from '@/models/CrisisEvent.ts';
import { fetchTheCrisisEventById } from '@/services/CrisisEventService'
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import { getScenarioThemePreview } from '@/services/api/ScenarioThemeService'
import { type ScenarioThemePreview } from '@/models/ScenarioTheme'
import type { Page } from '@/types/Page';
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import {formatDateFull} from '@/utils/dateUtils.ts';
import { useI18n } from 'vue-i18n'
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
	SelectLabel,
} from '@/components/ui/select'
import {
Card,
CardContent,
CardHeader,
CardTitle,
} from '@/components/ui/card'

const { t } = useI18n();
const selectedEvent = ref<CrisisEventDto | null>(null);
const updatedEvent = ref<UpdateCrisisEventDto | null> (null);
const scenarioPreviews = ref<ScenarioThemePreview[]>([]);
const allowedCategories = ref<String[]>([]);
const form = ref();
const onSubmit = ref<(e?: Event) => void>();
const scenarioName = ref<string | undefined> (undefined);
/**
 * For pagination:
 */
const queryClient = useQueryClient();
const pageSize = 10;
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery<CrisisEventDto[], Error>({
  queryKey: ['events'],
  queryFn: async ({ pageParam = 0 }) => {
		const pageNumber = pageParam as number;
		const page = await getCurrentEvents(pageNumber, 10);
		return page.content;
	},
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < pageSize ? undefined : allPages.length;
	},
	initialPageParam: 0
});

const allEvents = computed<CrisisEventDto[]>(() => data.value?.pages.flat() ?? []);
allEvents.value.forEach((event: CrisisEventDto) => { console.log(event.id)});

/**
 * Saves the event the admin user chose to edit to the 'selectedEvent' variable. 
 * @param index - index of event in the 'events' array. 
 */
async function selectEvent(index: number) {
	const event = allEvents.value[index];
	if (!event) {
		console.log('Event doesnt exist in array from backend');
		return;
	}
	try {
		const crisisEventDetails = await fetchTheCrisisEventById(event.id);
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

/**
 * When the component is loaded, the events saved will be displayed automatically.
 * Awaits response from fetchAllCrisisEvents() from backend API.
 */
onMounted( () => {
	fetchNextPage();
	try {
		getCategories();
		setUpFormSchema();
	} catch (error) {
		console.error("klarte ikke sette opp skjema: ", error);
	}
});

function setUpFormSchema() {
	const formSchema = toTypedSchema(z.object({
		epicenterLatitude: z.preprocess((val) => val === '' ? undefined : Number(val), z.number()
				.min(-90, t('add-event-info.errors.latitude'))
				.max(90, t('add-event-info.errors.latitude')))
				.optional(),
		epicenterLongitude: z.preprocess((val) => val === '' ? undefined : Number(val), z.number()
				.min(-180, t('add-event-info.errors.longitude'))
				.max(180, t('add-event-info.errors.longitude')))
				.optional(),
		address: z.string()
				.max(100, t('add-event-info.errors.address'))
				.optional(),
		radius: z.preprocess((val) => val === '' ? undefined : Number(val), z.number()
				.min(1, t('add-event-info.errors.radius'))
				.max(10000, t('add-event-info.errors.radius'))),
		severity: z.enum(["green", "yellow", "red"]),
		category: z.string().refine(val => allowedCategories.value.includes(val),'add-event-info.errors.category').optional(),
		description: z.preprocess((val) => (val === '' ? undefined : val),
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
	form.value = useForm({ validationSchema: formSchema });
	onSubmit.value = form.value.handleSubmit(handleFormSubmit)
}

/**
 * Every time selectedEvent changes, like after selecting an event from the list,
 * the form will reset its values to the selected events' values.
 */
watch(selectedEvent, async (event)=> {
	if(event && form.value) {
		if(scenarioPreviews.value.length === 0) {
			console.warn('Scenarios not yet loaded in...');
			return;
		}
		await nextTick();
		scenarioName.value = getScenarioName(event.scenarioThemeId);
		form.value.setValues({
			epicenterLatitude: event.epicenterLatitude ?? '',
			epicenterLongitude: event.epicenterLongitude ?? '',
			address: '',
			radius: event.radius ?? '',
			severity: event.severity ?? '',
			category: scenarioName.value,
			description: event.description ?? '',
		});
	} else {
		scenarioName.value = undefined;
	}
});

/**
 * the updated fields should be saved with the new changes,
 * and the fields unchanged should stay as they were when first fetched 
 * from the backend API. Then submit.
 */
async function handleFormSubmit(values: any) {
	if (!selectedEvent.value) {
		console.error('No event selected');
		return;
	}
	//only the updated fields should be added to updatedEvent, non updated fields should stay
	updatedEvent.value = {
		name: selectedEvent.value.name, // only change the edited fields
		latitude: values.epicenterLatitude ?? selectedEvent.value.epicenterLatitude,
		longitude: values.epicenterLongitude ?? selectedEvent.value.epicenterLongitude,
		description: values.description ?? selectedEvent.value.description,
		severity: values.severity ?? selectedEvent.value.severity,
		scenarioThemeId: getScenarioId(values.category) ?? selectedEvent.value.scenarioThemeId,
		radius: values.radius ?? selectedEvent.value.radius,
	}
	console.log('Oppdaterte event verdier til:', updatedEvent.value);
	
	updateSelectedEvent();
}

/**
 * Update the selected event with the new details in backend API.
 */
async function updateSelectedEvent() {
	if (!selectedEvent.value || !updatedEvent.value) {
		console.log('No event selected or updated!');
		return;
	}
	try {
		const response = await updateCurrentEvent(selectedEvent.value.id, updatedEvent.value);

		console.log('Event updated successfully!', response.data);
		callToast('Updated the event with your new values!');
		
		selectedEvent.value = null; // redirects user back to the list of events
		updatedEvent.value = null;

		await queryClient.invalidateQueries({queryKey: ['events']});
	
	} catch (error) {
		callToast('Failed to update event details...');
		console.error('Failed to update event: ', error);
	}
}

/**
 * Cancels the potential changes of variables. 
 * Being used in 'Go back' button.
 */
function cancelUpdate() {
	selectedEvent.value = null;
	updatedEvent.value = null;
	form.value?.resetForm();
}

/**
* Deactivates the event by setting the 'active' attribute in backend API to 'false'. 
* Shows up in the form as 'inactive' if false, or 'active' if true. 
* @param id 
*/
async function deactivateEvent(id: number) {
	if (!selectedEvent.value) {
		console.log("didnt select any event...");
		return;
	}
	try {
		await deactivateCurrentEvent(id);
		callToast('Hendelsen er nå satt som inaktiv!');
		
		selectedEvent.value = null; // redirects user back to the list of events
		updatedEvent.value = null;

		await queryClient.invalidateQueries({queryKey: ['events']});
	} catch (error) {
		callToast("Failed to deactivate event!");
		console.error('Something happened when trying to deactivate: ', error);
	}
}

async function getCategories() {
	try {
		const response = await getScenarioThemePreview();
		console.log('getting scenarios:', response);
		scenarioPreviews.value = response;
		allowedCategories.value = scenarioPreviews.value.map((s) => s.name);
		console.log('allowedCategories: ', allowedCategories.value);
	} catch (error) {
		console.error('Something happened when fetching categories: ', error);
	}
}

function getScenarioName(id: number): string {
	if (!scenarioPreviews.value) {
		console.log('Fant ikke scenariotypen...')
		return 'undefined';
	} else {
		let name;
		for (let i = 0; i < scenarioPreviews.value.length; i++) {
			if (scenarioPreviews.value[i].id == id) {
				name = scenarioPreviews.value[i].name;
				console.log('henta scenario navn: ', name);
				break;
			}
		}
		console.log('test',name);
		return name ? name : 'undefined';
	}
}

function getScenarioId(category: string) {
	if (!scenarioPreviews.value) {
		return null;
	}
	let scenario = null;
	for (let i = 0; i < scenarioPreviews.value.length; i++) {
		if (scenarioPreviews.value[i].name == category) {
			scenario = scenarioPreviews.value[i];
			break;
		}
	}
	return scenario ? scenario.id : null;
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
	min-width: fit-content;
	max-height: 600px;
}

.listOfEvents {
	display: flex;
	flex-flow: row nowrap;
	width: 100%;
	gap: 3px;
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

.descriptionArea {
	min-height: 100px;
	overflow: auto; 
}
/* scroll i textboks eller er det bedre at den bare utvider seg? 
PErsonlig liker jeg ikke scroll i tekstbokser */
.severity-tag {
	padding: 2px 10px;
	border-radius: 8px;
	text-transform: uppercase;
}
.true {
	background-color: blue;
	color: white; /**endre fargene senere */
}
.false {
	background-color: rgb(80, 173, 93);
	color: white
}

.green {
	background-color: var(--color-chart-2); /* should be green but is off*/
}
.yellow {
	background-color: var(--color-chart-4); /*should be yellow on dark mode... */
}
.red {
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
