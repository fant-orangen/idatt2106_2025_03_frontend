<!-- Page for editing an existing point of interest -->

<template>
  <div style="margin: 20px;">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin-panel">
            {{ t('navigation.admin-panel') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ t('admin.edit-POI') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Page title -->

    <h1>{{ t('admin.edit-POI') }}</h1>

    <!-- Cancel button for editing a POI -->
    <div v-if="selectedPoi">
      <Button @click="cancelUpdate">{{ t('navigation.go-back') }}</Button>
    </div>

    <div class="page">
      <div class="events" v-if="!selectedPoi">
        <ScrollArea class="rounded-md border w-[100%] h-[100%]">
          <div class="p-4">
            <h4 class="mb-4 text-sm font-medium leading-none">
              {{ t('add-event-info.titles.choose-event') }}
            </h4>
            <div v-for="(poi, index) in pois" :key="index" @click="selectPoi(poi)"
                 class="text-sm hover:underline cursor-pointer transition-colors"
                 :class="{ 'bg-muted': false, 'hover:bg-muted/50': true }">
              {{ poi.name }} | {{ poi.description }}
              <Separator class="my-2" />
            </div>
          </div>
        </ScrollArea>
      </div>

      <!-- POI edit form -->

      <div class="edit" v-if="selectedPoi">
        <form @submit="onSubmit">
          <FormField name="name" v-slot="{ field }">
            <FormItem class="mt-4">
              <FormLabel>{{ t('add-poi.name') }}</FormLabel>
              <FormControl>
                <Input v-model="field.value" />
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Latitude and longitude -->
            <FormField name="latitude" v-slot="{ field }">
                <FormItem class="mt-4">
                    <FormLabel>{{ t('add-poi.latitude') }}</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" v-model.number="field.value" />
                    </FormControl>
                </FormItem>
            </FormField>

            <FormField name="longitude" v-slot="{ field }">
                <FormItem class="mt-4">
                    <FormLabel>{{ t('add-poi.longitude') }}</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" v-model.number="field.value" />
                    </FormControl>
                </FormItem>
            </FormField>


            <!-- Description -->
          <FormField name="description" v-slot="{ field }">
            <FormItem class="mt-4">
              <FormLabel>{{ t('add-poi.description') }}</FormLabel>
              <FormControl>
                <Textarea v-model="field.value" />
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Opening hours -->
          <FormField name="openingFrom" v-slot="{ field }">
            <FormItem class="mt-4">
              <FormLabel>{{ t('add-POI-info.titles.open-from') }}</FormLabel>
              <FormControl>
                <Input type="time" v-model="field.value" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="openingTo" v-slot="{ field }">
            <FormItem class="mt-4">
              <FormLabel>{{ t('add-POI-info.titles.open-to') }}</FormLabel>
              <FormControl>
                <Input type="time" v-model="field.value" />
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Contact information -->
          <FormField name="contactInfo" v-slot="{ field }">
            <FormItem class="mt-4">
              <FormLabel>{{ t('add-poi.contact') }}</FormLabel>
              <FormControl>
                <Input v-model="field.value" />
              </FormControl>
            </FormItem>
          </FormField>

          <!-- POI type -->
          <FormField name="poiTypeId" v-slot="{ field }">
            <FormItem class="mt-4">
              <FormLabel>{{ t('add-poi.type') }}</FormLabel>
              <FormControl>
                <Select v-model="field.value">
                  <SelectTrigger>
                    <SelectValue :placeholder="t('admin.select-poi-type')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="type in poiTypes" :value="type.id" :key="type.id">
                        {{ type.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Submit and delete buttons -->
          <div class="form-actions mt-6">
            <Button type="submit">{{ t('add-poi.submit') }}</Button>
            <Button class="bg-red-600 ml-2" @click.prevent="deleteSelectedPoi">
              {{ t('add-poi.delete') }}
            </Button>
          </div>
        </form>
      </div>

      <!-- Placeholder for map -->

      <div class="map" v-if="selectedPoi">
        <p>(Kart vises her senere)</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Imports: UI components, select dropdown,form components and breadcrumb.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { fetchPublicPois } from '@/services/api/PoiService'
import { editPoi, deletePoi } from '@/services/api/AdminServices'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@/components/ui/select'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const { t } = useI18n()
const router = useRouter()

const pois = ref<any[]>([])

/**
 * Available POI types (translated for dropdown).
 */

const poiTypes = ref([
  { id: 1, name: t('map.shelter') },
  { id: 2, name: t('map.defibrillator') }
])

/**
 * The currently selected POI.
 */

const selectedPoi = ref<any | null>(null)

/**
 * Fetch POI's on load.
 */

onMounted(async () => {
  const response = await fetchPublicPois()
  pois.value = response
})

/**
 * Form validation schema.
 */

const formSchema = toTypedSchema(z.object({
  name: z.string().min(2),
  description: z.string().optional(),
    latitude: z
        .preprocess(val => val !== '' ? Number(val) : undefined, z.number().optional()),
    longitude: z
        .preprocess(val => val !== '' ? Number(val) : undefined, z.number().optional()),

    contactInfo: z.string().optional(),
  openingFrom: z.string().optional(),
  openingTo: z.string().optional(),
  poiTypeId: z.preprocess(val => val ? Number(val) : undefined, z.number().optional())
}))

/**
 * Initialize the form.
 */

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    contactInfo: '',
    openingFrom: '',
    openingTo: '',
    poiTypeId: undefined
  }
})

/**
 * Populate form with POI data.
 * @param poi the selected POI-object.
 */

function selectPoi(poi: any) {
  selectedPoi.value = poi

  const [openFrom, openTo] = poi.openingHours?.split('-').map((s: string) => s.trim()) || ['', '']

  form.setValues({
    name: poi.name || '',
    description: poi.description || '',
    latitude: poi.latitude?.toString() || '',
    longitude: poi.longitude?.toString() || '',
    contactInfo: poi.contactInfo || '',
    openingFrom: openFrom,
    openingTo: openTo,
    poiTypeId: poi.poiTypeId?.toString() || ''
  })
}

/**
 * Handle form submit to update POI.
 * @param values form values.
 */
async function onSubmit(values: any) {
  if (!selectedPoi.value) return

  const updateData = {
    ...values,
    openingHours: values.openingFrom && values.openingTo
      ? `${values.openingFrom} - ${values.openingTo}`
      : null
  }

  await editPoi(selectedPoi.value.id, updateData)
  router.push('/admin-panel')
}

/**
 * Cancel update of current POI.
 */
function cancelUpdate() {
  selectedPoi.value = null
}

/**
 * Delete current POI (after conformation).
 */
async function deleteSelectedPoi() {
  if (!selectedPoi.value) return
  const confirmed = confirm(t('add-poi.confirm-delete') || 'Are you sure you want to delete this point of interest?')
  if (!confirmed) return
  await deletePoi(selectedPoi.value.id)
  router.push('/admin-panel')
}
</script>

<style scoped>
h1 {
  font-size: 2em;
  margin: 20px;
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
.edit form > * + * {
  margin-top: 1rem;
}
.map {
  border-radius: 8px;
  border: solid grey;
  min-width: 300px;
  min-height: 400px;
  background-color: lightgreen;
}
</style>
