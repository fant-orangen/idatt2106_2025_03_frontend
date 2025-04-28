<template>
    <div class="page">

        <UseTemplate>
            <form class="grid items-start gap-4 px-4">
            <div class="grid gap-2">
                <Label html-for="email">Email</Label>
                <Input id="email" type="email" default-value="shadcn@example.com" />
            </div>
            <div class="grid gap-2">
                <Label html-for="username">Username</Label>
                <Input id="username" default-value="@shadcn" />
            </div>
            <Button type="submit">
                Save changes
            </Button>
            </form>
        </UseTemplate>

        <Dialog v-if="isDesktop" v-model:open="isOpen">
            <DialogTrigger as-child>
            <Button variant="outline">
                Edit Profile
            </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                Make changes to your profile here. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            <GridForm />
            </DialogContent>
        </Dialog>

        <Drawer v-else v-model:open="isOpen">
            <DrawerTrigger as-child>
            <Button variant="outline">
                Edit Profile
            </Button>
            </DrawerTrigger>
            <DrawerContent>
            <DrawerHeader class="text-left">
                <DrawerTitle>Edit profile</DrawerTitle>
                <DrawerDescription>
                Make changes to your profile here. Click save when you're done.
                </DrawerDescription>
            </DrawerHeader>
            <GridForm />
            <DrawerFooter class="pt-2">
                <DrawerClose as-child>
                <Button variant="outline">
                    Cancel
                </Button>
                </DrawerClose>
            </DrawerFooter>
            </DrawerContent>
        </Drawer>
    </div>
</template>

<script setup lang="ts">
import {getAdminUsers} from '@/services/api/AdminServices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createReusableTemplate, useMediaQuery } from '@vueuse/core'
import { ref } from 'vue'
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

const [UseTemplate, GridForm] = createReusableTemplate()
const isDesktop = useMediaQuery('(min-width: 768px)')

const isOpen = ref(false)

async function getAllAdmins() {
    try {
        const response = await getAdminUsers();
        console.log('Fetched admins from backend!', response.data);
    } catch (error) {
        console.error('Failed to fetch admin users from backend!');
    }
}

</script>


<style scoped>

.page {
    
}

</style>