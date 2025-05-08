<script setup lang="ts">

/**
 * @component PrivacyPolicyView
 * @description Displays the privacy policy page and includes a reusable PrivacyAgreement component for content.
 */
import PrivacyAgreement from '@/components/PrivacyAgreement.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>

  <!-- Breadcrumb navigation -->
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

  <!-- Renders the privacy policy content -->
  <PrivacyAgreement />
</template>
