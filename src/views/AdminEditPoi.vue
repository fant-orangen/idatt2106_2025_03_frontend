<template>
  <div class="m-5">

    <!-- Navigation for admin-panel -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" class="hover:underline">
            {{ t('navigation.home') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/admin-panel" class="hover:underline">
            {{ t('navigation.admin-panel') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ t('admin.edit-POI') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header for editing -->
    <h1 class="text-3xl font-semibold my-5">{{ t('admin.edit-POI') }}:</h1>

    <!-- 'Go back' button after POI is chosen -->
    <div v-if="selectedPoi" class="mb-4">
      <Button @click="cancelUpdate()">{{ t('navigation.go-back') }}</Button>
    </div>

    <div class="flex flex-wrap justify-center gap-4 pb-30">

      <!-- List of POI's to choose from -->
      <div v-if="!selectedPoi" class="min-w-fit max-w-lg max-h-[600px] flex-grow">
        <div class="mb-4">
          <Input
              type="text"
              v-model="searchQuery"
              :placeholder="t('add-poi.search-poi')"
              class="w-full"
          />
        </div>
        <Card class="h-full flex flex-col">
          <CardHeader>
            <CardTitle>{{ t('add-POI-info.titles.choose-poi') }}</CardTitle>
          </CardHeader>
          <CardContent class="flex-grow overflow-y-auto card-content-padding">
                         <InfiniteScroll
                           :is-loading="isFetchingNextPage"
                           :has-more="hasNextPage"
                           @load-more="fetchNextPage"
                           class="h-full"
                         >
                           <div
                             v-for="poi in poiList"
                             :key="poi.id"
                             @click="selectedAPoi(poi.id)"
                    class="text-sm cursor-pointer transition-colors hover:bg-muted/80 p-2 rounded-md">
                  <div class="flex flex-nowrap w-full justify-between items-center gap-2">
                    <span class="poi-tag truncate">{{ poi.name }}</span>
                    <span class="poi-tag whitespace-nowrap">{{ poi.type }}</span>
                  </div>
                  <Separator class="my-2" />
                </div>

                <template #loading>
                  <div class="text-center p-4">{{ t('add-poi.loading') }}</div>
                </template>
                <template #end-message>
                  <div class="text-center p-4 text-muted-foreground" v-if="!hasNextPage && allPois.length > 0 && !searchQuery">{{ t('add-poi.loading-complete') }}</div>
                </template>
             </InfiniteScroll>
          </CardContent>
        </Card>
      </div>

      <!-- Editing schema for chosen POI -->

      <div v-if="selectedPoi" class="min-w-[350px] max-w-lg flex-grow">
        <Card>
          <CardHeader>
            <CardTitle>{{ t('admin.poi-details') }}:</CardTitle>
          </CardHeader>
          <CardContent class="card-content-padding">

            <form v-if="form && onSubmitPoi" @submit.prevent="onSubmitPoi" class="space-y-6">
              <FormField v-slot="{ field }" name="name">
                <FormItem>
                  <FormLabel>{{t('add-poi.name')}}</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="field" readonly disabled />
                  </FormControl>
                </FormItem>
              </FormField>

              <div class="flex flex-nowrap gap-4">
                <FormField v-slot="{ field }" name="latitude" class="flex-1">
                  <FormItem>
                    <FormLabel>{{t('add-poi.latitude')}}</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" v-bind="field" readonly disabled />
                    </FormControl>
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field }" name="longitude" class="flex-1">
                  <FormItem>
                    <FormLabel>{{t('add-poi.longitude')}}</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" v-bind="field" readonly disabled />
                    </FormControl>
                  </FormItem>
                </FormField>
              </div>

              <FormField v-slot="{ field }" name="address">
                <FormItem>
                  <FormLabel>{{t('add-poi.address')}}</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="field" readonly disabled/>
                  </FormControl>
                </FormItem>
              </FormField>

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

              <FormField v-slot="{ field }" name="poiType">
                <FormItem>
                  <FormLabel>{{ t('add-poi.type') }}</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="field" readonly disabled/>
                  </FormControl>
                </FormItem>
              </FormField>

              <div class="flex gap-2 pt-4">
                <Button type="submit">{{t('add-poi.submit')}}</Button>
                <Button type="button" variant="destructive" @click="openDialog()">{{t('add-poi.delete')}}</Button>
              </div>
            </form>
             <div v-else class="text-center p-4 text-muted-foreground">
                {{t('add-poi.loading-schema')}}
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        v-if="selectedPoi"
        class="min-w-[300px] max-w-xl flex-1 h-[400px] overflow-hidden rounded-lg border"
      >
        <StaticMapWithMarker class="z-50"
          :lat="selectedPoi.latitude"
          :lng="selectedPoi.longitude"
          :poiTypeName="selectedPoi.poiTypeName"
          :mapId="'poi-marker-map-' + selectedPoi.id"
        />
      </div>
    </div>

    <!-- Dialog for deleting a POI -->
    <Dialog v-model:open="wantToDelete" v-if="selectedPoi">
      <DialogTrigger></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('add-poi.confirm-delete') }}</DialogTitle>
          <DialogDescription>
            {{ t('add-poi.delete-info') }}
          </DialogDescription>
          <DialogFooter>
            <Button @click="confirmDeletePoi(selectedPoi.id)">
              {{ t('add-poi.delete')}}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * @component AdminEditPOI
 * @description displays page to edit an existing point of interest.
 */
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import type { PoiPreviewDto, PoiData, UpdatePoiDto } from '@/models/PoiData.ts'
import { fetchPoiPreviews, fetchPoiById, searchPoiPreviews } from '@/services/api/PoiService';
import { deletePoi } from '@/services/api/AdminServices';
import StaticMapWithMarker from '@/components/map/StaticMapWithMarker.vue'
import 'leaflet/dist/leaflet.css'

import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { editPoi } from "@/services/api/AdminServices.ts";


const { t } = useI18n();
const queryClient = useQueryClient();
const selectedPoi = ref<PoiData | null>(null);
const updatedData = ref<UpdatePoiDto | null> (null);
const form = ref();
const onSubmitPoi = ref<(e?: Event) => void>();
const wantToDelete = ref(false)
const searchQuery = ref('');

/**
 * Method for searching for a POI by name. If no search is done, show the full list.
 */
const poiList = computed<PoiPreviewDto[]>(() =>
    data.value?.pages.flat() ?? []
  );

const pageSize = 10;
const {
  data,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
} = useInfiniteQuery<PoiPreviewDto[], Error>({
    queryKey: computed(() => ['pois', searchQuery.value]),
    queryFn: async ({ pageParam = 0 }) => {
      const pageNumber = pageParam as number;
      if (searchQuery.value.trim()) {
          const page = await searchPoiPreviews(searchQuery.value, pageNumber, pageSize);
          return page.content;
        } else {
          const page = await fetchPoiPreviews(pageNumber, pageSize, 'id,desc');
          return page.content;
        }
    },
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < pageSize ? undefined :  allPages.length;
  },
  initialPageParam: 0
});

/**
 * FlatMap with fallback to create a list of all POI's
 */
const allPois = computed<PoiPreviewDto[]>(() =>
  data.value?.pages.flat() ?? []
);

/**
 * Retrieves details for a chosen POI based on id.
 * @param id - the ID of the chosen POI.
 */

async function selectedAPoi(id: number) {

  try {
    const response = await fetchPoiById(id);
    selectedPoi.value = response;
  } catch (error) {
    console.error('Error while fetching POI:' , error)
  }
}

/**
 * Retrieves and sets up validation schema for editing a POI.
 * Uses Zod and VeeValidate for validation.
 */

function setupFormSchema() {

  const schema = z.object({
     name: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    description: z.string().max(1000, t('add-poi.description-max')).optional(),
    openFrom: z.string().optional(),
    openTo: z.string().optional(),
    contactInfo: z.string().max(100, t('add-poi.contact-max')).optional(),
    poiType: z.string().optional()
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

/**
 * Handles submission of schema and prepares data for updates.
 * @param values - the values sent in from schema.
 */

async function handleFormSubmitPoi(values: any) {
    if (!selectedPoi.value) {
        console.error('No point of interest selected');
        return;
    }
    updatedData.value = {
        name: values.name ?? selectedPoi.value.name,
        latitude: values.latitude ?? selectedPoi.value.latitude,
        longitude: values.longitude ?? selectedPoi.value.longitude,
        description: values.description ?? selectedPoi.value.description,
        openFrom: values.openFrom ?? selectedPoi.value.openFrom,
        openTo: values.openTo ?? selectedPoi.value.openTo,
        contactInfo: values.contactInfo ?? selectedPoi.value.contactInfo,
        poiTypeId: values.poiTypeId ?? selectedPoi.value.poiTypeId,
    };
    console.log("Submitting update data:", updatedData.value);
    updateSelectedPoi();
}

/**
 * Method responsible for API-call to update a POI.
 */
async function updateSelectedPoi() {
  if (!selectedPoi.value || !updatedData.value) {
      console.log('No POI selected or updated.');
      return;
  }
  try {
    const response = await editPoi(selectedPoi.value.id, updatedData.value)

    console.log('Point of interest updated successfully!', response.data);
    callToast(t('add-poi.update-success'));;

    selectedPoi.value = null;
    updatedData.value = null;

    await queryClient.invalidateQueries({queryKey: ['pois']});

  } catch (error) {
      callToast(t('add-poi.update-failed'));
      console.error('Failed to update POI: ', error);
  }
}

/**
 * Cancels the editing and resets the schema.
 */

function cancelUpdate() {
  console.log("Update cancelled.");
    selectedPoi.value = null;
    updatedData.value = null;
    form.value?.resetForm();

}

/**
 * Opens the dialog for deletion of a chosen POI.
 */

function openDialog() {
  wantToDelete.value = true
}

/**
 * Performs deletion of a POI through API.
 * @param poiId - the ID of the POI to be deleted.
 */
async function confirmDeletePoi(poiId: number) {
  if (poiId === null || undefined) {
    callToast(t('add-poi.deletion.failed'));
    return;
  }
  console.log('Attempting to delete POI with ID:', poiId);
  try {
    const response = await deletePoi(poiId);
    console.log("Deleted a POI: ", response)

    callToast(t('add-poi.deletion.success'));
    selectedPoi.value = null;
    await queryClient.invalidateQueries({ queryKey: ['pois'] });

    console.log("POI deleted successfully, query invalidated.");
  } catch (error) {
    console.error('Failed to delete POI:', error);
  }
  console.log("Deletion confirmed.");

}

/**
 * Method to show toast-message to the user.
 * @param message - the message to be shown.
 */
function callToast(message: string) {
  console.log("Toast:", message);
  toast(message);
}

onMounted(() => {
  fetchNextPage;
  setupFormSchema();
});

watch(selectedPoi, async(poi) => {
  if( poi && form.value){
    await nextTick();
    form.value.setValues({
      name: poi.name ?? '',
      latitude: poi.latitude ?? '',
      longitude: poi.longitude ??'',
      address: poi.address ?? '',
      description: poi.description ?? '',
      openFrom: poi.openFrom ?? '',
      openTo: poi.openTo ?? '',
      contactInfo: poi.contactInfo ?? '',
      poiType: poi.poiTypeName ?? ''
    })
  }
});
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
