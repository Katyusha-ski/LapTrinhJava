import { httpClient } from './httpClient';

export interface PracticeSession {
  id: number;
  learnerId: number;
  mentorId: number;
  startTime?: string | null;
  endTime?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  topic?: string | null;
  duration?: number | null;
}

// Backend uses /api/practice-sessions
export const sessionApi = {
  // Get all sessions (admin)
  getAll: (page?: number, size?: number) =>
    httpClient<{ content: PracticeSession[]; totalElements: number }>('/api/practice-sessions', {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  // Create new practice session
  createSession: (payload: any) => httpClient('/api/practice-sessions', { method: 'POST', body: JSON.stringify(payload) }),

  // Get sessions for a learner
  getLearnerSessions: (learnerId: number) => httpClient(`/api/practice-sessions/learner/${learnerId}`),

  // Get sessions for a mentor
  getMentorSessions: (mentorId: number) => httpClient(`/api/practice-sessions/mentor/${mentorId}`),

  // Update session status: PUT /api/practice-sessions/{id}/status?status=...
  updateSessionStatus: (id: number, status: string) => httpClient(`/api/practice-sessions/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' }),

  // Delete session
  deleteSession: (id: number) => httpClient(`/api/practice-sessions/${id}`, { method: 'DELETE' }),

  // Get session by id
  getSessionById: (id: number) => httpClient(`/api/practice-sessions/${id}`),
};
