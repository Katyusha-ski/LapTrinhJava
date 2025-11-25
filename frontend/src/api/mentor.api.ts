import { httpClient } from "./httpClient";
import type { Mentor, MentorSearchParams } from "../types/mentor";
import type { LearnerProfile } from "./learner.api";

export interface MentorProfile {
  id: number;
  userId: number;
  specialty?: string | null;
  yearsExperience?: number | null;
  qualifications?: string | null;
  avgRating?: number | null;
  totalReviews?: number | null;
  hourlyRate?: number | null;
  availability?: boolean | null;
  bio?: string | null;
  certifications?: string | null;
  createdAt?: string | null;
}

export interface CreateMentorRequest {
  specialty: string;
  yearsExperience: number;
  qualifications: string;
  hourlyRate: number;
  bio?: string;
  certifications?: string;
}

export interface UpdateMentorRequest {
  specialty?: string;
  yearsExperience?: number;
  qualifications?: string;
  hourlyRate?: number;
  availability?: boolean;
  bio?: string;
  certifications?: string;
}

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
  getAll: (page?: number, size?: number) => 
    httpClient<{ content: Mentor[]; totalElements: number }>("/api/mentors", {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  getById: (id: number) =>
    httpClient<Mentor>(`/api/mentors/${id}`),

  getByUserId: (userId: number) =>
    httpClient<Mentor>(`/api/mentors/by-user/${userId}`),

  search: (params?: MentorSearchParams) =>
    httpClient<Mentor[]>("/api/mentors/search", {
      query: sanitizeParams(params),
    }),

  getBySpecialty: (specialty: string, page?: number, size?: number) =>
    httpClient<{ content: Mentor[]; totalElements: number }>("/api/mentors/specialty", {
      query: { specialty, ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  getAvailableMentors: (page?: number, size?: number) =>
    httpClient<{ content: Mentor[]; totalElements: number }>("/api/mentors/available", {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  create: (data: CreateMentorRequest) =>
    httpClient<Mentor>("/api/mentors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateMentorRequest) =>
    httpClient<Mentor>(`/api/mentors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    httpClient(`/api/mentors/${id}`, { method: "DELETE" }),

  toggleAvailability: (mentorId: number) =>
    httpClient<Mentor>(`/api/mentors/${mentorId}/toggle-availability`, {
      method: "PATCH",
    }),

  assignMentor: (learnerId: number, mentorId: number) =>
    httpClient<LearnerProfile>(`/api/learners/${learnerId}/assign-mentor/${mentorId}`, {
      method: "POST",
    }),

  updateRating: (id: number, rating: number) =>
    httpClient<Mentor>(`/api/mentors/${id}/rating`, {
      method: "PATCH",
      body: JSON.stringify({ rating }),
    }),
};
