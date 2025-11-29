import { httpClient } from "./httpClient";

export interface LearningPackage {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  durationDays?: number | null;
  features?: string[] | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const packageApi = {
  list: async (): Promise<LearningPackage[]> => {
    const payload = await httpClient<LearningPackage[]>("/api/packages");
    return Array.isArray(payload) ? payload : [];
  },

  get: async (id: number): Promise<LearningPackage> => {
    return httpClient<LearningPackage>(`/api/packages/${id}`);
  },
};
