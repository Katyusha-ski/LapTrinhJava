import { httpClient } from "./httpClient";

export interface LearnerProfile {
  id: number;
  userId: number;
  mentorId?: number | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  englishLevel?: string | null;
  learningGoals?: string | null;
  currentStreak?: number | null;
  totalPracticeHours?: number | null;
  averagePronunciationScore?: number | null;
  createdAt?: string | null;
}

export const learnerApi = {
  getByUserId: (userId: number) => httpClient<LearnerProfile>(`/api/learners/by-user/${userId}`),
};
