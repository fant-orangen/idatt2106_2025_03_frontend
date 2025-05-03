<script setup lang="ts">
// Imports from both versions, ensuring NotificationStore is included
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useColorMode } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { Globe, User, Bell, Settings, Sun, Moon, ShieldUser, LogOut } from 'lucide-vue-next'
import type { NotificationMessage } from '@/models/NotificationMessage.ts' // Keep type definition
import { useNotificationStore } from '@/stores/NotificationStore' // Import NotificationStore (from version A)

// UI Components (keep all from version B)
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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import NotificationPopover from '@/components/NotificationPopover.vue'

// Store and Router setup (keep from version B, add notificationStore)
import { useUserStore } from '@/stores/UserStore'
const { locale, t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore() // Instantiate NotificationStore (from version A)
const isMenuOpen = ref(false) // Mobile menu state (from version B)

// Mobile Menu Type and Logic (from version B)
type MenuLink = {
  label: string
  route?: string
  action?: () => void
}

const menuLinks = computed<MenuLink[]>(() => {
  if (!userStore.loggedIn) {
    return [
      { label: t('navigation.home'), route: '/' },
      { label: t('login.login'), route: '/login' },
      { label: t('login.signup'), route: '/register' },
    ]
  } else {
    const links: MenuLink[] = [
      { label: t('navigation.home'), route: '/' },
      { label: t('navigation.profile'), route: '/profile' },
      { label: t('settings.settings'), route: '/settings' },
      { label: t('notifications.notifications'), route: '/notifications' },
    ]

    if (userStore.isAdminUser) {
      links.push({ label: t('navigation.admin-panel'), route: '/admin-panel' })
    }

    links.push({ label: t('login.logout'), action: logOut })

    return links
  }
})

function toggleMenu() {
  // from version B
  isMenuOpen.value = !isMenuOpen.value
}

function navigateTo(route: string): void {
  // from version B
  isMenuOpen.value = false
  router.push(route)
}

// Scroll and Language setup (from version B)
let prevScrollpos: number = window.pageYOffset
const languages = [
  { label: 'Norsk bokmål', code: 'nb-NO' },
  { label: 'English', code: 'en-US' },
  { label: 'Norsk nynorsk (WIP)', code: 'nn-NO' },
  { label: 'Sámi (WIP)', code: 'se' },
]
const selectedLanguage = ref(languages[0].label)

// Dark mode toggle (from version B)
const colorMode = useColorMode()

// Get the latest notifications for the popover using the store (from version A)
const topNotifications = computed(() => notificationStore.latestNotifications)

// Fetch notifications using the store on mount (from version A)
onMounted(async () => {
  // Only fetch if logged in and haven't fetched yet
  if (userStore.isAuthenticated && !notificationStore.hasFetchedInitial) {
    try {
      await notificationStore.fetchNotifications()
      console.log('NavBar: Initial notifications fetched via store.')
    } catch (error) {
      console.error('NavBar: Failed to fetch initial notifications via store:', error)
    }
  }
})

// Window scroll handler (from version B)
window.onscroll = function (): void {
  const currentScrollPos: number = window.pageYOffset
  const navbar = document.getElementById('navbar')

  if (navbar) {
    if (prevScrollpos > currentScrollPos) {
      navbar.style.top = '0'
    } else {
      // Hide navbar when scrolling down
      navbar.style.top = '-60px' // Adjust based on actual navbar height if needed
    }
  }
  prevScrollpos = currentScrollPos
}

// Logout function (from version B)
function logOut(): void {
  userStore.logout()
  notificationStore.resetStore() // Reset notification store on logout
  isMenuOpen.value = false // Close mobile menu if open
  router.push('/')
}

// Select language function (from version B)
function selectLanguage(language: { label: string; code: string }): void {
  selectedLanguage.value = language.label
  locale.value = language.code
}

// Go to page function (from version B)
function goToPage(route: string) {
  isMenuOpen.value = false // Close mobile menu on navigation
  router.push(route)
}
</script>

<template>
  <div
    id="navbar"
    class="navbar shadow-md bg-secondary text-secondary-foreground flex justify-between items-center px-5 py-3 transition-all duration-300 fixed top-0 left-0 right-0 z-[1000]"
  >
    <div class="navbar-right flex items-center gap-4">
      <RouterLink to="/" class="hover:text-primary flex items-center">
        <img src="../assets/krisefikser.svg" alt="Logo" class="h-8 w-auto" />
      </RouterLink>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            class="flex items-center gap-2 text-secondary-foreground hover:text-primary"
          >
            <Globe class="h-5 w-5" />
            {{ selectedLanguage }}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="z-[1001]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{{ $t('language.select-language') }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              v-for="language in languages"
              :key="language.code"
              @click="selectLanguage(language)"
              class="cursor-pointer"
            >
              {{ language.label }}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <button
      class="hamburger-menu md:hidden flex items-center justify-center p-2 rounded hover:bg-input dark:hover:bg-background/40"
      @click="toggleMenu"
      aria-label="Toggle menu"
    >
      <span v-if="!isMenuOpen">☰</span>
      <span v-else>✖</span>
    </button>

    <div
      v-if="isMenuOpen"
      class="fixed top-0 left-0 w-full h-full bg-black/50 z-[1050]"
      @click.self="toggleMenu"
    >
      <div
        class="menu-card fixed top-0 right-0 w-4/5 max-w-sm h-full bg-secondary text-secondary-foreground shadow-lg p-5 transition-transform transform translate-x-0 z-[1051]"
        :class="{ 'translate-x-full': !isMenuOpen }"
      >
        <button
          class="close-button absolute top-5 right-7 text-primary text-lg mb-4"
          @click="toggleMenu"
        >
          ✖
        </button>
        <Button
          variant="ghost"
          size="icon"
          class="dark-mode-toggle cursor-pointer hover:bg-input dark:hover:bg-background/40"
          @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
        >
          <component :is="colorMode === 'dark' ? Sun : Moon" class="h-6 w-6" />
        </Button>

        <ul class="menu-links space-y-4 mt-16">
          <li
            v-for="link in menuLinks"
            :key="link.label"
            class="text-lg hover:text-primary cursor-pointer"
            @click="link.action ? link.action() : navigateTo(link.route ?? '/')"
          >
            {{ $t(link.label) }}
          </li>
        </ul>

        <!-- Dark Mode Toggle -->
        <div class="mt-8 flex items-center justify-center"></div>
      </div>
    </div>

    <div class="navbar-left hidden md:flex items-center gap-4">
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
      <div class="flex gap-2">
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
              <DropdownMenuSeparator v-if="userStore.isAdminUser" />
              <DropdownMenuItem v-if="userStore.isAdminUser" @click="goToPage('/admin-panel')">
                <ShieldUser class="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="logOut()">
                <LogOut class="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger as="button" class="no-border relative">
            <Button
              variant="ghost"
              size="icon"
              class="cursor-pointer hover:bg-input dark:hover:bg-background/40"
            >
              <Bell class="h-5 w-5" />
              <span
                v-if="notificationStore.unreadCount > 0"
                class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-secondary"
              ></span>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="z-[1001] w-80 p-0">
            <NotificationPopover :notifications="topNotifications" />
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          class="dark-mode-toggle cursor-pointer hover:bg-input dark:hover:bg-background/40"
          @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
          aria-label="Toggle dark mode"
        >
          <component :is="colorMode === 'dark' ? Sun : Moon" class="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add specific styles here if needed, or rely on Tailwind classes */
.no-border {
  border: none;
  padding: 0; /* Adjust if button padding is interfering */
  background: none;
}

/* Ensure navbar stays on top and handles content scrolling underneath */
#navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* Ensure navbar is above most content */
}

/* Add padding to the body or main content area to prevent content from hiding behind the fixed navbar */
/* You might need to adjust the padding value based on the actual height of your navbar */
/* Apply this in your App.vue or main layout component's style */
/*
body {
  padding-top: 60px; // Example: Adjust to your navbar height
}
*/

/* Style for the notification badge */
.absolute.top-0.right-0 {
  transform: translate(25%, -25%); /* Adjust badge position slightly */
}
</style>
