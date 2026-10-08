import api from "../lib/axios.js";
export const getProjects = () => api.get("/api/projects").then(r=>r.data);
export const createProject = d => api.post("/api/projects",d).then(r=>r.data);
export const getProject = id => api.get(`/api/projects/${id}`).then(r=>r.data);
export const updateProject = (id,d) => api.put(`/api/projects/${id}`,d).then(r=>r.data);
export const deleteProject = id => api.delete(`/api/projects/${id}`).then(r=>r.data);
export const addMember = (id,d) => api.post(`/api/projects/${id}/members`,d).then(r=>r.data);
export const removeMember = (id,uid) => api.delete(`/api/projects/${id}/members/${uid}`).then(r=>r.data);
