import './utils/polyfills'
import './assets/index.css'

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

import App from './App.vue'
import router from './router'
import i18n from '@/i18n.ts'
import userProfilePopup from '@/composables/userProfilePopup.ts'

const queryClient = new QueryClient();
const app = createApp(App)

app.use(VueQueryPlugin, { queryClient });

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(userProfilePopup)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
