<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import type { UserBasicInfoDto } from '@/models/User'
import { getUserProfile } from '@/services/UserService'
import { toast } from 'vue-sonner'

// Icon
import {
  Globe,
  User,
  Users,
  Bell,
  Settings,
  Sun,
  Moon,
  ShieldUser,
  LogOut,
  Menu,
  X,
  BookOpen,
  House,
  Siren,
  Phone,
  Info,
} from 'lucide-vue-next'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

import NotificationPopover from '@/components/NotificationPopover.vue'

import { useColorMode } from '@vueuse/core'

// Stores
import { useUserStore } from '@/stores/UserStore'
import { useNotificationStore } from '@/stores/NotificationStore'

// i18n
import { useI18n } from 'vue-i18n'
import { tooltip } from 'leaflet'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const colorMode = useColorMode()

// Langauge
const englishSelected = ref(false)

// Loading state
const isLoading = ref(false)

const profile = ref<UserBasicInfoDto>({
  firstName: '',
  lastName: '',
  email: '',
  householdName: '',
  emailVerified: false,
})

function changeLanguage(code: string) {
  locale.value = code
  englishSelected.value = code === 'en-US'
}

// Notifications
const topNotifications = computed(() => notificationStore.latestNotifications)
const hasUnreadNotifications = computed(() => notificationStore.hasUnread)

// Watch for changes in notifications and update unread status
watch(
  () => notificationStore.notifications,
  async () => {
    console.log('HeaderNavbar: Notifications changed, checking unread status') // TODO: remove logs
    await notificationStore.checkUnreadNotifications()
  },
  { deep: true },
)

// Watch hasUnread state for debugging
watch(
  () => notificationStore.hasUnread,
  (newValue) => {
    console.log('HeaderNavbar: hasUnread state changed to:', newValue)
  },
)

watch(
  () => userStore.loggedIn,
  async (loggedIn) => {
    if (loggedIn) {
      try {
        isLoading.value = true
        const userData = await getUserProfile()
        profile.value = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          householdName: userData.householdName,
          emailVerified: userData.emailVerified,
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        toast.error(t('errors.unexpected-error'))
      } finally {
        isLoading.value = false
      }
    }
  },
  { immediate: true },
)


onMounted(async () => {
  // Only load profile & notifications when the user is logged in
  if (!userStore.loggedIn) {
    return
  }

  isLoading.value = true
  try {
    // Fetch user profile
    const userData = await getUserProfile()
    profile.value = {
      firstName:     userData.firstName,
      lastName:      userData.lastName,
      email:         userData.email,
      householdName: userData.householdName,
      emailVerified: userData.emailVerified,
    }
  } catch (error: any) {
    // Suppress 403 (unauthenticated), but log and toast other errors
    if (error.response?.status !== 403) {
      console.error('Profile load error:', error)
      toast.error(t('errors.unexpected-error'))
    }
  } finally {
    isLoading.value = false
  }

  // Fetch notifications once
  if (!notificationStore.hasFetchedInitial) {
    try {
      await notificationStore.fetchNotifications()
      await notificationStore.checkUnreadNotifications()
    } catch (error) {
      console.error('Notifications load error:', error)
    }
  }
})

onMounted(async () => {
  // Only fetch if logged in and haven't fetched yet
  if (userStore.isAuthenticated && !notificationStore.hasFetchedInitial) {
    try {
      await notificationStore.fetchNotifications()
      await notificationStore.checkUnreadNotifications()
      console.log('NavBar: Initial notifications fetched and checked for unread')
    } catch (error) {
      console.error('NavBar: Failed to fetch initial notifications via store:', error)
    }
  }
})

// Handle notification bell click
async function handleNotificationClick() {
  if (notificationStore.hasUnread) {
    try {
      await notificationStore.markAllAsRead()
      await notificationStore.checkUnreadNotifications() // Recheck after marking as read
      console.log('NavBar: Marked all notifications as read')
    } catch (error) {
      console.error('NavBar: Failed to mark notifications as read:', error)
    }
  }
}

// Mobile menu
const isMenuOpen = ref(false)

type MenuLink = {
  label: string
  route?: string
  action?: () => void
}

// Menu links
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
      { label: t('reflect.reflections'), route: '/reflections' },
      { label: t('settings.settings'), route: '/settings' },
      { label: t('notifications.notifications'), route: '/notifications' },
    ]

    if (userStore.isAdminUser) {
      links.push({ label: t('navigation.admin-panel'), route: '/admin/admin-panel' })
    }

    links.push({ label: t('login.logout'), action: logOut })

    return links
  }
})

// Toggle mobile menu
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// Go to page
function goToPage(route: string) {
  isMenuOpen.value = false
  router.push(route)
}

// Logout
function logOut() {
  userStore.logout()
  notificationStore.resetStore()
  isMenuOpen.value = false
  router.push('/login')
}
</script>

<template>
  <div class="navbar text-secondary-foreground bg-secondary shadow-md p-4 sticky top-0 z-[100]">
    <div class="w-full max-w-screen-2xl mx-auto flex flex-row items-center justify-between">
      <div class="navbar-left flex flex-row gap-4">
        <!-- Logo -->
        <RouterLink
          to="/"
          class="hover:text-primary flex items-center"
          v-tooltip="t('navigation.home')"
        >
          <img src="../assets/krisefikserNY.png" alt="Logo" class="h-8 w-auto" />
        </RouterLink>

        <!-- Change Language -->

        <Button
          variant="link"
          v-tooltip="t('language.change-language')"
          @click="changeLanguage(englishSelected ? 'nb-NO' : 'en-US')"
        >
          <Globe class="h-4 w-4" />
          {{ englishSelected ? 'Bytt til norsk' : 'Switch to English' }}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              v-tooltip="t('infoPage.emergencyContacts')"
              class="hidden md:inline-flex cursor-pointer hover:bg-input dark:hover:bg-background/40"
            >
              <Siren class="h-4 w-4" />
              {{ t('infoPage.emergencyContacts') }}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="z-101">
            <DropdownMenuLabel> {{ t('infoPage.emergencyContacts') }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup class="hover:bg-white dark:hover:bg-black">
              <DropdownMenuLabel class="flex flex-row">
                <Phone class="mr-2 h-4 w-4" />
                <span>{{ $t('infoPage.generalEmergencyContacts.police') }}</span>
              </DropdownMenuLabel>
              <DropdownMenuLabel class="flex flex-row">
                <Phone class="mr-2 h-4 w-4" />
                <span>{{ $t('infoPage.generalEmergencyContacts.ambulance') }}</span>
              </DropdownMenuLabel>
              <DropdownMenuLabel class="flex flex-row">
                <Phone class="mr-2 h-4 w-4" />
                <span>{{ $t('infoPage.generalEmergencyContacts.fire') }}</span>
              </DropdownMenuLabel>
              <DropdownMenuLabel class="flex flex-row">
                <Phone class="mr-2 h-4 w-4" />
                <span>{{ $t('infoPage.generalEmergencyContacts.civilDefense') }}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          class="cursor-pointer hover:bg-input dark:hover:bg-background/40"
          v-tooltip="t('info.info')"
          @click="goToPage('/info')"
        >
          <Info class="h-5 w-5" />
          <span class="hidden md:inline-flex">
            {{ $t('info.info') }}
          </span>
        </Button>
      </div>
      <div class="navbar-right flex flex-row items-center gap-4">
        <!-- Login -->

        <Button
          class="hidden md:inline-flex"
          variant="link"
          @click="goToPage('/login')"
          v-if="!userStore.loggedIn"
          >{{ t('login.login') }}</Button
        >

        <!-- Sign up -->

        <Button
          class="hidden md:inline-flex"
          variant="link"
          @click="goToPage('/register')"
          v-if="!userStore.loggedIn"
          >{{ t('login.signup') }}</Button
        >

        <Button
          v-if="userStore.loggedIn"
          variant="ghost"
          class="cursor-pointer hover:bg-input dark:hover:bg-background/40"
          v-tooltip="t('household.my-household')"
          @click="goToPage('/household')"
        >
          <House class="h-5 w-5" />
          <span class="hidden md:inline-flex">
            {{ t('household.my-household') }}
          </span>
        </Button>

        <Button
          v-if="userStore.isAdminUser"
          variant="ghost"
          class="hidden md:inline-flex cursor-pointer hover:bg-input dark:hover:bg-background/40"
          v-tooltip="t('navigation.admin-panel')"
          @click="goToPage('/admin/admin-panel')"
        >
          <ShieldUser class="h-5 w-5" />
          <span class="hidden md:inline-flex">
            {{ $t('navigation.admin-panel') }}
          </span>
        </Button>

        <DropdownMenu v-if="userStore.loggedIn">
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              class="cursor-pointer hover:bg-input dark:hover:bg-background/40"
              v-tooltip="t('settings.account.myAccount')"
            >
              <User class="h-5 w-5" />
              <span class="hidden md:inline-flex">
                {{ isLoading ? t('loading') : `${profile.firstName} ${profile.lastName}` }}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="z-[101]">
            <DropdownMenuLabel>{{ t('settings.account.myAccount') }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem @select="goToPage('/profile')">
                <User class="mr-2 h-4 w-4" />
                <span>{{ t('navigation.profile') }}</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="goToPage('/reflections')">
                <BookOpen class="mr-2 h-4 w-4" />
                <span>{{ t('reflect.reflections') }}</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="goToPage('/settings')">
                <Settings class="mr-2 h-4 w-4" />
                <span>{{ t('settings.settings') }}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="logOut()">
                <LogOut class="mr-2 h-4 w-4" />
                <span>{{ t('login.logout') }}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Notifications -->

        <Popover v-if="userStore.loggedIn">
          <PopoverTrigger as="button" class="no-border relative">
            <Button
              v-tooltip="t('notifications.notifications')"
              variant="ghost"
              size="icon"
              class="cursor-pointer hover:bg-input dark:hover:bg-background/40"
              @click="handleNotificationClick"
            >
              <Bell class="h-5 w-5" />
              <span
                v-if="hasUnreadNotifications"
                class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-secondary"
              ></span>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="z-[1001] w-80 p-4">
            <NotificationPopover :notifications="topNotifications" />
          </PopoverContent>
        </Popover>

        <!-- Dark Mode Toggle -->
        <Button
          v-tooltip="t('navigation.change-mode')"
          variant="ghost"
          size="icon"
          class="hidden md:inline-flex cursor-pointer hover:bg-input dark:hover:bg-background/40"
          @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
          aria-label="Toggle dark mode"
        >
          <component :is="colorMode === 'dark' ? Sun : Moon" class="h-5 w-5" />
        </Button>

        <!-- Mobile Menu -->

        <Button
          v-tooltip="t('navigation.menu')"
          class="hamburger-menu md:hidden z-9999"
          variant="ghost"
          size="icon"
          @click="toggleMenu"
        >
          <span v-if="!isMenuOpen" class="z-99999">
            <Menu class="h-5 w-5" />
          </span>
          <span v-else class="z-9999">
            <X class="h-5 w-5" />
          </span>
        </Button>
        <div
          v-if="isMenuOpen"
          class="fixed top-0 left-0 w-full h-full bg-black/50 z-[1050]"
          @click.self="toggleMenu"
        >
          <div
            class="menu-card fixed top-0 right-0 w-4/5 max-w-sm h-full bg-secondary text-secondary-foreground shadow-lg p-5 transition-transform transform translate-x-0 z-[1051]"
            :class="{ 'translate-x-full': !isMenuOpen }"
          >
            <div class="menu-header flex items-center justify-between">
              <Button
                v-tooltip="t('navigation.change-mode')"
                variant="ghost"
                size="icon"
                class="dark-mode-toggle cursor-pointer hover:bg-input dark:hover:bg-background/40"
                @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
              >
                <component :is="colorMode === 'dark' ? Sun : Moon" class="h-6 w-6" />
              </Button>
            </div>

            <ul class="menu-links space-y-4 mt-16">
              <li
                v-for="link in menuLinks"
                :key="link.label"
                class="text-lg hover:text-primary cursor-pointer"
                @click="link.action ? link.action() : goToPage(link.route ?? '/')"
              >
                {{ $t(link.label) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
