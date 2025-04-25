<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Lock, User } from 'lucide-vue-next'
</script>

<template>
  <h1 class="text-4xl font-bold text-foreground w-full max-w-4xl px-4 mb-6 mt-10 ml-20">
    Settings
  </h1>
  <div class="page-content flex flex-col items-center mt-10 w-full">
    <!-- Tabs -->
    <Tabs default-value="account" class="w-full max-w-4xl">
      <!-- Tabs List -->
      <TabsList class="grid grid-cols-2 w-1/2 mx-auto mb-4">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <!-- Tabs Content -->
      <TabsContent value="account">
        <div class="flex flex-col gap-10">
          <Card>
            <CardHeader>
              <CardTitle class="test text-3xl">Account Settings</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent class="account-settings space-y-2">
              <div class="space-y-1">
                <Label for="name">Full name</Label>
                <!-- TODO: here the user's email should be -->
                <Input id="name" default-value="Kari Nordmann" />
              </div>
              <div class="space-y-1">
                <Label for="email">E-mail</Label>
                <!-- TODO: here the user's email should be -->
                <Input id="email" default-value="alice@example.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent class="password-settings space-y-2">
              <div class="space-y-1">
                <Label for="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div class="space-y-1">
                <Label for="new">New password</Label>
                <Input id="new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Enhance your account's security with two-step verification, requiring a code sent to
                your email in addition to your password for login.
              </CardDescription>
            </CardHeader>
            <CardContent class="security-settings space-y-2">
              <div class="space-y-1">
                <Button variant="outline">
                  <Lock class="w-4 h-4 mr-2" /> Turn on 2 step verification
                </Button>
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data. This action is irreversible
                and cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent class="security-settings space-y-2">
              <div class="space-y-1">
                <Button variant="destructive">
                  <User class="w-4 h-4 mr-2" /> Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <div class="flex flex-col gap-10">
          <Card>
            <CardHeader>
              <CardTitle class="text-2xl font-bold text-primary">Notifications Settings</CardTitle>
              <CardDescription class="text-muted-foreground">
                Customize how you receive notifications to stay informed.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Email Notifications -->
              <div class="flex items-center justify-between border-b pb-4">
                <div>
                  <Label for="email-notifications" class="text-lg font-medium">
                    Email Notifications
                  </Label>
                  <p class="text-sm text-muted-foreground">Receive updates and alerts via email.</p>
                  <div class="items-top flex gap-x-2 pt-4">
                    <Checkbox id="terms1" />
                    <div class="grid gap-1.5 leading-none">
                      <label
                        for="terms1"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        System Notifications
                      </label>
                      <p class="text-sm text-muted-foreground">
                        Receive notifications about critical crisis events to stay informed and
                        prepared.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter class="flex justify-end">
              <Button class="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
