import api from "../lib/axios.js";
export const registerUser = d => api.post("/api/auth/register",d).then(r=>r.data);
export const loginUser = d => api.post("/api/auth/login",d).then(r=>r.data);
export const getMe = () => api.get("/api/auth/me").then(r=>r.data);
