import api from "../lib/axios.js";
export const getActivity = pid => api.get(`/api/projects/${pid}/activity`).then(r=>r.data);
