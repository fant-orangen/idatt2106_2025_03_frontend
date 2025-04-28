<template>
<div style="margin:20px">
	<!--Breadcrumb at the top left-->
	<Breadcrumb>
		<BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbLink href="/admin-panel">
				{{ $t('navigation.admin-panel') }}
				</BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator/>
			<BreadcrumbItem>
				<BreadcrumbPage href="/add-new-POI">{{ $t('navigation.new-POI') }}</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	</Breadcrumb>
</div>

<!--Title-->
<h1>{{ $t('admin.make-new-POI') }}:</h1>

<div class="page">
	<!--Input fields for the admin user-->
	<div class="fields">
		<form @submit="onSubmit">

			<!--Title of POI -->
			<FormField v-slot="{ field, meta, errorMessage }" name="title">
				<FormItem>
					<FormLabel>{{$t('add-event-info.titles.title')}}</FormLabel>
					<FormControl>
						<Input type="text" placeholder="Title" v-bind="field" />
					</FormControl>
					<FormDescription>{{ $t('add-POI-info.info.title') }}</FormDescription>
					<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
				</FormItem>
			</FormField><br>

			<!--Placement of POI-->
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
			<br>

			<!--Select type field-->
			<FormField v-slot="{ field, meta, errorMessage }" name="type">
				<FormItem>
					<FormLabel>{{$t('add-POI-info.titles.type')}}</FormLabel>
					<FormControl>
						<Select v-bind="field">
							<SelectTrigger style="cursor: pointer;">
								<SelectValue placeholder="Choose a type"/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="defibrillator">{{$t('add-POI-info.POI-type.defibrillator')}}</SelectItem>
									<SelectItem value="shelter">{{$t('add-POI-info.POI-type.shelter')}}</SelectItem>
									<SelectItem value="water-source">{{$t('add-POI-info.POI-type.water-source')}}</SelectItem>
									<SelectItem value="food-station">{{$t('add-POI-info.POI-type.food')}}</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</FormControl>
					<FormDescription>{{ $t('add-POI-info.info.type') }}</FormDescription>
					<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
				</FormItem>
			</FormField><br>

			<div class="container">

				<!--Open from time-->
				<FormField v-slot="{ field, meta, errorMessage }" name="openfrom">
					<FormItem>
						<FormLabel>{{$t('add-POI-info.titles.open-from')}}</FormLabel>
						<FormControl>
							<Input type="time" v-bind="field" />
						</FormControl>
						<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
					</FormItem>
				</FormField>

				<!--Open to time-->
				<FormField v-slot="{ field, meta, errorMessage }" name="opento">
					<FormItem>
						<FormLabel>{{$t('add-POI-info.titles.open-to')}}</FormLabel>
						<FormControl>
							<Input type="time" v-bind="field" />
						</FormControl>
						<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
					</FormItem>
				</FormField>
			</div><br>

			<!--Contact information field-->
			<FormField v-slot="{ field, meta, errorMessage }" name="contactinfo">
				<FormItem>
					<FormLabel>{{$t('add-POI-info.titles.contact-info')}}</FormLabel>
					<FormControl>
						<Input type="phone" placeholder="+47 123 45 678" v-bind="field" />
					</FormControl>
					<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
				</FormItem>
			</FormField><br>

			<!--Description of POI-->
			<FormField v-slot="{ field, meta, errorMessage }" name="description">
			<FormItem>
				<FormLabel>{{$t('add-event-info.titles.description')}}:</FormLabel>
				<FormControl>
					<Textarea placeholder="Description" v-bind="field"></Textarea>
				</FormControl>
				<FormDescription>{{ $t('add-POI-info.info.description') }}</FormDescription>
				<FormMessage v-if="meta.touched  || meta.submitFailed">{{ errorMessage }}</FormMessage>
			</FormItem>
			</FormField><br>

			<Button>{{$t('add-event-info.titles.submit')}}</Button>
		</form>
	</div>

	<!--This is the map-->
	<div class="box">
		MAP
	</div>
</div>

</template>

<script setup lang="ts">
import router from '@/router'
import { createPOI } from '@/services/api/AdminServices'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toTypedSchema } from '@vee-validate/zod'
import { Textarea } from '@/components/ui/textarea'
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

const { t } = useI18n();

/**
 * Validates the data from the user.
 */
const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(2, t('add-event-info.errors.title')).max(50, t('add-event-info.errors.title')),

		latitude: z.preprocess((val) => Number(val), z.number()
			.min(-90, t('add-event-info.errors.latitude'))
  		.max(90, t('add-event-info.errors.latitude'))).optional(),

		longitude: z.preprocess((val) => Number(val), z.number()
  		.min(-180, t('add-event-info.errors.longitude'))
  		.max(180, t('add-event-info.errors.longitude'))).optional(),

		address: z.string()
			.max(100, 'add-event-info.errors.address').optional(),

		type: z.enum(["defibrillator", "shelter", "water-source", "food-station"]),

		contactinfo: z.string()
		.optional()
		.refine((val) => {
			if (!val) return true;
			const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{8}$/; // +47 12345678 or 12345678
			return phoneRegex.test(val);
		}, {
			message: t('add-event-info.errors.contact-info')
		}),

		openfrom: z.string().optional(),

		opento: z.string().optional(),

		description: z.string()
			.min(10, t('add-event-info.errors.description'))
			.max(500, t('add-event-info.errors.description')),
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
		type: 'defibrillator',
		contactinfo: '',
		openfrom: '',
		opento: '',
		description: ''
	}
});

const onSubmit = form.handleSubmit(async (values) => {
	try {
		const response = await createPOI(values);

		console.log('POI created successfully!', response.data);

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

.fields {
	max-width: 450px;
}

.box { /*denne kan fjernes når kartet er på plass, brukes bare som placeholder,
	kartet kan godt være litt større enn størrelsen jeg har satt på boksen*/
	border-radius: 8px;
	border: solid grey;
	min-width: 300px;
	max-height: 400px;
	background-color: lightgreen;
}
</style>
