/**
 * HTTP client configuration module with Axios.
 *
 * This module configures a central Axios instance for all API requests,
 * with preset base URL and authentication handling through interceptors.
 *
 * @module AxiosInstance
 */
import axios from 'axios';

/**
 * Preconfigured Axios instance for API requests.
 *
 * Sets up a reusable client with:
 * - Base URL pointing to the backend API
 * - Request interceptors for authentication
 *
 * @constant
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

/**
 * Request interceptor that automatically injects authentication tokens.
 *
 * Checks localStorage for an available token and adds it as a Bearer
 * token in the Authorization header of outgoing API requests.
 *
 * @param {import('axios').AxiosRequestConfig} config - The request configuration
 * @returns {import('axios').AxiosRequestConfig} The modified request config with auth header
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})

export default api;
