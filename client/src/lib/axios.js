import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 — but NOT on the auth endpoints themselves
// (so wrong-password errors show a toast instead of hard-redirecting)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthEndpoint =
      url.includes("/api/auth/login") || url.includes("/api/auth/register");

    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("tf_token");
      localStorage.removeItem("tf_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
