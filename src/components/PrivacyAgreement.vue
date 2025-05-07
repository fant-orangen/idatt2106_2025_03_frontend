<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import Separator from './ui/separator/Separator.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <Breadcrumb class="m-5">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">{{ t('privacy.breadcrumbHome') }}</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{{ t('privacy.breadcrumbCurrent') }}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

  <section class="max-w-4xl mx-auto p-6 space-y-8 mb-10">
    <div>
      <h1 class="text-3xl font-bold">{{ t('privacy.title') }}</h1>
      <Separator class="my-4" />
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.introductionTitle') }}</h2>
      <Separator class="my-4" />
      <p class="text-muted-foreground">{{ t('privacy.introductionText') }}</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.dataTitle') }}</h2>
      <Separator class="my-4" />
      <ul class="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>{{ t('privacy.dataPersonal') }}</li>
        <li>{{ t('privacy.dataAccount') }}</li>
        <li>{{ t('privacy.dataUsage') }}</li>
        <li>{{ t('privacy.dataEmergency') }}</li>
      </ul>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.useTitle') }}</h2>
      <Separator class="my-4" />
      <ul class="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>{{ t('privacy.useServices') }}</li>
        <li>{{ t('privacy.useExperience') }}</li>
        <li>{{ t('privacy.useSecurity') }}</li>
        <li>{{ t('privacy.useLegal') }}</li>
      </ul>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.childrenTitle') }}</h2>
      <Separator class="my-4" />
      <p class="text-muted-foreground">{{ t('privacy.childrenText') }}</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.twoFaTitle') }}</h2>
      <Separator class="my-4" />
      <p class="text-muted-foreground">{{ t('privacy.twoFaText') }}</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.sharingTitle') }}</h2>
      <Separator class="my-4" />
      <ul class="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>{{ t('privacy.sharingConsent') }}</li>
        <li>{{ t('privacy.sharingLegal') }}</li>
        <li>{{ t('privacy.sharingProviders') }}</li>
      </ul>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.retentionTitle') }}</h2>
      <Separator class="my-4" />
      <p class="text-muted-foreground">{{ t('privacy.retentionText') }}</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.rightsTitle') }}</h2>
      <Separator class="my-4" />
      <ul class="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>{{ t('privacy.rightsAccess') }}</li>
        <li>{{ t('privacy.rightsCorrect') }}</li>
        <li>{{ t('privacy.rightsDelete') }}</li>
        <li>{{ t('privacy.rightsRestrict') }}</li>
        <li>{{ t('privacy.rightsPortable') }}</li>
      </ul>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.accessibilityTitle') }}</h2>
      <Separator class="my-4" />
      <p class="text-muted-foreground">{{ t('privacy.accessibilityText') }}</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.securityTitle') }}</h2>
      <Separator class="my-4" />
      <p class="text-muted-foreground">{{ t('privacy.securityText') }}</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.cookiesTitle') }}</h2>
      <Separator class="my-4" />
      <p class="text-muted-foreground">{{ t('privacy.cookiesText') }}</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.changesTitle') }}</h2>
      <Separator class="my-4" />
      <p class="text-muted-foreground">{{ t('privacy.changesText') }}</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold">{{ t('privacy.contactTitle') }}</h2>
      <Separator class="my-4" />

      <div class="flex items-center space-x-2">
        <p class="text-muted-foreground">
          {{ t('privacy.contactText') }}
        </p>
        <a href="mailto:krisefikser.smtp@gmail.com" class="font-semibold text-blue-500 underline">
          krisefikser.smtp@gmail.com
        </a>
      </div>
    </div>
  </section>
</template>
