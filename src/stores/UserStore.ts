/**
 * User store module for global user state management.
 *
 * This Pinia store manages the application's user authentication state,
 * profile data (including location sharing preference), current location,
 * and provides methods for login, registration, profile updates, and location state management.
 *
 * @module UserStore
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import api from '@/services/api/AxiosInstance.ts';
import { fetchToken, register, send2FACode, verify2FACode } from '@/services/api/AuthService.ts';
import type { RegistrationData, UserProfile } from '@/models/User.ts';
import type { UserLocation } from '@/types/map'; // Import UserLocation type

/**
 * Extended UserProfile interface including the location sharing preference.
 * Ensure this aligns with the actual data structure returned by your backend's /api/users/me endpoint.
 */
export interface UserProfileExtended extends UserProfile {
  locationSharingEnabled?: boolean; // Assumed boolean preference from backend
  // Add other fields from UserProfileDto if necessary (id, emailVerified, householdId, etc.)
  id?: number;
  emailVerified?: boolean;
  householdId?: number;
  householdName?: string;
}

/**
 * Defines and exports the user store for global user state management.
 */
export const useUserStore = defineStore('user', () => {
  // --- Authentication State ---
  const token = ref<string | null>(null);
  const username = ref<string | null>(null); // Typically the user's email
  const role = ref<string | null>(null);
  const userId = ref<string | null>(null);
  const isAuthenticated = ref(false);

  // --- User Profile State ---
  // Holds the extended profile data, initialized to null
  const profile = ref<UserProfileExtended | null>(null);

  // --- Geolocation State ---
  /**
   * Stores the latest successfully retrieved user location coordinates.
   * Updated by the `useGeolocation` composable via the `setLocation` action.
   */
  const currentUserLocation = ref<UserLocation | null>(null);
  /**
   * Stores the last geolocation error encountered. Simplified to code and message.
   * Updated by the `useGeolocation` composable via the `setLocationError` action.
   */
  const locationError = ref<{ code: number; message: string } | null>(null);
  /**
   * Boolean flag indicating if a geolocation request is currently in progress.
   * Managed by the `setLocationLoading`, `setLocation`, and `setLocationError` actions.
   */
  const isLocationLoading = ref(false);
  /**
   * User-friendly string indicating the current status of geolocation attempts.
   * (e.g., 'Loading', 'Success', 'Permission Denied', 'Disabled by User', 'Not Supported', 'Error').
   * Managed by the `setLocationLoading`, `setLocation`, and `setLocationError` actions.
   */
  const locationStatus = ref<string | null>(null);

  // --- Initialization ---
  /**
   * Initializes the store state from localStorage (token, username, role, userId).
   * Validates the stored token against the backend.
   * Fetches the user profile if the token is valid.
   */
  async function initializeFromStorage() {
    console.log('Initializing UserStore from storage...');
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken && storedUsername && storedRole && storedUserId) {
      // Temporarily set state from storage
      token.value = storedToken;
      username.value = storedUsername;
      role.value = storedRole;
      userId.value = storedUserId;

      try {
        // Validate the token with the backend
        console.log('Validating token...');
        await api.get('/auth/validate'); // Endpoint checks token from interceptor

        // Token is valid, set authenticated state
        isAuthenticated.value = true;
        console.log('Token validated successfully.');

        // Fetch the full user profile
        await fetchUserProfile();
      } catch (error) {
        console.error('Token validation failed or profile fetch failed:', error);
        // Clear all state if token is invalid or profile fetch fails critically
        clearAuthState();
      }
    } else {
      console.log('No complete auth state found in storage.');
      clearAuthState(); // Ensure clean state if loading fails
    }
  }

  // --- State Clearing ---
  /**
   * Clears all authentication, profile, and location state.
   * Removes relevant items from localStorage.
   */
  function clearAuthState() {
    console.log('Clearing auth state...');
    token.value = null;
    username.value = null;
    role.value = null;
    userId.value = null;
    isAuthenticated.value = false;
    profile.value = null; // Clear profile
    // Clear location state
    currentUserLocation.value = null;
    locationError.value = null;
    isLocationLoading.value = false;
    locationStatus.value = null;
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }

  // --- Geolocation State Actions (called by useGeolocation composable) ---
  /**
   * Updates the store with a successfully retrieved location.
   * @param payload - Object containing the location, status message, and loading state.
   */
  function setLocation(payload: {
    location: UserLocation | null;
    status: string | null;
    isLoading: boolean;
  }) {
    currentUserLocation.value = payload.location;
    locationStatus.value = payload.status;
    isLocationLoading.value = payload.isLoading;
    locationError.value = null; // Clear error on success/status update
  }

  /**
   * Updates the store when a geolocation error occurs.
   * @param payload - Object containing the error, status message, and loading state.
   */
  function setLocationError(payload: {
    error: GeolocationPositionError | { code: number; message: string } | null;
    status: string | null;
    isLoading: boolean;
  }) {
    // Store a simplified version of the error for easier handling
    locationError.value = payload.error
      ? { code: payload.error.code, message: payload.error.message }
      : null;
    locationStatus.value = payload.status;
    isLocationLoading.value = payload.isLoading;
    currentUserLocation.value = null; // Clear location on error
  }

  /**
   * Sets the loading state for geolocation requests.
   * @param loading - Boolean indicating if loading is active.
   */
  function setLocationLoading(loading: boolean) {
    isLocationLoading.value = loading;
    if (loading) {
      locationStatus.value = 'Loading'; // Set status when loading starts
      locationError.value = null; // Clear previous errors
    }
  }

  // --- User Profile Actions ---
  /**
   * Fetches the current user's profile data from the backend.
   * Requires the user to be authenticated (token must be set).
   * Updates the `profile` ref on success.
   */
  async function fetchUserProfile() {
    if (!isAuthenticated.value) {
      console.warn('Cannot fetch profile: User not authenticated.');
      return;
    }
    console.log('Fetching user profile...');
    try {
      // Assumes backend endpoint '/api/users/me' returns UserProfileExtended data
      const response = await api.get<UserProfileExtended>('/users/me');
      profile.value = response.data;
      console.log('User profile fetched successfully:', profile.value);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Handle error appropriately - maybe logout if unauthorized (401)
      // For now, just clear the profile maybe?
      // profile.value = null;
    }
  }

  /**
   * Updates the user's location sharing preference on the backend and locally.
   * Requires the user to be authenticated.
   * @param enabled - The new boolean value for locationSharingEnabled.
   */
  async function updateLocationPreference(enabled: boolean) {
    if (!profile.value || !isAuthenticated.value) {
      console.warn('Cannot update preference: User profile not loaded or not authenticated.');
      return;
    }
    console.log(`Updating location preference to: ${enabled}`);
    try {
      // Assumes backend endpoint 'PATCH /api/users/me/preferences'
      // The actual endpoint might differ based on UserController.java
      await api.patch('/users/me/preferences', { locationSharingEnabled: enabled });
      // Update local state immediately for better UX
      profile.value.locationSharingEnabled = enabled;
      console.log('Location preference updated successfully.');
    } catch (error) {
      console.error('Failed to update location preference:', error);
      // Optionally revert local state or show an error message to the user
      // profile.value.locationSharingEnabled = !enabled; // Revert optimistic update
    }
  }

  // --- Authentication Actions ---
  /**
   * Internal function to set authentication state after successful login/token validation.
   * Parses the token, stores data in state and localStorage, and fetches the user profile.
   * @param status - The HTTP status code (should be 200).
   * @param tokenStr - The JWT token string.
   * @param userEmail - The email of the logged-in user.
   */
  async function _handleSuccessfulAuth(status: number, tokenStr: string, userEmail: string) {
    if (status !== 200 || !tokenStr) {
      console.error('_handleSuccessfulAuth called with invalid status or token.');
      return;
    }
    console.log('Handling successful authentication...');
    try {
      const tokenParts = tokenStr.split('.');
      if (tokenParts.length !== 3) throw new Error('Invalid JWT format');

      const payload = JSON.parse(atob(tokenParts[1]));
      if (!payload.role || !payload.userId) throw new Error('Missing role or userId in JWT payload');

      // Update state
      role.value = payload.role;
      userId.value = payload.userId?.toString();
      token.value = tokenStr;
      username.value = userEmail;
      isAuthenticated.value = true;

      // Store in localStorage
      localStorage.setItem('token', tokenStr);
      localStorage.setItem('username', userEmail);
      localStorage.setItem('role', payload.role);
      localStorage.setItem('userId', payload.userId?.toString() || '');

      console.log('Auth state set, fetching profile...');
      // Fetch profile AFTER successful login
      await fetchUserProfile();

    } catch (error) {
      console.error('Error processing token or fetching profile:', error);
      clearAuthState(); // Clear state if token parsing or profile fetch fails
    }
  }

  /**
   * Attempts to log in the user with email and password.
   * Handles both direct login and the start of 2FA flow.
   * On successful direct login (status 200), sets auth state and fetches profile.
   * Returns the full Axios response for handling 2FA (status 202) or errors.
   * @param userEmail - User's email.
   * @param password - User's password.
   * @returns Full Axios response object.
   */
  async function verifyLogin(userEmail: string, password: string) {
    console.log(`Attempting login for: ${userEmail}`);
    try {
      const response = await fetchToken({ username: userEmail, password });
      console.log('Login API response status:', response.status);

      // Handle successful direct login (no 2FA required or already verified)
      if (response.status === 200 && response.data.token && !response.data.isUsing2FA) {
        await _handleSuccessfulAuth(response.status, response.data.token, userEmail);
      }
      // If status is 202, it means 2FA is required - the calling component handles this.
      // If status is an error, it will be caught below.

      return response; // Return full response for caller to handle 2FA or errors
    } catch (error) {
      console.error('Login verification failed:', error);
      clearAuthState(); // Clear state on login failure
      throw error; // Re-throw for the component to handle
    }
  }

  /**
   * Registers a new user and attempts to log them in immediately.
   * @param userData - User registration data.
   */
  async function registerUser(userData: RegistrationData) {
    console.log(`Attempting registration for: ${userData.email}`);
    try {
      await register(userData); // Call registration API
      console.log('Registration successful, attempting login...');
      // After successful registration, attempt login (which includes profile fetch)
      await verifyLogin(userData.email, userData.password);
    } catch (error) {
      console.error('Registration or subsequent login failed:', error);
      clearAuthState(); // Clear state if registration/login fails
      throw error; // Re-throw for component
    }
  }

  /**
   * Requests the backend to send a 2FA code to the user's email.
   * @param userEmail - The email to send the code to.
   */
  async function send2FACodeToEmail(userEmail: string) {
    console.log(`Requesting 2FA code for: ${userEmail}`);
    try {
      await send2FACode(userEmail);
      console.log('2FA code request sent.');
    } catch (error) {
      console.error('Error sending 2FA code request:', error);
      throw error; // Re-throw for component
    }
  }

  /**
   * Verifies a 2FA code entered by the user against the backend.
   * On successful verification (status 200), sets auth state and fetches profile.
   * Returns the full Axios response.
   * @param userEmail - User's email.
   * @param code - The 2FA code entered by the user.
   * @returns Full Axios response object.
   */
  async function verify2FACodeInput(userEmail: string, code: number) {
    console.log(`Verifying 2FA code for: ${userEmail}`);
    try {
      const response = await verify2FACode(userEmail, code); // Call verification API
      console.log('2FA Verification API response status:', response.status);

      // Handle successful 2FA verification
      if (response.status === 200 && response.data.token) {
        await _handleSuccessfulAuth(response.status, response.data.token, userEmail);
      }

      return response; // Return full response for caller
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      // Don't necessarily clear auth state here, as the initial login attempt might still be partially valid
      throw error; // Re-throw for component
    }
  }

  /**
   * Logs the user out by clearing all local state and stored data.
   */
  function logout() {
    console.log('Logging out user...');
    clearAuthState();
    // Optionally: Call a backend logout endpoint if it exists
    // api.post('/auth/logout');
  }

  // --- Computed Properties ---
  /** Checks if the user is currently authenticated. */
  const loggedIn = computed(() => isAuthenticated.value);
  /** Checks if the user has SUPERADMIN role. */
  const isSuperAdminUser = computed(() => role.value === 'SUPERADMIN');
  /** Checks if the user has ADMIN or SUPERADMIN role. */
  const isAdminUser = computed(() => role.value === 'ADMIN' || role.value === 'SUPERADMIN');

  // --- Store Interface ---
  return {
    // State
    token,
    username,
    role,
    userId,
    isAuthenticated,
    profile, // Exposes the extended profile object
    currentUserLocation,
    locationError,
    isLocationLoading,
    locationStatus,

    // Actions - Auth & Profile
    initializeFromStorage,
    verifyLogin,
    registerUser,
    send2FACodeToEmail,
    verify2FACodeInput,
    logout,
    fetchUserProfile,
    updateLocationPreference,

    // Actions - Location (Primarily for use by useGeolocation)
    setLocation,
    setLocationError,
    setLocationLoading,

    // Computed Getters
    loggedIn,
    isAdminUser,
    isSuperAdminUser
  };
});
