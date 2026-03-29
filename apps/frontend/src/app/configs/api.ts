import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: backendUrl,
  timeout: 15000,
  headers: {"Content-Type": "application/json"},
})

export default axiosInstance;
