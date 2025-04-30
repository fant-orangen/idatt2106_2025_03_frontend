<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useColorMode } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { Globe, User, Bell, Settings, Sun, Moon, ShieldUser, LogOut } from 'lucide-vue-next'
import { getNotifications } from '@/services/NotificationService.ts'
import type { NotificationMessage } from '@/models/NotificationMessage.ts'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/UserStore'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import NotificationPopover from '@/components/NotificationPopover.vue'

const { locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const isMenuOpen = ref(false)

type MenuLink = { label: string; route: string; action?: () => void };

// Removed duplicate logOut function

const menuLinks = computed<MenuLink[]>(() => {
  if (!userStore.loggedIn) {
    return [
      { label: 'Home', route: '/' },
      { label: 'Login', route: '/login' },
      { label: 'Register', route: '/register' },
    ]
  } else {
    const links = [
      { label: 'Home', route: '/' },
      { label: 'Profile', route: '/profile' },
      { label: 'Settings', route: '/settings' },
    ]
    if (userStore.isAdmin) {
      links.push({ label: 'Admin Panel', route: '/admin-panel' })
    }
    links.push({ label: 'Log out', route: '/logout', action: logOut })
    return links
  }
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function navigateTo(route: string): void {
  isMenuOpen.value =false
  router.push(route)
}

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

// Get the top 3 notifications
const topNotifications = ref<NotificationMessage[]>([])

onMounted(async () => {
  try {
    topNotifications.value = await getNotifications()
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  }
})

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

function logOut(): void {
  userStore.logout()
  router.push('/')
}

function toggleDropdown(): void {
  showDropdown.value = !showDropdown.value
}

function selectLanguage(language: { label: string; code: string }): void {
  selectedLanguage.value = language.label
  showDropdown.value = false
  locale.value = language.code
}

function goToPage(route: string) {
  router.push(route)
}
</script>

<template>
  <div
    id="navbar"
    class="navbar shadow-md bg-secondary text-secondary-foreground flex justify-between items-center px-5 py-3 transition-all duration-300"
  >
    <!-- Left Section: Language Selector -->
    <div class="navbar-right flex gap-4">
      <RouterLink to="/" class="hover:text-primary">
        <img src="../assets/krisefikser.svg" alt="Logo" class="h-8 w-auto" />
      </RouterLink>
      <div class="dropdown relative">
        <button
          class="dropbtn flex items-center gap-2 text-secondary-foreground hover:text-primary"
          @click="toggleDropdown"
        >
          <Globe class="h-5 w-5" />
          {{ selectedLanguage }}
        </button>
        <div
          v-if="showDropdown"
          class="dropdown-content absolute bg-card text-card-foreground shadow-lg mt-2 rounded-md w-[200px] z-50"
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

    <!-- Hamburger Menu Button (Visible on Mobile) -->
    <button
      class="hamburger-menu md:hidden flex items-center justify-center p-2 rounded hover:bg-input dark:hover:bg-background/40"
      @click="toggleMenu"
    >
      <span v-if="!isMenuOpen">☰</span>
      <span v-else>✖</span>
    </button>

    <!-- Sliding Menu Card (Mobile) -->
    <div
      v-if="isMenuOpen"
      class="fixed top-0 left-0 w-full h-full bg-black/50 z-50"
      @click.self="toggleMenu"
    >
      <div
        class="menu-card fixed top-0 left-0 w-4/5 max-w-sm h-full bg-secondary text-secondary-foreground shadow-lg p-5 transition-transform transform"
        :class="{ '-translate-x-full': !isMenuOpen, 'translate-x-0': isMenuOpen }"
      >
        <!-- Close Button -->
        <button
          class="close-button text-primary text-lg mb-4"
          @click="toggleMenu"
        >
          ✖
        </button>

        <!-- Mobile Menu Links -->
        <ul class="menu-links space-y-4">
          <li
            v-for="link in menuLinks"
            :key="link.route"
            class="text-lg hover:text-primary cursor-pointer"
            @click="link.action ? link.action() : navigateTo(link.route)"
          >
            {{ link.label }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Right Section: Desktop Navbar -->
    <div class="navbar-left hidden md:flex items-center gap-4">
      <!-- Public Links -->
      <RouterLink
        v-if="!userStore.loggedIn"
        to="/login"
        class="hover:text-primary border-b-2 border-transparent hover:border-primary pb-1"
      >
        {{ $t('login.login') }}
      </RouterLink>
      <RouterLink
        v-if="!userStore.loggedIn"
        to="/register"
        class="hover:text-primary border-b-2 border-transparent hover:border-primary pb-1"
      >
        {{ $t('login.signup') }}
      </RouterLink>

      <!-- User Dropdown Menu -->
      <DropdownMenu v-if="userStore.loggedIn">
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="cursor-pointer hover:bg-input dark:hover:bg-background/40"
          >
            <User class="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User class="mr-2 h-4 w-4" />
              <span @click="goToPage('/profile')">Profile (WIP)</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="goToPage('/settings')">
              <Settings class="mr-2 h-4 w-4" />
              <span>Settings (WIP)</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator v-if="userStore.loggedIn" />
            <DropdownMenuItem v-if="userStore.loggedIn" @click="goToPage('/admin-panel')">
              <ShieldUser class="mr-2 h-4 w-4" />
              <span>Admin Panel (WIP)</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator v-if="userStore.loggedIn" />
            <DropdownMenuItem @click="logOut()">
              <LogOut class="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Notifications -->
      <Popover>
        <PopoverTrigger as="button" class="no-border">
          <Button
                variant="ghost"
                size="icon"
                class="cursor-pointer hover:bg-input dark:hover:bg-background/40"
                >
                <Bell class="h-5 w-5" />
              </Button>
            </PopoverTrigger>
        <PopoverContent>
          <NotificationPopover :notifications="topNotifications" />
        </PopoverContent>
      </Popover>

      <!-- Dark Mode Toggle -->
      <Button
        variant="ghost"
        size="icon"
        class="dark-mode-toggle cursor-pointer hover:bg-input dark:hover:bg-background/40"
        @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
      >
        <component :is="colorMode === 'dark' ? Sun : Moon" class="h-5 w-5" />
      </Button>
    </div>
  </div>
</template>