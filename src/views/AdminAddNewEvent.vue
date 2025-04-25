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
<form @submit="onSubmit">
	<FormField v-slot="{ field, meta, errorMessage }" name="title">
		<FormItem>
			<FormLabel>Tittel</FormLabel>
			<FormControl>
				<Input type="text" placeholder="Title" v-bind="field" />
			</FormControl>
			<FormDescription>{{ $t('add-event-info.title') }}</FormDescription>
			<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
		</FormItem>
	</FormField>
	<br>

	<div class="position">
		<FormField v-slot="{ field, meta, errorMessage }" name="latitude">
		<FormItem>
			<FormLabel>Latitude</FormLabel>
			<FormControl>
				<Input class="w-[100px]" placeholder="latitude" v-bind="field" />
			</FormControl>
			<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
		</FormItem>
	</FormField>

	<FormField v-slot="{ field, meta, errorMessage }" name="longitude">
		<FormItem>
			<FormLabel>Longitude</FormLabel>
			<FormControl>
				<Input class="w-[100px]" placeholder="longitude" v-bind="field" />
			</FormControl>
			<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
		</FormItem>
	</FormField>
</div>
<p class="text-muted-foreground text-sm">{{ $t('add-event-info.coordinates') }}</p>
	<br>

	<FormField v-slot="{ field, meta, errorMessage }" name="radius">
		<FormItem>
			<FormLabel>Radius</FormLabel>
			<FormControl>
				<Input type="number" placeholder="meters" v-bind="field" />
			</FormControl>
			<FormDescription>{{ $t('add-event-info.radius') }}</FormDescription>
			<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
		</FormItem>
	</FormField><br>

	<FormField v-slot="{ field, meta, errorMessage }" name="priority">
		<FormItem>
			<FormLabel>Krisetype</FormLabel>
			<FormControl>
				<Select v-bind="field">
					<SelectTrigger style="cursor: pointer;">
						<SelectValue placeholder="Select a priority"/>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Krisetype</SelectLabel>
							<SelectItem value="Lav">Lav</SelectItem>
							<SelectItem value="Middels">Middels</SelectItem>
							<SelectItem value="Høy">Høy</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</FormControl>
			<FormDescription>{{ $t('add-event-info.priority') }}</FormDescription>
			<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
		</FormItem>
		</FormField><br>

		<FormField v-slot="{ field, meta, errorMessage }" name="description">
		<FormItem>
			<FormLabel>Informasjon:</FormLabel>
			<FormControl>
				<textarea class="
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      " style="min-height:100px;" placeholder="Description" v-bind="field"></textarea>
			</FormControl>
			<FormDescription>{{ $t('add-event-info.description') }}</FormDescription>
			<FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
		</FormItem>
		</FormField><br>

	<Button>Submit</Button>
</form>

</div>

<!--This is the map-->
<div>
	<div>
		<p>MAP<3</p>
	</div>

</div>

</div>

</template>

<script setup lang="ts">

// TODO: error message for input felter vises ikke. må fikses!


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

const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(2, t('add-event-info.errors.title')).max(50, t('add-event-info.errors.title')),
    latitude: z.preprocess((val) => Number(val), z.number()
			.min(-90, t('add-event-info.errors.latitude'))
  		.max(90, t('add-event-info.errors.latitude'))),    
		longitude: z.preprocess((val) => Number(val), z.number()
  		.min(-90, t('add-event-info.errors.longitude'))
  		.max(90, t('add-event-info.errors.longitude'))),    
		radius: z.preprocess((val) => Number(val), z.number()
			.min(1, t('add-event-info.errors.radius'))
			.max(10000, t('add-event-info.errors.radius'))),
    priority: z.enum(["Lav", "Middels", "Høy"], t('add-event-info.errors.priority')),
    description: z.string().min(10, t('add-event-info.errors.description')).max(500, t('add-event-info.errors.description')),
  })
);

	const form = useForm({
		validateSchema: formSchema,
		initialValues: {
			title: '',
			latitude: '',
			longitude: '',
			radius: '',
			priority: '',
			description: ''
		}
	});

	const onSubmit = form.handleSubmit((values) => {
		console.log('Form submitted!', values)
	});

</script>

<style scoped>

h1 {
	font-size: 2em;
	margin: 20px;
}

.page {
	display:flex;
	flex-flow: row wrap;
	margin: 30px;
	justify-content: space-evenly;
	gap: 15px;
}

.info {
	max-width:400px;
}
.position {
	display: flex;
	flex-flow: row nowrap;
	gap: 10px;
}

Input {	
	max-width: 400px;
}



</style>