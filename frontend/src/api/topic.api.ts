import { httpClient } from './httpClient';

export interface Topic {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  keywords?: string | null;
  createdAt?: string | null;
  createdBy?: number | null;
}

export interface CreateTopicRequest {
  title: string;
  description?: string;
  category: string;
  level: string;
  keywords?: string;
}

export interface UpdateTopicRequest {
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  keywords?: string;
}

export const topicApi = {
  list: (page?: number, size?: number) =>
    httpClient<{ content: Topic[]; totalElements: number }>('/api/topics', {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  get: (id: number) =>
    httpClient<Topic>(`/api/topics/${id}`),

  getByCategory: (category: string, page?: number, size?: number) =>
    httpClient<{ content: Topic[]; totalElements: number }>('/api/topics/category', {
      query: { category, ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  getByLevel: (level: string, page?: number, size?: number) =>
    httpClient<{ content: Topic[]; totalElements: number }>('/api/topics/level', {
      query: { level, ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  search: (keyword: string, page?: number, size?: number) =>
    httpClient<{ content: Topic[]; totalElements: number }>('/api/topics/search', {
      query: { keyword, ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  create: (data: CreateTopicRequest) =>
    httpClient<Topic>('/api/topics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateTopicRequest) =>
    httpClient<Topic>(`/api/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    httpClient(`/api/topics/${id}`, { method: 'DELETE' }),
};
