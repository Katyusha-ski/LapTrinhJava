import { httpClient } from './httpClient';

export const conversationApi = {
  list: (query?: Record<string, any>) => httpClient('/api/conversations', { query }),
  get: (id: string) => httpClient(`/api/conversations/${id}`),
  create: (payload: any) => httpClient('/api/conversations', { method: 'POST', body: JSON.stringify(payload) }),
};
