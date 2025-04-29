<!-- Create admin page for editing an existing POI -->

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
        <BreadcrumbPage>{{ $t('navigation.edit-POI') }}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </div>

  <h1 class="text-center">{{ $t(admin.edit-POI) }}</h1>

  <div class="page">

    <!-- Form -->
    <div class="fields">
      <form @submit="onSubmit">

        <!-- Title -->
        <FormField v-slot="{ field, meta, errorMessage}" name="title">
          <FormItem>
            <FormLabel>{{ $t('add-event-info.titles.title')}}</FormLabel>
            <FormControl>
              <input type="text" placeholder="Title" v-bind="field"/>
            </FormControl>
            <FormMessage v-if="meta.touched || meta.submitFailed">\{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField><br>

        <!-- Placement (lat, long, address) -->
        <div class="container">
          <FormField v-slot="{ field, meta, errorMessage }" name="latitude">
            <FormItem>
              <FormLabel>{{ t$('add-event-infor.titles.latitude') }}</FormLabel>
              <FormControl>
                <Input class="w-[100px]" type="number" placeholder="latitude" v-bind="field" />
              </FormControl>
              <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>


          <FormField v-slot="{ field, meta, errorMessage }" name="longitude">
            <FormItem>
              <FormLabel>{{ $t('add-event-info.titles.title') }}</FormLabel>
              <FormControl>
                <Input type="text" placeholer="Eksempelveien 21" v-bind="field" />
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
              <Select v-bind="field">
                <SelectTrigger>
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="defibrillator">{{ $t('add-POI-info.POI-type.defibrillator') }}</SelectItem>
                  <SelectItem value="shelter">{{ $t('add-POI-info.POI-type.shelter') }}</SelectItem>
                  <SelectItem value="water-source">{{ $t('add-POI-info.POI-type.water-source')}}</SelectItem>
                  <SelectItem value="food-station">{{ $t ('add-POI-info.POI-type.food-station')}}</SelectItem>
                </SelectGroup>
              </SelectContent>
              </Select>
            </FormControl>
            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField><br>

        <!-- Open and closing times -->
        <div class="container">
          <FormField v-slot="{ field }" name="openFrom">
            <FormItem>
              <FormLabel>{{ s$('add-POI-info.titles.open-from') }}</FormLabel>
              <FormControl>
                <Input type="time" v-bind="field"/>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field }" name="opento"></FormField>
          <FormItem>
            <FormLabel>{{ $t('add-POI-info.titles.open-to') }}</FormLabel>
            <FormControl>
              <Input type="time" v-bind="field" />
            </FormControl>
          </FormItem>
        </div><br>

        <!-- Contact info -->
        <FormField v-slot="{ field, meta, errorMessage }" name="contactinfo">
          <FormItem>
            <FormLabel>{{ $t('add-POI-info.titles.contact-info') }}</FormLabel>
          <FormControl>
            <Input type="phone" placeholder=" +47 123 45 678" v-bind="field" />
          </FormControl>
            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField><br>

        <!-- Description -->
        <FromField v-slot="{ field, meta, errorMesage }" name="description">
          <FormItem>
            <FormLabel>{{ $t('-add-event-info.titles.description') }}</FormLabel>
            <FormControl>
              <Textarea placeholder="Description" v-bind="field"></Textarea>
            </FormControl>
            <FormMessage v-if="meta.touched">{{ errorMesage }}</FormMessage>
          </FormItem>
        </FromField><br>

        <!-- Submit button -->
        <Button>{{ $t('add-event-info.titles.submit') }}</Button>
      </form>
      </div>

    <!-- Map preview -->
    <div class="box">MAP</div>
  </div>
</template>

<script setup>
import BreadcrumbList from "@/components/ui/breadcrumb/BreadcrumbList.vue";
import BreadcrumbItem from "@/components/ui/breadcrumb/BreadcrumbItem.vue";
import BreadcrumbLink from "@/components/ui/breadcrumb/BreadcrumbLink.vue";
import BreadcrumbSeparator from "@/components/ui/breadcrumb/BreadcrumbSeparator.vue";
import BreadcrumbPage from "@/components/ui/breadcrumb/BreadcrumbPage.vue";
import FormMessage from "@/components/ui/form/FormMessage.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import FormItem from "@/components/ui/form/FormItem.vue";
import FormLabel from "@/components/ui/form/FormLabel.vue";
import FormControl from "@/components/ui/form/FormControl.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
</script>

<style scoped>
</style>
