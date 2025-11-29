import { httpClient } from "./httpClient";

export interface Topic {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  keywords?: string | null;
  sampleQuestions?: string[];
  isActive?: boolean | null;
  createdAt?: string | null;
  createdBy?: number | null;
}

type RawTopic = {
  id?: number | null;
  title?: string | null;
  name?: string | null;
  topic_name?: string | null;
  category?: string | null;
  topic_category?: string | null;
  level?: string | null;
  cefr_level?: string | null;
  cefrLevel?: string | null;
  description?: string | null;
  keywords?: string | string[] | null;
  difficultyKeywords?: string[] | null;
  difficulty_keywords?: string[] | null;
  sampleQuestions?: string[] | null;
  sample_questions?: string[] | null;
  isActive?: boolean | null;
  is_active?: boolean | null;
  createdAt?: string | null;
  created_at?: string | null;
  createdBy?: number | null;
  created_by?: number | null;
};

type RawTopicCollection = RawTopic[] | { content?: RawTopic[] } | null | undefined;

const normalizeKeywords = (value?: string | string[] | null): string | null => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value;
};

const normalizeTopic = (raw: RawTopic | null | undefined): Topic | null => {
  if (!raw) return null;
  const title = raw.title?.trim() || raw.name?.trim() || raw.topic_name?.trim();
  const level = raw.level || raw.cefr_level || raw.cefrLevel;
  const category = raw.category || raw.topic_category;
  const sampleQuestions = raw.sampleQuestions || raw.sample_questions || undefined;
  const keywords =
    normalizeKeywords(raw.keywords) ??
    normalizeKeywords(raw.difficultyKeywords) ??
    normalizeKeywords(raw.difficulty_keywords);

  return {
    id: raw.id ?? 0,
    title: title || `Chủ đề #${raw.id ?? "?"}`,
    description: raw.description ?? null,
    category: category ?? null,
    level: level ? level.toUpperCase() : null,
    keywords: keywords ?? null,
    sampleQuestions,
    isActive: raw.isActive ?? raw.is_active ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    createdBy: raw.createdBy ?? raw.created_by ?? null,
  };
};

const normalizeCollection = (payload: RawTopicCollection): Topic[] => {
  const collection = Array.isArray(payload) ? payload : payload?.content ?? [];
  return collection
    .map((raw) => normalizeTopic(raw))
    .filter((topic): topic is Topic => topic !== null);
};

export interface CreateTopicRequest {
  title: string;
  description?: string;
  category: string;
  level: string;
  keywords?: string;
}

export interface UpdateTopicRequest {
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  keywords?: string;
}

export const topicApi = {
  list: async (page?: number, size?: number): Promise<Topic[]> => {
    const payload = await httpClient<RawTopicCollection>("/api/topics", {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    });
    const topics = normalizeCollection(payload);
    return topics;
  },

  listAll: async (): Promise<Topic[]> => {
    const payload = await httpClient<RawTopicCollection>("/api/topics/all");
    return normalizeCollection(payload);
  },

  get: async (id: number): Promise<Topic> => {
    const payload = await httpClient<RawTopic>(`/api/topics/${id}`);
    const topic = normalizeTopic(payload);
    if (!topic) {
      throw new Error("Topic not found");
    }
    return topic;
  },

  getByCategory: async (category: string, page?: number, size?: number): Promise<Topic[]> => {
    const payload = await httpClient<RawTopicCollection>(`/api/topics/category/${encodeURIComponent(category)}`, {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    });
    return normalizeCollection(payload);
  },

  getByLevel: async (level: string, page?: number, size?: number): Promise<Topic[]> => {
    const payload = await httpClient<RawTopicCollection>(`/api/topics/level/${encodeURIComponent(level)}`, {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    });
    return normalizeCollection(payload);
  },

  search: async (keyword: string, page?: number, size?: number): Promise<Topic[]> => {
    const payload = await httpClient<RawTopicCollection>("/api/topics/search", {
      query: { keyword, ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    });
    return normalizeCollection(payload);
  },

  create: (data: CreateTopicRequest) =>
    httpClient<Topic>("/api/topics", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateTopicRequest) =>
    httpClient<Topic>(`/api/topics/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    httpClient(`/api/topics/${id}`, { method: "DELETE" }),
};
