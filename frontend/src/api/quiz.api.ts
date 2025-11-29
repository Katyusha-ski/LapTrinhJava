import { httpClient } from "./httpClient";
import type { EnglishLevel } from "../types/shared";

export type QuestionType = "MULTIPLE_CHOICE" | "FILL_IN_BLANK";

export interface StartQuizAttemptPayload {
  learnerId?: number;
  targetLevel?: EnglishLevel;
  questionType?: QuestionType;
  questionCount?: number;
  excludeQuestionIds?: number[];
}

export interface AnswerOptionDto {
  id: number;
  text: string;
}

export interface QuestionItemDto {
  id: number;
  text: string;
  level: EnglishLevel;
  topicArea?: string | null;
  answers: AnswerOptionDto[];
}

export interface StartQuizAttemptResponse {
  targetLevel: EnglishLevel;
  questionType: QuestionType;
  questionCount: number;
  questions: QuestionItemDto[];
}

export interface SubmitQuizAnswersPayload {
  answers: { questionId: number; answerId: number }[];
}

export interface QuestionEvaluationDto {
  questionId: number;
  level: EnglishLevel;
  correct: boolean;
}

export interface QuizAttemptResultResponse {
  evaluations: QuestionEvaluationDto[];
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
}

export interface AdaptiveAssessmentPayload {
  startingLevel: EnglishLevel;
  attemptResult: {
    evaluations: QuestionEvaluationDto[];
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
  };
}

export interface AdaptiveAssessmentResponse {
  startingLevel: EnglishLevel;
  baselineLevel: EnglishLevel;
  recommendedLevel: EnglishLevel;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export const quizApi = {
  startAttempt: (payload: StartQuizAttemptPayload) =>
    httpClient<StartQuizAttemptResponse>("/api/quiz/attempts/start", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  submitAnswers: (payload: SubmitQuizAnswersPayload) =>
    httpClient<QuizAttemptResultResponse>("/api/quiz/attempts/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  assessAttempt: (payload: AdaptiveAssessmentPayload) =>
    httpClient<AdaptiveAssessmentResponse>("/api/quiz/assessment", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
