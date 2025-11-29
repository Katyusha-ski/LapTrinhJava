import { httpClient } from "./httpClient";

export type PaymentMethod =
  | "CREDIT_CARD"
  | "PAYPAL"
  | "BANK_TRANSFER"
  | "CASH"
  | "VISA"
  | "MOMO";

export interface Subscription {
  id: number;
  learnerId: number;
  packageId: number;
  packageName?: string;
  startDate: string;
  endDate: string;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  status: string;
  createdAt?: string;
}

export interface CreateSubscriptionRequest {
  learnerId: number;
  packageId: number;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  paymentAmount: number;
  paymentMethod: PaymentMethod;
}

export const subscriptionApi = {
  create: (data: CreateSubscriptionRequest) =>
    httpClient<Subscription>("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getActive: (learnerId: number) =>
    httpClient<Subscription>(`/api/subscriptions/learner/${learnerId}/active`),

  listByLearner: (learnerId: number) =>
    httpClient<Subscription[]>(`/api/subscriptions/learner/${learnerId}`),
};
