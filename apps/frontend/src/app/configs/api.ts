import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
const apiKey = import.meta.env.VITE_X_API_KEY as string;

const axiosInstance = axios.create({
  baseURL: backendUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  },
})

export default axiosInstance;
