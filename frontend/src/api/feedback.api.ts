import { httpClient } from './httpClient';

export interface FeedbackResponse {
  id: number;
  learnerId?: number | null;
  learnerName?: string | null;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderatedBy?: string | null;
  moderatedAt?: string | null;
  createdAt?: string | null;
}

export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page
  size: number;
}

export const listFeedbacks = async (page = 0, size = 20, status?: string) => {
  const query: Record<string, string | number | boolean> = { page, size };
  if (status) query.status = status;
  return httpClient<PagedResult<FeedbackResponse>>('/api/admin/feedbacks', { method: 'GET', query });
};

export const moderateFeedback = async (id: number, status: string) => {
  return httpClient<FeedbackResponse>(`/api/admin/feedbacks/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' });
};

export const deleteFeedback = async (id: number) => {
  return httpClient<void>(`/api/admin/feedbacks/${id}`, { method: 'DELETE' });
};

export const submitFeedback = async (payload: { learnerId: number; content: string }) => {
  return httpClient<FeedbackResponse>('/api/feedback', { method: 'POST', body: JSON.stringify(payload) });
};
