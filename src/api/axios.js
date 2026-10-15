// src/api/axios.js
import axios from "axios";

export const TOKEN_KEY = "taskpulse_token";
export const USER_KEY = "taskpulse_user";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Before every request: attach the JWT if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// After every response: if the token is expired/invalid, go back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Turns any error into a readable message
export function errorMessage(err) {
  if (!err.response) return "Cannot reach the server. Is the backend running?";
  const data = err.response.data;
  if (data?.errors) return Object.values(data.errors).join(", ");
  return data?.message || "Something went wrong";
}

export default api;