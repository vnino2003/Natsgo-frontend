// src/services/api/http.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15000
});

// Optional: log errors nicely
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // keep default error but with cleaner message
    return Promise.reject(err);
  }
);

export default api;
