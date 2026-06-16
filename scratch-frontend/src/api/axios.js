import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  // send cookies automatically with every request
});

// Refresh instance (no interceptors)
const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

// REQUEST INTERCEPTOR
// run after every request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR
// run after every response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const authRoutes = [
      "/user/login",
      "/user/register",
      "/user/forgot-password",
      "/user/reset-password",
      "/user/refresh-token",
    ];

    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/user/refresh-token" && !authRoutes.includes(originalRequest.url)
    ) {
      originalRequest._retry = true;
      // Handle unauthorized access

      try {
        // try to refresh token
        const { data } = await refreshApi.post("/user/refresh-token");
        accessToken = data.accessToken;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        accessToken = null;
        window.location.href = "/login"; // redirect to login page
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
