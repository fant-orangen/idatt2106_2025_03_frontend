<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { useColorMode } from '@vueuse/core'

const { locale } = useI18n()

let prevScrollpos: number = window.pageYOffset
const showDropdown = ref(false)
const languages = [
  { label: 'Norsk bokmål', code: 'nb-NO' },
  { label: 'English', code: 'en-US' },
  { label: 'Norsk nynorsk (WIP)', code: 'nn-NO' },
  { label: 'Sámi (WIP)', code: 'se' },
]
const selectedLanguage = ref(languages[0].label)

// Dark mode toggle
const colorMode = useColorMode()

window.onscroll = function (): void {
  const currentScrollPos: number = window.pageYOffset
  const navbar = document.getElementById('navbar')

  if (navbar) {
    if (prevScrollpos > currentScrollPos) {
      navbar.style.top = '0'
    } else {
      navbar.style.top = '-50px'
    }
  }

  prevScrollpos = currentScrollPos
}

function toggleDropdown(): void {
  showDropdown.value = !showDropdown.value
}

function selectLanguage(language: { label: string; code: string }): void {
  selectedLanguage.value = language.label
  showDropdown.value = false
  locale.value = language.code
}
</script>

<template>
  <div
    id="navbar"
    class="navbar shadow-md bg-secondary text-secondary-foreground flex justify-between items-center px-5 py-3 transition-all duration-300"
  >
    <div class="navbar-right flex gap-4">
      <RouterLink to="/" class="hover:text-primary"> {{ $t('navigation.home') }}</RouterLink>
      <div class="dropdown relative">
        <button
          class="dropbtn flex items-center gap-2 text-secondary-foreground hover:text-primary"
          @click="toggleDropdown"
        >
          <font-awesome-icon :icon="['fas', 'globe']" size="lg" />
          {{ selectedLanguage }}
        </button>
        <div
          v-if="showDropdown"
          class="dropdown-content absolute bg-card text-card-foreground shadow-lg mt-2 rounded-md w-[200px]"
        >
          <div
            v-for="language in languages"
            :key="language.code"
            @click="selectLanguage(language)"
            class="dropdown-item px-4 py-2 hover:bg-muted hover:text-foreground cursor-pointer"
          >
            {{ language.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="navbar-left flex items-center gap-4">
      <RouterLink
        to="/login"
        class="hover:text-primary border-b-2 border-transparent hover:border-primary pb-1"
      >
        {{ $t('login.login') }}</RouterLink
      >
      <RouterLink
        to="/"
        class="hover:text-primary border-b-2 border-transparent hover:border-primary pb-1"
      >
        {{ $t('login.signup') }}</RouterLink
      >
      <RouterLink to="/" class="no-border">
        <font-awesome-icon :icon="['fas', 'user']" size="lg" />
      </RouterLink>
      <RouterLink to="/" class="no-border">
        <font-awesome-icon :icon="['fas', 'bell']" size="lg" />
      </RouterLink>
      <button
        variant="outline"
        class="dark-mode-toggle flex items-center justify-center p-0 text-secondary-foreground hover:text-primary cursor-pointer"
        @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
      >
        <Icon
          :icon="colorMode === 'dark' ? 'radix-icons:sun' : 'radix-icons:moon'"
          class="h-[1.2rem] w-[1.2rem] transition-all"
        />
      </button>
    </div>
  </div>
</template>
