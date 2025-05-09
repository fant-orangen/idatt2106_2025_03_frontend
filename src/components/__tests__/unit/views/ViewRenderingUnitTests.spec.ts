/**
 * View Components Unit Tests
 *
 * This file contains basic unit tests for all view components.
 * Each test verifies that a component renders correctly.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

// Import all view components
import NotFoundView from '@/views/404NotFoundView.vue'
import AdminAddNewActivity from '@/views/AdminAddNewActivity.vue'
import AdminAddNewEvent from '@/views/AdminAddNewEvent.vue'
import AdminAddNewPOI from '@/views/AdminAddNewPOI.vue'
import AdminAddNewScenarioTheme from '@/views/AdminAddNewScenarioTheme.vue'
import AdminAddNews from '@/views/AdminAddNews.vue'
import AdminEditEvent from '@/views/AdminEditEvent.vue'
import AdminEditMeetingPoint from '@/views/AdminEditMeetingPoint.vue'
import AdminEditPOI from '@/views/AdminEditPOI.vue'
import AdminEditScenarioTheme from '@/views/AdminEditScenarioTheme.vue'
import AdminPanel from '@/views/AdminPanel.vue'
import CrisisEventView from '@/views/CrisisEventView.vue'
import DefineQuizView from '@/views/gamification/admin/DefineQuizView.vue'
import EditQuizView from '@/views/gamification/admin/EditQuizView.vue'
import EnhancedInformationView from '@/views/information/EnhancedInformationView.vue'
import FoodAndDrinksView from '@/views/FoodAndDrinksView.vue'
import GroupPage from '@/views/GroupPage.vue'
import HouseholdView from '@/views/HouseholdView.vue'
import LoginView from '@/views/LoginView.vue'
import MedicineInventory from '@/views/MedicineInventory.vue'
import NewsView from '@/views/NewsView.vue'
import NotificationView from '@/views/NotificationView.vue'
import PrivacyPolicyView from '@/views/PrivacyPolicyView.vue'
import ProfileView from '@/views/ProfileView.vue'
import QuizHistoryView from '@/views/gamification/QuizHistoryView.vue'
import QuizOverviewView from '@/views/gamification/QuizOverviewView.vue'
import QuizView from '@/views/gamification/QuizView.vue'
import ReflectionsView from '@/views/ReflectionsView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ShareItemModal from '@/views/ShareItemModal.vue'
import SuperAdminAdministrate from '@/views/SuperAdminAdministrate.vue'

// Mock the stores
vi.mock('@/stores/UserStore', () => ({
  useUserStore: vi.fn(() => ({
    isAuthenticated: false,
    token: null,
    username: null,
    role: null,
    userId: null
  }))
}))

vi.mock('@/stores/HouseholdStore', () => ({
  useHouseholdStore: vi.fn(() => ({
    currentHousehold: null,
    members: [],
    isLoading: false,
    error: null,
    isMemberOfHousehold: false,
    fetchCurrentHousehold: vi.fn().mockResolvedValue(null)
  }))
}))

// Mock the i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, fallback: string) => fallback
  }),
  createI18n: vi.fn(() => ({
    global: {
      locale: 'en-US',
      fallbackLocale: 'en-US',
      t: (key: string, fallback: string) => fallback
    },
    install: vi.fn()
  }))
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn()
  })),
  useRoute: vi.fn(() => ({
    params: {},
    query: {},
    path: '/'
  })),
  createRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    resolve: vi.fn(),
    addRoute: vi.fn(),
    removeRoute: vi.fn(),
    hasRoute: vi.fn(),
    getRoutes: vi.fn(),
    onError: vi.fn()
  })),
  createWebHistory: vi.fn(() => ({}))
}))

// Mock any other common services or components that might be needed
vi.mock('@/services/CrisisEventService', () => ({
  fetchAllPreviewCrisisEvents: vi.fn().mockResolvedValue({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0
  })
}))

// Global setup for all tests
beforeEach(() => {
  // Create a fresh Pinia instance and make it active
  setActivePinia(createPinia())

  // Reset all mocks before each test
  vi.resetAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})

// Helper function to test component rendering
const testComponentRendering = (component: any, name: string) => {
  describe(name, () => {
    it('should render correctly', async () => {
      try {
        const wrapper = shallowMount(component, {
          global: {
            stubs: ['router-link', 'router-view']
          }
        })
        expect(wrapper.exists()).toBe(true)
      } catch (error) {
        console.error(`Error mounting ${name}:`, error)
        throw error
      }
    })
  })
}

// Test each view component
testComponentRendering(NotFoundView, '404NotFoundView')
testComponentRendering(AdminAddNewActivity, 'AdminAddNewActivity')
testComponentRendering(AdminAddNewEvent, 'AdminAddNewEvent')
testComponentRendering(AdminAddNewPOI, 'AdminAddNewPOI')
testComponentRendering(AdminAddNewScenarioTheme, 'AdminAddNewScenarioTheme')
testComponentRendering(AdminAddNews, 'AdminAddNews')
testComponentRendering(AdminEditEvent, 'AdminEditEvent')
testComponentRendering(AdminEditMeetingPoint, 'AdminEditMeetingPoint')
testComponentRendering(AdminEditPOI, 'AdminEditPOI')
testComponentRendering(AdminEditScenarioTheme, 'AdminEditScenarioTheme')
testComponentRendering(AdminPanel, 'AdminPanel')
testComponentRendering(CrisisEventView, 'CrisisEventView')
testComponentRendering(DefineQuizView, 'DefineQuizView')
testComponentRendering(EditQuizView, 'EditQuizView')
testComponentRendering(EnhancedInformationView, 'EnhancedInformationView')
testComponentRendering(FoodAndDrinksView, 'FoodAndDrinksView')
testComponentRendering(GroupPage, 'GroupPage')
testComponentRendering(HouseholdView, 'HouseholdView')
testComponentRendering(LoginView, 'LoginView')
testComponentRendering(MedicineInventory, 'MedicineInventory')
testComponentRendering(NewsView, 'NewsView')
testComponentRendering(NotificationView, 'NotificationView')
testComponentRendering(PrivacyPolicyView, 'PrivacyPolicyView')
testComponentRendering(ProfileView, 'ProfileView')
testComponentRendering(QuizHistoryView, 'QuizHistoryView')
testComponentRendering(QuizOverviewView, 'QuizOverviewView')
testComponentRendering(QuizView, 'QuizView')
testComponentRendering(ReflectionsView, 'ReflectionsView')
testComponentRendering(RegisterView, 'RegisterView')
testComponentRendering(ResetPasswordView, 'ResetPasswordView')
testComponentRendering(SettingsView, 'SettingsView')
testComponentRendering(ShareItemModal, 'ShareItemModal')
testComponentRendering(SuperAdminAdministrate, 'SuperAdminAdministrate')
