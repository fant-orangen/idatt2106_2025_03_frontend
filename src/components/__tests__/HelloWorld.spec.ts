import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

// Create a simple component just for testing
const SimpleComponent = {
  template: '<div>{{ message }}</div>',
  props: {
    message: {
      type: String,
      default: 'Pipeline Test'
    }
  }
}

describe('Pipeline Test', () => {
  it('renders component with props', () => {
    const message = 'CI/CD Pipeline Working'
    const wrapper = mount(SimpleComponent, { props: { message } })

    // Basic assertions that should always pass if mounting works
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('CI/CD Pipeline Working')
  })

  it('uses default prop value when none provided', () => {
    const wrapper = mount(SimpleComponent)
    expect(wrapper.text()).toContain('Pipeline Test')
  })
})
