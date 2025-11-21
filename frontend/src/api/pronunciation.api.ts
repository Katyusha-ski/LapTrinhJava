import { httpClient } from './httpClient';

// Backend expects POST /api/pronunciation with JSON body (PronunciationScoreRequest)
export const pronunciationApi = {
  submitScore: (payload: any) => httpClient('/api/pronunciation', { method: 'POST', body: JSON.stringify(payload) }),
  getScoresByLearner: (learnerId: number) => httpClient(`/api/pronunciation/learner/${learnerId}`),
  getScoresBySession: (sessionId: number) => httpClient(`/api/pronunciation/session/${sessionId}`),
  getScoreById: (id: number) => httpClient(`/api/pronunciation/${id}`),
};
