<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const messages = {
  en: {
    login: {
      'privacy-policy': 'Privacy Policy',
    },
  },
  nb: {
    login: {
      'privacy-policy': 'Personvernerklæring',
    },
  },
}

const { t } = useI18n({ messages })
</script>

<template>
  <div
    class="footer bg-secondary text-secondary-foreground shadow-t-md flex flex-col md:flex-row justify-center items-center px-5 py-2 md:py-3 transition-all duration-300 gap-4 md:gap-10 text-center md:text-left"
  >
    <div>
      <a href="/privacy-policy" class="underline">
        {{ t('login.privacy-policy') }}
      </a>
    </div>
    <div>{{ t('footer.title') }}</div>
    <div>© IDATT2106 Team 3</div>
    <div>
      {{ t('footer.contact-us') }}
      <a href="mailto:krisefikser.smtp@gmail.com" class="underline">krisefikser.smtp@gmail.com</a>
    </div>
  </div>
</template>

<style scoped>
.footer {
  box-shadow:
    0 -4px 6px -1px rgba(0, 0, 0, 0.1),
    0 -2px 4px -1px rgba(0, 0, 0, 0.06); /* Shadow above */
}
</style>
