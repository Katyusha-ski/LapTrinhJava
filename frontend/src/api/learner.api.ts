import { httpClient } from "./httpClient";

export interface LearnerProfile {
  id: number;
  userId: number;
  mentorId?: number | null;
  name?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  englishLevel?: string | null;
  learningGoals?: string | null;
  currentStreak?: number | null;
  totalPracticeHours?: number | null;
  averagePronunciationScore?: number | null;
  createdAt?: string | null;
}

export interface LearnerMutationRequest {
  userId: number;
  mentorId?: number | null;
  englishLevel?: string | null;
  learningGoals?: string | null;
  currentStreak?: number | null;
  totalPracticeHours?: number | null;
  averagePronunciationScore?: number | null;
}

export const learnerApi = {
  getAll: (page?: number, size?: number) =>
    httpClient<{ content: LearnerProfile[]; totalElements: number }>("/api/learners", { 
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) }
    }),
  
  getById: (id: number) => 
    httpClient<LearnerProfile>(`/api/learners/${id}`),
  
  getByUserId: (userId: number) => 
    httpClient<LearnerProfile>(`/api/learners/by-user/${userId}`),
  
  create: (data: LearnerMutationRequest) =>
    httpClient<LearnerProfile>("/api/learners", { 
      method: "POST", 
      body: JSON.stringify(data) 
    }),
  
  update: (id: number, data: LearnerMutationRequest) =>
    httpClient<LearnerProfile>(`/api/learners/${id}`, { 
      method: "PUT", 
      body: JSON.stringify(data) 
    }),
  
  delete: (id: number) =>
    httpClient(`/api/learners/${id}`, { method: "DELETE" }),

  assignMentor: (learnerId: number, mentorId: number) =>
    httpClient<LearnerProfile>(`/api/learners/${learnerId}/assign-mentor/${mentorId}`, {
      method: "POST",
    }),
};
