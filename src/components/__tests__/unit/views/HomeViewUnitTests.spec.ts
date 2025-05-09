/**
 * HomeView Unit Tests
 *
 * This file contains basic unit tests for the HomeView component.
 * The tests verify that the component renders correctly.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeView from '@/views/HomeView.vue'

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

// Mock the CrisisEventService
vi.mock('@/services/CrisisEventService', () => ({
  fetchAllPreviewCrisisEvents: vi.fn().mockResolvedValue({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0
  })
}))

// Mock the i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, fallback: string) => fallback
  })
}))

// Mock the child components
vi.mock('@/components/homeview/UnauthenticatedHome.vue', () => ({
  default: {
    name: 'UnauthenticatedHome',
    render: () => null
  }
}))

vi.mock('@/components/homeview/AuthenticatedNoHouseholdHome.vue', () => ({
  default: {
    name: 'AuthenticatedNoHouseholdHome',
    render: () => null
  }
}))

vi.mock('@/components/homeview/AuthenticatedWithHouseholdHome.vue', () => ({
  default: {
    name: 'AuthenticatedWithHouseholdHome',
    render: () => null
  }
}))

vi.mock('@/components/homeview/AuthenticatedWithHouseholdCrisisHome.vue', () => ({
  default: {
    name: 'AuthenticatedWithHouseholdCrisisHome',
    render: () => null
  }
}))

describe('HomeView', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance and make it active
    setActivePinia(createPinia())

    // Reset all mocks before each test
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  /**
   * Test: Component Rendering
   *
   * Verifies that the HomeView component renders correctly.
   * This is a basic test to ensure the component can be mounted without errors.
   */
  it('should render correctly', async () => {
    const wrapper = mount(HomeView)

    // Verify that the component renders
    expect(wrapper.exists()).toBe(true)

    // Verify that the unauthenticated view is shown by default
    // (since we mocked useUserStore to return isAuthenticated: false)
    expect(wrapper.findComponent({ name: 'UnauthenticatedHome' }).exists()).toBe(true)
  })
})
