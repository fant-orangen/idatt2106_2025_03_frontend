import './assets/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faUser, faGlobe, faSignIn, faBell } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faUser, faGlobe, faSignIn, faBell)

import App from './App.vue'
import router from './router'
import i18n from '@/i18n.ts'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
