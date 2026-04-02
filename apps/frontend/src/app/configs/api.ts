import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

console.log(backendUrl)
console.log("this is running second")

const axiosInstance = axios.create({
  baseURL: backendUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_X_API_KEY as string,
  },
})

export default axiosInstance;
