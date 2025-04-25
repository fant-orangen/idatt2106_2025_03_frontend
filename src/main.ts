import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faUser as faUserRegular } from '@fortawesome/free-regular-svg-icons'

import {
  faUser as faUserSolid,
  faGlobe,
  faSignIn,
  faBell,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faUserSolid, faGlobe, faSignIn, faBell, faTriangleExclamation)
library.add(faUserRegular)

import App from './App.vue'
import router from './router'
import i18n from '@/i18n.ts'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
