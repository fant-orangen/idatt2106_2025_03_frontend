<template>
  <div style="margin: 20px;">

    <!-- Breadcrumb -->
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
          <BreadcrumbPage>{{ $t('admin.edit-scenario-themes') }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Page title -->
    <h1>{{ $t('admin.edit-scenario-themes') }}</h1>

    <!-- Go back button shows up when a theme is chosen -->
    <div v-if="selectedTheme" class="mb-4">
      <Button @click="cancelEdit()">{{ $t('navigation.go-back') }}</Button>
    </div>

    <div class="page">

      <!-- List of scenario themes -->
      <div v-if="!selectedTheme" class="w-full max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{{ $t('admin.select-scenario-theme') }}</CardTitle>
          </CardHeader>
          <CardContent>

            <!-- Loading indicator -->
            <div v-if="loadingThemes" class="flex justify-center py-8">
              <Loader class="h-8 w-8 animate-spin text-primary" />
              <span class="sr-only">{{ $t('admin.loading-scenario-themes') }}</span>
            </div>

            <!-- No themes available -->
            <div v-else-if="scenarioThemes.length === 0" class="text-center py-8 text-muted-foreground">
              {{ $t('admin.no-scenario-themes') }}
            </div>

            <!-- Scrollable theme list -->
            <ScrollArea v-else class="h-[400px]">
              <div class="space-y-2 p-1">
                <Button
                  v-for="theme in scenarioThemes"
                  :key="theme.id"
                  variant="outline"
                  class="w-full justify-start text-left h-auto py-3 px-4 hover:bg-muted dark:hover:bg-muted/2"
                  @click="selectTheme(theme)"
                >
                  <div class="font-medium">{{ theme.name }}</div>
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <!-- Edit form for selected theme -->
      <div v-if="selectedTheme" class="w-full max-w-3xl mx-auto">
        <h2 class="text-xl font-semibold mb-4">{{ $t('admin.scenario-theme-details') }}</h2>
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

            <!-- Submit and Delete buttons -->
            <div class="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                :disabled="isSubmitting"
                @click="confirmDelete"
              >
                {{ $t('admin.delete-scenario-theme') }}
              </Button>

              <Button
                type="submit"
                :disabled="isSubmitting"
              >
                <Loader v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                {{ $t('admin.update-scenario-theme') }}
              </Button>
            </div>
          </form>
      </div>
    </div>

    <!-- Success Dialog for Update -->
    <Dialog :open="isSuccessDialogOpen" @update:open="isSuccessDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t('admin.scenario-theme-updated') }}</DialogTitle>
          <DialogDescription>
            {{ $t('admin.scenario-theme-updated-description') }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="navigateToAdminPanel">{{ $t('add-event-info.go-to-admin') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Success Dialog for Delete -->
    <Dialog :open="isDeleteSuccessDialogOpen" @update:open="isDeleteSuccessDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t('admin.scenario-theme-deleted') }}</DialogTitle>
          <DialogDescription>
            {{ $t('admin.scenario-theme-deleted-description') }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="navigateToAdminPanel">{{ $t('add-event-info.go-to-admin') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Confirmation Dialog for Delete -->
    <AlertDialog :open="isDeleteConfirmOpen" @update:open="isDeleteConfirmOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ $t('admin.delete-scenario-theme') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ $t('admin.confirm-delete-scenario-theme') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ $t('common.cancel') }}</AlertDialogCancel>
          <AlertDialogAction @click="deleteTheme">{{ $t('common.delete') }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">

/**
 * @component AdminEditScenarioTheme
 * @description This component provides functionality to edit or delete existing scenario themes.
 * It includes a list of themes to select from, a form for editing, and confirmation dialogs.
 *
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {
  fetchAllScenarioThemes,
  fetchScenarioThemeById,
  updateScenarioTheme,
  deleteScenarioTheme as deleteScenarioThemeApi
} from '@/services/api/ScenarioThemeService'
import type {
  ScenarioThemeDto,
  UpdateScenarioThemeDto
} from '@/models/ScenarioTheme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader } from 'lucide-vue-next'
import {
  Card,
  CardContent,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
const scenarioThemes = ref<ScenarioThemeDto[]>([])
const selectedTheme = ref<ScenarioThemeDto | null>(null)
const loadingThemes = ref(true)
const isSubmitting = ref(false)
const isSuccessDialogOpen = ref(false)
const isDeleteSuccessDialogOpen = ref(false)
const isDeleteConfirmOpen = ref(false)

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
 * Initialize form.
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
 * Load all scenario themes.
 */
onMounted(async () => {
  try {
    const response = await fetchAllScenarioThemes()
    scenarioThemes.value = response.content
  } catch (error) {
    console.error('Failed to load scenario themes:', error)
  } finally {
    loadingThemes.value = false
  }
})

/**
 * Select theme to edit
 * @param theme - the theme to edit.
 */
function selectTheme(theme: ScenarioThemeDto) {
  selectedTheme.value = theme

  // Load the full theme details
  fetchScenarioThemeById(theme.id).then(themeDetails => {
    if (themeDetails) {
      // Set form values
      form.setValues({
        name: themeDetails.name,
        description: themeDetails.description || '',
        before: themeDetails.before || '',
        under: themeDetails.under || '',
        after: themeDetails.after || ''
      })
    }
  }).catch(error => {
    console.error(`Failed to load details for theme ID ${theme.id}:`, error)
  })
}

/**
 * Cancel editing a theme and return to list.
 */
function cancelEdit() {
  selectedTheme.value = null
  form.resetForm()
}

/**
 * Form submission handler for updating a theme.
 */
const onSubmit = form.handleSubmit(async (values) => {
  if (!selectedTheme.value) return

  isSubmitting.value = true

  try {
    const themeData: UpdateScenarioThemeDto = {
      id: selectedTheme.value.id,
      name: values.name,
      description: values.description,
      before: values.before,
      under: values.under,
      after: values.after
    }

    await updateScenarioTheme(themeData)
    isSuccessDialogOpen.value = true
  } catch (error) {
    console.error('Failed to update scenario theme:', error)
    // You could add error handling here, such as displaying a toast notification
  } finally {
    isSubmitting.value = false
  }
})

/**
 * Open delete confirmation dialog.
 */
function confirmDelete() {
  isDeleteConfirmOpen.value = true
}

/**
 * Delete a scenario theme.
 */
async function deleteTheme() {
  if (!selectedTheme.value) return

  isSubmitting.value = true

  try {
    // Get the current form values
    const currentValues = form.values

    const themeData: UpdateScenarioThemeDto = {
      id: selectedTheme.value.id,
      name: currentValues.name,
      description: currentValues.description,
      before: currentValues.before,
      under: currentValues.under,
      after: currentValues.after
    }

    await deleteScenarioThemeApi(themeData);
    isDeleteConfirmOpen.value = false
    isDeleteSuccessDialogOpen.value = true
  } catch (error) {
    console.error('Failed to delete scenario theme:', error)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Navigate back to admin panel after successful operation.
 */
function navigateToAdminPanel() {
  isSuccessDialogOpen.value = false
  isDeleteSuccessDialogOpen.value = false
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
