import axios from 'axios';
const resolvedEnvUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const API_BASE_URL = resolvedEnvUrl || (import.meta.env.DEV ? '/api' : `${window.location.origin}/api`);
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
export const userApi = {
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/users', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/users/${id}`);
    },
    link: async (userId, friendId) => {
        await api.post(`/users/${userId}/link`, { friendId });
    },
    unlink: async (userId, friendId) => {
        await api.delete(`/users/${userId}/unlink`, { params: { friendId } });
    },
};
export const graphApi = {
    getGraphData: async () => {
        const response = await api.get('/graph');
        return response.data;
    },
};
export default api;
