<template>
<div class="admin-page-wrapper">
    <div class = top>
        <!--breadcrumb-->
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/admin-panel">{{ $t('navigation.admin-panel') }}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                <BreadcrumbItem>
                    <BreadcrumbPage href="/handle-admins">{{ $t('admin.edit-admin') }}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <h1> <b>{{$t('admin.edit-admin')}}: </b></h1>
    </div>
    <div class="page">
        <!--Add new admin user button-->
        <Card>
            <CardHeader>
            <CardTitle>{{ $t('admin.new-admin') }}:</CardTitle>
            </CardHeader>
            <CardContent>
                <Button @click="openNewAdminDialog()">
                    {{ $t('admin.new-admin') }}
                </Button>
                <CardDescription>{{ $t('admin.give-rights') }}</CardDescription>
            </CardContent>
        </Card>

            <Card class=" admin-list-card">
            <CardHeader>
                <CardTitle>{{ $t('admin.current-admins') }}:</CardTitle>
            </CardHeader>
            <CardContent>
                <!--List of all current admin users -->
                <div class="admin-list">
                    <div v-for="admin in admins" :key="admin.id">
                        <Button variant="outline" @click="openDrawer(admin)">
                            {{ admin.email }}
                        </Button>
                    </div>
                </div>
            </CardContent>
            </Card>

        <!--Dialog for adding a new Admin-->
        <Dialog v-model:open="isNewAdminDialogOpen">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{{ $t('admin.new-admin') }}:</DialogTitle>
                </DialogHeader>

                <form @submit.prevent="confirmNewAdmin" class="grid gap-4">
                    <!-- FormField for email -->
                    <FormField v-slot="{ field, meta, errorMessage }" name="email">
                        <FormItem>
                            <FormLabel>{{$t('login.enter-email')}}</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="name@email.com" v-bind="field" />
                            </FormControl>
                            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
                        </FormItem>
                    </FormField>

                    <!--Confirm email field-->
                    <FormField v-slot="{ field, meta, errorMessage }" name="confirmEmail">
                        <FormItem>
                            <FormLabel>{{$t('login.confirm-email')}}</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="name@email.com" v-bind="field" />
                            </FormControl>
                            <FormMessage v-if="meta.touched">{{ errorMessage }}</FormMessage>
                        </FormItem>
                    </FormField>

                    <Button type="submit" variant="outline">
                        {{ $t('household.save') }}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
        
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
                        <AlertDialogAction @click="handleAdminSubmit">{{ $t('admin.submit') }}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
        </AlertDialog>
        
        <!--Dialog / drawer for editing existing admins-->
        <Dialog v-if="isDesktop" v-model:open="isOpen">
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <!--Inni drawer-->
                    <DialogTitle>{{ $t('admin.administrate-profile') }}</DialogTitle>
                </DialogHeader>

                <form class="grid items-start gap-4 px-4">
                    <!--email field-->
                    <div class="grid gap-2">
                        <Label for="email">{{$t('login.email')}}</Label>
                        <Input id="email" style="cursor: not-allowed;" type="email" :model-value=selectedAdmin?.email readonly disabled  />
                    </div>
                
                    <!--Revoke rights button-->
                    <Button variant="destructive" @click="revokeRights(selectedAdmin!.id)">
                        {{ $t('admin.revoke-rights') }}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
        <!--For mobile experience there is a Drawer option-->
        <Drawer v-else v-model:open="isOpen">
            <DrawerContent>
                <DrawerHeader class="text-left">
                    <DrawerTitle>{{ $t('admin.administrate-profile') }}</DrawerTitle>
                </DrawerHeader>
            
                <form class="grid items-start gap-4 px-4">
                    <!--email field-->
                    <div class="grid gap-2">
                        <Label html-for="email">{{$t('login.email')}}</Label>
                        <Input id="email" type="email" :model-value="selectedAdmin?.email" readonly disabled  />
                    </div>

                    <!--Action buttons-->
                    <Button variant="destructive" @click="revokeRights(selectedAdmin!.id)">
                        {{ $t('admin.revoke-rights') }}
                    </Button>
                </form>

                <DrawerFooter class="pt-2">
                    <DrawerClose as-child>
                        <Button variant="secondary">
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
import { getAdminUsers, getUserId, addNewAdmin, revokeAdminRights } from '@/services/api/AdminServices'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMediaQuery } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,  
  FormMessage 
} from '@/components/ui/form'
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

//TODO: hardkode alle toast meldingene t('osvosv')

const {t} = useI18n();
interface Admin {
  id: number;
  email: string;
}

const admins = ref<Admin[]>([]);
const isDesktop = useMediaQuery('(min-width: 768px)');
const isOpen = ref(false);
const isNewAdminDialogOpen = ref(false);
const showConfirmationDialog = ref(false);
const selectedAdmin = ref<Admin | null>(null);
const stagedEmail = ref('');
const userId = ref(<number | null>(null));


onMounted(() => {
    getAllAdmins();
});

const schema = z.object({
    email: z.string().email(),
    confirmEmail: z.string().email()
}).refine((data) => data.email === data.confirmEmail, {
    message: 'Make sure that both emails are the same, and exists' ,
    path: ['confirmEmail'],
});

const form = useForm({
    validationSchema: toTypedSchema(schema),
    initialValues: {
        email: '',
        confirmEmail: ''
    }
});

const { values, resetForm } = form;

const onSubmit = form.handleSubmit(async (values) => {
    try {
        if(!values.email) {
            return;
        }

        const response = await getUserId(values.email);
        console.log('Retrieved user id from API:', response.data);
        userId.value = response.data; // set userId

        // find user with that email
        if (!userId.value) {
            callToast(t('admin.user-notfound'));
            console.log("User doesn't exist!");
        } else {
            console.log('NEW ADMIN NEW EMAIL: ', values.email)
            createNewAdmin(userId.value);

            console.log('New admin created!');
            
            userId.value = null;
            stagedEmail.value = '';
            
            resetForm();
            // legg til funksjon for å  lukke panelet om det ikke skjer auto
            await getAllAdmins(); // refresh
        }
    } catch (error) {
        console.error('Failed to create a new admin user...', error);
    } finally {
        resetForm();
        isNewAdminDialogOpen.value = false;
        showConfirmationDialog.value = false;
    }
});

const handleAdminSubmit = () => {
    onSubmit();
}

function openNewAdminDialog() {
  isNewAdminDialogOpen.value = true;
}

function openDrawer(admin: Admin) {
    selectedAdmin.value = admin;
    isOpen.value = true;
}

async function getAllAdmins() {
    try {
        const response = await getAdminUsers();
        console.log('Fetched admins from backend!', response.data);
        admins.value = response.data;
    } catch (error) {
        console.error('Failed to fetch admin users from backend!');
    }
}

async function createNewAdmin(userID: number) {
    try {
        await addNewAdmin(userID);
        console.log('Created new admin user!');
        
        callToast('Created new admin!');
        await getAllAdmins();// update list
    } catch (error) {
        console.error('Failed to create new admin', error);
    }
}

async function revokeRights(adminId: number) {
    try {
        await revokeAdminRights(adminId);
        console.log('Admin rights revoked!');

        callToast('Admin rights revoked.')
        await getAllAdmins(); // update the list of admins 
    } catch (error) {
        console.error('Failed to revoke admin rights', error);
    }
}

const callToast = ((message: string) => { 
    console.log('Called toast for message: ', message);
    toast ({
        description: message
    })
});

const confirmNewAdmin = form.handleSubmit(() => {
    if (values.confirmEmail !== undefined) {
        stagedEmail.value = values.confirmEmail;
        showConfirmationDialog.value = true;
    }
});

</script>


<style scoped>
h1 {
    font-size: 2.3em;
    margin: 20px;
}

.admin-page-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.top {
    margin: 20px;
}

.page {
    display: flex;
    flex-flow: row wrap;
    gap: 10px;
    padding: 10px;
    justify-content: center;
}

.listOfAdmins > div > Button {
    min-width: 300px;
    margin: 5px;
}

.grid {
    padding: 10px;
}

.listOfAdmins {
    margin: auto;
    border-radius: 8px;
    max-height: 450px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: var(--color-muted);
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: center;
    padding: 10px;
}

.admin-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 10px;
}

</style>