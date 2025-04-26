<template>
<div style="margin:20px">
	<Breadcrumb>
		<BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbLink href="/admin-panel">
				{{ $t('navigation.admin-panel') }}
				</BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator/>
			<BreadcrumbItem>
				<BreadcrumbPage href="/add-new-event">{{ $t('navigation.new-event') }}</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	</Breadcrumb>
</div>

<h1>{{ $t('admin.make-new-event') }}:</h1>

<div class="page">

	<!--This is the Form where the user types its input for the new event-->
<div class="info">

	<!--Title of the event-->
	<form @submit="onSubmit">
		<FormField v-slot="{ field, meta, errorMessage }" name="title">
			<FormItem>
				<FormLabel>{{$t('add-event-info.titles.title')}}</FormLabel>
				<FormControl>
					<Input type="text" placeholder="Title" v-bind="field" />
				</FormControl>
				<FormDescription>{{ $t('add-event-info.title') }}</FormDescription>
				<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
			</FormItem>
		</FormField>
		<br>

		<!--Latitude field-->
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
			<FormField v-slot="{ field, meta, errorMessage }" name="time">
				<FormItem>
					<FormLabel>{{$t('add-event-info.titles.time')}}</FormLabel>
					<FormControl>
						<Input type="time" v-bind="field" />
					</FormControl>
					<FormDescription>{{ $t('add-event-info.time') }}</FormDescription>
					<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
				</FormItem>
			</FormField>

			<!--Choose date of event first occurring-->
			<FormField v-slot="{ field, meta, errorMessage }" name="date">
			<FormItem>
				<FormLabel>{{$t('add-event-info.titles.date')}}</FormLabel>
				<FormControl>
					<Input type="date" v-bind="field" />
				</FormControl>
				<FormDescription>{{ $t('add-event-info.date') }}</FormDescription>
				<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
			</FormItem>
		</FormField>
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
								<SelectItem value="Lav">{{ $t('add-event-info.crisis-level.low') }}</SelectItem>
								<SelectItem value="Middels">{{ $t('add-event-info.crisis-level.medium') }}</SelectItem>
								<SelectItem value="Høy">{{ $t('add-event-info.crisis-level.high') }}</SelectItem>
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
					<textarea class="
				'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
				" style="min-height:100px;" placeholder="Description" v-bind="field"></textarea>
				</FormControl>
				<FormDescription>{{ $t('add-event-info.description') }}</FormDescription>
				<FormMessage v-if="meta.touched  || meta.submitFailed">{{ errorMessage }}</FormMessage>
			</FormItem>
			</FormField><br>

		<Button>{{$t('add-event-info.titles.submit')}}</Button>
	</form>
</div>

<!--This is the map-->
<div>
	<div>
		<p>MAP preview, should be able to click on map to get coordinates</p>
	</div>

	<div class="box"></div>

</div>

</div>

</template>

<script setup lang="ts">
	import { createEvent } from '@/services/api/EventsService'
	import { Button } from '@/components/ui/button'
	import { useForm } from 'vee-validate'
	import { toTypedSchema } from '@vee-validate/zod'
	import * as z from 'zod'
	import { useI18n } from 'vue-i18n';
	import { Input } from '@/components/ui/input'
	import {
		FormControl,
		FormDescription,
		FormField,
		FormItem,
		FormLabel,
		FormMessage
	} from '@/components/ui/form'
	import {
		Breadcrumb,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbList,
		BreadcrumbPage,
		BreadcrumbSeparator, 
	} from '@/components/ui/breadcrumb'
	import {
		Select,
		SelectContent,
		SelectGroup,
		SelectItem,
		SelectLabel,
		SelectTrigger,
		SelectValue,
	} from '@/components/ui/select'

const { t } = useI18n();

/* 
	Validate the different feids for correct input.
*/
const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(2, t('add-event-info.errors.title')).max(50, t('add-event-info.errors.title')),
    latitude: z.preprocess((val) => Number(val), z.number()
			.min(-90, t('add-event-info.errors.latitude'))
  		.max(90, t('add-event-info.errors.latitude'))).optional(),    
		longitude: z.preprocess((val) => Number(val), z.number()
  		.min(-90, t('add-event-info.errors.longitude'))
  		.max(90, t('add-event-info.errors.longitude'))).optional(),
		address: z.string().min(2, t('add-event-info.errors.address')).max(100, 'add-event-info.errors.title').optional(),
		radius: z.preprocess((val) => Number(val), z.number()
			.min(1, t('add-event-info.errors.radius'))
			.max(10000, t('add-event-info.errors.radius'))),
    priority: z.enum(["Lav", "Middels", "Høy"], t('add-event-info.errors.priority')),
    description: z.string().min(10, t('add-event-info.errors.description')).max(500, t('add-event-info.errors.description')),
  })
	.refine((data) => {
		/*If latitude and longitude is missing, the address field need to be set */
		if ((data.latitude === undefined || isNaN(data.latitude)) || (data.longitude === undefined || isNaN(data.longitude))) {
			return !!data.address && data.address.length > 0;
		}
		return true;
	}, {
		message : t('add-event-info.errors.position-missing'),
		path: ['address'], 
	})
);

	const form = useForm({
		validationSchema: formSchema,
		initialValues: {
			title: '',
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
			const response = await createEvent(values);

			console.log('Event created successfully!', response.data);

			router.push('/admin-panel'); //redirect user to the panel 
		} catch (error) {
			console.error('An error occured while submitting the event: ', error);
		}
		
	});

</script>

<style scoped>

h1 {
	font-size: 2em;
	text-align: center;
}

.page {
	display:flex;
	flex-flow: row wrap;
	margin: 30px;
	justify-content: space-evenly;
	gap: 15px;
}

.info {
	max-width:450px;
}

.container {
	display: flex;
	flex-flow: row nowrap;
	gap: 10px;
}

Input {	
	width: 100%;
}

.box { /*denne kan fjernes når kartet er på plass, brukes bare som placeholder, 
	kartet kan godt være litt større enn størrelsen jeg har satt på boksen*/
	border-radius: 8px;
	border: solid grey;
	min-width: 300px;
	min-height: 400px;
	background-color: lightgreen;
}



</style>