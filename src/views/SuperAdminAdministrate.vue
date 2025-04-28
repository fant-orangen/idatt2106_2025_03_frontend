<template>
    <div class="page">
  <!--breadcrumb-->
        <div>
            <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/admin-panel">
                    {{ $t('navigation.admin-panel') }}
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                <BreadcrumbItem>
                    <BreadcrumbPage href="/handle-admins">{{ $t('admin.edit-admin') }}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
	    </Breadcrumb>
        </div>
        
        <h1>Super Admin: rediger adminbrukere: </h1>

        <!--List of admin users -->
        <div class="listOfAdmins" v-for="admin in admins" :key="admin.id">
            <Button variant="outline" @click="openDrawer(admin)">
                {{ admin.email }} her skal det stå email
            </Button>
        </div>

        <!--Add new admin user-->
        <div>
            <Button @click="openNewAdminDialog">
                {{ $t('admin.new-admin') }}
            </Button>
        </div>

        <!--Dialog for adding a new Admin -->
        <Dialog v-model:open="isNewAdminDialogOpen">
            <DialogContent>
                <DialogHeader>
                <DialogTitle>{{ $t('admin.create-new-admin') }}</DialogTitle>
                </DialogHeader>

                <form class="grid gap-4" @submit.prevent="createNewAdmin">
                <div>
                    <Label for="new-email">{{ $t('login.email') }}</Label>
                    <Input id="new-email" v-model="newAdminEmail" type="email" required />
                </div>

                <Button type="submit">{{ $t('admin.create') }}</Button>
                </form>
            </DialogContent>
        </Dialog>

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
                        <Input id="email" style="cursor: not-allowed;" type="email" :value="selectedAdmin?.value?.email" readonly disabled  />
                    </div>

                    <!--Action buttons-->
                    <Button variant="outline" @click="revokeRights(selectedAdmin.value.id)">
                        {{ $t('admin.revoke-rights') }}
                    </Button>

                    <Button variant="destructive" @click="deleteUser(selectedAdmin.value.id)">
                        {{ $t('admin.delete-user') }}
                    </Button>

                    <Button>
                        <MailOpen class="w-4 h-4 mr-2" @click="sendNewLink(selectedAdmin.value.id)"/> {{ $t('admin.send-pw-link') }}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>

        <Drawer v-else v-model:open="isOpen">
            <DrawerTrigger as-child>
            <Button variant="outline">
                {{admin.email}} her skal det stå email2
            </Button>
            </DrawerTrigger>
            <DrawerContent>
            <DrawerHeader class="text-left">
                <DrawerTitle>{{ $t('admin.edit-profile') }}</DrawerTitle>
            </DrawerHeader>
            
            <form class="grid items-start gap-4 px-4">
                <!--email field-->
                <div class="grid gap-2">
                    <Label html-for="email">{{$t('login.email')}}</Label>
                    <Input id="email" style="cursor: not-allowed;" type="email" :value="selectedAdmin?.value?.email" readonly disabled  />
                </div>
                <!--Action buttons-->
                <Button variant="outline" @click="revokeRights(selectedAdmin.value.id)">
                    {{ $t('admin.revoke-rights') }}
                </Button>

                <Button variant="destructive" @click="deleteUser(selectedAdmin.value.id)">
                    {{ $t('admin.delete-user') }}
                </Button>

                <Button @click="sendNewLink(selectedAdmin.value.id)">
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
import { getAdminUsers, addNewAdmin, revokeAdminRights, deleteAdmin } from '@/services/api/AdminServices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createReusableTemplate, useMediaQuery } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import { MailOpen } from 'lucide-vue-next'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const admins = ref([]);

const isDesktop = useMediaQuery('(min-width: 768px)');
const isNewAdminDialogOpen = ref(false);
const newAdminEmail = ref('');

const isOpen = ref(false);
const selectedAdmin = ref(null);

onMounted(() => {
    getAllAdmins();
})

function openNewAdminDialog() {
  isNewAdminDialogOpen.value = true;
}

function openDrawer(admin: any) {
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

async function deleteUser(adminId: number) {
    try {
        await deleteAdmin(adminId);
        console.log('User deleted!');
        await getAllAdmins(); // update the list of admins
    } catch (error) {
        console.error('Failed to delete user', error);
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

async function newAdmin() {
    try {
        if(!newAdminEmail.value) return;
        await addNewAdmin({
            email: newAdminEmail.value;
        });
        console.log('Ny admin opprettet!');
        isNewAdminDialogOpen.value = false;
        newAdminEmail.value = '';
        await getAllAdmins();
    } catch (error) {
        console.error('Failed to create a new admin user...', error);
    }
}

</script>


<style scoped>
h1 {
    font-size: 2em;
}

.page {
    margin: 40px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.listOfAdmins {
    background-color: aquamarine;
}

Button {
    width: 100%;
}

</style>