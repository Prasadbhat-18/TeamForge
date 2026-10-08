import api from "../lib/axios.js";
export const getTasks = (pid,params) => api.get(`/api/projects/${pid}/tasks`,{params}).then(r=>r.data);
export const createTask = (pid,d) => api.post(`/api/projects/${pid}/tasks`,d).then(r=>r.data);
export const updateTask = (id,d) => api.put(`/api/tasks/${id}`,d).then(r=>r.data);
export const patchTaskStatus = (id,d) => api.patch(`/api/tasks/${id}/status`,d).then(r=>r.data);
export const deleteTask = id => api.delete(`/api/tasks/${id}`).then(r=>r.data);
