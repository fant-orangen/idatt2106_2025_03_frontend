import api from '@/services/api/AxiosInstance';

/**
* Creates a new event by sending event data to the backend API.
* Makes a POST request to the '/crisis-events' endpoint with the provided event info.
* Automatically includes the authentication token if available.
*
* @param {Object} eventData - Contains the event details to be created, such as:
* @param {string} eventData.title - The title of the event
* @param {number} eventData.latitude - The latitude coordinate of the event
* @param {number} eventData.longitude - The longitude coordinate of the event
* @param {string} [eventData.address] - The address of the event (optional if coordinates are given)
* @param {number} eventData.radius - The effective radius around the event in meters
* @param {string} eventData.priority - The priority of the event (Lav, Middels, Høy)
* @param {string} eventData.description - A description of the event
* @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the server response
* @throws {Error} When the event creation fails or network issues occur.
*/
export async function createEvent(eventData: any) {
  return await api.post('/crisis-events', eventData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
* Creates a new POI by sending data to the backend API.
* Makes a POST request to the '/POI' endpoint with the provided info.
* Automatically includes the authentication token if available.
*
* @param {Object} poiData - Contains the event details to be created, such as:
* @param {string} poiData.title - The title of the POI
* @param {number} poiData.latitude - The latitude coordinate of the POI
* @param {number} poiData.longitude - The longitude coordinate of the POI
* @param {string} [poiData.address] - The address of the POI (optional if coordinates are given)
* @param {string} poiData.type - The type of POI
* @param {string} poiData.openfrom - The opening hours from-time
* @param {string} poiData.opento - The opening hours to-time
* @param {string} poiData.contactinfo - The contact number for the POI
* @param {string} poiData.description - A description of the POI
* @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the server response
* @throws {Error} When the POI creation fails or network issues occur.
*/
export async function createPOI(poiData: any) {
  return await api.post('/POI', poiData, { // change url when made
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


/**
 * Fetches all current crisis events from the backend API.
 * Makes a GET request to the '/crisis-events/all' endpoint.
 * Automatically includes the authentication token if available.
 * @returns {Promise<AxiosResponse<any, any>>} Server response with a list of events.
 */
export async function getCurrentEvents() {
  return await api.get('/crisis-events/all', {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Updates an existing crisis event in the backend.
 * Sends a PUT request to the '/crisis-events/{id}' endpoint with the updated event data.
 * @param {number} id - The ID of the event to update.
 * @param {object} eventData  - An object containing the updated event fields.
 * @returns  {Promise<AxiosResponse<any, any>>} A promise resolving to the server response after the update operation.
 */
export async function updateCurrentEvent(id: number, eventData: any) {
  return await api.put('/crisis-events/'+ id, eventData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
