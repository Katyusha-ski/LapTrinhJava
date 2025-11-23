import { httpClient } from './httpClient';

export const topicApi = {
  list: () => httpClient('/api/topics'),
  get: (id: string) => httpClient(`/api/topics/${id}`),
};
