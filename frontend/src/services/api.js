import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (process.env.NODE_ENV === 'production'
    ? "https://parental-ai-backend.onrender.com/api"
    : "http://localhost:3000/api")
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;