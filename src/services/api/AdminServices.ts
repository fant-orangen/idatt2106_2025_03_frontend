import api from '@/services/api/AxiosInstance';
import type { AxiosResponse } from 'axios';

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
 */
export async function createEvent(eventData: any): Promise<AxiosResponse> {
  return await api.post('/admin/crisis-events', eventData, {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Get all current crisis events.
 */
export async function getCurrentEvents(): Promise<AxiosResponse<any>> {
  return await api.get('/crisis-events/all', {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Updates an existing crisis event.
 * @param id - ID of the event to update.
 * @param eventData - Data to update.
 */
export async function updateCurrentEvent(id: number, eventData: any): Promise<AxiosResponse<any>> {
  return await api.put(`/admin/crisis-events/${id}`, eventData, {
    headers: { 'Content-Type': 'application/json' }
  });
}


/**
 * Create a new POI.
 */
export async function createPOI(poiData: any): Promise<AxiosResponse> {
  return await api.post('/admin/poi', poiData, {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Get all admin users.
 */
export async function getAdminUsers(): Promise<AxiosResponse<any>> {
  return await api.get('/super-admin/all', {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Add a new admin user.
 */
export async function addNewAdmin(userID: number): Promise<AxiosResponse<any>> {
  return await api.put(`/super-admin/add/${userID}`, null, {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Revoke admin rights from a user.
 */
export async function revokeAdminRights(adminID: number): Promise<AxiosResponse<any>> {
  return await api.put(`/super-admin/revoke/${adminID}`, null, {
    headers: { 'Content-Type': 'application/json' }
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
