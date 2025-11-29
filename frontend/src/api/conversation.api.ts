import { httpClient } from "./httpClient";

export interface AIConversation {
  id: number;
  sessionId: number;
  speaker: "USER" | "AI" | null;
  message?: string | null;
  correctedMessage?: string | null;
  grammarErrors?: string[];
  vocabularySuggestions?: string[];
  createdAt?: string | null;
}

export interface SendAudioResponse {
  conversationId?: number | null;
  aiResponse?: string | null;
  feedback?: string | null;
  pronunciationScore?: number | null;
  fluencyScore?: number | null;
  accuracyScore?: number | null;
  audioUrl?: string | null;
}

export interface CreateConversationRequest {
  sessionId: number;
  speaker: "USER" | "AI";
  message: string;
  correctedMessage?: string;
  grammarErrors?: string[];
  vocabularySuggestions?: string[];
}

export interface UpdateConversationRequest {
  message?: string;
  correctedMessage?: string;
  grammarErrors?: string[];
  vocabularySuggestions?: string[];
}

export const conversationApi = {
  list: (page?: number, size?: number) =>
    httpClient<{ content: AIConversation[]; totalElements: number }>("/api/conversations", {
      query: { ...(page !== undefined && { page }), ...(size !== undefined && { size }) },
    }),

  get: (id: number) => httpClient<AIConversation>(`/api/conversations/${id}`),

  getBySession: (sessionId: number) =>
    httpClient<AIConversation[]>(`/api/conversations/session/${sessionId}`),

  getRecentBySession: (sessionId: number, limit?: number) =>
    httpClient<AIConversation[]>(`/api/conversations/session/${sessionId}/recent`, {
      query: { ...(limit !== undefined && { limit }) },
    }),

  create: (payload: CreateConversationRequest) =>
    httpClient<AIConversation>("/api/conversations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, data: UpdateConversationRequest) =>
    httpClient<AIConversation>(`/api/conversations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) => httpClient(`/api/conversations/${id}`, { method: "DELETE" }),

  sendAudioMessage: (sessionId: number, audio?: Blob, userMessage?: string) => {
    const formData = new FormData();
    formData.append("sessionId", String(sessionId));
    if (audio) {
      formData.append("audio", audio, "speech.webm");
    }
    if (userMessage) {
      formData.append("userMessage", userMessage);
    }
    return httpClient<SendAudioResponse>("/api/conversations/send-message", {
      method: "POST",
      body: formData,
    });
  },
};
