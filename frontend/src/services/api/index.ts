import { getTheCallingAPI } from './client';
import axios from 'axios';

// Ensure JWT cookies are always sent with requests
axios.defaults.withCredentials = true;

// Global interceptor to handle session expiry (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

const api = getTheCallingAPI();

export const getHealth = api.getHealth;
export const postApiAuthLogin = api.postApiAuthLogin;
export const postApiAuthLogout = api.postApiAuthLogout;
export const getApiUsersMe = api.getApiUsersMe;
export const listUsers = api.listUsers;
export const createRequest = api.createRequest;
export const listRequests = api.listRequests;
export const getRequest = api.getRequest;
export const updateRequest = api.updateRequest;

// Mapped names for backward compatibility with existing files
export const getApiRequests = api.listRequests;
export const getApiRequestById = api.getRequest;
export const postApiRequests = api.createRequest;
export const patchApiRequest = api.updateRequest;
