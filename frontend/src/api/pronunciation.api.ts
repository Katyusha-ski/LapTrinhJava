import { httpClient } from './httpClient';

export interface PronunciationScore {
  id: number;
  learnerId: number;
  sessionId?: number | null;
  word?: string | null;
  scorePercentage?: number | null;
  feedback?: string | null;
  recordingUrl?: string | null;
  createdAt?: string | null;
}

export interface SubmitPronunciationRequest {
  word: string;
  scorePercentage: number;
  sessionId?: number;
  recordingUrl?: string;
}

export interface UpdatePronunciationRequest {
  word?: string;
  scorePercentage?: number;
  feedback?: string;
  recordingUrl?: string;
}

export const pronunciationApi = {
  submit: (payload: SubmitPronunciationRequest) =>
    httpClient<PronunciationScore>('/api/pronunciation', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getById: (id: number) =>
    httpClient<PronunciationScore>(`/api/pronunciation/${id}`),

  getScoresByLearner: (learnerId: number, page?: number, size?: number) =>
    httpClient<{ content: PronunciationScore[]; totalElements: number }>(`/api/pronunciation/learner/${learnerId}`, {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  getScoresBySession: (sessionId: number, page?: number, size?: number) =>
    httpClient<{ content: PronunciationScore[]; totalElements: number }>(`/api/pronunciation/session/${sessionId}`, {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  update: (id: number, data: UpdatePronunciationRequest) =>
    httpClient<PronunciationScore>(`/api/pronunciation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    httpClient(`/api/pronunciation/${id}`, { method: 'DELETE' }),

  getAverageScore: (learnerId: number) =>
    httpClient<{ averageScore: number }>(`/api/pronunciation/learner/${learnerId}/average`),
};
