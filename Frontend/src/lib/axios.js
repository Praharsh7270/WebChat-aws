import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "/api";

export const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

