<template>
  <div class="min-h-screen p-6 bg-background text-foreground">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Breadcrumb -->
      <Breadcrumb class="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin-panel">{{ $t('navigation.admin-panel') }}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage href="/handle-admins">{{ $t('admin.edit-admin') }}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <!-- Page Header -->
      <h1 class="text-3xl font-bold">{{ $t('admin.edit-admin') }}</h1>

      <!-- Add New Admin Section -->
      <Card class="p-6">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">{{ $t('admin.new-admin') }}</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="flex flex-col sm:items-start sm:justify-start gap-4">
                <Button @click="openNewAdminDialog" class="w-full sm:w-auto">
              {{ $t('admin.new-admin') }}
            </Button>
            <CardDescription class="text-sm text-muted-foreground">
              {{ $t('admin.give-rights') }}
            </CardDescription>
          </div>
        </CardContent>
      </Card>

      <!-- Current Admins Section -->
      <Card class="p-6">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">{{ $t('admin.current-admins') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea class="h-full w-full rounded-md border p-4">
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="admin in admins" :key="admin.userId">
                <Button variant="secondary"
                  @click="openDrawer(admin)"
                  class="w-full sm:w-auto">
                  {{ admin.email }}
                </Button>
              </div>
             </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <!-- Add New Admin Dialog -->
      <Dialog v-model:open="isNewAdminDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ $t('admin.new-admin') }}</DialogTitle>
          </DialogHeader>
          <form @submit.prevent="confirmNewAdmin" class="grid gap-4">
            <!-- Email Field -->
            <FormField v-slot="{ field, meta, errorMessage }" name="email">
              <FormItem>
                <FormLabel>{{ $t('login.enter-email') }}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="name@email.com" v-bind="field" />
                </FormControl>
                <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>

            <!-- Confirm Email Field -->
            <FormField v-slot="{ field, meta, errorMessage }" name="confirmEmail">
              <FormItem>
                <FormLabel>{{ $t('login.confirm-email') }}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="name@email.com" v-bind="field" />
                </FormControl>
                <FormMessage v-if="meta.touched && errorMessage">{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>

            <Button type="submit" variant="default" class="w-full">
              {{ $t('household.save') }}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <!-- Confirmation Dialog -->
      <AlertDialog v-model:open="showConfirmationDialog">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{{ $t('admin.are-you-sure') }}</AlertDialogTitle>
            <AlertDialogDescription>
              {{ $t('admin.if-continue') }}: {{ form.values.confirmEmail }}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{{ $t('admin.cancel') }}</AlertDialogCancel>
            <AlertDialogAction @click="handleAdminSubmit">
              {{ $t('admin.submit') }}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Admin Drawer -->
      <Drawer v-model:open="isOpen">
        <DrawerContent class="z-101">
          <DrawerHeader>
            <DrawerTitle>{{ $t('admin.administrate-profile') }}</DrawerTitle>
          </DrawerHeader>
          <form class="grid gap-4">
            <!-- Email Field -->
            <div class="grid gap-2">
              <Label for="email">{{ $t('login.email') }}</Label>
              <Input
                id="email"
                type="email"
                :model-value="selectedAdmin?.email"
                readonly
                disabled
                class="cursor-not-allowed"
              />
            </div>

            <!-- Revoke Rights Button -->
            <Button
              type="button"
              variant="destructive"
              @click="revokeRights(selectedAdmin!.userId)"
              class="w-full"
            >
              {{ $t('admin.revoke-rights') }}
            </Button>
          </form>
          <DrawerFooter>
            <DrawerClose as-child>
              <Button variant="secondary" class="w-full">
                {{ $t('household.cancel') }}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getAdminUsers,
  getUserId,
  addNewAdmin,
  revokeAdminRights,
} from '@/services/api/AdminServices'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMediaQuery } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import type { AxiosResponse } from 'axios'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

//TODO: hardkode alle toast meldingene t('osvosv')

const { t } = useI18n()
interface Admin {
  userId: number
  email: string
}

const admins = ref<Admin[]>([])
const isOpen = ref(false)
const isNewAdminDialogOpen = ref(false)
const showConfirmationDialog = ref(false)
const selectedAdmin = ref<Admin | null>(null)
const stagedEmail = ref('')
const userId = ref(<number | null>null)

onMounted(() => {
  getAllAdmins()
})

const schema = z
  .object({
    email: z.string().email(),
    confirmEmail: z.string().email(),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Make sure that both emails are the same, and exists',
    path: ['confirmEmail'],
  })

const form = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    email: '',
    confirmEmail: '',
  },
})

const { values, resetForm } = form

const onSubmit = form.handleSubmit(async (values) => {
  try {
    if (!values.email) {
      return
    }
    const response = await getUserId(values.email)
    console.log('Retrieved user id from API:', response.data)
    userId.value = response.data.userId // set userId

    if (userId.value !== null) {
      console.log('NEW ADMIN EMAIL: ', values.email)
      createNewAdmin(userId.value)

      userId.value = null
      stagedEmail.value = ''
      resetForm()
    }
  } catch (error) {
    console.error('Failed to create a new admin user...', error)
    callToast(t('admin.user-notfound'))
  } finally {
    resetForm()
    isNewAdminDialogOpen.value = false
    showConfirmationDialog.value = false
  }
})

const handleAdminSubmit = () => {
  onSubmit()
}

function openNewAdminDialog() {
  isNewAdminDialogOpen.value = true
}

function openDrawer(admin: Admin) {
  console.log('selecting admin...')
  selectedAdmin.value = {
    email: admin.email,
    userId: admin.userId,
  }
  isOpen.value = true
}

async function getAllAdmins() {
  try {
    const response = await getAdminUsers()
    console.log('Fetched admins from backend!', response.data)
    admins.value = response.data
  } catch (error) {
    console.error('Failed to fetch admin users from backend!')
  }
}

async function createNewAdmin(userID: number) {
  try {
    const response = await addNewAdmin(userID)
    console.log('Created new admin user!', response.data)
    callToast('Created new admin!')
    await getAllAdmins()
  } catch (error: any) {
    let errorMessage = ''
    console.warn('Failed to create new admin', error)
    if (error?.response?.data) {
      errorMessage = error.response.data
    } else if(error?.data?.message) {
      errorMessage = error.data.message
    } else if (error?.message) {
      errorMessage = error?.message
    }
    callToast(errorMessage)
  }
}

async function revokeRights(adminId: number) {
  try {
    console.log('Admin id is: ', adminId)
    await revokeAdminRights(adminId)
    console.log('Admin rights revoked!')

    callToast('Admin rights revoked.')
    await getAllAdmins() // update the list of admins
    isOpen.value = false
  } catch (error) {
    console.error('Failed to revoke admin rights', error)
  }
}

function callToast(message: string) {
  console.log('Called toast for message: ', message)
  toast(message)
}

const confirmNewAdmin = form.handleSubmit(() => {
  if (values.confirmEmail !== undefined) {
    stagedEmail.value = values.confirmEmail
    showConfirmationDialog.value = true
  }
})
</script>
