import api from '@/services/api/AxiosInstance';
import type { AxiosResponse } from 'axios'; // Import AxiosResponse type

/**
 * Creates a new event by sending event data to the backend API.
 * Makes a POST request to the '/crisis-events' endpoint with the provided event info.
 * Automatically includes the authentication token if available.
 *
 * @param {Object} eventData - Contains the event details to be created, such as:
 * @param {string} eventData.name - The name of the event (mapped from title)
 * @param {number} eventData.latitude - The latitude coordinate of the event
 * @param {number} eventData.longitude - The longitude coordinate of the event
 * @param {string} [eventData.address] - The address of the event (optional if coordinates are given)
 * @param {number} eventData.radius - The effective radius around the event in meters
 * @param {string} eventData.severity - The severity of the event (green, yellow, red)
 * @param {string} eventData.description - A description of the event
 * @param {string} eventData.startTime - The start time of the event (ISO format)
 * @returns {Promise<AxiosResponse>} Promise resolving to the server response
 * @throws {Error} When the event creation fails or network issues occur.
 */
export async function createEvent(eventData: any): Promise<AxiosResponse> {
  // Assuming this function remains as is, ensure the eventData structure matches backend CreateCrisisEventDto
  return await api.post('/crisis-events', eventData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Creates a new POI by sending data to the backend API.
 * Makes a POST request to the '/api/poi' endpoint with the provided info.
 * Automatically includes the authentication token if available.
 *
 * @param {Object} poiData - Contains the POI details to be created (matching CreatePoiDto).
 * @param {string} poiData.name - The name of the POI (mapped from title)
 * @param {number} poiData.latitude - The latitude coordinate of the POI
 * @param {number} poiData.longitude - The longitude coordinate of the POI
 * @param {number} poiData.poiTypeId - The integer ID of the POI type
 * @param {string} [poiData.address] - The address of the POI (optional)
 * @param {string} [poiData.description] - A description of the POI (optional)
 * @param {string} [poiData.openingHours] - Opening hours as a string (optional)
 * @param {string} [poiData.contactInfo] - Contact information (optional)
 * @returns {Promise<AxiosResponse>} Promise resolving to the server response.
 * @throws {Error} When the POI creation fails or network issues occur.
 */
export async function createPOI(poiData: any): Promise<AxiosResponse> {
  // *** MODIFIED: Corrected the endpoint URL ***
  // The backend PoiController uses '/api/poi' for POST requests
  return await api.post('/poi', poiData, {
    // *** END MODIFIED ***
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


/**
 * Fetches all current crisis events from the backend API.
 * Makes a GET request to the '/crisis-events/all' endpoint.
 * Automatically includes the authentication token if available.
 * @returns {Promise<AxiosResponse<any>>} Server response with a list of events.
 */
export async function getCurrentEvents(): Promise<AxiosResponse<any>> {
  return await api.get('/crisis-events/all', { // Backend endpoint might need adjustment if pagination is used
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Updates an existing crisis event in the backend.
 * Sends a PUT request to the '/crisis-events/{id}' endpoint with the updated event data.
 * @param {number} id - The ID of the event to update.
 * @param {object} eventData  - An object containing the updated event fields (matching UpdateCrisisEventDto).
 * @returns  {Promise<AxiosResponse<any>>} A promise resolving to the server response after the update operation.
 */
export async function updateCurrentEvent(id: number, eventData: any): Promise<AxiosResponse<any>> {
  // Assuming this function remains as is, ensure eventData matches UpdateCrisisEventDto
  return await api.put('/crisis-events/'+ id, eventData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Fetches all the admin users from the backend API. 
 * Sends a GET request to the '/super-admin/all' endpoint to retrieve a list of all admin users. 
 * @returns {Promise<AxiosResponse<any>>} Server response with a list of admin users.
 */
export async function getAdminUsers() {
  return await api.get('/super-admin/all', {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Creates a new admin user. 
 * Sends a POST request to the '/super-admin' endpoint with the new adnmin user email. 
 * @returns  {Promise<AxiosResponse<any>>} A promise resolving to the server response after the post operation.
 */
export async function addNewAdmin(userID: number, adminEmail: string) {
  return await api.post('/super-admin/add/' + userID, adminEmail, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Removes the admin role, changes it to normal user role, in backend API. 
 * Sends a put request to the '/super-admin/revoke/{id}' endpoint with the admin user ID. 
 * @returns  {Promise<AxiosResponse<any>>} A promise resolving to the server response after the update operation.
 */
export async function revokeAdminRights(adminID: number) {
  return await api.put('/super-admin/revoke/' + adminID, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Removes the admin role, changes it to normal user role, in backend API. 
 * Sends a put request to the '/super-admin/revoke/{id}' endpoint with the admin user ID. 
 * 
 * Still not created in backend!!!!
 * 
 * @returns 
 */
export async function sendNewPasswordLink(email: string) {
  return await api.post('/super-admin/link/' + email, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function getUserId(email: string) {
  return await api.get('/super-admin/change this when u know' + email, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
