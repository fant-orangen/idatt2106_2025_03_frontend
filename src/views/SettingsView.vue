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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h1 class="text-4xl font-bold text-foreground flex justify-center mb-6 mt-10">
    {{ t('settings.title') }}
  </h1>
  <div class="page-content flex flex-col items-center mt-10 mb-20 w-full">
    <!-- Tabs -->
    <Tabs default-value="account" class="w-full max-w-2/3">
      <!-- Tabs List -->
      <TabsList class="grid grid-cols-2 w-1/2 mx-auto mb-4">
        <TabsTrigger value="account">{{ t('settings.tabs.account') }}</TabsTrigger>
        <TabsTrigger value="notifications">{{ t('settings.tabs.notifications') }}</TabsTrigger>
      </TabsList>

      <!-- Tabs Content -->
      <TabsContent value="account">
        <div class="flex flex-col gap-10">
          <Card>
            <CardHeader>
              <CardTitle class="test text-3xl">{{ t('settings.account.title') }}</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardHeader>
              <CardTitle>{{ t('settings.account.subtitle') }}</CardTitle>
              <CardDescription>
                {{ t('settings.account.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="account-settings space-y-2">
              <div class="space-y-1">
                <Label for="name">{{ t('settings.account.fullName') }}</Label>
                <Input id="name" default-value="Kari Nordmann" />
              </div>
              <div class="space-y-1">
                <Label for="email">{{ t('settings.account.email') }}</Label>
                <Input id="email" default-value="alice@example.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>{{ t('settings.account.saveChanges') }}</Button>
            </CardFooter>
            <CardHeader>
              <CardTitle>{{ t('settings.account.password.title') }}</CardTitle>
              <CardDescription>
                {{ t('settings.account.password.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="password-settings space-y-2">
              <div class="space-y-1">
                <Label for="current">{{ t('settings.account.password.current') }}</Label>
                <Input id="current" type="password" />
              </div>
              <div class="space-y-1">
                <Label for="new">{{ t('settings.account.password.new') }}</Label>
                <Input id="new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>{{ t('settings.account.saveChanges') }}</Button>
            </CardFooter>
            <CardHeader>
              <CardTitle>{{ t('settings.account.security.title') }}</CardTitle>
              <CardDescription>
                {{ t('settings.account.security.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="security-settings space-y-2">
              <div class="space-y-1">
                <Button variant="outline">
                  <Lock class="w-4 h-4 mr-2" /> {{ t('settings.account.security.twoStep') }}
                </Button>
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle>{{ t('settings.account.delete.title') }}</CardTitle>
              <CardDescription>
                {{ t('settings.account.delete.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="security-settings space-y-2">
              <div class="space-y-1">
                <Button variant="destructive">
                  <User class="w-4 h-4 mr-2" /> {{ t('settings.account.delete.button') }}
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
              <CardTitle class="text-2xl font-bold text-primary">
                {{ t('settings.notifications.title') }}
              </CardTitle>
              <CardDescription class="text-muted-foreground">
                {{ t('settings.notifications.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Email Notifications -->
              <div class="flex items-center justify-between border-b pb-4">
                <div>
                  <Label for="email-notifications" class="text-lg font-medium">
                    {{ t('settings.notifications.email.title') }}
                  </Label>
                  <p class="text-sm text-muted-foreground">
                    {{ t('settings.notifications.email.description') }}
                  </p>
                  <div class="items-top flex gap-x-2 pt-4">
                    <Checkbox id="terms1" />
                    <div class="grid gap-1.5 leading-none">
                      <label
                        for="terms1"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {{ t('settings.notifications.email.system') }}
                      </label>
                      <p class="text-sm text-muted-foreground">
                        {{ t('settings.notifications.email.systemDescription') }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter class="flex justify-end">
              <Button class="bg-primary text-primary-foreground hover:bg-primary/90">
                {{ t('settings.notifications.saveChanges') }}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
