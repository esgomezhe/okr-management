import { apiClient } from './apiServices';

export class BaseService {
  constructor(resource) {
    this.resource = resource;
  }

  async getAll(params = {}) {
    const response = await apiClient.get(`/${this.resource}/`, { params });
    return response.data;
  }

  async getById(id) {
    const response = await apiClient.get(`/${this.resource}/${id}/`);
    return response.data;
  }

  async create(data) {
    const response = await apiClient.post(`/${this.resource}/`, data);
    return response.data;
  }

  async update(id, data) {
    const response = await apiClient.put(`/${this.resource}/${id}/`, data);
    return response.data;
  }

  async delete(id) {
    const response = await apiClient.delete(`/${this.resource}/${id}/`);
    return response.data;
  }

  async patch(id, data) {
    const response = await apiClient.patch(`/${this.resource}/${id}/`, data);
    return response.data;
  }
} 