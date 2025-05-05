/**
 * User store module for global user state management.
 *
 * This Pinia store manages the application's user authentication state,
 * including login, registration, profile management, and authentication tokens.
 *
 * @module UserStore
 */
import { defineStore } from 'pinia'
import { fetchToken } from '@/services/api/AuthService.ts'
import { register } from '@/services/api/AuthService.ts'
import { send2FACode } from '@/services/api/AuthService.ts'
import { verify2FACode } from '@/services/api/AuthService.ts'
import { changePassword, changeEmail } from '@/services/api/AuthService.ts'
import { computed, ref } from 'vue'
import api from '@/services/api/AxiosInstance.ts'
import type { RegistrationData, UserProfile } from '@/models/User.ts'

/**
 * Defines and exports the user store for global user state management.
 *
 * Provides reactive state for user authentication, profile data, and
 * methods for login, registration, and profile management.
 */
export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(null)
  const username = ref<string | null>(null)
  const role = ref<string | null>(null)
  const userId = ref<string | null>(null)
  const isAuthenticated = ref(false)
  const profile = ref<UserProfile>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    locationSharingEnabled: true,
  })

  // Initialize from localStorage and validate token
  async function initializeFromStorage() {
    console.log('Initializing from storage...')
    const storedToken = localStorage.getItem('token')
    const storedUsername = localStorage.getItem('username')
    const storedRole = localStorage.getItem('role')
    const storedUserId = localStorage.getItem('userId')

    if (storedToken) {
      try {
        // First restore state from localStorage
        token.value = storedToken
        username.value = storedUsername
        role.value = storedRole
        userId.value = storedUserId

        // Then validate the token
        await api.get('/auth/validate', {
          headers: { Authorization: `Bearer ${storedToken}` },
        })

        isAuthenticated.value = true
        console.log('Token validated successfully')
      } catch (error) {
        console.error('Token validation failed:', error)
        clearAuthState()
      }
    } else {
      clearAuthState()
    }
  }

  function clearAuthState() {
    token.value = null
    username.value = null
    role.value = null
    userId.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
  }

  async function login(status: number, tokenStr: string, userEmail: string) {
    if (status === 200) {
      // Extract role and userId from token
      const tokenParts = tokenStr.split('.')
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]))
          role.value = payload.role
          userId.value = payload.userId?.toString()

          // Save to localStorage
          localStorage.setItem('token', tokenStr)
          localStorage.setItem('username', userEmail)
          localStorage.setItem('role', payload.role)
          localStorage.setItem('userId', payload.userId?.toString() || '')

          // Update state
          token.value = tokenStr
          console.log('Token:', token.value)
          username.value = userEmail
          isAuthenticated.value = true

          // Fetch user profile
          await fetchUserProfile()
        } catch (error) {
          console.error('Error parsing token payload:', error)
          clearAuthState()
        }
      }
    }
  }

  async function verifyLogin(userEmail: string, password: string, recaptchaToken: string) {
    try {
      console.log('Verifying login...')
      const response = await fetchToken({ email: userEmail, password, recaptchaToken })
      return response
      // login(response.status, response.data.token, userEmail);
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function registerUser(userData: RegistrationData) {
    try {
      await register(userData)
      await verifyLogin(userData.email, userData.password, userData.recaptchaToken)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  async function fetchUserProfile() {
    console.log(` TOKEN BENIG SENT TO BACKEND IN FETCH USER PROFILE: ${token.value}`)

    try {
      const response = await api.get<UserProfile>('/users/me', {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      profile.value = response.data
      localStorage.setItem('profile', JSON.stringify(response.data))
      console.log('User profile fetched successfully:', response.data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  async function send2FACodeToEmail(userEmail: string) {
    try {
      await send2FACode(userEmail)
    } catch (error) {
      console.error('Error sending 2FA code:', error)
      throw error
    }
  }

  async function verify2FACodeInput(userEmail: string, code: number) {
    try {
      const response = await verify2FACode(userEmail, code)
      return response
    } catch (error) {
      console.error('Error verifying 2FA code:', error)
      throw error
    }
  }

  async function updatePassword(oldPassword: string, newPassword: string) {
    if (!username.value) {
      throw new Error('User is not logged in. Cannot change password.')
    }

    try {
      await changePassword(username.value, oldPassword, newPassword)
      console.log('Password updated successfully')
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  async function updateEmail(newEmail: string, password: string) {
    if (!username.value) {
      throw new Error('User is not logged in. Cannot change email.')
    }

    try {
      await changeEmail(username.value, newEmail, password)
      username.value = newEmail // Update the email in the store
      localStorage.setItem('username', newEmail) // Update localStorage
      console.log('Email updated successfully')
    } catch (error) {
      console.error('Error updating email:', error)
      throw error
    }
  }

  function logout() {
    clearAuthState()
  }

  const loggedIn = computed(() => isAuthenticated.value)

  const isSuperAdminUser = computed(() => role.value === 'SUPERADMIN')

  const isAdminUser = computed(() => role.value === 'ADMIN' || role.value === 'SUPERADMIN')

  return {
    token,
    username,
    role,
    userId,
    isAuthenticated,
    profile,
    login,
    verifyLogin,
    registerUser,
    logout,
    send2FACodeToEmail,
    verify2FACodeInput,
    updatePassword,
    updateEmail,
    loggedIn,
    initializeFromStorage,
    isAdminUser,
    isSuperAdminUser,
  }
})
