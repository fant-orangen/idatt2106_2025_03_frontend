/**
 * Vue directive for showing a user profile popup when clicking on a user element.
 *
 * This directive can be applied to any element that represents a user in the UI.
 * When the element is clicked, it will trigger a popup showing the user's basic information
 * (first name, last name, email, and household name) using the UserBasicInfoDto from the backend.
 *
 * Usage:
 * v-user-profile="{ userId: 123 }"
 */

import type { DirectiveBinding } from 'vue'
import { createApp, h, type App } from 'vue'

declare global {
  interface HTMLElement {
    _userId?: number
    _clickHandler?: (event: MouseEvent) => void
  }
}
import UserProfilePopup from '@/components/profile/UserProfilePopup.vue'
import { getUserBasicInfo } from '@/services/UserService.ts'
import i18n from '@/i18n.ts'

const activePopups = new Map<number, { app: App, container: HTMLElement }>()

const createPopup = async (userId: number, element: HTMLElement) => {

  if (activePopups.has(userId)) {
    return
  }

  try {
    const userProfile = await getUserBasicInfo(userId)

    const container = document.createElement('div')
    document.body.appendChild(container)

    const app = createApp({
      render() {
        return h(UserProfilePopup, {
          isOpen: true,
          userProfile,
          'onUpdate:isOpen': (value: boolean) => {
            if (!value) {
              closePopup(userId)
            }
          }
        })
      }
    })
    app.use(i18n)
    app.mount(container)
    activePopups.set(userId, { app, container })

    const handleClickOutside = (event: MouseEvent) => {
      if (!container.contains(event.target as Node) && event.target !== element) {
        closePopup(userId)
      }
    }

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)

  } catch (error) {
    console.error(`Failed to load user profile for ID ${userId}:`, error)
  }
}

const closePopup = (userId: number) => {
  const popup = activePopups.get(userId)
  if (popup) {
    const { app, container } = popup
    app.unmount()
    document.body.removeChild(container)
    activePopups.delete(userId)
  }
}

const userProfileDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { userId } = binding.value || {}

    if (!userId) {
      return
    }

    const clickHandler = (event: MouseEvent) => {
      event.stopPropagation()
      createPopup(userId, el)
    }
    el.addEventListener('click', clickHandler)
    el._clickHandler = clickHandler
    el._userId = userId
  },

  unmounted(el: HTMLElement) {
    if (el._userId) {
      closePopup(el._userId)
    }

    if (el._clickHandler) {
      el.removeEventListener('click', el._clickHandler)
    }
  }
}

export default {
  install(app: App) {
    app.directive('user-profile', userProfileDirective)
  }
}

export const userProfilePopup = userProfileDirective
