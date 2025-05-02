// src/stores/UserStore.ts

/**
 * User store module for global user state management.
 *
 * This Pinia store manages the application's user authentication state,
 * profile data (including location sharing preference), and provides
 * methods for login, registration, profile updates, and related auth flows.
 *
 * @module UserStore
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import api from '@/services/api/AxiosInstance.ts';
import { fetchToken, register, send2FACode, verify2FACode } from '@/services/api/AuthService.ts';
import type { RegistrationData, UserProfile } from '@/models/User.ts';
import { useGeolocationStore } from './GeolocationStore'; // Import GeolocationStore for cleanup

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
  // Add role if it comes from the profile endpoint
  role?: string;
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
    const storedRole = localStorage.getItem('role'); // Still useful as initial guess
    const storedUserId = localStorage.getItem('userId'); // Still useful as initial guess

    if (storedToken && storedUsername && storedRole && storedUserId) {
      // Temporarily set state from storage
      token.value = storedToken;
      username.value = storedUsername;
      // Set role/userId temporarily from storage, will be overwritten by profile fetch
      role.value = storedRole;
      userId.value = storedUserId;


      try {
        // Validate the token with the backend
        console.log('Validating token...');
        await api.get('/auth/validate'); // Endpoint checks token from interceptor

        // Token is valid, set authenticated state *tentatively*
        // The profile fetch will confirm/update role/userId
        isAuthenticated.value = true;
        console.log('Token validated successfully.');

        // Fetch the full user profile - this will update role/userId correctly
        await fetchUserProfile();

        // If profile fetch failed, clear state
        if (!profile.value) {
          console.warn('Profile fetch failed during initialization, clearing auth state.');
          clearAuthState();
        } else {
          console.log('UserStore initialized successfully.');
        }

      } catch (error) {
        console.error('Token validation failed or profile fetch failed during init:', error);
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
   * Clears all authentication and profile state.
   * Removes relevant items from localStorage.
   * Also clears geolocation state.
   */
  function clearAuthState() {
    console.log('UserStore: Clearing auth and profile state...');
    token.value = null;
    username.value = null;
    role.value = null;
    userId.value = null;
    isAuthenticated.value = false;
    profile.value = null; // Clear profile

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');

    // Clear geolocation state from the other store
    const geolocationStore = useGeolocationStore();
    geolocationStore.clearLocationState();
  }

  // --- User Profile Actions ---
  /**
   * Fetches the current user's profile data from the backend.
   * Requires the user to be authenticated (token must be set).
   * Updates the `profile` ref on success and also updates `role` and `userId` from profile data.
   */
  async function fetchUserProfile() {
    // Ensure token is set before fetching profile (even if isAuthenticated might be slightly delayed)
    if (!token.value) {
      console.warn('Cannot fetch profile: No token available.');
      return;
    }
    console.log('Fetching user profile...');
    try {
      // Assumes backend endpoint '/api/users/me' returns UserProfileExtended data
      const response = await api.get<UserProfileExtended>('/users/me');
      profile.value = response.data;

      // --- Update role and userId based on fetched profile ---
      if (profile.value) {
        // Assuming the profile DTO includes the role and ID
        role.value = profile.value.role || null; // Adjust based on actual profile DTO field name
        userId.value = profile.value.id?.toString() || null; // Adjust based on actual profile DTO field name
        // Ensure isAuthenticated reflects successful profile fetch
        isAuthenticated.value = true;
        console.log('User profile fetched successfully, updated role/userId:', profile.value);
      } else {
        console.warn('User profile fetched but data is null/empty.');
        // Consider clearing auth if profile is essential and failed to load
        // clearAuthState();
      }

    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Handle error appropriately - maybe logout if unauthorized (401)
      if ((error as any)?.response?.status === 401) {
        console.log('Unauthorized fetching profile, clearing auth state.');
        clearAuthState();
      }
      // Clear profile on error? Or keep potentially stale data? Clearing is safer.
      profile.value = null;
      role.value = null;
      userId.value = null;
      // Don't set isAuthenticated to false here unless it's a 401,
      // as the token might still be technically valid but profile endpoint failed
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
   * Sets isAuthenticated to true *after* profile fetch succeeds.
   * @param status - The HTTP status code (should be 200).
   * @param tokenStr - The JWT token string.
   * @param userEmail - The email of the logged-in user.
   */
  async function _handleSuccessfulAuth(status: number, tokenStr: string, userEmail: string) {
    if (status !== 200 || !tokenStr) {
      console.error('_handleSuccessfulAuth called with invalid status or token.');
      clearAuthState(); // Clear state on invalid input
      return;
    }
    console.log('Handling successful authentication...');

    // Set token first so fetchUserProfile is authorized
    token.value = tokenStr;
    username.value = userEmail; // Set username tentatively

    try {
      // --- Fetch Profile BEFORE setting final auth state ---
      console.log('Token set, fetching profile...');
      await fetchUserProfile();

      // Check if profile fetch succeeded (it updates role, userId, and potentially isAuthenticated)
      if (!profile.value || !isAuthenticated.value) {
        console.error('Profile fetch failed after successful authentication API call. Clearing state.');
        // fetchUserProfile likely already called clearAuthState on critical failure (like 401)
        // If it failed for other reasons, ensure state is clean.
        if (isAuthenticated.value || token.value) { // Avoid redundant clear if already cleared
          clearAuthState();
        }
        return; // Stop the process
      }

      // --- Profile fetched successfully, state (role, userId, isAuthenticated) is updated ---
      // --- Now store in localStorage ---
      console.log('Profile fetched, storing auth state to localStorage...');
      localStorage.setItem('token', tokenStr);
      localStorage.setItem('username', userEmail); // Store the provided email
      localStorage.setItem('role', role.value || ''); // Store the role from fetched profile
      localStorage.setItem('userId', userId.value || ''); // Store the userId from fetched profile

      console.log('Authentication and profile fetch fully completed.');

    } catch (error) {
      // This catch block might be redundant if fetchUserProfile handles its errors well,
      // but acts as a safety net.
      console.error('Unexpected error during profile fetch or state storage in _handleSuccessfulAuth:', error);
      clearAuthState(); // Ensure cleanup on any unexpected error
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
        // _handleSuccessfulAuth now includes profile fetching
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
      // verifyLogin now calls _handleSuccessfulAuth which fetches the profile
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
        // _handleSuccessfulAuth now includes profile fetching
        await _handleSuccessfulAuth(response.status, response.data.token, userEmail);
      }

      return response; // Return full response for caller
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      // Don't necessarily clear auth state here, as the initial login attempt might still be partially valid
      // If _handleSuccessfulAuth fails above, it will clear the state.
      throw error; // Re-throw for component
    }
  }

  /**
   * Logs the user out by clearing all local state and stored data.
   * Calls clearAuthState which now also clears geolocation state.
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
  /** Checks if the user has SUPERADMIN role (reads from reactive `role` ref). */
  const isSuperAdminUser = computed(() => role.value === 'SUPERADMIN');
  /** Checks if the user has ADMIN or SUPERADMIN role (reads from reactive `role` ref). */
  const isAdminUser = computed(() => role.value === 'ADMIN' || role.value === 'SUPERADMIN');
  /** Computed property for the user's location sharing preference */
  const locationSharingEnabled = computed(() => profile.value?.locationSharingEnabled ?? false);


  // --- Store Interface ---
  return {
    // State
    token,
    username,
    role,
    userId,
    isAuthenticated,
    profile, // Exposes the extended profile object

    // Actions - Auth & Profile
    initializeFromStorage,
    verifyLogin,
    registerUser,
    send2FACodeToEmail,
    verify2FACodeInput,
    logout,
    fetchUserProfile,
    updateLocationPreference,

    // Computed Getters
    loggedIn,
    isAdminUser,
    isSuperAdminUser,
    locationSharingEnabled, // Expose the computed preference
  };
});
