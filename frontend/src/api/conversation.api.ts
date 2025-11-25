import { httpClient } from './httpClient';

export interface AIConversation {
  id: number;
  learnerId: number;
  topicId?: number | null;
  conversationContent?: string | null;
  feedbackFromAI?: string | null;
  duration?: number | null;
  qualityScore?: number | null;
  createdAt?: string | null;
}

export interface CreateConversationRequest {
  topicId?: number;
  conversationContent: string;
}

export interface UpdateConversationRequest {
  conversationContent?: string;
  feedbackFromAI?: string;
  qualityScore?: number;
}

export const conversationApi = {
  list: (page?: number, size?: number) =>
    httpClient<{ content: AIConversation[]; totalElements: number }>('/api/conversations', {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  get: (id: number) =>
    httpClient<AIConversation>(`/api/conversations/${id}`),

  getByLearner: (learnerId: number, page?: number, size?: number) =>
    httpClient<{ content: AIConversation[]; totalElements: number }>(`/api/conversations/learner/${learnerId}`, {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  getByTopic: (topicId: number, page?: number, size?: number) =>
    httpClient<{ content: AIConversation[]; totalElements: number }>(`/api/conversations/topic/${topicId}`, {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  create: (payload: CreateConversationRequest) =>
    httpClient<AIConversation>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, data: UpdateConversationRequest) =>
    httpClient<AIConversation>(`/api/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    httpClient(`/api/conversations/${id}`, { method: 'DELETE' }),

  generateFeedback: (id: number) =>
    httpClient<AIConversation>(`/api/conversations/${id}/generate-feedback`, {
      method: 'POST',
    }),
};
