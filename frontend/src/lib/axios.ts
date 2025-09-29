import axios from "axios";

const api = axios.create({
// src/lib/api.tsF
 baseURL: import.meta.env.VITE_API_URL || '/api',
 headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      localStorage.removeItem("token");

      const isLoginRequest = error.config.url.includes("/api/login");

      if (token && !isLoginRequest) {
        console.log("Session expirée, redirection vers login");
        if (window.location.pathname !== "/") {
          window.dispatchEvent(
            new CustomEvent("auth-redirect", {
              detail: { to: "/" },
            })
          );
        }
      }

    }
    return Promise.reject(error);
  })


export default api;