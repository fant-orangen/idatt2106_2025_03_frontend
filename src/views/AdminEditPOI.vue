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

        <!-- Opening Times -->
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

        <!-- Contact Info -->
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
</template>

<script setup lang="ts">
import router from '@/router'
import { editPOI } from '@/services/api/AdminServices'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const { t } = useI18n();

const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(2).max(50),
    latitude: z.preprocess((val) => Number(val), z.number().min(-90).max(90)).optional(),
    longitude: z.preprocess((val) => Number(val), z.number().min(-180).max(180)).optional(),
    address: z.string().max(100).optional(),
    type: z.enum(["defibrillator", "shelter", "water-source", "food-station"]),
    openfrom: z.string().optional(),
    opento: z.string().optional(),
    contactinfo: z.string().optional(),
    description: z.string().min(10).max(500),
  })
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: '',
    latitude: '',
    longitude: '',
    address: '',
    type: 'defibrillator',
    openfrom: '',
    opento: '',
    contactinfo: '',
    description: ''
  }
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const [response] = await Promise.all([editPOI(values)]);
    console.log('POI edited successfully!', response.data);
    router.push('/admin-panel');
  } catch (error) {
    console.error('Error editing POI:', error);
  }
});
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
