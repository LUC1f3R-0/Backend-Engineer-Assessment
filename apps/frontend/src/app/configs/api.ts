import axios from "axios";

const backendUrl = "https://backend-engineer-assessment-534959216168.asia-south1.run.app" ?? "http://localhost:3000";
const apiKey = import.meta.env.VITE_X_API_KEY ?? "x9gGn0G47o3cgPv3jIuVAYSCaRa00wy63J30rpYiGvxVWSr9JqlWT4c4OiuPkbQg";

const axiosInstance = axios.create({
  baseURL: backendUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  },
})

export default axiosInstance;
