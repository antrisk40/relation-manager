import axios from 'axios';
import { User, CreateUserDto, UpdateUserDto, GraphData } from '../types/user';

const resolvedEnvUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
const API_BASE_URL = resolvedEnvUrl || (import.meta.env.DEV ? '/api' : `${window.location.origin}/api`);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  link: async (userId: string, friendId: string): Promise<void> => {
    await api.post(`/users/${userId}/link`, { friendId });
  },

  unlink: async (userId: string, friendId: string): Promise<void> => {
    await api.delete(`/users/${userId}/unlink`, { params: { friendId } });
  },
};

export const graphApi = {
  getGraphData: async (): Promise<GraphData> => {
    const response = await api.get<GraphData>('/graph');
    return response.data;
  },
};

export default api;

