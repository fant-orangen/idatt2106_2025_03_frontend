/**
 * User store module for global user state management.
 *
 * This Pinia store manages the application's user authentication state,
 * including login, registration, profile management, and authentication tokens.
 *
 * @module UserStore
 */
import { defineStore } from 'pinia';
import { fetchToken } from '@/services/api/AuthService.ts';
import { register } from '@/services/api/AuthService.ts';
import { computed, ref } from 'vue';
import api from '@/services/api/AxiosInstance.ts';
import type { RegistrationData, UserProfile } from '@/models/User.ts'

/**
 * Defines and exports the user store for global user state management.
 *
 * Provides reactive state for user authentication, profile data, and
 * methods for login, registration, and profile management.
 */
export const useUserStore = defineStore("user", () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const username = ref<string | null>(localStorage.getItem('username'));
  const role = ref<string | null>(localStorage.getItem('role'));
  const userId = ref<string | null>(localStorage.getItem('userId'));

  const profile = ref<UserProfile>({ // Use the UserProfile interface
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });


  /**
   * Processes a successful login response.
   *
   * Updates store state with authentication information and persists
   * the data to localStorage.
   *
   * @param {number} status - HTTP status code from login response
   * @param {string} tokenStr - JWT token string from authentication
   * @param {string} userEmail - User's email address
   * @returns {void}
   * @private
   */
  function login(status: number, tokenStr: string, userEmail: string) { // Changed 'user' to 'userEmail' for clarity
    if (status === 200) {
      token.value = tokenStr;
      username.value = userEmail; // Store email as username identifier

      // Extract role and userId from token and save to localStorage
      const tokenParts = tokenStr.split('.');
      // **** START CORRECTION ****
      // Check if the token looks like a valid JWT (3 parts) before parsing
      if (tokenParts.length === 3) {
        // **** END CORRECTION ****
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          role.value = payload.role;
          userId.value = payload.userId?.toString(); // Ensure userId is stored as string
          if (payload.role) localStorage.setItem('role', payload.role);
          if (payload.userId) localStorage.setItem('userId', payload.userId.toString()); // Store as string
        } catch (error) {
          console.error("Error parsing token payload during login:", error); // Changed console message
          // Handle error, maybe clear invalid token? Could clear role/userId here.
          role.value = null;
          userId.value = null;
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
        }
      } else {
        console.error("Invalid token format received during login."); // Keep this log
        // Handle invalid token format - Ensure role/userId are cleared
        role.value = null;
        userId.value = null;
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
      }

      localStorage.setItem('token', tokenStr);
      localStorage.setItem('username', userEmail); // Store email in localStorage
    } else {
      throw new Error("Login Info Error");
    }
  }

  /**
   * Authenticates a user with email and password.
   *
   * Calls the authentication API and processes the response.
   *
   * @param {string} userEmail - User's email address
   * @param {string} password - User's password
   * @returns {Promise<void>} Promise that resolves upon successful login
   * @throws {Error} If authentication fails due to invalid credentials or network errors
   */
  async function verifyLogin(userEmail: string, password: string) { // Renamed 'user' to 'userEmail'
    try {
      console.log(`Starting login for user: ${userEmail}`);
      // Use userEmail for the 'username' field expected by fetchToken
      const response = await fetchToken({ username: userEmail, password: password });
      console.log("Login response:", response.data);

      const tokenStr = response.data.token;

      if (response.status !== 200 || !tokenStr) {
        throw new Error("Login Info Error: Invalid status or missing token");
      }

      login(response.status, tokenStr, userEmail); // Pass userEmail here
    } catch (error) {
      console.error("Login error:", error);
      // Clear potentially bad state if login fails
      logout(); // Consider calling logout on failure
      throw error;
    }
  }

  /**
   * Registers a new user account and automatically logs in.
   *
   * Sends registration data to the backend API and then attempts to authenticate
   * with the provided credentials.
   *
   * @param {RegistrationData} userData - User registration details
   * @returns {Promise<void>} Promise that resolves upon successful registration and login
   * @throws {Error} If registration or subsequent login fails
   */
  async function registerUser(userData: RegistrationData) {
    try {
      await register(userData);
      await verifyLogin(userData.email, userData.password);
    } catch (error) {
      console.error("Registration or subsequent login failed:", error);
      throw error;
    }
  }


  /**
   * Fetches the current user's profile from the backend.
   *
   * Updates the store's profile state with the retrieved information.
   *
   * @returns {Promise<void>} Promise that resolves when profile is successfully fetched
   * @throws {Error} If the API request fails
   */
  async function fetchProfile() {
    try {
      const response = await api.get('/users/profile');
      // Map backend response to the profile ref structure
      profile.value = {
        email: response.data.email || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phone: response.data.phone || ''
      };
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // Reset profile on error
      profile.value = { email: '', firstName: '', lastName: '', phone: ''};
      throw error;
    }
  }


  /**
   * Updates the user's profile by sending updated data to the backend.
   * The payload must match the backend's UserCreateDto structure.
   *
   * @param updatedProfile - An object matching UserProfile interface, plus the required password.
   */
    // The payload for update must match UserCreateDto
  interface UpdatePayload extends UserProfile {
    password?: string; // New password (optional)
    currentPassword?: string; // Current password for verification (required by backend endpoint logic)
  }

  /**
   * Updates the user's profile information.
   *
   * Sends updated profile data to the backend API and updates the local state.
   *
   * @param {UpdatePayload} updatedProfile - Updated profile data including password for verification
   * @returns {Promise<void>} Promise that resolves when profile is successfully updated
   * @throws {Error} If the update fails or password is missing
   */
  async function updateProfile(updatedProfile: UpdatePayload) { // Use the extended payload type
    try {
      // Construct the payload matching UserUpdateDto (or similar backend DTO)
      const payload = {
        email: updatedProfile.email,
        password: updatedProfile.password, // Send new password if provided
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        currentPassword: updatedProfile.currentPassword // <-- Include currentPassword
      };

      // Check if current password is provided, backend requires it for verification
      if (!payload.currentPassword) {
        throw new Error("Current password is required to update profile.");
      }


      const response = await api.put('/users/profile', payload);

      // Update local profile state with the response from the backend
      // Ensure mapping matches UserProfile interface
      profile.value = {
        email: response.data.email || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phone: response.data.phone || '',
      };
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  /**
   * Logs out the current user.
   *
   * Clears all authentication state from memory and localStorage.
   *
   * @returns {void}
   */
  function logout() {
    token.value = null;
    username.value = null;
    role.value = null;
    userId.value = null; // Clear userId
    profile.value = { email: '', firstName: '', lastName: '', phone: ''};
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId'); // Remove userId from storage
  }

  /** Computed property indicating if a user is logged in with a valid ID */
  const isLoggedInUser = computed(() => {
    return userId.value !== null && userId.value !== '0';
  });

  /** Computed property indicating if user is authenticated with a token */
  const loggedIn = computed(() => token.value !== null);

  /** Computed getter for the username */
  const getUsername = computed(() => username.value);

  /** Computed getter for the authentication token */
  const getToken = computed(() => token.value);

  /** Computed getter for the user ID */
  const getUserId = computed(() => userId.value);

  /** Computed getter for the user role */
  const getUserRole = computed(() => role.value);

  const isSuperAdminUser = computed(() => role.value === 'SUPER_ADMIN');

  const isAdminUser = computed (() => role.value === 'ADMIN' || role.value === 'SUPER_ADMIN');

  return {
    token,
    username,
    profile,
    role,
    userId,
    login,
    verifyLogin,
    registerUser,
    fetchProfile,
    updateProfile,
    logout,
    loggedIn,
    getUsername,
    getToken,
    getUserId,
    getUserRole,
    isLoggedInUser,
    isAdminUser,
    isSuperAdminUser
  };
});
