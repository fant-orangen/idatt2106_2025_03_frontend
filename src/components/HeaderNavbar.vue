<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

let prevScrollpos: number = window.pageYOffset
const showDropdown = ref(false)
const languages = [
  { label: 'Norsk bokmål', code: 'nb-NO' },
  { label: 'English', code: 'en-US' },
  { label: 'Norsk nynorsk (WIP)', code: 'nn-NO' },
  { label: 'Sámi (WIP)', code: 'se' },
]
const selectedLanguage = ref(languages[0].label)

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
  <div class="navbar">
    <div class="navbar-right">
      <RouterLink to="/"> {{ $t('home') }}</RouterLink>
      <div class="dropdown">
        <button class="dropbtn" @click="toggleDropdown">
          <font-awesome-icon :icon="['fas', 'globe']" size="lg" />
          {{ selectedLanguage }}
        </button>
        <div v-if="showDropdown" class="dropdown-content">
          <div
            v-for="language in languages"
            :key="language.code"
            @click="selectLanguage(language)"
            class="dropdown-item"
          >
            {{ language.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="navbar-left">
      <RouterLink to="/login"> {{ t('login') }}</RouterLink>
      <RouterLink to="/"> {{ t('signup') }}</RouterLink>
      <RouterLink to="/" class="no-border">
        <font-awesome-icon :icon="['fas', 'user']" size="lg" />
      </RouterLink>
      <RouterLink to="/" class="no-border">
        <font-awesome-icon :icon="['fas', 'bell']" size="lg" />
      </RouterLink>
    </div>
  </div>
</template>

<style>
font-awesome-icon {
  color: var(--fifth-color);
}

.navbar {
  box-shadow: 0px 5px 6px rgb(0, 0, 0, 0.25);
  height: 60px;
  background-color: var(--secondary-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  transition: top 0.3s;
}

.navbar a {
  color: var(--fifth-color);
  text-decoration: none;
  font-weight: medium;
  border-bottom: 5px solid transparent;
  transition: border-color 0.3s ease;
  line-height: 55px;
  font-size: larger;
}

.rl-icon:hover {
  border: trans;
}

.navbar a:hover {
  border-bottom: 5px solid var(--fifth-color);
}

.navbar a.no-border:hover {
  border-bottom: 5px solid transparent;
}

.navbar-left,
.navbar-right {
  display: flex;
  gap: 30px;
  align-items: center;
}

.dropdown {
  position: relative;
}

.dropbtn {
  background-color: var(--secondary-color);
  color: #d6e3ef;
  border: none;
  cursor: pointer;
  font-size: larger;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  background-color: var(--background-color);
  box-shadow: 0px 5px 6px rgb(0, 0, 0, 0.25);
  z-index: 1;
  top: 150%;
  width: 200px;
}

.dropdown-item {
  padding: 10px;
  color: var(--text-color);
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background-color: var(--fifth-color);
}
</style>
