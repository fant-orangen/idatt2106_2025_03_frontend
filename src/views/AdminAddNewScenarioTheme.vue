<template>
  <div style="margin: 20px;">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            {{ $t('navigation.home') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/admin-panel">
            {{ $t('navigation.admin-panel') }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ $t('admin.make-new-scenario-theme') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <h1>{{ $t('admin.make-new-scenario-theme') }}</h1>

    <div class="page">
      <Card class="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{{ $t('admin.scenario-theme-details') }}</CardTitle>
          <CardDescription>{{ $t('admin.scenario-theme-description') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="onSubmit" class="space-y-6">
            <!-- Name field -->
            <FormField v-slot="{ field, meta, errorMessage }" name="name">
              <FormItem>
                <FormLabel>{{ $t('admin.scenario-theme-name') }}</FormLabel>
                <FormControl>
                  <Input v-bind="field" :placeholder="$t('admin.scenario-theme-name-placeholder')" />
                </FormControl>
                <FormDescription>{{ $t('admin.scenario-theme-name-description') }}</FormDescription>
                <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>

            <!-- Description field -->
            <FormField v-slot="{ field, meta, errorMessage }" name="description">
              <FormItem>
                <FormLabel>{{ $t('admin.scenario-theme-description-label') }}</FormLabel>
                <FormControl>
                  <Textarea
                    v-bind="field"
                    :placeholder="$t('admin.scenario-theme-description-placeholder')"
                    class="min-h-[100px]"
                  />
                </FormControl>
                <FormDescription>{{ $t('admin.scenario-theme-description-help') }}</FormDescription>
                <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>

            <!-- Before Crisis Instructions field -->
            <FormField v-slot="{ field, meta, errorMessage }" name="before">
              <FormItem>
                <FormLabel>{{ $t('admin.scenario-theme-before') }}</FormLabel>
                <FormControl>
                  <Textarea
                    v-bind="field"
                    :placeholder="$t('admin.scenario-theme-before-placeholder')"
                    class="min-h-[150px]"
                  />
                </FormControl>
                <FormDescription>
                  {{ $t('admin.scenario-theme-before-help') }}
                  <span class="block mt-1 text-xs">{{ $t('admin.markdown-supported') }}</span>
                </FormDescription>
                <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>

            <!-- During Crisis Instructions field -->
            <FormField v-slot="{ field, meta, errorMessage }" name="under">
              <FormItem>
                <FormLabel>{{ $t('admin.scenario-theme-under') }}</FormLabel>
                <FormControl>
                  <Textarea
                    v-bind="field"
                    :placeholder="$t('admin.scenario-theme-under-placeholder')"
                    class="min-h-[150px]"
                  />
                </FormControl>
                <FormDescription>
                  {{ $t('admin.scenario-theme-under-help') }}
                  <span class="block mt-1 text-xs">{{ $t('admin.markdown-supported') }}</span>
                </FormDescription>
                <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>

            <!-- After Crisis Instructions field -->
            <FormField v-slot="{ field, meta, errorMessage }" name="after">
              <FormItem>
                <FormLabel>{{ $t('admin.scenario-theme-after') }}</FormLabel>
                <FormControl>
                  <Textarea
                    v-bind="field"
                    :placeholder="$t('admin.scenario-theme-after-placeholder')"
                    class="min-h-[150px]"
                  />
                </FormControl>
                <FormDescription>
                  {{ $t('admin.scenario-theme-after-help') }}
                  <span class="block mt-1 text-xs">{{ $t('admin.markdown-supported') }}</span>
                </FormDescription>
                <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>

            <!-- Submit button -->
            <div class="flex justify-end">
              <Button
                type="submit"
                :disabled="isSubmitting"
                class="w-full md:w-auto"
              >
                <Loader v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                {{ $t('admin.create-scenario-theme') }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>

    <!-- Success Dialog -->
    <Dialog :open="isSuccessDialogOpen" @update:open="isSuccessDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t('admin.scenario-theme-created') }}</DialogTitle>
          <DialogDescription>
            {{ $t('admin.scenario-theme-created-description') }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="navigateToAdminPanel">{{ $t('admin.back-to-admin') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * AdminAddNewScenarioTheme component
 *
 * This component provides a form for administrators to create new scenario themes.
 * It includes validation, form submission handling, and success feedback.
 *
 * @component
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { createScenarioTheme } from '@/services/api/ScenarioThemeService'
import type { CreateScenarioThemeDto } from '@/models/ScenarioTheme'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

const { t } = useI18n()
const router = useRouter()
const isSubmitting = ref(false)
const isSuccessDialogOpen = ref(false)

/**
 * Form validation schema using Zod
 * Defines validation rules for the scenario theme form fields
 */
const formSchema = toTypedSchema(
  z.object({
    name: z.string()
      .min(3, { message: t('admin.scenario-theme-name-min-length') })
      .max(100, { message: t('admin.scenario-theme-name-max-length') }),
    description: z.string()
      .min(10, { message: t('admin.scenario-theme-description-min-length') })
      .max(1000, { message: t('admin.scenario-theme-description-max-length') }),
    before: z.string()
      .min(10, { message: t('admin.scenario-theme-before-instructions-min-length') })
      .max(5000, { message: t('admin.scenario-theme-before-instructions-max-length') }),
    under: z.string()
      .min(10, { message: t('admin.scenario-theme-under-instructions-min-length') })
      .max(5000, { message: t('admin.scenario-theme-under-instructions-max-length') }),
    after: z.string()
      .min(10, { message: t('admin.scenario-theme-after-instructions-min-length') })
      .max(5000, { message: t('admin.scenario-theme-after-instructions-max-length') })
  })
)

/**
 * Initialize form with validation schema and default values.
 */
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    description: '',
    before: '',
    under: '',
    after: ''
  }
})

/**
 * Form submission handler
 * Creates a new scenario theme with the form data
 */
const onSubmit = form.handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    const themeData: CreateScenarioThemeDto = {
      name: values.name,
      description: values.description,
      before: values.before,
      under: values.under,
      after: values.after
    }

    await createScenarioTheme(themeData)
    isSuccessDialogOpen.value = true
    form.resetForm()
  } catch (error) {
    console.error('Failed to create scenario theme:', error)
  } finally {
    isSubmitting.value = false
  }
})

/**
 * Navigate back to admin panel after successful creation
 * Closes the success dialog and redirects to the admin panel
 */
function navigateToAdminPanel() {
  isSuccessDialogOpen.value = false
  router.push('/admin/admin-panel')
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
</style>
