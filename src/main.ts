import './utils/polyfills'
import './assets/index.css'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

import {
  faUser,
  faGlobe,
  faSignIn,
  faBell,
  faTriangleExclamation,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faUser, faGlobe, faSignIn, faBell, faTriangleExclamation, faArrowRight)

FloatingVue.options.themes.tooltip.autoHide = false
FloatingVue.options.themes.tooltip.delay = [300, 100]
FloatingVue.options.themes.tooltip.triggers = ['hover', 'focus']
FloatingVue.options.themes.tooltip.popperOptions = {
  modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
}

import App from './App.vue'
import router from './router'
import i18n from '@/i18n.ts'
import userProfilePopup from '@/composables/userProfilePopup.ts'

const queryClient = new QueryClient();
const app = createApp(App)

app.use(VueQueryPlugin, { queryClient });
app.use(FloatingVue)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(userProfilePopup)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
