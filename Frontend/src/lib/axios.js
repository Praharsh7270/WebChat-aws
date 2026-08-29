import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "/api";

export const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  if (window.Clerk) {
    if (window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn("Failed to get Clerk token", err);
      }
    }

    if (window.Clerk.user) {
      const u = window.Clerk.user;
      const fullName =
        u.fullName ||
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        "";
      const email =
        u.primaryEmailAddress?.emailAddress ||
        u.emailAddresses?.[0]?.emailAddress ||
        "";
      const profilePic = u.imageUrl || "";

      if (fullName) config.headers["x-user-fullname"] = encodeURIComponent(fullName);
      if (email) config.headers["x-user-email"] = encodeURIComponent(email);
      if (profilePic) config.headers["x-user-image"] = encodeURIComponent(profilePic);
    }
  }
  return config;
});

