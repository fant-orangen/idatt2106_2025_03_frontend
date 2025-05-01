import api from '@/services/api/AxiosInstance'
import type { AxiosResponse } from 'axios' // Import AxiosResponse type
import { type CrisisEventDto, type UpdateCrisisEventDto } from '@/models/CrisisEvent'
import type { Page } from '@/types/Page.ts'

/**
 * Edit existing POI.
 * @param id - ID of the POI to edit.
 * @param updateData - The data to update.
 */
export async function editPoi(id: number, updateData: any): Promise<AxiosResponse> {
  return await api.put(`/poi/${id}`, updateData, {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Delete a POI by ID.
 * @param id - ID of the POI to delete.
 */
export async function deletePoi(id: number): Promise<void> {
  await api.delete(`/poi/${id}`, {
    headers: { 'Content-Type': 'application/json' }
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
  return await api.post('/poi', poiData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Creates a new event by sending event data to the backend API.
 * Makes a POST request to the '/crisis-events' endpoint with the provided event info.
 * Automatically includes the authentication token if available.
 *
 * @param {Object} eventData - Contains the event details to be created, such as: name, latitude, longitude, 
 * address, radius, severity, description, starttime.
 *     
 * @returns {Promise<AxiosResponse>} Promise resolving to the server response
 */
export async function createEvent(eventData: CrisisEventDto): Promise<AxiosResponse> {
  return await api.post('/crisis-events', eventData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Updates an existing crisis event in the backend.
 * Sends a PUT request to the '/crisis-events/{id}' endpoint with the updated event data.
 * 
 * @param {number} id - The ID of the event to update.
 * @param {object} eventData  - An object containing the updated event fields (matching UpdateCrisisEventDto).
 * @returns  {Promise<AxiosResponse<any>>} A promise resolving to the server response after the update operation.
 */
export async function updateCurrentEvent(id: number, eventData: UpdateCrisisEventDto): Promise<AxiosResponse<any>> {
  console.log('Got this info from update: ', eventData);
  return await api.put('/crisis-events/'+ id, eventData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


/**
 * Deactivates a current event. Sets the event to inactive in the backend API. 
 * Calls a PUT request to the '/crisis-events/deactivate/{id}' endpoint. 
 * 
 * @param id - The ID of the event chosen to be deactivated. 
 * @returns { Promise<AxiosResponse<any>> }A promise resolving to the server response after the update operation.
 */
export async function deactivateCurrentEvent(id: number): Promise<AxiosResponse<any>> {
  return await api.put('/crisis-events/deactivate/'+ id, {
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
  return await api.get<Page<CrisisEventDto>>('/super-admin/all', {
    params: { size: 20 },
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Creates a new admin user. 
 * Sends a PUT request to the '/super-admin' endpoint with the new adnmin user email. 
 * @returns  {Promise<AxiosResponse<any>>} A promise resolving to the server response after the post operation.
 */
export async function addNewAdmin(userID: number): Promise<AxiosResponse<any>> {
  return await api.put(`/super-admin/add/${userID}`, null, {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Removes the admin role, changes it to normal user role, in backend API. 
 * Sends a put request to the '/super-admin/revoke/{id}' endpoint with the admin user ID. 
 * @returns  {Promise<AxiosResponse<any>>} A promise resolving to the server response after the update operation.
 */
export async function revokeAdminRights(adminID: number) {
  const id = adminID.toString();
  console.log('Admin id from AdminServices: ', id);
  return await api.put('/super-admin/revoke/' + id, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Get user ID by email.
 */
export async function getUserId(email: string): Promise<AxiosResponse<any>> {
  return await api.get(`/super-admin/user-info/${email}`, {
    headers: { 'Content-Type': 'application/json' }
  });
}
