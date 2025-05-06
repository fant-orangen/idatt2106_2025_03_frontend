<template>
  <div class="m-5">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" class="hover:underline">
            {{ t('navigation.home') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin-panel" class="hover:underline">
            {{ t('navigation.admin-panel') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ t('admin.edit-POI') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <h1 class="text-3xl font-semibold my-5">{{ t('admin.edit-POI') }}:</h1>

    <div v-if="selectedPoi" class="mb-4">
      <Button @click="cancelUpdate()">{{ t('navigation.go-back') }}</Button>
    </div>

    <div class="flex flex-wrap justify-center gap-4">
      <div v-if="!selectedPoi" class="min-w-fit max-w-lg max-h-[600px] flex-grow">
        <Card class="h-full flex flex-col">
          <CardHeader>
            <CardTitle>{{ t('add-POI-info.titles.choose-poi') }}</CardTitle>
          </CardHeader>
          <CardContent class="flex-grow overflow-y-auto card-content-padding">
             <InfiniteScroll :is-loading="isFetchingNextPage" :has-more="hasNextPage" @load-more="fetchNextPage" class="h-full">
                <div v-for="(poi) in allPois" :key="poi.id" @click="selectPoiById(poi.id)"
                    class="text-sm cursor-pointer transition-colors hover:bg-muted/80 p-2 rounded-md">
                  <div class="flex flex-nowrap w-full justify-between items-center gap-2">
                    <span class="poi-tag truncate">{{ poi.name }}</span>
                    <span class="poi-tag whitespace-nowrap">{{ poi.type }}</span>
                  </div>
                  <Separator class="my-2" />
                </div>

                <template #loading>
                  <div class="text-center p-4">Laster flere...</div>
                </template>
                <template #end-message>
                  <div class="text-center p-4 text-muted-foreground" v-if="!hasNextPage && allPois.length > 0">Alle interessepunkter er lastet inn</div>
                </template>
             </InfiniteScroll>
          </CardContent>
        </Card>
      </div>

      <div v-if="selectedPoi" class="min-w-[350px] max-w-lg flex-grow">
        <Card>
          <CardHeader>
            <CardTitle>{{ t('admin.poi-details') }}:</CardTitle>
          </CardHeader>
          <CardContent class="card-content-padding">

            <form v-if="form && onSubmitPoi" @submit.prevent="onSubmitPoi" class="space-y-6">
              <FormField v-slot="{ field, meta, errorMessage }" name="name">
                <FormItem>
                  <FormLabel>{{t('add-poi.name')}}</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="field" readonly disabled />
                  </FormControl>
                  <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                </FormItem>
              </FormField>

              <div class="flex flex-nowrap gap-4">
                <FormField v-slot="{ field, meta, errorMessage }" name="latitude" class="flex-1">
                  <FormItem>
                    <FormLabel>{{t('add-poi.latitude')}}</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" v-bind="field" readonly disabled />
                    </FormControl>
                    <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field, meta, errorMessage }" name="longitude" class="flex-1">
                  <FormItem>
                    <FormLabel>{{t('add-poi.longitude')}}</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" v-bind="field" readonly disabled />
                    </FormControl>
                    <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                  </FormItem>
                </FormField>
              </div>

              <FormField v-slot="{ field, meta, errorMessage }" name="address">
                <FormItem>
                  <FormLabel>{{t('add-poi.address')}}</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="field" readonly disabled/>
                  </FormControl>
                  <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                </FormItem>
              </FormField>
              <p class="text-xs text-muted-foreground">{{ t('add-event-info.coordinates') }}</p>


              <FormField v-slot="{ field, meta, errorMessage }" name="description">
                <FormItem>
                  <FormLabel>{{t('add-poi.description')}}:</FormLabel>
                  <FormControl>
                    <Textarea class="min-h-[100px]" v-bind="field"></Textarea>
                  </FormControl>
                  <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
                </FormItem>
              </FormField>

              <div class="flex flex-nowrap gap-4">
                <FormField v-slot="{ field, meta, errorMessage }" name="openFrom" class="flex-1">
                  <FormItem>
                    <FormLabel>{{ t('add-POI-info.titles.open-from') }}</FormLabel>
                    <FormControl>
                      <Input type="time" v-bind="field" />
                    </FormControl>
                     <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field, meta, errorMessage }" name="openTo" class="flex-1">
                  <FormItem>
                    <FormLabel>{{ t('add-POI-info.titles.open-to') }}</FormLabel>
                    <FormControl>
                      <Input type="time" v-bind="field" />
                    </FormControl>
                     <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                  </FormItem>
                </FormField>
              </div>

              <FormField v-slot="{ field, meta, errorMessage }" name="contactInfo">
                <FormItem>
                  <FormLabel>{{ t('add-poi.contact') }}</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="field" />
                  </FormControl>
                  <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                </FormItem>
              </FormField>

              <FormField v-slot="{ field, meta, errorMessage }" name="poiTypeId">
                <FormItem>
                  <FormLabel>{{ t('add-poi.type') }}</FormLabel>
                  <FormControl>
                      <Input :placeholder="$t('add-POI-info.POI-type.')" readonly disabled/>
                  </FormControl>
                  <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
                </FormItem>
              </FormField>

              <div class="flex gap-2 pt-4">
                <Button type="submit">{{t('add-poi.submit')}}</Button>
                <Button type="button" variant="destructive" @click="confirmDeletePoi(selectedPoi?.id)">{{t('add-poi.delete')}}</Button>
              </div>
            </form>
             <div v-else class="text-center p-4 text-muted-foreground">
                Laster skjema...
            </div>
          </CardContent>
        </Card>
      </div>

      <div v-if="selectedPoi" class="map-placeholder rounded-lg border min-w-[300px] min-h-[400px] flex justify-center items-center flex-grow-2 max-w-xl">
         {{ t('admin.map-placeholder') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';
import type { PoiPreviewDto, PoiData, UpdatePoiDto } from '@/models/PoiData.ts'
import { fetchPoiPreviews, getPoiById, updatePoi as apiUpdatePoi } from '@/services/api/PoiService';
import { deletePoi } from '@/services/api/AdminServices';

import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';



import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { updateCurrentPoi } from "@/services/api/AdminServices.ts";


const { t } = useI18n();
const router = useRouter();
const queryClient = useQueryClient();
const selectedPoi = ref<PoiData | null>(null);
const updatedData = ref<UpdatePoiDto | null> (null);
const form = ref();
const onSubmitPoi = ref<(e?: Event) => void>();

const pageSize = 10;
const {
  data,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
} = useInfiniteQuery<PoiPreviewDto[], Error>({
  queryKey: ['pois'],
  queryFn: async ({ pageParam = 0 }) => {
    const pageNumber = pageParam as number;
    const page = await fetchPoiPreviews(pageNumber, 10);
    console.log(`Workspaceing POIs page: ${pageParam}`);
    return page.content;
  },
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < pageSize ? undefined :  allPages.length;
  },
  initialPageParam: 0
});

// Bruker flatMap med fallback for å lage en flat liste av alle POIs
const allPois = computed<PoiPreviewDto[]>(() =>
  data.value?.pages.flat() ?? []
);


function setupFormSchema() {
  console.log("Setting up form schema...");
  const schema = z.object({
     name: z.string().min(2, t('add-poi.errors.name-minmax')).max(100, t('add-poi.errors.name-minmax')),
    latitude: z.preprocess((val) => (val === '' || val === null || val === undefined) ? undefined : Number(val),
      z.number({invalid_type_error: t('add-event-info.errors.latitude')}).min(-90, t('add-event-info.errors.latitude')).max(90, t('add-event-info.errors.latitude'))
    ).optional(),
    longitude: z.preprocess((val) => (val === '' || val === null || val === undefined) ? undefined : Number(val),
      z.number({invalid_type_error: t('add-event-info.errors.longitude')}).min(-180, t('add-event-info.errors.longitude')).max(180, t('add-event-info.errors.longitude'))
    ).optional(),
    address: z.string().max(200, t('add-poi.errors.address-max')).optional(),
    description: z.string().max(1000, t('add-poi.errors.description-max')).optional(),
    openFrom: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, t('admin.errors.invalid-time-format')).optional().or(z.literal('')),
    openTo: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, t('admin.errors.invalid-time-format')).optional().or(z.literal('')),
    contactInfo: z.string().max(100, t('add-poi.errors.contact-max')).optional(),
    poiTypeId: z.preprocess(val => val ? Number(val) : undefined, z.number({ required_error: t('add-poi.errors.type-required'), invalid_type_error: t('add-poi.errors.type-invalid') })),
  }).refine(data => {
    // Tillater at begge koordinatene er undefined, men hvis én er satt, må begge være det.
    const latIsNum = typeof data.latitude === 'number' && !isNaN(data.latitude);
    const lonIsNum = typeof data.longitude === 'number' && !isNaN(data.longitude);
    if (latIsNum !== lonIsNum) { // En er satt, den andre ikke
         return false;
    }
    return true;
  }, {
    message: t('add-event-info.errors.coordinates-pair'),
    path: ['latitude'],
  });

  form.value = useForm({
    validationSchema: toTypedSchema(schema),
  });

  if (form.value) {
    onSubmitPoi.value = form.value.handleSubmit(handleFormSubmitPoi);
  } else {
     console.error("Form instance could not be created in setupFormSchema.");
  }
  console.log("Form schema setup complete.");
}

async function handleFormSubmitPoi(values: any) {
    if (!selectedPoi.value) {
        console.error('No event selected');
        return;
    }
    updatedData.value = {
        name: values.name ?? selectedPoi.value.name,
        latitude: values.latitude ?? selectedPoi.value.latitude, // Bruker validert/prosessert verdi
        longitude: values.longitude ?? selectedPoi.value.longitude, // Bruker validert/prosessert verdi
        description: values.description ?? selectedPoi.value.description,
        openFrom: values.openFrom ?? selectedPoi.value.openFrom,
        openTo: values.openTo ?? selectedPoi.value.openTo,
        contactInfo: values.contactInfo ?? selectedPoi.value.contactInfo,
        poiTypeId: values.poiTypeId ?? selectedPoi.value.poiTypeId,
    };
    console.log("Submitting update data:", updatedData.value);
    updateSelectedPoi();
}
async function updateSelectedPoi() {
    if (!selectedPoi.value || !updatedData.value) {
        console.log('No POI selected or updated.');
        return;
    }
    try {
        const response = await updateCurrentPoi(selectedPoi.value.id, updatedData.value)

        console.log('Event updated successfully!', response.data);
        callToast('Updated the event with your new values!');

        selectedPoi.value = null;
        updatedData.value = null;

        await queryClient.invalidateQueries({queryKey: ['pois']});

    } catch (error) {
        callToast('Failed to update POI details...');
        console.error('Failed to update POI: ', error);
    }


function cancelUpdate() {
  console.log("Update cancelled.");
    selectedPoi.value = null;
    updatedData.value = null;
    form.value?.resetForm();

}

async function confirmDeletePoi(poiId: number | undefined) {
  if (poiId === undefined) {
    callToast(t('admin.errors.poi-delete-failed'));
    return;
  }
  console.log(`Attempting to delete POI with ID: ${poiId}`);
  const confirmed = window.confirm(t('add-poi.confirm-delete'));
  if (confirmed) {
    console.log("Deletion confirmed.");
    try {
      const response = await deletePoi(poiId);
      console.log("Tried deleting a POI..", response)

      callToast(t('admin.success.poi-deleted'));
      selectedPoi.value = null;
      await queryClient.invalidateQueries({ queryKey: ['pois'] });

      console.log("POI deleted successfully, query invalidated.");
    } catch (error) {
      console.error('Failed to delete POI:', error);
      const errorResponse = (error as any)?.response?.data;
      let errorMessage = t('admin.errors.poi-delete-failed'); // Default
      if (typeof errorResponse === 'string' && errorResponse.length > 0) {
            errorMessage = errorResponse;
      } else if (typeof errorResponse?.message === 'string' && errorResponse.message.length > 0) {
            errorMessage = errorResponse.message;
      } else if ((error as Error)?.message) {
            errorMessage = (error as Error).message;
      }
      callToast(errorMessage);
    }
  } else {
      console.log("Deletion cancelled.");
  }
}

function callToast(message: string) {
  console.log("Toast:", message);
  toast(message);
}

onMounted(() => {
  fetchNextPage();
  setupFormSchema(); // Initialiser form
});

watch(selectedPoi, async(poi) => {
  if( poi && form.value){
    await nextTick();
    form.value.setValues({
      name: poi.name ?? '',
      latitude: poi.latitude ?? '',
      longitude: poi.longitude ??'',
      description: poi.description ?? '',
      openFrom: poi.openFrom ?? '',
      openTo: poi.openTo ?? '',

    })
  }
});

watch(selectedPoi, async (poi) => {
   console.log("Watcher: selectedPoi changed", poi);
  if (poi) {
    if (form.value && typeof form.value.setValues === 'function') {
      await nextTick();
      console.log("Setting form values for POI:", poi.id);
      try {
           const initialValues = {
                name: poi.name ?? '',
                latitude: poi.latitude?.toString() ?? '',
                longitude: poi.longitude?.toString() ?? '',
                address: poi.address ?? '',
                description: poi.description ?? '',
                openFrom: poi.openFrom ?? '',
                openTo: poi.openTo ?? '',
                contactInfo: poi.contactInfo ?? '',
                poiTypeId: poi.poiTypeId ?? undefined,
            };
          // Reset for å fjerne gamle feil og sett nye verdier
          form.value.resetForm({ values: initialValues });
          console.log("Form values set and form reset.");

      } catch (e) {
          console.error("Error setting/resetting form values:", e);
      }

    } else {
         console.warn("Form not ready when trying to set values for selected POI.");
         //setter opp skjema på nytt dersom det ikk går med onMounted
         setupFormSchema();
         await nextTick();
         if (form.value && typeof form.value.setValues === 'function') {
              const initialValuesRetry = {};
             form.value.resetForm({ values: initialValuesRetry });
         } else {
             console.error("Form still not ready after retry.");
         }
    }
  } else if (form.value && typeof form.value.resetForm === 'function') {
    console.log("Resetting form because selectedPoi is null.");
    form.value.resetForm();
  }
}, { deep: true })};
// --- Slutt Watchers ---

</script>

<style scoped>
.card-content-padding {
  padding: 1rem;
}
.poi-tag {
  padding: 2px 8px;
  border-radius: var(--radius-md);
  background-color: var(--color-muted-foreground);
  color: var(--color-background);
  text-transform: capitalize;
  flex-shrink: 0;
}
.map-placeholder {
  background-color: var(--color-muted);
  color: var(--color-muted-foreground);
  border-color: var(--color-border);
}
:deep(.FormItem) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
:deep(.FormLabel) {
  font-weight: 500;
  color: var(--color-foreground);
}
</style>
