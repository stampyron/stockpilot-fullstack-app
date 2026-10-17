import axios from "axios";

export const BACKEND_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong";
}

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path}`;
}

export default api;
