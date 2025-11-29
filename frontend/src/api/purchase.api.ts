import { httpClient } from './httpClient';

export type PurchaseFilter = {
  learnerId?: number;
  packageId?: number;
  status?: string;
};

export async function listPurchases(filter?: PurchaseFilter) {
  return httpClient('/api/admin/subscriptions', { method: 'GET', query: filter as any });
}

export async function updatePurchaseStatus(id: number, status: string) {
  return httpClient(`/api/admin/subscriptions/${id}/payment-status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getSubscriptionsByLearner(learnerId: number) {
  return httpClient(`/api/subscriptions/learner/${learnerId}`, { method: 'GET' });
}
