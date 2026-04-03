import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';
const apiKey = import.meta.env.VITE_X_API_KEY as string | undefined;

/**
 * Shared Axios instance for the backend API (`/api/...`). Matches Nest global prefix and `x-api-key` guard.
 */
export const httpClient = axios.create({
  baseURL: backendUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
  },
});
