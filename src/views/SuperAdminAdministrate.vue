<template>
<div class="page">
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
    <!--Add new admin user button-->
    <div>
        <Button @click="openNewAdminDialog()">
            {{ $t('admin.new-admin') }}
        </Button>
    </div>

    <!--Dialog for adding a new Admin-->
    <Dialog v-model:open="isNewAdminDialogOpen">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{{ $t('admin.new-admin') }}:</DialogTitle>
            </DialogHeader>

            <form @submit.prevent="onSubmit" class="grid gap-4">
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
                
                <Button type="submit">{{ $t('household.save') }}</Button>
            </form>
        </DialogContent>
    </Dialog>

    <AlertDialog>
    <AlertDialogTrigger as-child>
      <Button variant="outline">
        Are you sure?
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

    <!--List of all current admin users -->
    <div class="listOfAdmins" v-for="admin in admins" :key="admin.id">
        <Button variant="outline" @click="openDrawer(admin)">
            {{ admin.email }}
        </Button>
    </div>

    <!--Dialog / drawer for editing existing admins-->
    <Dialog v-if="isDesktop" v-model:open="isOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <!--Inni drawer-->
                <DialogTitle>{{ $t('admin.edit-profile') }}</DialogTitle>
            </DialogHeader>

            <form class="grid items-start gap-4 px-4">
                <!--email field-->
                <div class="grid gap-2">
                    <Label html-for="email">{{$t('login.email')}}</Label>
                    <Input id="email" type="email" :value="selectedAdmin?.email" readonly disabled  />
                </div>
            
                <!--Action buttons-->
                <Button variant="destructive" @click="revokeRights(selectedAdmin!.id)">
                    {{ $t('admin.revoke-rights') }}
                </Button>

                <Button>
                    <MailOpen class="w-4 h-4 mr-2" @click="sendNewLink(selectedAdmin!.id)"/> {{ $t('admin.send-pw-link') }}
                </Button>
            </form>
        </DialogContent>
    </Dialog>
    <!--For mobile experience there is a Drawer option-->
    <Drawer v-else v-model:open="isOpen">
        <DrawerContent>
        <DrawerHeader class="text-left">
            <DrawerTitle>{{ $t('admin.edit-profile') }}</DrawerTitle>
        </DrawerHeader>
        
        <form class="grid items-start gap-4 px-4">
            <!--email field-->
            <div class="grid gap-2">
                <Label html-for="email">{{$t('login.email')}}</Label>
                <Input id="email" style="cursor: not-allowed;" type="email" :value="selectedAdmin?.email" readonly disabled  />
            </div>
            <!--Action buttons-->
            <Button variant="destructive" @click="revokeRights(selectedAdmin!.id)">
                {{ $t('admin.revoke-rights') }}
            </Button>

            <Button @click="sendNewLink(selectedAdmin!.id)">
                <MailOpen class="w-4 h-4 mr-2" /> {{ $t('admin.send-pw-link') }}
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
</template>

<script setup lang="ts">
import { getAdminUsers, addNewAdmin, revokeAdminRights } from '@/services/api/AdminServices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMediaQuery } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import { MailOpen } from 'lucide-vue-next'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Admin {
  id: number;
  email: string;
}

/**
 * List of admin users loaded from backend API
 */
 const admins = ref<Admin[]>([]);
/**
 * Checking if the window size is at desktop width or not, 
 * thereby changing the visual effect of the drawer.
 */
const isDesktop = useMediaQuery('(min-width: 768px)');
const isNewAdminDialogOpen = ref(false);
const isOpen = ref(false);
const selectedAdmin = ref<Admin | null>(null);

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

const onSubmit = form.handleSubmit(async (values) => {
    try {
        if(!values.email) {
            return;
        }
       
        console.log(' NEW ADMIN NEW EMAIL: ', values.email)
        await addNewAdmin(values.email);

        console.log('New admin created!');

        isNewAdminDialogOpen.value = false; //close dialog
        form.resetForm();

        await getAllAdmins(); // refresh
        
        
    } catch (error) {
        console.error('Failed to create a new admin user...', error);
    }
});


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

async function revokeRights(adminId: number) {
    try {
        await revokeAdminRights(adminId);
        console.log('Admin rights revoked!');
        await getAllAdmins(); // update the list of admins 
    } catch (error) {
        console.error('Failed to revoke admin rights', error);
    }
}

async function sendNewLink(adminId: number) {
    try {
        await revokeAdminRights(adminId);
        console.log('Revoked admin rights!');
        await getAllAdmins(); // update the list of admins
    } catch (error) {
        console.error('Failed to send link', error);
    }
}

</script>


<style scoped>
h1 {
    font-size: 2.3em;
}

.page {
    margin: 40px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.grid {
    padding: 10px;
}

.page > div {
    max-width: fit-content;
}

.listOfAdmins {
    margin: auto;
    min-width: 400px;
}

Button {
    width: 100%;
}

</style>