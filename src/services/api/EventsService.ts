import api from '@/services/api/AxiosInstance';

/**
* Creates a new event by sending event data to the backend API.
* Makes a POST request to the '/events' endpoint witht he provided event info. 
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
  return await api.post('/events', eventData, { // change the url when the end point is created
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
