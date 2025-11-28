import type { EnglishLevel } from "./shared";

export interface Mentor {
  id: number;
  userId: number;
  fullName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  experienceYears?: number | null;
  hourlyRate?: number | null;
  rating?: number | null;
  totalStudents?: number | null;
  isAvailable: boolean;
  isActive?: boolean;
  skills: string[];
  supportedLevels: EnglishLevel[];
}

export interface MentorSearchParams {
  skill?: string;
  level?: EnglishLevel;
  minRating?: number;
  maxRate?: number;
  onlyAvailable?: boolean;
}
