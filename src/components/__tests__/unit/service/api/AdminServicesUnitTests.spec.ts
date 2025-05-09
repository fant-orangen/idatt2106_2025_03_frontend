/**
 * Unit Tests for AdminServices
 *
 * This file contains comprehensive unit tests for all functions in the AdminServices module.
 * Each function is tested for:
 * 1. Correct API endpoint calls with appropriate parameters
 * 2. Successful response handling
 * 3. Error handling
 *
 * The tests use Vitest's mocking capabilities to mock axios calls and verify
 * that the functions interact with the API as expected without making actual HTTP requests.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  editPoi,
  deletePoi,
  createEvent,
  getCurrentEvents,
  updateCurrentEvent,
  deactivateCurrentEvent,
  createPOI,
  getAdminUsers,
  addNewAdmin,
  revokeAdminRights,
  getUserId
} from '@/services/api/AdminServices';
import type { Page } from '@/types/Page';
import type { CrisisEventDto, UpdateCrisisEventDto, CreateCrisisEventDto } from '@/models/CrisisEvent';

// Mock the api module from AxiosInstance
vi.mock('@/services/api/AxiosInstance', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn()
        }
      }
    }
  };
});

// Import the mocked api
import api from '@/services/api/AxiosInstance';

describe('AdminServices', () => {

  afterEach(() => {
    vi.clearAllMocks(); // Clear mocks after each test
  });

  /**
   * Tests for editPoi function
   *
   * editPoi allows administrators to update existing points of interest.
   * It sends a PUT request to the '/admin/poi/{id}' endpoint with the updated POI data.
   */
  describe('editPoi', () => {
    it('should call the editPoi API endpoint with correct data', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const poiId = 123;
      const updateData = { name: 'New Name' };
      const expectedUrl = `/admin/poi/${poiId}`;

      mockAxiosPut.mockResolvedValue({ data: { message: 'POI updated' } });

      await editPoi(poiId, updateData);

      expect(mockAxiosPut).toHaveBeenCalledWith(expectedUrl, updateData, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve with the axios response', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const mockResponse = { data: { message: 'POI updated' }, status: 200 };
      mockAxiosPut.mockResolvedValue(mockResponse);

      const response = await editPoi(123, { name: 'New Name' });

      expect(response).toBe(mockResponse);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      mockAxiosPut.mockRejectedValue(new Error('API Error'));

      await expect(editPoi(123, { name: 'New Name' })).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for deletePoi function
   *
   * deletePoi allows administrators to remove points of interest from the system.
   * It sends a DELETE request to the '/admin/poi/{id}' endpoint.
   */
  describe('deletePoi', () => {
    it('should call the deletePoi API endpoint with correct ID', async () => {
      const mockAxiosDelete = vi.mocked(api.delete);
      const poiId = 456;
      const expectedUrl = `/admin/poi/${poiId}`;

      mockAxiosDelete.mockResolvedValue({ status: 200 });

      await deletePoi(poiId);

      expect(mockAxiosDelete).toHaveBeenCalledWith(expectedUrl, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve if the axios call succeeds', async () => {
      const mockAxiosDelete = vi.mocked(api.delete);
      mockAxiosDelete.mockResolvedValue({ status: 200 });

      await expect(deletePoi(456)).resolves.not.toThrow();
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosDelete = vi.mocked(api.delete);
      mockAxiosDelete.mockRejectedValue(new Error('API Error'));

      await expect(deletePoi(456)).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for createEvent function
   *
   * createEvent allows administrators to create new crisis events in the system.
   * It sends a POST request to the '/admin/crisis-events' endpoint with the event data.
   */
  describe('createEvent', () => {
    it('should call the createEvent API endpoint with correct data', async () => {
      const mockAxiosPost = vi.mocked(api.post);
      const eventData = { name: 'Test Event' };
      const expectedUrl = '/admin/crisis-events';

      mockAxiosPost.mockResolvedValue({ data: { id: 1 } });

      await createEvent(eventData);

      expect(mockAxiosPost).toHaveBeenCalledWith(expectedUrl, eventData, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve with the axios response', async () => {
      const mockAxiosPost = vi.mocked(api.post);
      const mockResponse = { data: { id: 1 }, status: 201 };
      mockAxiosPost.mockResolvedValue(mockResponse);

      const response = await createEvent({ name: 'Test Event' });

      expect(response).toBe(mockResponse);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosPost = vi.mocked(api.post);
      mockAxiosPost.mockRejectedValue(new Error('API Error'));

      await expect(createEvent({ name: 'Test Event' })).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for getCurrentEvents function
   *
   * getCurrentEvents retrieves a paginated list of all current crisis events.
   * It sends a GET request to the '/public/crisis-events/all' endpoint with pagination parameters.
   * This function returns the data property of the response, which is a Page<CrisisEventDto> object.
   */
  describe('getCurrentEvents', () => {
    it('should call the getCurrentEvents API endpoint with correct parameters', async () => {
      const mockAxiosGet = vi.mocked(api.get);
      const page = 1;
      const size = 10;
      const expectedUrl = '/public/crisis-events/all';
      const mockPageData: Page<CrisisEventDto> = {
        content: [{ id: 1, name: 'Test Event', description: 'Test Description', active: true }],
        pageable: {
          pageNumber: 1,
          pageSize: 10,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: 10,
          unpaged: false,
          paged: true
        },
        totalElements: 1,
        totalPages: 1,
        last: true,
        size: 10,
        number: 1,
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: 1,
        first: true,
        empty: false
      };

      mockAxiosGet.mockResolvedValue({ data: mockPageData });

      const result = await getCurrentEvents(page, size);

      expect(mockAxiosGet).toHaveBeenCalledWith(expectedUrl, {
        params: { page, size },
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockPageData);
    });

    it('should use default pagination parameters if not provided', async () => {
      const mockAxiosGet = vi.mocked(api.get);
      const expectedUrl = '/public/crisis-events/all';
      const mockPageData: Page<CrisisEventDto> = {
        content: [{ id: 1, name: 'Test Event', description: 'Test Description', active: true }],
        pageable: {
          pageNumber: 0,
          pageSize: 20,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: 0,
          unpaged: false,
          paged: true
        },
        totalElements: 1,
        totalPages: 1,
        last: true,
        size: 20,
        number: 0,
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: 1,
        first: true,
        empty: false
      };

      mockAxiosGet.mockResolvedValue({ data: mockPageData });

      const result = await getCurrentEvents();

      expect(mockAxiosGet).toHaveBeenCalledWith(expectedUrl, {
        params: { page: 0, size: 20 },
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockPageData);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosGet = vi.mocked(api.get);
      mockAxiosGet.mockRejectedValue(new Error('API Error'));

      await expect(getCurrentEvents()).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for updateCurrentEvent function
   *
   * updateCurrentEvent allows administrators to update existing crisis events.
   * It sends a PUT request to the '/admin/crisis-events/{id}' endpoint with the updated event data.
   */
  describe('updateCurrentEvent', () => {
    it('should call the updateCurrentEvent API endpoint with correct data', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const eventId = 123;
      const updateData = { name: 'Updated Event', description: 'Updated Description' };
      const expectedUrl = `/admin/crisis-events/${eventId}`;

      mockAxiosPut.mockResolvedValue({ data: { message: 'Event updated' } });

      await updateCurrentEvent(eventId, updateData);

      expect(mockAxiosPut).toHaveBeenCalledWith(expectedUrl, updateData, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve with the axios response', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const mockResponse = { data: { message: 'Event updated' }, status: 200 };
      mockAxiosPut.mockResolvedValue(mockResponse);

      const response = await updateCurrentEvent(123, { name: 'Updated Event' });

      expect(response).toBe(mockResponse);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      mockAxiosPut.mockRejectedValue(new Error('API Error'));

      await expect(updateCurrentEvent(123, { name: 'Updated Event' })).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for deactivateCurrentEvent function
   *
   * deactivateCurrentEvent allows administrators to set a crisis event as inactive.
   * It sends a PUT request to the '/admin/crisis-events/deactivate/{id}' endpoint.
   */
  describe('deactivateCurrentEvent', () => {
    it('should call the deactivateCurrentEvent API endpoint with correct ID', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const eventId = 456;
      const expectedUrl = '/admin/crisis-events/deactivate/' + eventId;

      mockAxiosPut.mockResolvedValue({ data: { message: 'Event deactivated' } });

      await deactivateCurrentEvent(eventId);

      expect(mockAxiosPut).toHaveBeenCalledWith(expectedUrl, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve with the axios response', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const mockResponse = { data: { message: 'Event deactivated' }, status: 200 };
      mockAxiosPut.mockResolvedValue(mockResponse);

      const response = await deactivateCurrentEvent(456);

      expect(response).toBe(mockResponse);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      mockAxiosPut.mockRejectedValue(new Error('API Error'));

      await expect(deactivateCurrentEvent(456)).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for createPOI function
   *
   * createPOI allows administrators to create new points of interest.
   * It sends a POST request to the '/admin/poi' endpoint with the POI data.
   */
  describe('createPOI', () => {
    it('should call the createPOI API endpoint with correct data', async () => {
      const mockAxiosPost = vi.mocked(api.post);
      const poiData = { name: 'New POI', latitude: 10.123, longitude: 20.456 };
      const expectedUrl = '/admin/poi';

      mockAxiosPost.mockResolvedValue({ data: { id: 1 } });

      await createPOI(poiData);

      expect(mockAxiosPost).toHaveBeenCalledWith(expectedUrl, poiData, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve with the axios response', async () => {
      const mockAxiosPost = vi.mocked(api.post);
      const mockResponse = { data: { id: 1 }, status: 201 };
      mockAxiosPost.mockResolvedValue(mockResponse);

      const response = await createPOI({ name: 'New POI' });

      expect(response).toBe(mockResponse);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosPost = vi.mocked(api.post);
      mockAxiosPost.mockRejectedValue(new Error('API Error'));

      await expect(createPOI({ name: 'New POI' })).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for getAdminUsers function
   *
   * getAdminUsers retrieves a list of all users with admin privileges.
   * It sends a GET request to the '/super-admin/all' endpoint.
   */
  describe('getAdminUsers', () => {
    it('should call the getAdminUsers API endpoint correctly', async () => {
      const mockAxiosGet = vi.mocked(api.get);
      const expectedUrl = '/super-admin/all';
      const mockAdminUsers = [{ id: 1, email: 'admin@example.com' }];

      mockAxiosGet.mockResolvedValue({ data: mockAdminUsers });

      await getAdminUsers();

      expect(mockAxiosGet).toHaveBeenCalledWith(expectedUrl, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve with the axios response', async () => {
      const mockAxiosGet = vi.mocked(api.get);
      const mockResponse = { data: [{ id: 1, email: 'admin@example.com' }], status: 200 };
      mockAxiosGet.mockResolvedValue(mockResponse);

      const response = await getAdminUsers();

      expect(response).toBe(mockResponse);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosGet = vi.mocked(api.get);
      mockAxiosGet.mockRejectedValue(new Error('API Error'));

      await expect(getAdminUsers()).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for addNewAdmin function
   *
   * addNewAdmin grants administrator privileges to a user.
   * It sends a PUT request to the '/super-admin/add/{userID}' endpoint.
   */
  describe('addNewAdmin', () => {
    it('should call the addNewAdmin API endpoint with correct user ID', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const userId = 789;
      const expectedUrl = `/super-admin/add/${userId}`;

      mockAxiosPut.mockResolvedValue({ data: { message: 'Admin rights granted' } });

      await addNewAdmin(userId);

      expect(mockAxiosPut).toHaveBeenCalledWith(expectedUrl, null, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve with the axios response', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const mockResponse = { data: { message: 'Admin rights granted' }, status: 200 };
      mockAxiosPut.mockResolvedValue(mockResponse);

      const response = await addNewAdmin(789);

      expect(response).toBe(mockResponse);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      mockAxiosPut.mockRejectedValue(new Error('API Error'));

      await expect(addNewAdmin(789)).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for revokeAdminRights function
   *
   * revokeAdminRights removes administrator privileges from a user.
   * It sends a PUT request to the '/super-admin/revoke/{id}' endpoint.
   */
  describe('revokeAdminRights', () => {
    it('should call the revokeAdminRights API endpoint with correct admin ID', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const adminId = 321;
      const expectedUrl = '/super-admin/revoke/' + adminId;

      mockAxiosPut.mockResolvedValue({ data: { message: 'Admin rights revoked' } });

      await revokeAdminRights(adminId);

      expect(mockAxiosPut).toHaveBeenCalledWith(expectedUrl, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve with the axios response', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      const mockResponse = { data: { message: 'Admin rights revoked' }, status: 200 };
      mockAxiosPut.mockResolvedValue(mockResponse);

      const response = await revokeAdminRights(321);

      expect(response).toBe(mockResponse);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosPut = vi.mocked(api.put);
      mockAxiosPut.mockRejectedValue(new Error('API Error'));

      await expect(revokeAdminRights(321)).rejects.toThrow('API Error');
    });
  });

  /**
   * Tests for getUserId function
   *
   * getUserId retrieves a user's ID by their email address.
   * It sends a GET request to the '/super-admin/user-info/{email}' endpoint.
   */
  describe('getUserId', () => {
    it('should call the getUserId API endpoint with correct email', async () => {
      const mockAxiosGet = vi.mocked(api.get);
      const email = 'user@example.com';
      const expectedUrl = `/super-admin/user-info/${email}`;

      mockAxiosGet.mockResolvedValue({ data: { id: 123 } });

      await getUserId(email);

      expect(mockAxiosGet).toHaveBeenCalledWith(expectedUrl, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should resolve with the axios response', async () => {
      const mockAxiosGet = vi.mocked(api.get);
      const mockResponse = { data: { id: 123 }, status: 200 };
      mockAxiosGet.mockResolvedValue(mockResponse);

      const response = await getUserId('user@example.com');

      expect(response).toBe(mockResponse);
    });

    it('should reject if the axios call fails', async () => {
      const mockAxiosGet = vi.mocked(api.get);
      mockAxiosGet.mockRejectedValue(new Error('API Error'));

      await expect(getUserId('user@example.com')).rejects.toThrow('API Error');
    });
  });
});
