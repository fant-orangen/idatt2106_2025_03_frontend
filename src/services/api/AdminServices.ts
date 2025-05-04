import api from '@/services/api/AxiosInstance'
import type { AxiosResponse } from 'axios' // Import AxiosResponse type
import type {  CrisisEventDto, UpdateCrisisEventDto, CreateCrisisEventDto} from '@/models/CrisisEvent'
import type { Page } from '@/types/Page.ts'

/**
 * Edit existing POI.
 * @param id - ID of the POI to edit.
 * @param updateData - The data to update.
 */
export async function editPoi(id: number, updateData: any): Promise<AxiosResponse> {
  return await api.put(`/admin/poi/${id}`, updateData, {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Delete a POI by ID.
 * @param id - ID of the POI to delete.
 */
export async function deletePoi(id: number): Promise<void> {
  await api.delete(`/admin/poi/${id}`, {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Create a new crisis event.
 * 
 */
export async function createEvent(eventData: CreateCrisisEventDto): Promise<AxiosResponse> {
  return await api.post('/admin/crisis-events', eventData, {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Get all current crisis events.
 * 
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 */
export async function getCurrentEvents(page = 0, size = 20): Promise<Page<CrisisEventDto>> {
  try {
    const response = await api.get<Page<CrisisEventDto>>('/public/crisis-events/all', {
        params: { page, size },
        headers: { 'Content-Type': 'application/json' },
      });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch paginated crisis events', error);
    throw error;
  }
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
  return await api.put(`/admin/crisis-events/${id}`, eventData, { //mulig denne fortsatt er bare /crisis-events/id
    headers: { 'Content-Type': 'application/json' }
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
  return await api.put('/admin/crisis-events/deactivate/'+ id, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


/**
 * Creates a new point of interest.
 */
export async function createPOI(poiData: any): Promise<AxiosResponse> {
  return await api.post('/admin/poi', poiData, {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Fetches all the admin users from the backend API. 
 * Sends a GET request to the '/super-admin/all' endpoint to retrieve a list of all admin users. 
 * @returns {Promise<AxiosResponse<any>>} Server response with a list of admin users.
 */
export async function getAdminUsers() {
  return await api.get<Page<any>>('/super-admin/all', {
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
