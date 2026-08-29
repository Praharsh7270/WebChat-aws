import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "/api";

export const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  if (window.Clerk && window.Clerk.session) {
    try {
      const token = await window.Clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Failed to get Clerk token", err);
    }
  }
  return config;
});

