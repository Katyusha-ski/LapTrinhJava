import { httpClient } from "./httpClient";
import type { Mentor, MentorSearchParams } from "../types/mentor";
import type { LearnerProfile } from "./learner.api";

const sanitizeParams = (params?: MentorSearchParams) => {
  if (!params) return undefined;
  const query: Record<string, string | number | boolean> = {};

  if (params.skill) {
    query.skill = params.skill;
  }
  if (params.level) {
    query.level = params.level;
  }
  if (typeof params.minRating === "number") {
    query.minRating = params.minRating;
  }
  if (typeof params.maxRate === "number") {
    query.maxRate = params.maxRate;
  }
  if (typeof params.onlyAvailable === "boolean") {
    query.onlyAvailable = params.onlyAvailable;
  }

  return query;
};

export const mentorApi = {
  getAll: () => httpClient<Mentor[]>("/api/mentors"),
  search: (params?: MentorSearchParams) =>
    httpClient<Mentor[]>("/api/mentors/search", {
      query: sanitizeParams(params),
    }),
  toggleAvailability: (mentorId: number) =>
    httpClient<Mentor>(`/api/mentors/${mentorId}/availability`, {
      method: "PATCH",
    }),
  assignMentor: (learnerId: number, mentorId: number) =>
    httpClient<LearnerProfile>(`/api/learners/${learnerId}/assign-mentor/${mentorId}`, {
      method: "POST",
    }),
};
