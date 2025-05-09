<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Home, Mail, Phone, Info, Shield, MapPin } from 'lucide-vue-next'

const messages = {
  en: {
    login: {
      'privacy-policy': 'Privacy Policy',
    },
    footer: {
      'title': 'Krisefikser.no',
      'about': 'About Us',
      'contact': 'Contact',
      'address': 'Address',
      'phone': 'Phone',
      'email': 'Email',
      'links': 'Quick Links',
      'home': 'Home',
      'map': 'Map',
      'info': 'Information',
      'news': 'News',
    }
  },
  nb: {
    login: {
      'privacy-policy': 'Personvernerklæring',
    },
    footer: {
      'about': 'Om oss',
      'contact': 'Kontakt',
      'address': 'Adresse',
      'phone': 'Telefon',
      'email': 'E-post',
      'links': 'Hurtiglenker',
      'home': 'Hjem',
      'map': 'Kart',
      'info': 'Informasjon',
      'news': 'Nyheter',
    }
  },
}

const router = useRouter()
const { t } = useI18n({ messages })

/**
 * Navigate to a route
 *
 * @param {string} route - The route to navigate to
 */
const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <footer class="footer bg-secondary text-secondary-foreground shadow-t-md py-8 transition-all duration-300">
    <div class="container mx-auto px-4">

      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">

        <!-- About Section -->
        <div class="footer-section">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <Info class="w-5 h-5 mr-2" />
            {{ t('footer.about') }}
          </h3>
          <p class="text-sm">{{ t('footer.title') }}</p>
          <p class="text-sm mt-2">{{ t('home.hero.description') }}</p>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <Shield class="w-5 h-5 mr-2" />
            {{ t('footer.links') }}
          </h3>
          <ul class="space-y-2">
            <li>
              <a @click="navigateTo('/')" class="text-sm hover:underline cursor-pointer flex items-center">
                <Home class="w-4 h-4 mr-2" />
                {{ t('footer.home') }}
              </a>
            </li>
            <li>
              <a @click="navigateTo('/info')" class="text-sm hover:underline cursor-pointer flex items-center">
                <Info class="w-4 h-4 mr-2" />
                {{ t('footer.info') }}
              </a>
            </li>
            <li>
              <a @click="navigateTo('/news')" class="text-sm hover:underline cursor-pointer flex items-center">
                <Mail class="w-4 h-4 mr-2" />
                {{ t('footer.news') }}
              </a>
            </li>
            <li>
              <a href="/privacy-policy" class="text-sm hover:underline flex items-center">
                <Shield class="w-4 h-4 mr-2" />
                {{ t('login.privacy-policy') }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div class="footer-section md:col-span-1 lg:col-span-2">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <Phone class="w-5 h-5 mr-2" />
            {{ t('footer.contact') }}
          </h3>
          <div class="space-y-2">
            <p class="text-sm flex items-center">
              <MapPin class="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{{ t('footer.address') }}: O. S. Bragstads Plass, 7034 Trondheim</span>
            </p>
            <p class="text-sm flex items-center">
              <Phone class="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{{ t('footer.phone') }}: +47 123 45 678</span>
            </p>
            <p class="text-sm flex items-center">
              <Mail class="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{{ t('footer.email') }}:
                <a href="mailto:krisefikser.smtp@gmail.com" class="hover:underline">krisefikser.smtp@gmail.com</a>
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Copyright Bar -->
      <div class="border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center">
        <p class="text-sm">© {{ new Date().getFullYear() }} IDATT2106 Team 3. {{ t('footer.title') }}</p>
        <div class="flex space-x-4 mt-4 md:mt-0">
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  box-shadow:
    0 -4px 6px -1px rgba(0, 0, 0, 0.1),
    0 -2px 4px -1px rgba(0, 0, 0, 0.06); /* Shadow above */
}

.footer-section h3 {
  position: relative;
  padding-bottom: 0.5rem;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 50px;
  background-color: rgba(var(--secondary-foreground), 0.3);
}

/* Make links and interactive elements more obvious */
.footer a, .footer button {
  transition: all 0.2s ease;
}

.footer a:hover, .footer button:hover {
  opacity: 0.8;
}
</style>
