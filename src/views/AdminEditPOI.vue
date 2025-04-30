<!-- Admin-page for editing POI's -->

<template>
  <div style="margin:20px">

    <!-- Breadcrumb -->
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/admin-panel">
          {{ $t('navigation.admin-panel') }}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{{ $t('admin.edit-POI') }}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </div>

  <h1 class="text-center">{{ $t('admin.edit-POI') }}</h1>

  <div class="page">

    <!-- Form -->
    <div class="fields">
      <form @submit="onSubmit">

        <!-- Title -->
        <FormField v-slot="{ field, meta, errorMessage}" name="title">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.title')}}</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Title" v-bind="field" />
            </FormControl>
            <FormMessage v-if="meta.touched || meta.submitFailed">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField><br>

        <!-- Placement -->
        <div class="container">
          <FormField v-slot="{ field, meta, errorMessage }" name="latitude">
            <FormItem>
              <FormLabel>{{ $t('add-event-info.titles.latitude') }}</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Latitude" v-bind="field" class="w-[100px]" />
              </FormControl>
              <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field, meta, errorMessage }" name="longitude">
            <FormItem>
              <FormLabel>{{ $t('add-event-info.titles.longitude') }}</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Longitude" v-bind="field" class="w-[100px]" />
              </FormControl>
              <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field, meta, errorMessage }" name="address">
            <FormItem>
              <FormLabel>{{ $t('add-event-info.titles.address') }}</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Eksempelveien 21" v-bind="field" />
              </FormControl>
              <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div><br>

        <!-- Type -->
        <FormField v-slot="{ field, meta, errorMessage }" name="type">
          <FormItem>
            <FormLabel>{{ $t('add-POI-info.titles.type') }}</FormLabel>
            <FormControl>
              <Select v-model="field.value">
                <SelectTrigger>
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="defibrillator">{{ $t('add-POI-info.POI-type.defibrillator') }}</SelectItem>
                    <SelectItem value="shelter">{{ $t('add-POI-info.POI-type.shelter') }}</SelectItem>
                    <SelectItem value="water-source">{{ $t('add-POI-info.POI-type.water-source') }}</SelectItem>
                    <SelectItem value="food-station">{{ $t('add-POI-info.POI-type.food-station') }}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField><br>

        <!-- Opening times -->
        <div class="container">
          <FormField v-slot="{ field }" name="openfrom">
            <FormItem>
              <FormLabel>{{ $t('add-POI-info.titles.open-from') }}</FormLabel>
              <FormControl>
                <Input type="time" v-bind="field" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field }" name="opento">
            <FormItem>
              <FormLabel>{{ $t('add-POI-info.titles.open-to') }}</FormLabel>
              <FormControl>
                <Input type="time" v-bind="field" />
              </FormControl>
            </FormItem>
          </FormField>
        </div><br>

        <!-- Contact info -->
        <FormField v-slot="{ field, meta, errorMessage }" name="contactinfo">
          <FormItem>
            <FormLabel>{{ $t('add-POI-info.titles.contact-info') }}</FormLabel>
            <FormControl>
              <Input type="phone" placeholder="+47 123 45 678" v-bind="field" />
            </FormControl>
            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField><br>

        <!-- Description -->
        <FormField v-slot="{ field, meta, errorMessage }" name="description">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.description') }}</FormLabel>
            <FormControl>
              <Textarea placeholder="Description" v-bind="field" />
            </FormControl>
            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField><br>

        <Button type="submit">{{ $t('add-event-info.titles.submit') }}</Button>
      </form>
    </div>

    <!-- Map preview -->
    <div class="box">MAP</div>
  </div>

  <!-- Delete Button -->
  <div class="mt-6 text-right">
    <button
      @click="showDeleteConfirm = true"
      class="text-sm text-red-500 underline"
    >
      {{ $t('delete') }}
</button>
</div>

  <!-- Confirm delete modal -->
  <div
    v-if="showDeleteConfirm"
    class="fixed top-1/4 left-1/2 -translate-x-1/2 bg-card text-foreground p-6 border border-destructive rounded-lg shadow-xl z-50"
  >
    <p class="mb-4">{{ $t("Are you sure you want to delete this POI?") }}</p>
    <div class="flex justify-end space-x-4">
      <button @click="showDeleteConfirm = false" class="text-muted-foreground underline">
        {{ $t("Cancel") }}
      </button>
      <button @click="confirmDelete" class="text-destructive underline">
        {{ $t("Delete permanently") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useI18n } from 'vue-i18n';
import * as z from 'zod';
import { getPOIById, editPOI, deletePOI } from '@/services/api/AdminServices';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const poiId = Number(route.params.id);
const isLoading = ref(true);
const showDeleteConfirm = ref(false);

/**
 * Form schema
 */

const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(2).max(50),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    address: z.string().max(100).optional(),
    type: z.enum(["defibrillator", "shelter", "water-source", "food-station"]),
    openfrom: z.string().optional(),
    opento: z.string().optional(),
    contactinfo: z.string().optional(),
    description: z.string().min(10).max(500),
  })
);

/**
 * Form configuration.
 */

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: '',
    latitude: undefined,
    longitude: undefined,
    address: '',
    type: 'defibrillator',
    openfrom: '',
    opento: '',
    contactinfo: '',
    description: ''
  }
});

/**
 * Fetch existing POI data.
 */

onMounted(async () => {
  try {
    const response = await getPOIById(poiId);
    form.setValues(response.data);
  } catch (error) {
    console.error('Error loading POI:', error);
  } finally {
    isLoading.value = false;
  }
});

/**
 * Submit handler.
 */

const onSubmit = form.handleSubmit(async (values) => {
  try {
    await editPOI(poiId, values);
    router.push('/admin-panel');
  } catch (error) {
    console.error('Failed to update POI:', error);
  }
});

/**
 * Confirm deleting a POI.
 */

const confirmDelete = async () => {
  try {
    await deletePOI(poiId);
    router.push('/admin-panel');
  } catch (error) {
    console.error('Failed to delete POI:', error);
  }
};
</script>

<style scoped>
.page {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  margin: 30px;
  gap: 15px;
}

.container {
  display: flex;
  gap: 10px;
}

.fields {
  max-width: 450px;
}

.box {
  border: 1px solid gray;
  border-radius: 8px;
  min-width: 300px;
  min-height: 400px;
  background-color: lightgreen;
}
</style>
